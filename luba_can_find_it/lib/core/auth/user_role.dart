/// User roles supported in the LUBA CanFindIT system.
enum UserRole {
  citizen,
  maintenance,
  admin,
  unauthorized;

  static UserRole fromString(String? role) {
    if (role == null) return UserRole.unauthorized;
    return switch (role.toLowerCase().trim()) {
      'citizen' => UserRole.citizen,
      'maintenance' ||
      'maintenance_staff' ||
      'team_lead' ||
      'worker' => UserRole.maintenance,
      'admin' || 'administrator' || 'lgu_admin' => UserRole.admin,
      _ => UserRole.unauthorized,
    };
  }

  String get label => switch (this) {
    UserRole.citizen => 'Citizen',
    UserRole.maintenance => 'Maintenance Staff',
    UserRole.admin => 'Administrator',
    UserRole.unauthorized => 'Unauthorized',
  };

  bool get isCitizen => this == UserRole.citizen;
  bool get isMaintenance => this == UserRole.maintenance;
  bool get isAdmin => this == UserRole.admin;
}
