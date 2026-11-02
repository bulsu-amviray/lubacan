import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status, this.fontSize = 11});

  final String status;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final (Color color, Color bg) = switch (status) {
      'Resolved' => (AppColors.statusResolved, AppColors.statusResolvedBg),
      'In Progress' => (
        AppColors.statusInProgress,
        AppColors.statusInProgressBg,
      ),
      'Cancelled' => (AppColors.statusDanger, AppColors.statusDangerBg),
      'Verified' => (AppColors.statusInProgress, AppColors.statusInProgressBg),
      'Assigned' => (AppColors.statusInProgress, AppColors.statusInProgressBg),
      _ => (AppColors.statusPending, AppColors.statusPendingBg),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
