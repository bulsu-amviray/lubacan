import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

import 'app_routes.dart';
import 'core/auth/session_manager.dart';
import 'data/reports_store.dart';
import 'screens/account_settings_screen.dart';
import 'screens/cancel_report_screen.dart';
import 'screens/change_password_screen.dart';
import 'screens/contact_support_screen.dart';
import 'screens/edit_profile_screen.dart';
import 'screens/edit_report_screen.dart';
import 'screens/feedback_received_screen.dart';
import 'screens/help_center_screen.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/my_reports_screen.dart';
import 'screens/notification_preferences_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/pothole_map_screen.dart';
import 'screens/privacy_policy_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/rate_repair_screen.dart';
import 'screens/register_screen.dart';
import 'screens/report_details_screen.dart';
import 'screens/report_offline_screen.dart';
import 'screens/report_pothole_screen.dart';
import 'screens/reset_password_screen.dart';
import 'screens/set_new_password_screen.dart';
import 'screens/set_pothole_location_screen.dart';
import 'screens/terms_screen.dart';
import 'screens/verify_email_screen.dart';
import 'screens/welcome_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SessionManager.instance.initialize();
  runApp(const LubaCanFindItApp());
}

class LubaCanFindItApp extends StatelessWidget {
  const LubaCanFindItApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LUBA CanFindIT',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: AppRoutes.welcome,
      routes: {
        AppRoutes.welcome: (context) => const WelcomeScreen(),
        AppRoutes.login: (context) => const LoginScreen(),
        AppRoutes.register: (context) => const RegisterScreen(),
        AppRoutes.resetPassword: (context) => const ResetPasswordScreen(),
        AppRoutes.home: (context) => _guardAuth(const HomeScreen()),
        AppRoutes.report: (context) =>
            _guardAuth(const ReportPotholeScreen()),
        AppRoutes.reportOffline: (context) =>
            _guardAuth(const ReportOfflineScreen()),
        AppRoutes.profile: (context) =>
            _guardAuth(const ProfileScreen(isStandalone: true)),
        AppRoutes.accountSettings: (context) =>
            _guardAuth(const AccountSettingsScreen()),
        AppRoutes.editProfile: (context) =>
            _guardAuth(const EditProfileScreen()),
        AppRoutes.changePassword: (context) =>
            _guardAuth(const ChangePasswordScreen()),
        AppRoutes.notificationPreferences: (context) =>
            _guardAuth(const NotificationPreferencesScreen()),
        AppRoutes.privacyPolicy: (context) =>
            _guardAuth(const PrivacyPolicyScreen()),
        AppRoutes.terms: (context) => _guardAuth(const TermsScreen()),
        AppRoutes.helpCenter: (context) =>
            _guardAuth(const HelpCenterScreen()),
        AppRoutes.myReports: (context) =>
            _guardAuth(const MyReportsScreen(isStandalone: true)),
        AppRoutes.notifications: (context) =>
            _guardAuth(const NotificationsScreen(isStandalone: true)),
        AppRoutes.potholeMap: (context) =>
            _guardAuth(const PotholeMapScreen()),
      },
      onGenerateRoute: (settings) {
        final args = settings.arguments;
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (context) {
            switch (settings.name) {
              case AppRoutes.reportDetails:
                return _guardAuth(
                  ReportDetailsScreen(reportId: args is String ? args : null),
                );
              case AppRoutes.editReport:
                return _guardAuth(
                  EditReportScreen(reportId: args is String ? args : null),
                );
              case AppRoutes.cancelReport:
                return _guardAuth(
                  CancelReportScreen(reportId: args is String ? args : null),
                );
              case AppRoutes.rateRepair:
                return _guardAuth(
                  RateRepairScreen(reportId: args is String ? args : null),
                );
              case AppRoutes.feedbackReceived:
                return _guardAuth(
                  FeedbackReceivedScreen(
                    reportId: args is String ? args : null,
                  ),
                );
              case AppRoutes.contactSupport:
                return _guardAuth(
                  ContactSupportScreen(
                    initialReportId: args is String ? args : null,
                  ),
                );
              case AppRoutes.setPotholeLocation:
                return _guardAuth(
                  SetPotholeLocationScreen(
                    initialLocation: args is LatLng ? args : null,
                  ),
                );
              case AppRoutes.setNewPassword:
                return SetNewPasswordScreen(
                  email: args is String
                      ? args
                      : (SessionManager.instance.currentUser?.email ??
                          ReportsStore.instance.profile.email),
                );
              case AppRoutes.verifyEmail:
                return VerifyEmailScreen(
                  email: args is String
                      ? args
                      : (SessionManager.instance.currentUser?.email ??
                          ReportsStore.instance.profile.email),
                  userName: SessionManager.instance.currentUser?.fullName ??
                      ReportsStore.instance.profile.fullName,
                );
              default:
                return const WelcomeScreen();
            }
          },
        );
      },
    );
  }

  /// Requires a valid signed-in session before allowing access.
  static Widget _guardAuth(Widget target) {
    final session = SessionManager.instance;
    if (!session.isAuthenticated) {
      return const LoginScreen();
    }
    return target;
  }
}

typedef LubaApp = LubaCanFindItApp;
