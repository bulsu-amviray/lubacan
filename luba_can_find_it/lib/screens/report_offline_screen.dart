import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../app_routes.dart';
import '../data/reports_store.dart';
import '../models/pothole_report.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class ReportOfflineScreen extends StatefulWidget {
  const ReportOfflineScreen({super.key});

  @override
  State<ReportOfflineScreen> createState() => _ReportOfflineScreenState();
}

class _ReportOfflineScreenState extends State<ReportOfflineScreen> {
  bool _isRetrying = false;
  final _draft = ReportsStore.instance.savedDraft;

  Future<void> _handleRetry() async {
    setState(() => _isRetrying = true);
    await Future<void>.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;

    // Simulate successful submission on retry
    final now = DateTime.now();
    final rand = (now.millisecondsSinceEpoch % 9000 + 1000).toString();
    final newId = 'RW-${now.year}-$rand';

    final report = PotholeReport(
      id: newId,
      roadName: _draft.roadName,
      address: _draft.address,
      description: _draft.description.isNotEmpty
          ? _draft.description
          : 'Pothole on service road causing vehicular hazard.',
      severity: _draft.severity,
      status: 'Submitted',
      reportedBy: ReportsStore.instance.profile.fullName,
      reportedAt: '${now.day} Oct · 9:24 AM',
      location: LatLng(_draft.latitude, _draft.longitude),
      timeline: [
        ReportTimelineEvent(
          status: 'Submitted',
          timestamp: 'Just now',
          description:
              'Report received from ${ReportsStore.instance.profile.fullName}',
        ),
      ],
    );

    ReportsStore.instance.addReport(report);

    setState(() => _isRetrying = false);

    Navigator.of(
      context,
    ).pushReplacementNamed(AppRoutes.reportDetails, arguments: newId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Report a pothole'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Offline Red Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFDE8E8),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF8B4B4)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "You're offline",
                    style: TextStyle(
                      color: Color(0xFF9B1C1C),
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 3),
                  Text(
                    'We couldn\'t submit your report. No report ID has been created yet.',
                    style: TextStyle(
                      color: Color(0xFF9B1C1C),
                      fontSize: 12,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Disconnected Antenna Icon
            Center(
              child: Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFFFECEC),
                ),
                child: const Icon(
                  Icons.wifi_off_rounded,
                  color: Color(0xFFE02424),
                  size: 36,
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Heading
            const Center(
              child: Text(
                'Connection interrupted',
                style: TextStyle(
                  color: AppColors.navy,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Center(
              child: Text(
                'Your draft and photo are safe on this device.\nReconnect to the internet, then try again.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                  height: 1.45,
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Saved draft card
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
                  const Text(
                    'Saved draft',
                    style: TextStyle(
                      color: AppColors.navy,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _detailLine('Road', _draft.roadName),
                  const SizedBox(height: 8),
                  _detailLine(
                    'Photo',
                    '${_draft.photoCount} photo · ${_draft.photoSize} · stored locally',
                  ),
                  const SizedBox(height: 8),
                  _detailLine('Last saved', _draft.savedAt),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Try submitting again button
            SizedBox(
              height: 50,
              child: FilledButton.icon(
                onPressed: _isRetrying ? null : _handleRetry,
                icon: _isRetrying
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.refresh_rounded, size: 20),
                label: const Text(
                  'Try submitting again',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Back to saved draft button
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
                  'Back to saved draft',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Footnote
            const Center(
              child: Text(
                'Retrying will not create duplicate submissions.',
                style: TextStyle(color: AppColors.muted, fontSize: 11),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
    );
  }

  Widget _detailLine(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
