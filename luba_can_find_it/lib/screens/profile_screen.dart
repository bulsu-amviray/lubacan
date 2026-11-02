import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../app_routes.dart';
import '../core/auth/auth_service.dart';
import '../core/auth/session_manager.dart';
import '../data/reports_store.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, this.isStandalone = false});

  final bool isStandalone;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _store = ReportsStore.instance;

  @override
  void initState() {
    super.initState();
    _store.addListener(_onStoreChanged);
    SessionManager.instance.addListener(_onStoreChanged);
  }

  @override
  void dispose() {
    _store.removeListener(_onStoreChanged);
    SessionManager.instance.removeListener(_onStoreChanged);
    super.dispose();
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _checkLocationPermission() async {
    final status = await Geolocator.checkPermission();
    if (!mounted) return;
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Location Permission'),
        content: Text(
          'Current app permission status: ${status.name}.\n'
          'Location is used to pinpoint pothole reports on the map.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              Geolocator.openAppSettings();
            },
            style: FilledButton.styleFrom(backgroundColor: AppColors.orange),
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  void _signOut() {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign out?'),
        content: const Text(
          'You will need to sign in again to submit reports or view your saved history.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              AuthService.instance.signOut();
              Navigator.of(
                context,
              ).pushNamedAndRemoveUntil(AppRoutes.welcome, (route) => false);
            },
            style: FilledButton.styleFrom(backgroundColor: AppColors.navy),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = SessionManager.instance.currentUser;
    final profile = _store.profile;

    final displayName =
        (currentUser != null && currentUser.fullName.trim().isNotEmpty)
            ? currentUser.fullName.trim()
            : profile.fullName;
    final displayEmail =
        (currentUser != null && currentUser.email.trim().isNotEmpty)
            ? currentUser.email.trim()
            : profile.email;
    final displayMobile = (currentUser != null &&
            currentUser.mobileNumber != null &&
            currentUser.mobileNumber!.trim().isNotEmpty)
        ? currentUser.mobileNumber!.trim()
        : profile.mobileNumber;
    final displayMunicipality = (currentUser != null &&
            currentUser.municipality != null &&
            currentUser.municipality!.trim().isNotEmpty)
        ? currentUser.municipality!.trim()
        : profile.municipality;
    final displayBarangay = (currentUser != null &&
            currentUser.barangay != null &&
            currentUser.barangay!.trim().isNotEmpty)
        ? currentUser.barangay!.trim()
        : profile.barangay;

    if (currentUser != null) {
      profile.fullName = displayName;
      profile.email = displayEmail;
      profile.mobileNumber = displayMobile;
      profile.municipality = displayMunicipality;
      profile.barangay = displayBarangay;
    }

    final body = SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.subtleBorder),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: const Color(0xFFD8E6FD),
                      child: Text(
                        _getInitials(displayName),
                        style: const TextStyle(
                          color: AppColors.navy,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            displayName,
                            style: const TextStyle(
                              color: AppColors.navy,
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'Citizen · Joined ${profile.joinedDate}',
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.statusResolvedBg,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'Active',
                              style: TextStyle(
                                color: AppColors.statusResolved,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: OutlinedButton(
                    onPressed: () =>
                        Navigator.of(context).pushNamed(AppRoutes.editProfile),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.navy,
                      side: const BorderSide(color: AppColors.subtleBorder),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'Edit profile',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Contact Details Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.subtleBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildContactRow('Email', displayEmail),
                const Divider(height: 24, color: AppColors.subtleBorder),
                _buildContactRow('Mobile', displayMobile),
                const Divider(height: 24, color: AppColors.subtleBorder),
                _buildContactRow('City', displayMunicipality),
                const Divider(height: 24, color: AppColors.subtleBorder),
                _buildContactRow(
                  'Barangay',
                  displayBarangay.toLowerCase().startsWith('brgy') ||
                          displayBarangay.toLowerCase().startsWith('barangay')
                      ? displayBarangay
                      : 'Brgy. $displayBarangay',
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Settings Rows Card
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.subtleBorder),
            ),
            child: Column(
              children: [
                _buildNavRow(
                  icon: Icons.notifications_none_rounded,
                  title: 'Report notifications',
                  trailing: 'On',
                  onTap: () => Navigator.of(
                    context,
                  ).pushNamed(AppRoutes.notificationPreferences),
                ),
                const Divider(
                  height: 1,
                  indent: 54,
                  color: AppColors.subtleBorder,
                ),
                _buildNavRow(
                  icon: Icons.location_on_outlined,
                  title: 'Location permission',
                  trailing: 'While using',
                  onTap: _checkLocationPermission,
                ),
                const Divider(
                  height: 1,
                  indent: 54,
                  color: AppColors.subtleBorder,
                ),
                _buildNavRow(
                  icon: Icons.lock_outline_rounded,
                  title: 'Change password',
                  onTap: () =>
                      Navigator.of(context).pushNamed(AppRoutes.changePassword),
                ),
                const Divider(
                  height: 1,
                  indent: 54,
                  color: AppColors.subtleBorder,
                ),
                _buildNavRow(
                  icon: Icons.shield_outlined,
                  title: 'Privacy & data',
                  onTap: () =>
                      Navigator.of(context).pushNamed(AppRoutes.privacyPolicy),
                ),
                const Divider(
                  height: 1,
                  indent: 54,
                  color: AppColors.subtleBorder,
                ),
                _buildNavRow(
                  icon: Icons.help_outline_rounded,
                  title: 'Help center',
                  onTap: () =>
                      Navigator.of(context).pushNamed(AppRoutes.helpCenter),
                ),
                const Divider(
                  height: 1,
                  indent: 54,
                  color: AppColors.subtleBorder,
                ),
                _buildNavRow(
                  icon: Icons.settings_outlined,
                  title: 'Account settings',
                  onTap: () => Navigator.of(
                    context,
                  ).pushNamed(AppRoutes.accountSettings),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Privacy Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFEAF2FC),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your privacy matters',
                  style: TextStyle(
                    color: AppColors.statusInProgress,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Only authorized LGU staff can view your contact information.',
                  style: TextStyle(
                    color: AppColors.statusInProgress,
                    fontSize: 12,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Sign Out Button
          SizedBox(
            height: 48,
            child: OutlinedButton.icon(
              onPressed: _signOut,
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: const Text(
                'Sign out',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.navy,
                backgroundColor: Colors.white,
                side: const BorderSide(color: AppColors.subtleBorder),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Footer
          Center(
            child: Text(
              currentUser != null
                  ? 'LUBA canFindIT v1.0 · ${currentUser.email}'
                  : 'LUBA canFindIT v1.0 · Citizen Account',
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ),
        ],
      ),
    );

    if (!widget.isStandalone) {
      return Scaffold(
        backgroundColor: AppColors.pageBackground,
        body: Column(
          children: [
            AppTopBar(
              title: 'My profile',
              showBack: false,
              trailing: IconButton(
                icon: const Icon(
                  Icons.notifications_none_rounded,
                  color: AppColors.navy,
                ),
                onPressed: () =>
                    Navigator.of(context).pushNamed(AppRoutes.notifications),
              ),
            ),
            Expanded(child: body),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'My profile'),
      body: body,
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'M';
  }

  Widget _buildContactRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavRow({
    required IconData icon,
    required String title,
    String? trailing,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: ListTile(
        leading: Icon(icon, color: AppColors.muted, size: 20),
        title: Text(
          title,
          style: const TextStyle(
            color: AppColors.navy,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (trailing != null)
            Text(
              trailing,
              style: const TextStyle(color: AppColors.muted, fontSize: 13),
            ),
          const SizedBox(width: 4),
          const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.muted,
            size: 18,
          ),
        ],
      ),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      dense: true,
    ),
  );
}
}
