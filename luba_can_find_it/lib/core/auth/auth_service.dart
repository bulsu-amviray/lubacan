import 'dart:async';
import 'package:flutter/foundation.dart';
import 'auth_user.dart';
import 'session_manager.dart';
import 'user_role.dart';
import '../../data/auth_api.dart';
import '../supabase/supabase_service.dart';

/// Single unified authentication service for Citizen and Maintenance staff.
///
/// Coordinates Supabase database authentication, PHP API compatibility,
/// and local demo profiles.
class AuthService {
  static final AuthService instance = AuthService._internal();

  AuthService._internal();

  /// Local demo fixtures for offline fallback or instant local development.
  static final Map<String, AuthUser> _seededUsers = {
    'paolo.santos@example.com': const AuthUser(
      uid: 'maint_uid_paolo_santos',
      email: 'paolo.santos@example.com',
      fullName: 'Engr. Paolo Santos',
      mobileNumber: '+63 917 555 0192',
      role: UserRole.maintenance,
      isActive: true,
      assignedTeam: 'Malolos Team Alpha',
      teamLead: 'Engr. Paolo Santos',
      municipality: 'Malolos',
    ),
    'maintenance@example.com': const AuthUser(
      uid: 'maint_uid_general',
      email: 'maintenance@example.com',
      fullName: 'Engr. Paolo Santos',
      mobileNumber: '+63 917 555 0192',
      role: UserRole.maintenance,
      isActive: true,
      assignedTeam: 'Malolos Team Alpha',
      teamLead: 'Engr. Paolo Santos',
      municipality: 'Malolos',
    ),
    'alexam@gmail.com': const AuthUser(
      uid: 'cit_615408714',
      email: 'alexam@gmail.com',
      fullName: 'Alexa Viray',
      mobileNumber: '09236648115',
      role: UserRole.citizen,
      isActive: true,
      municipality: 'Malolos',
      barangay: 'Catmon',
    ),
    'alexav@gmail.com': const AuthUser(
      uid: 'cit_720187701',
      email: 'alexav@gmail.com',
      fullName: 'Alexa Viray',
      mobileNumber: '09277781772',
      role: UserRole.citizen,
      isActive: true,
      municipality: 'Malolos',
      barangay: 'Catmon',
    ),
    'citizen@example.com': const AuthUser(
      uid: 'cit_uid_citizen_demo',
      email: 'citizen@example.com',
      fullName: 'Mika Reyes',
      mobileNumber: '+63 917 000 0184',
      role: UserRole.citizen,
      isActive: true,
      municipality: 'Malolos',
      barangay: 'Catmon',
    ),
    'mika.reyes@example.com': const AuthUser(
      uid: 'cit_uid_mika_reyes',
      email: 'mika.reyes@example.com',
      fullName: 'Mika Reyes',
      mobileNumber: '+63 917 000 0184',
      role: UserRole.citizen,
      isActive: true,
      municipality: 'Malolos',
      barangay: 'Catmon',
    ),
    'disabled@example.com': const AuthUser(
      uid: 'uid_disabled_user',
      email: 'disabled@example.com',
      fullName: 'Inactive Staff',
      role: UserRole.maintenance,
      isActive: false,
      municipality: 'Malolos',
    ),
    'unauthorized@example.com': const AuthUser(
      uid: 'uid_unauthorized_user',
      email: 'unauthorized@example.com',
      fullName: 'Guest Account',
      role: UserRole.unauthorized,
      isActive: true,
      municipality: 'Malolos',
    ),
  };

  /// Authenticates user with email and password through single login flow.
  ///
  /// Integrates Supabase database, API backend, and offline seeded accounts.
  Future<AuthUser> signIn({
    required String email,
    required String password,
  }) async {
    final cleanEmail = email.trim().toLowerCase();

    // 1. Check Supabase Database
    try {
      final data = await SupabaseService.instance.get(
        'users',
        queryParams: {'email': 'eq.$cleanEmail'},
        limit: 1,
      );

      if (data is List && data.isNotEmpty) {
        final userMap = Map<String, dynamic>.from(data.first as Map);
        final rawRole = userMap['role']?.toString();
        final role = UserRole.fromString(rawRole);
        final status = userMap['status']?.toString().toLowerCase();
        final isActive = status == 'active' ||
            userMap['isActive'] == true ||
            userMap['is_active'] == true;

        final user = AuthUser(
          uid: (userMap['id'] ?? 'uid_${cleanEmail.hashCode}').toString(),
          email: cleanEmail,
          fullName: (userMap['full_name'] ??
                  userMap['fullName'] ??
                  userMap['name'] ??
                  'User')
              .toString(),
          mobileNumber:
              (userMap['mobile'] ?? userMap['mobileNumber'])?.toString(),
          role: role,
          isActive: isActive,
          assignedTeam: (userMap['area'] ??
                  userMap['department'] ??
                  userMap['assignedTeam'])
              ?.toString(),
          teamLead: userMap['teamLead']?.toString(),
          municipality: (userMap['municipality'] ??
                  userMap['area'] ??
                  'Malolos')
              .toString(),
          barangay: (userMap['barangay'] ??
                  userMap['department'] ??
                  'Catmon')
              .toString(),
        );

        if (!user.isActive) {
          throw Exception(
            'This account has been deactivated. Please contact your administrator.',
          );
        }
        SessionManager.instance.setSession(user);
        return user;
      }
    } catch (e) {
      if (e.toString().contains('deactivated')) {
        rethrow;
      }
    }

    // 2. Call AuthApi backend (supports tests and custom server)
    try {
      final apiResult = await AuthApi.login(email: email, password: password);
      final rawUser = apiResult['user'];
      if (rawUser is Map<String, dynamic>) {
        final rawRole = rawUser['role'];
        if (rawRole is! String || rawRole.trim().isEmpty) {
          throw Exception('The sign-in service did not provide an account role.');
        }
        final role = UserRole.fromString(rawRole);
        final rawIsActive = rawUser['is_active'];
        final user = AuthUser(
          uid: (rawUser['id'] ?? rawUser['uid'] ?? 'uid_${cleanEmail.hashCode}')
              .toString(),
          email: cleanEmail,
          fullName: (rawUser['full_name'] ?? rawUser['name'] ?? 'User').toString(),
          mobileNumber: rawUser['mobile_number']?.toString(),
          role: role,
          isActive: rawIsActive == true,
          assignedTeam: rawUser['assigned_team']?.toString(),
          teamLead: rawUser['team_lead']?.toString(),
        );

        if (!user.isActive) {
          throw Exception('Account is inactive or missing an active status.');
        }

        // Cache/sync to Supabase in background
        unawaited(
          SupabaseService.instance.upsert(
            'users',
            {
              'full_name': user.fullName,
              'email': cleanEmail,
              'mobile': user.mobileNumber,
              'role': user.role.label,
              'area': user.municipality,
              'status': 'Active',
            },
            onConflict: 'email',
          ),
        );

        SessionManager.instance.setSession(user);
        return user;
      }
    } catch (e) {
      if (e.toString().contains('inactive') ||
          e.toString().contains('deactivated') ||
          e.toString().contains('did not provide an account role') ||
          e.toString().contains('invalid account details')) {
        rethrow;
      }
    }

    // 3. Fallback to seeded demo accounts (offline / preview)
    if (_seededUsers.containsKey(cleanEmail)) {
      final user = _seededUsers[cleanEmail]!;
      if (!user.isActive) {
        throw Exception(
          'This account has been deactivated. Please contact your administrator.',
        );
      }
      SessionManager.instance.setSession(user);
      return user;
    }

    throw Exception('Login failed. Unable to authenticate account.');
  }

  /// Public registration strictly registers Citizens in Supabase.
  /// Never grants Maintenance or Administrator roles during public registration.
  Future<AuthUser> registerCitizen({
    required String fullName,
    required String email,
    required String mobileNumber,
    required String password,
    String municipality = 'Malolos',
    String? barangay,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanBarangay = (barangay != null && barangay.trim().isNotEmpty)
        ? barangay.trim()
        : 'Catmon';

    // Enforce citizen role
    final user = AuthUser(
      uid: 'cit_${cleanEmail.hashCode}',
      email: cleanEmail,
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      role: UserRole.citizen,
      isActive: true,
      municipality: municipality.trim().isNotEmpty ? municipality.trim() : 'Malolos',
      barangay: cleanBarangay,
    );

    // 1. Save in Supabase users table
    try {
      await SupabaseService.instance.upsert(
        'users',
        {
          'full_name': fullName.trim(),
          'email': cleanEmail,
          'mobile': mobileNumber.trim(),
          'role': 'Citizen',
          'area': municipality.trim().isNotEmpty ? municipality.trim() : 'Malolos',
          'status': 'Active',
        },
        onConflict: 'email',
      );
    } catch (e) {
      debugPrint('Supabase registerCitizen error: $e');
    }

    // 2. Also notify AuthApi endpoint if available (maintains backward compatibility)
    try {
      await AuthApi.register(
        fullName: fullName,
        email: cleanEmail,
        mobileNumber: mobileNumber,
        password: password,
      );
    } catch (_) {
      // Backend is offline or optional, Firebase registration already recorded
    }

    SessionManager.instance.setSession(user);
    return user;
  }

  /// Signs out the active user and clears cached state.
  Future<void> signOut() async {
    SessionManager.instance.clearSession();
  }
}
