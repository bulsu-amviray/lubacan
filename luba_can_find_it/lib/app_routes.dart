class AppRoutes {
  AppRoutes._();

  static const String welcome = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String resetPassword = '/reset-password';
  static const String setNewPassword = '/set-new-password';
  static const String verifyEmail = '/verify-email';
  static const String home = '/home';
  static const String report = '/report';
  static const String reportOffline = '/report-offline';

  // Profile and Account (Citizen)
  static const String profile = '/profile';
  static const String accountSettings = '/account-settings';
  static const String editProfile = '/edit-profile';
  static const String changePassword = '/change-password';
  static const String notificationPreferences = '/notification-preferences';
  static const String privacyPolicy = '/privacy-policy';
  static const String terms = '/terms';
  static const String helpCenter = '/help-center';
  static const String contactSupport = '/contact-support';

  // Reports and Map (Citizen)
  static const String myReports = '/my-reports';
  static const String reportDetails = '/report-details';
  static const String editReport = '/edit-report';
  static const String cancelReport = '/cancel-report';
  static const String rateRepair = '/rate-repair';
  static const String feedbackReceived = '/feedback-received';
  static const String potholeMap = '/pothole-map';
  static const String setPotholeLocation = '/set-pothole-location';
  static const String notifications = '/notifications';
}
