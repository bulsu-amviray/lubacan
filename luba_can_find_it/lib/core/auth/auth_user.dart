import 'user_role.dart';

/// Represents an authenticated user in the LUBA CanFindIT system.
class AuthUser {
  final String uid;
  final String email;
  final String fullName;
  final String? mobileNumber;
  final UserRole role;
  final bool isActive;
  final String? assignedTeam;
  final String? teamLead;
  final String? municipality;
  final String? barangay;
  final DateTime? lastLoginAt;

  const AuthUser({
    required this.uid,
    required this.email,
    required this.fullName,
    this.mobileNumber,
    required this.role,
    this.isActive = true,
    this.assignedTeam,
    this.teamLead,
    this.municipality = 'Malolos',
    this.barangay = 'Catmon',
    this.lastLoginAt,
  });

  bool get isCitizen => role.isCitizen;
  bool get isMaintenance => role.isMaintenance;
  bool get isAdmin => role.isAdmin;

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'fullName': fullName,
      'name': fullName,
      'mobileNumber': mobileNumber,
      'mobile': mobileNumber,
      'role': role.name,
      'isActive': isActive,
      'assignedTeam': assignedTeam,
      'teamLead': teamLead,
      'municipality': municipality,
      'area': municipality,
      'barangay': barangay,
      'department': barangay,
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  factory AuthUser.fromMap(Map<String, dynamic> map, {required String uid}) {
    return AuthUser(
      uid: uid,
      email: (map['email'] as String?) ?? '',
      fullName: (map['fullName'] as String?) ??
          (map['full_name'] as String?) ??
          (map['name'] as String?) ??
          'User',
      mobileNumber: (map['mobileNumber'] as String?) ??
          (map['mobile'] as String?) ??
          (map['phone'] as String?),
      role: UserRole.fromString(map['role'] as String?),
      isActive: map['status'] != null
          ? (map['status'].toString().toLowerCase() == 'active')
          : ((map['isActive'] as bool?) ?? true),
      assignedTeam: (map['assignedTeam'] as String?) ??
          (map['department'] as String?) ??
          (map['area'] as String?),
      teamLead: map['teamLead'] as String?,
      municipality: (map['municipality'] as String?) ??
          (map['area'] as String?) ??
          'Malolos',
      barangay: (map['barangay'] as String?) ??
          (map['department'] as String?) ??
          'Catmon',
      lastLoginAt: map['lastLoginAt'] != null
          ? DateTime.tryParse(map['lastLoginAt'] as String)
          : null,
    );
  }

  AuthUser copyWith({
    String? email,
    String? fullName,
    String? mobileNumber,
    UserRole? role,
    bool? isActive,
    String? assignedTeam,
    String? teamLead,
    String? municipality,
    String? barangay,
    DateTime? lastLoginAt,
  }) {
    return AuthUser(
      uid: uid,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      mobileNumber: mobileNumber ?? this.mobileNumber,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      assignedTeam: assignedTeam ?? this.assignedTeam,
      teamLead: teamLead ?? this.teamLead,
      municipality: municipality ?? this.municipality,
      barangay: barangay ?? this.barangay,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }
}
