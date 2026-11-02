import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Terms and Conditions'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Sample Terms Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFEAF2FC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.azureBlue.withAlpha(40)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Sample terms · Demonstration only',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'These are sample usage terms, not an official LGU agreement. A production service must publish approved terms.',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Sample version · 21 October 2026',
              style: TextStyle(color: AppColors.muted, fontSize: 12),
            ),
            const SizedBox(height: 16),

            // Terms Sections
            _buildSection(
              title: 'Report accurately and safely',
              content:
                  'Submit road damage you have observed, with a clear description, useful landmark and relevant photo. Do not enter traffic or restricted areas to gather evidence. Never use the app while driving.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Not an emergency service',
              content:
                  'LUBA canFindIT is for non-emergency road maintenance reports. It does not dispatch emergency responders or guarantee immediate monitoring. For urgent danger, use the appropriate local emergency service through official channels.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Respect people and the service',
              content:
                  'Do not post harassment, threats, discriminatory content, unrelated advertisements or deliberately false reports. Do not upload another person\'s private information or photographs you are not entitled to share.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Review, moderation and duplicates',
              content:
                  'Authorized LGU staff review evidence and jurisdiction. Reports may be rejected with a reason or linked to an original as Duplicate. Nearby pins alone do not prove a duplicate; carriageway and site evidence also matter.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Repairs and approval',
              content:
                  'Verification confirms a report, not a completed repair. Assignment and target dates support planning; they are not a guarantee. Team completion evidence remains In Progress until the LGU approves resolution.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Changes and support',
              content:
                  'You may edit or cancel only while a report is Submitted and before review begins. For Under Review or later, contact support rather than changing the record. This demo uses fictional accounts and sample data.',
            ),
            const SizedBox(height: 24),

            // Back button
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
                  'Back to account settings',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }

  Widget _buildSection({required String title, required String content}) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.subtleBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 13,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
