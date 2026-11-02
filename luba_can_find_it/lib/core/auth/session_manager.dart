import 'package:flutter/foundation.dart';
import '../../data/reports_store.dart';
import '../supabase/supabase_service.dart';
import 'auth_user.dart';
import 'user_role.dart';

/// Manages the authenticated user session, state changes, and role validation.
class SessionManager extends ChangeNotifier {
  static final SessionManager instance = SessionManager._internal();

  SessionManager._internal();

  AuthUser? _currentUser;
  bool _isInitialized = false;

  AuthUser? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null && _currentUser!.isActive;
  bool get isInitialized => _isInitialized;
  UserRole get currentRole => _currentUser?.role ?? UserRole.unauthorized;

  bool get isCitizen => _currentUser?.role == UserRole.citizen;
  bool get isMaintenance => _currentUser?.role == UserRole.maintenance;
  bool get isAdmin => _currentUser?.role == UserRole.admin;

  /// Initializes the session, restoring any registered citizen account.
  Future<void> initialize() async {
    if (_isInitialized) return;
    _isInitialized = true;

    // Check Supabase for registered citizen account
    try {
      final data = await SupabaseService.instance.get(
        'users',
        queryParams: {'role': 'eq.Citizen'},
        order: 'id.desc',
        limit: 1,
      );
      if (data is List && data.isNotEmpty) {
        final userRow = Map<String, dynamic>.from(data.first as Map);
        final registeredUser = AuthUser.fromMap(
          userRow,
          uid: (userRow['id'] ?? 'cit_registered').toString(),
        );
        setSession(registeredUser);
        return;
      }
    } catch (_) {}

    // Default to registered citizen account
    if (_currentUser == null) {
      setSession(const AuthUser(
        uid: 'cit_615408714',
        email: 'alexam@gmail.com',
        fullName: 'Alexa Viray',
        mobileNumber: '09236648115',
        role: UserRole.citizen,
        isActive: true,
        municipality: 'Malolos',
        barangay: 'Catmon',
      ));
    }
  }

  /// Sets the active authenticated user session.
  void setSession(AuthUser user) {
    _currentUser = user;
    ReportsStore.instance.setProfileFromAuthUser(user);
    notifyListeners();
  }

  /// Updates details of the current logged-in user session.
  void updateUser({
    String? fullName,
    String? email,
    String? mobileNumber,
    String? municipality,
    String? barangay,
  }) {
    if (_currentUser == null) return;
    _currentUser = _currentUser!.copyWith(
      fullName: fullName,
      email: email,
      mobileNumber: mobileNumber,
      municipality: municipality,
      barangay: barangay,
    );
    notifyListeners();
  }

  /// Clears active session and resets role-specific state upon sign out.
  void clearSession() {
    _currentUser = null;
    ReportsStore.instance.resetProfileToDefaults();
    notifyListeners();
  }

  /// Validates whether the current active user has permission for a required role.
  bool hasAccess(UserRole requiredRole) {
    if (!isAuthenticated) return false;
    if (_currentUser!.role == UserRole.admin) return true;
    return _currentUser!.role == requiredRole;
  }
}
