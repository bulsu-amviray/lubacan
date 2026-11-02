import 'package:flutter/material.dart';
import '../app_routes.dart';
import '../data/reports_store.dart';
import '../models/pothole_report.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/status_badge.dart';

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key, this.isStandalone = false});

  final bool isStandalone;

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  final _searchController = TextEditingController();
  final _store = ReportsStore.instance;

  String _filter = 'All'; // 'All', 'Open', 'Resolved'

  @override
  void initState() {
    super.initState();
    _store.addListener(_onStoreChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _store.removeListener(_onStoreChanged);
    super.dispose();
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _filter = 'All';
    });
  }

  List<PotholeReport> get _filteredReports {
    final reports = _store.myReports;
    final query = _searchController.text.trim().toLowerCase();

    return reports.where((r) {
      final matchesFilter = switch (_filter) {
        'Open' => !r.isResolved && !r.isCancelled,
        'Resolved' => r.isResolved,
        _ => true,
      };

      final matchesQuery =
          query.isEmpty ||
          r.roadName.toLowerCase().contains(query) ||
          r.address.toLowerCase().contains(query) ||
          r.id.toLowerCase().contains(query);

      return matchesFilter && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final myReports = _store.myReports;
    final allCount = myReports.length;
    final openCount = myReports
        .where((r) => !r.isResolved && !r.isCancelled)
        .length;
    final resolvedCount = myReports.where((r) => r.isResolved).length;

    final displayed = _filteredReports;
    final isFiltering =
        _searchController.text.trim().isNotEmpty || _filter != 'All';

    final body = Column(
      children: [
        // Search & Filter header section
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search input
              TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Search by road or report ID',
                  hintStyle: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 13,
                  ),
                  prefixIcon: const Icon(
                    Icons.search_rounded,
                    color: AppColors.muted,
                    size: 20,
                  ),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(
                            Icons.clear_rounded,
                            size: 18,
                            color: AppColors.muted,
                          ),
                          onPressed: () =>
                              setState(() => _searchController.clear()),
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.pageBackground,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 11,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.subtleBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.subtleBorder),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: AppColors.orange,
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Filter pills: All, Open, Resolved
              Row(
                children: [
                  _filterPill('All $allCount', 'All'),
                  const SizedBox(width: 8),
                  _filterPill('Open $openCount', 'Open'),
                  const SizedBox(width: 8),
                  _filterPill('Resolved $resolvedCount', 'Resolved'),
                ],
              ),
            ],
          ),
        ),

        // Subheader count
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
          child: Row(
            children: [
              Text(
                displayed.isEmpty && isFiltering
                    ? '0 matching reports · ${_filter == 'All' ? 'Search results' : '$_filter only'}'
                    : '${displayed.length} reports · Newest first ↓',
                style: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),

        // Report list or empty state
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => _store.syncFromSupabase(),
            child: displayed.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      _buildEmptyState(),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
                  itemCount: displayed.length + 1,
                  itemBuilder: (context, index) {
                    if (index == displayed.length) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 8, bottom: 12),
                        child: SizedBox(
                          height: 50,
                          child: FilledButton.icon(
                            onPressed: () => Navigator.of(
                              context,
                            ).pushNamed(AppRoutes.report),
                            icon: const Icon(Icons.add_rounded, size: 20),
                            label: const Text(
                              'Report another pothole',
                              style: TextStyle(fontWeight: FontWeight.w600),
                            ),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.orange,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(11),
                              ),
                            ),
                          ),
                        ),
                      );
                    }
                    final report = displayed[index];
                    return _buildReportItem(report);
                  },
                ),
          ),
        ),
      ],
    );

    if (!widget.isStandalone) {
      return Scaffold(
        backgroundColor: AppColors.pageBackground,
        body: Column(
          children: [
            AppTopBar(
              title: 'My reports',
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
      appBar: const AppTopBar(title: 'My reports'),
      body: body,
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }

  Widget _filterPill(String label, String value) {
    final active = _filter == value;
    return InkWell(
      onTap: () => setState(() => _filter = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: active ? AppColors.navy : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active ? AppColors.navy : AppColors.subtleBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : AppColors.muted,
            fontSize: 12,
            fontWeight: active ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildReportItem(PotholeReport report) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.subtleBorder),
      ),
      child: InkWell(
        onTap: () {
          Navigator.of(
            context,
          ).pushNamed(AppRoutes.reportDetails, arguments: report.id);
        },
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    report.id,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  StatusBadge(status: report.status),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                report.roadName,
                style: const TextStyle(
                  color: AppColors.navy,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                report.address,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
              const SizedBox(height: 4),
              Text(
                report.reportedAt,
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Text(
                    '${report.severity} severity',
                    style: TextStyle(
                      color: report.severityColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward_rounded,
                    size: 13,
                    color: report.severityColor,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    final query = _searchController.text.trim();
    final hasNoUserReports = _store.myReports.isEmpty;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 36),
          // Circle icon
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFF0F5FA),
              border: Border.all(color: AppColors.subtleBorder, width: 2),
            ),
            child: Icon(
              hasNoUserReports
                  ? Icons.assignment_outlined
                  : Icons.close_rounded,
              color: AppColors.muted,
              size: 32,
            ),
          ),
          const SizedBox(height: 18),
          Text(
            hasNoUserReports ? 'No reports submitted yet' : 'No reports found',
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            hasNoUserReports
                ? 'You have not uploaded any pothole reports yet. Reports you submit will appear here with live tracking.'
                : (query.isNotEmpty
                    ? 'We couldn\'t find "$query" in your ${_filter.toLowerCase()} reports. Try another road or clear your filters.'
                    : 'No reports match your current filter selection.'),
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 13,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 22),
          if (hasNoUserReports)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton.icon(
                onPressed: () {
                  Navigator.of(context).pushNamed(AppRoutes.report);
                },
                icon: const Icon(Icons.add_circle_outline, size: 20),
                label: const Text(
                  'Report a pothole now',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            )
          else ...[
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton(
                onPressed: _clearFilters,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  'Clear search & filters',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _searchController.clear();
                    _filter = 'All';
                  });
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.navy,
                  backgroundColor: Colors.white,
                  side: const BorderSide(color: AppColors.subtleBorder),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  'View all my reports',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
          const SizedBox(height: 28),

          // Looking for nearby reports banner
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
                  'Looking for nearby reports?',
                  style: TextStyle(
                    color: AppColors.statusInProgress,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'The home map includes reports from your community, not just your own.',
                  style: TextStyle(
                    color: AppColors.statusInProgress,
                    fontSize: 12,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
