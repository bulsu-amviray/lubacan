import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Privacy Policy'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Demonstration Banner
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
                    'Demonstration policy · Not official',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Sample text for LUBA canFindIT. This is not an official LGU legal document or a binding privacy commitment.',
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

            // Policy Sections
            _buildSection(
              title: 'What a report contains',
              content:
                  'Road reports include your description, severity, road address, map pin, coordinates, photos and report timestamps. Use the damaged road\'s location, not a private home. Avoid capturing faces, number plates or unrelated personal details.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Who can see your information',
              content:
                  'Public map views may show road damage, approximate report location and status. Your name, email and mobile number are restricted to authorized LGU staff who need them to review reports or contact you.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Authorized LGU use',
              content:
                  'Authorized reviewers and assigned maintenance staff use relevant report data to verify the location, check duplicates, plan repairs and document completion. Access should be role-limited and decisions recorded for accountability.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Your rights under RA 10173',
              content:
                  'The Data Privacy Act of 2012 recognizes rights including information, access, correction and objection, and erasure or blocking where applicable. Requests may require identity checks and consideration of lawful records obligations.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Retention and security',
              content:
                  'Report evidence and audit records should be retained only for a documented operational or lawful purpose. A production LGU must publish its own retention schedule, safeguards and disposal process. This demo does not set an official retention period.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: 'Questions and requests',
              content:
                  'Use Contact Support for this fictional demonstration, or support@example.com. Do not send passwords, OTPs or sensitive identity documents. A real deployment must identify its responsible office and official privacy contact.',
            ),
            const SizedBox(height: 24),

            // Back to account settings button
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
