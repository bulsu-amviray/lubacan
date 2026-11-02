import 'package:flutter/material.dart';

import '../app_routes.dart';
import '../core/auth/session_manager.dart';
import '../data/reports_store.dart';
import '../widgets/app_top_bar.dart';

const _successNavy = Color(0xFF153456);
const _successOrange = Color(0xFFE6531A);
const _successBackground = Color(0xFFF2F6FB);
const _successMuted = Color(0xFF647B98);
const _successBorder = Color(0xFFDCE5EF);

class ReportSubmission {
  const ReportSubmission({
    required this.referenceId,
    required this.roadName,
    required this.address,
    required this.description,
    required this.severity,
    required this.latitude,
    required this.longitude,
    required this.submittedAt,
  });

  final String referenceId;
  final String roadName;
  final String address;
  final String description;
  final String severity;
  final double latitude;
  final double longitude;
  final DateTime submittedAt;
}

class ReportSubmittedScreen extends StatelessWidget {
  const ReportSubmittedScreen({super.key, required this.submission});

  final ReportSubmission submission;

  String _firstName() {
    final name = (SessionManager.instance.currentUser?.fullName ??
            ReportsStore.instance.profile.fullName)
        .trim();
    if (name.isEmpty) return 'Citizen';
    return name.split(' ').first;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
        } else {
          Navigator.of(context).pushNamedAndRemoveUntil(
            AppRoutes.home,
            (route) => false,
          );
        }
      },
      child: Scaffold(
        backgroundColor: _successBackground,
        body: SafeArea(
          child: Column(
            children: [
              _buildHeader(context),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 22, 24, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 8),
                      const Center(
                        child: CircleAvatar(
                        radius: 45,
                        backgroundColor: Color(0xFFE4F4EC),
                        child: CircleAvatar(
                          radius: 21,
                          backgroundColor: Colors.transparent,
                          foregroundColor: Color(0xFF168054),
                          child: Icon(Icons.check_rounded, size: 25),
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      'Thank you, ${_firstName()}.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: _successNavy,
                        fontSize: 27,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Your report is ready for review. Your community thanks you for helping make roads safer.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _successMuted,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 26),
                    _buildReportCard(),
                    const SizedBox(height: 18),
                    _buildNextSteps(),
                    const SizedBox(height: 18),
                    SizedBox(
                      height: 50,
                      child: FilledButton.icon(
                        onPressed: () {
                          Navigator.of(context).pushReplacementNamed(
                            AppRoutes.reportDetails,
                            arguments: submission.referenceId,
                          );
                        },
                        icon: const Icon(Icons.assignment_outlined, size: 20),
                        label: const Text(
                          'Track my report',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                        style: FilledButton.styleFrom(
                          backgroundColor: _successOrange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(11),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 50,
                      child: OutlinedButton(
                        onPressed: () =>
                            Navigator.of(context).pushNamedAndRemoveUntil(
                              AppRoutes.home,
                              (route) => false,
                            ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _successNavy,
                          backgroundColor: Colors.white,
                          side: const BorderSide(color: _successBorder),
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
                    const SizedBox(height: 12),
                    const Text(
                      'Demo reference only — this report has not been sent to a server.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _successMuted,
                        fontSize: 11,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

  Widget _buildHeader(BuildContext context) {
    return Container(
      height: AppTopBar.kHeaderHeight,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: _successBorder)),
      ),
      child: Row(
        children: [
          IconButton(
            tooltip: 'Back',
            onPressed: () {
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else {
                Navigator.of(context).pushNamedAndRemoveUntil(
                  AppRoutes.home,
                  (route) => false,
                );
              }
            },
            icon: const Icon(Icons.arrow_back_rounded, color: _successNavy, size: 22),
          ),
          const SizedBox(width: 4),
          const Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CITIZEN / BULACAN',
                  style: TextStyle(
                    color: _successOrange,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Report submitted',
                  style: TextStyle(
                    color: _successNavy,
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReportCard() {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _successBorder),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'YOUR REPORT ID',
            style: TextStyle(
              color: _successMuted,
              fontSize: 10,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 10),
          SelectableText(
            submission.referenceId,
            style: const TextStyle(
              color: _successNavy,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F1FC),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'Pending review',
              style: TextStyle(
                color: Color(0xFF185A9D),
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 15),
          _detailLine('Road', submission.roadName),
          const SizedBox(height: 9),
          _detailLine('Location', submission.address),
          const SizedBox(height: 9),
          _detailLine('Submitted', _formatDate(submission.submittedAt)),
          const SizedBox(height: 9),
          _detailLine('Severity', '${submission.severity} · awaiting review'),
        ],
      ),
    );
  }

  Widget _detailLine(String label, String value) {
    return Text.rich(
      TextSpan(
        style: const TextStyle(color: _successNavy, fontSize: 12, height: 1.4),
        children: [
          TextSpan(
            text: '$label · ',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          TextSpan(text: value),
        ],
      ),
    );
  }

  Widget _buildNextSteps() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF2FC),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'What happens next?',
            style: TextStyle(
              color: Color(0xFF185A9D),
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'In a live service, the LGU would review the photo, confirm the location, and check for duplicate reports.',
            style: TextStyle(
              color: Color(0xFF185A9D),
              fontSize: 12,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    final hour = date.hour % 12 == 0 ? 12 : date.hour % 12;
    final minute = date.minute.toString().padLeft(2, '0');
    final period = date.hour < 12 ? 'AM' : 'PM';
    return '${date.day} ${months[date.month - 1]} ${date.year} · $hour:$minute $period';
  }
}
