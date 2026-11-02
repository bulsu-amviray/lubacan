import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import '../app_routes.dart';
import '../data/reports_store.dart';
import '../models/pothole_report.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/round_pushpin.dart';
import '../widgets/status_badge.dart';

class ReportDetailsScreen extends StatefulWidget {
  const ReportDetailsScreen({super.key, this.reportId});

  final String? reportId;

  @override
  State<ReportDetailsScreen> createState() => _ReportDetailsScreenState();
}

class _ReportDetailsScreenState extends State<ReportDetailsScreen> {
  final _store = ReportsStore.instance;

  @override
  void initState() {
    super.initState();
    _store.addListener(_onStoreChanged);
  }

  @override
  void dispose() {
    _store.removeListener(_onStoreChanged);
    super.dispose();
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  Widget _buildEvidenceImage(String? imagePathOrUrl) {
    if (imagePathOrUrl == null || imagePathOrUrl.isEmpty) {
      return const SizedBox.shrink();
    }
    if (imagePathOrUrl.startsWith('data:image')) {
      try {
        final base64Data = imagePathOrUrl.split(',').last;
        final bytes = base64Decode(base64Data);
        return Image.memory(bytes, fit: BoxFit.cover);
      } catch (_) {
        return const SizedBox.shrink();
      }
    }
    if (imagePathOrUrl.startsWith('http://') ||
        imagePathOrUrl.startsWith('https://')) {
      return Image.network(
        imagePathOrUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
      );
    }
    final file = File(imagePathOrUrl);
    if (file.existsSync()) {
      return Image.file(file, fit: BoxFit.cover);
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    // Determine report ID from arguments or widget property
    final argId = ModalRoute.of(context)?.settings.arguments as String?;
    final targetId = widget.reportId ?? argId ?? 'RW-2026-0842';
    final report = _store.getReportById(targetId) ?? _store.allReports.first;

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Report details'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top ID and Status Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  report.id,
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                StatusBadge(status: report.status),
              ],
            ),
            const SizedBox(height: 12),

            // Road Photo container
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Container(
                height: 190,
                color: const Color(0xFF1B2A3D),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (report.imageUrl != null && report.imageUrl!.isNotEmpty)
                      _buildEvidenceImage(report.imageUrl)
                    else ...[
                      Image.asset(
                        'assets/images/luba_logo.png',
                        fit: BoxFit.contain,
                        color: Colors.white.withAlpha(25),
                      ),
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              report.isResolved
                                  ? Icons.task_alt_rounded
                                  : Icons.photo_camera_rounded,
                              color: Colors.white70,
                              size: 44,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              report.isResolved
                                  ? 'Repaired Site Photo · Verified'
                                  : 'Road Damage Evidence Photo',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              '${report.roadName} · ${report.severity} Severity',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Title & Address
            Text(
              report.roadName,
              style: const TextStyle(
                color: AppColors.navy,
                fontSize: 22,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              report.address,
              style: const TextStyle(
                color: AppColors.muted,
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 14),

            // Metadata Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.subtleBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _metaRow(
                    'Reported by',
                    '${report.reportedBy} · ${report.reportedAt}',
                  ),
                  const SizedBox(height: 8),
                  _metaRow(
                    'Severity',
                    '${report.severity} · confirmed by LGU',
                    valueColor: report.severityColor,
                  ),
                  if (report.repairTeam != null) ...[
                    const SizedBox(height: 8),
                    _metaRow('Repair team', report.repairTeam!),
                  ],
                  const SizedBox(height: 12),
                  const Divider(height: 1, color: AppColors.subtleBorder),
                  const SizedBox(height: 12),
                  Text(
                    report.description,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 13,
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Location Map Section
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                height: 150,
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: report.location,
                    initialZoom: 15,
                    interactionOptions: const InteractionOptions(
                      flags: InteractiveFlag.none,
                    ),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.luba.canfindit',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: report.location,
                          width: 40,
                          height: 46,
                          alignment: Alignment.topCenter,
                          child: RoundPushpinMarker(
                            color: report.severityColor,
                            size: 36,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '${report.location.latitude.toStringAsFixed(4)}° N, ${report.location.longitude.toStringAsFixed(4)}° E',
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
            ),
            const SizedBox(height: 20),

            // Report History Timeline
            const Text(
              'Report history',
              style: TextStyle(
                color: AppColors.navy,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.subtleBorder),
              ),
              child: Column(
                children: [
                  for (int i = 0; i < report.timeline.length; i++)
                    _buildTimelineRow(
                      report.timeline[i],
                      isLast: i == report.timeline.length - 1,
                    ),
                ],
              ),
            ),

            // LGU Verification Note
            if (report.approvedBy != null) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.statusResolvedBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.statusResolved.withAlpha(40),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Repair verified by your LGU',
                      style: TextStyle(
                        color: AppColors.statusResolved,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      report.approvalNote ??
                          '${report.approvedBy} approved the repair on ${report.approvedAt}, after reviewing completion evidence.',
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

            // Verified Repair Section with after photo
            if (report.isResolved) ...[
              const SizedBox(height: 18),
              const Text(
                'Verified repair',
                style: TextStyle(
                  color: AppColors.navy,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  height: 160,
                  color: const Color(0xFF133626),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.verified_rounded,
                              color: Color(0xFF68D391),
                              size: 40,
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Repaired Road Surface',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              'After photo · ${report.repairTeam ?? 'Team Alpha'} · 21 Oct, 10:35 AM',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'After photo · ${report.repairTeam ?? 'Team Alpha'} · 21 Oct, 10:35 AM',
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
            ],

            const SizedBox(height: 22),

            // Actions: If Resolved -> Rate repair button
            if (report.isResolved) ...[
              SizedBox(
                height: 50,
                child: FilledButton.icon(
                  onPressed: () {
                    Navigator.of(
                      context,
                    ).pushNamed(AppRoutes.rateRepair, arguments: report.id);
                  },
                  icon: const Icon(Icons.star_border_rounded, size: 20),
                  label: Text(
                    report.rating != null
                        ? 'Edit repair feedback (Rated ${report.rating}★)'
                        : '☆ How was the repair? Leave feedback',
                    style: const TextStyle(fontWeight: FontWeight.w600),
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
              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.of(
                      context,
                    ).pushNamed(AppRoutes.contactSupport, arguments: report.id);
                  },
                  child: const Text(
                    'Report an issue with this repair',
                    style: TextStyle(
                      color: AppColors.muted,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],

            // If Submitted -> Edit / Cancel buttons
            if (report.canEdit) ...[
              SizedBox(
                height: 50,
                child: FilledButton.icon(
                  onPressed: () {
                    Navigator.of(
                      context,
                    ).pushNamed(AppRoutes.editReport, arguments: report.id);
                  },
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  label: const Text(
                    'Edit submitted report',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.navy,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(11),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.of(
                      context,
                    ).pushNamed(AppRoutes.cancelReport, arguments: report.id);
                  },
                  icon: const Icon(
                    Icons.cancel_outlined,
                    size: 18,
                    color: AppColors.statusDanger,
                  ),
                  label: const Text(
                    'Cancel / Withdraw report',
                    style: TextStyle(
                      color: AppColors.statusDanger,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFF8B4B4)),
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(11),
                    ),
                  ),
                ),
              ),
            ],

            if (report.isCancelled) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDE8E8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Report Withdrawn',
                      style: TextStyle(
                        color: Color(0xFF9B1C1C),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Reason: ${report.cancellationReason ?? 'Cancelled by citizen'}',
                      style: const TextStyle(
                        color: Color(0xFF9B1C1C),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }

  Widget _metaRow(String label, String value, {Color? valueColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 95,
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
            style: TextStyle(
              color: valueColor ?? AppColors.navy,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineRow(ReportTimelineEvent event, {bool isLast = false}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vertical indicator line + dot
          SizedBox(
            width: 20,
            child: Column(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: AppColors.statusResolved,
                    shape: BoxShape.circle,
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(width: 2, color: AppColors.subtleBorder),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${event.status} · ${event.timestamp}',
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    event.description,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
