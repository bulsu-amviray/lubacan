import 'package:flutter/material.dart';
import '../app_routes.dart';
import '../data/reports_store.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/status_badge.dart';

class FeedbackReceivedScreen extends StatelessWidget {
  const FeedbackReceivedScreen({super.key, this.reportId});

  final String? reportId;

  @override
  Widget build(BuildContext context) {
    final argId = ModalRoute.of(context)?.settings.arguments as String?;
    final targetId = reportId ?? argId ?? 'RW-2026-0842';
    final report =
        ReportsStore.instance.getReportById(targetId) ??
        ReportsStore.instance.allReports.first;
    final userName = ReportsStore.instance.profile.fullName.split(' ').first;

    final rating = report.rating ?? 5;
    final ratingLabel = switch (rating) {
      1 => '$rating / 5 · Poor',
      2 => '$rating / 5 · Fair',
      3 => '$rating / 5 · Good',
      4 => '$rating / 5 · Very Good',
      _ => '$rating / 5 · Excellent',
    };

    final comment =
        report.feedbackComment ??
        'The road is smooth now and much safer for motorcycles. Thank you for the quick response!';
    final date =
        report.feedbackDate ?? 'Submitted · 21 Oct 2026 · 11:32 AM PHT';

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Feedback received'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Checkmark in circle badge
            Center(
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFE8F1FC),
                  border: Border.all(color: AppColors.azureBlue.withAlpha(50)),
                ),
                child: const Icon(
                  Icons.check_rounded,
                  color: AppColors.navy,
                  size: 32,
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Heading
            Center(
              child: Text(
                'Thank you, $userName.',
                style: const TextStyle(
                  color: AppColors.navy,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 6),
            const Center(
              child: Text(
                'Your feedback helps the LGU improve road maintenance.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.muted, fontSize: 13),
              ),
            ),
            const SizedBox(height: 24),

            // Feedback summary card
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
                    'Your repair feedback',
                    style: TextStyle(
                      color: AppColors.navy,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [StatusBadge(status: report.status)],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${report.id} · ${report.roadName}',
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: List.generate(5, (index) {
                      final filled = index < rating;
                      return Icon(
                        filled ? Icons.star_rounded : Icons.star_border_rounded,
                        color: const Color(0xFFF59E0B),
                        size: 24,
                      );
                    }),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    ratingLabel,
                    style: const TextStyle(
                      color: AppColors.orange,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    comment,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 13,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    date,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Success note banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.statusResolvedBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.statusResolved.withAlpha(40),
                ),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Feedback submitted successfully',
                    style: TextStyle(
                      color: AppColors.statusResolved,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 3),
                  Text(
                    'The repair was approved at 11:20 AM PHT. Your feedback is recorded after resolution and does not change report status.',
                    style: TextStyle(
                      color: AppColors.statusResolved,
                      fontSize: 12,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Back to report button
            SizedBox(
              height: 50,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).pushReplacementNamed(
                    AppRoutes.reportDetails,
                    arguments: report.id,
                  );
                },
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
                child: const Text(
                  'Back to report',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Back to home button
            SizedBox(
              height: 48,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.of(
                    context,
                  ).pushNamedAndRemoveUntil(AppRoutes.home, (route) => false);
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.navy,
                  backgroundColor: Colors.white,
                  side: const BorderSide(color: AppColors.subtleBorder),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
                child: const Text(
                  'Back to home',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }
}
