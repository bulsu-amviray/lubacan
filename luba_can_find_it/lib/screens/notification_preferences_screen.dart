import 'package:flutter/material.dart';
import '../data/reports_store.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class NotificationPreferencesScreen extends StatefulWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  State<NotificationPreferencesScreen> createState() =>
      _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState
    extends State<NotificationPreferencesScreen> {
  final _store = ReportsStore.instance;

  late bool _statusUpdates;
  late bool _repairFeedback;
  late bool _pushNotifications;
  late bool _emailNotifications;
  late bool _dailyDigest;
  late String _digestTime;

  bool _isSaving = false;
  bool _savedSuccess = false;

  final List<String> _digestTimes = [
    '8:00 AM PHT',
    '12:00 PM PHT',
    '6:00 PM PHT',
    '9:00 PM PHT',
  ];

  @override
  void initState() {
    super.initState();
    final s = _store.notificationSettings;
    _statusUpdates = s.statusUpdates;
    _repairFeedback = s.repairFeedback;
    _pushNotifications = s.pushNotifications;
    _emailNotifications = s.emailNotifications;
    _dailyDigest = s.dailyDigest;
    _digestTime = s.digestTime;
  }

  Future<void> _handleSave() async {
    setState(() => _isSaving = true);
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    _store.updateNotificationSettings(
      statusUpdates: _statusUpdates,
      repairFeedback: _repairFeedback,
      pushNotifications: _pushNotifications,
      emailNotifications: _emailNotifications,
      dailyDigest: _dailyDigest,
      digestTime: _digestTime,
    );

    setState(() {
      _isSaving = false;
      _savedSuccess = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final email = _store.profile.email;

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Notification preferences'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Report Updates Section
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.subtleBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(16, 16, 16, 6),
                    child: Text(
                      'Report updates',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  SwitchListTile(
                    value: _statusUpdates,
                    activeThumbColor: AppColors.orange,
                    title: const Text(
                      'Status updates',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      'Review, assignment, work start and resolution.',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                    onChanged: (val) => setState(() => _statusUpdates = val),
                  ),
                  const Divider(
                    height: 1,
                    indent: 16,
                    color: AppColors.subtleBorder,
                  ),
                  SwitchListTile(
                    value: _repairFeedback,
                    activeThumbColor: AppColors.orange,
                    title: const Text(
                      'Repair feedback',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      'A prompt after LGU-approved resolution.',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                    onChanged: (val) => setState(() => _repairFeedback = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Delivery Channels Section
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.subtleBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(16, 16, 16, 6),
                    child: Text(
                      'Delivery channels',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  SwitchListTile(
                    value: _pushNotifications,
                    activeThumbColor: AppColors.orange,
                    title: const Text(
                      'Push notifications',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      'Updates on this device; permission required.',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                    onChanged: (val) =>
                        setState(() => _pushNotifications = val),
                  ),
                  const Divider(
                    height: 1,
                    indent: 16,
                    color: AppColors.subtleBorder,
                  ),
                  SwitchListTile(
                    value: _emailNotifications,
                    activeThumbColor: AppColors.orange,
                    title: const Text(
                      'Email notifications',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      email,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                      ),
                    ),
                    onChanged: (val) =>
                        setState(() => _emailNotifications = val),
                  ),
                  const Divider(
                    height: 1,
                    indent: 16,
                    color: AppColors.subtleBorder,
                  ),
                  SwitchListTile(
                    value: _dailyDigest,
                    activeThumbColor: AppColors.orange,
                    title: const Text(
                      'Daily email digest',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      'Optional summary of reports you follow.',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                    onChanged: (val) => setState(() => _dailyDigest = val),
                  ),
                  if (_dailyDigest) ...[
                    const Divider(
                      height: 1,
                      indent: 16,
                      color: AppColors.subtleBorder,
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Digest time (when enabled)',
                            style: TextStyle(
                              color: AppColors.muted,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: _digestTime,
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: AppColors.pageBackground,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 10,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(
                                  color: AppColors.subtleBorder,
                                ),
                              ),
                            ),
                            items: _digestTimes.map((t) {
                              return DropdownMenuItem(value: t, child: Text(t));
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() => _digestTime = val);
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Essential notices banner
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
                    'Essential account notices stay on',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Verification, password reset and security messages are separate from these optional report preferences.',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Save preferences button
            SizedBox(
              height: 50,
              child: FilledButton(
                onPressed: _isSaving ? null : _handleSave,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Save preferences',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 10),

            // Cancel button
            SizedBox(
              height: 48,
              child: OutlinedButton(
                onPressed: () => Navigator.of(context).maybePop(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.navy,
                  backgroundColor: Colors.white,
                  side: const BorderSide(color: AppColors.subtleBorder),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
                child: const Text(
                  'Cancel',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),

            // Success feedback banner
            if (_savedSuccess) ...[
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.statusResolvedBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.statusResolved.withAlpha(50),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Preferences saved · sample feedback',
                      style: TextStyle(
                        color: AppColors.statusResolved,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Status and repair feedback updates are ${_statusUpdates && _repairFeedback ? 'enabled' : 'updated'} for ${_pushNotifications ? 'push' : ''}${_pushNotifications && _emailNotifications ? ' and ' : ''}${_emailNotifications ? 'email' : ''}. The optional daily digest is ${_dailyDigest ? 'on' : 'off'}.',
                      style: const TextStyle(
                        color: AppColors.statusResolved,
                        fontSize: 12,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }
}
