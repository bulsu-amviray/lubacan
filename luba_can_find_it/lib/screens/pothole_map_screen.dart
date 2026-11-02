import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../app_routes.dart';
import '../data/reports_store.dart';
import '../models/pothole_report.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/round_pushpin.dart';
import '../widgets/status_badge.dart';

class PotholeMapScreen extends StatefulWidget {
  const PotholeMapScreen({super.key});

  @override
  State<PotholeMapScreen> createState() => _PotholeMapScreenState();
}

class _PotholeMapScreenState extends State<PotholeMapScreen> {
  final _mapController = MapController();
  final _searchController = TextEditingController(
    text: 'MacArthur Highway, Malolos, Bulacan',
  );
  final _store = ReportsStore.instance;

  String _severityFilter =
      'All severity'; // 'All severity', 'High', 'Medium', 'Low'
  String _statusFilter = 'All statuses'; // 'All statuses', 'Open', 'Resolved'
  String _distanceFilter =
      'Within 5 km'; // 'Within 2 km', 'Within 5 km', 'Citywide'

  LatLng? _userLocation;
  bool _isLocating = false;
  late PotholeReport _selectedReport;

  @override
  void initState() {
    super.initState();
    _selectedReport =
        _store.getReportById('RW-2026-0842') ?? _store.allReports.first;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _locateUser() async {
    setState(() => _isLocating = true);
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Turn on Location Services to detect location.'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Location permission was not granted.'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
        return;
      }

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      if (!mounted) return;
      final point = LatLng(pos.latitude, pos.longitude);
      setState(() => _userLocation = point);
      _mapController.move(point, 15);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not determine your location. Try again.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  List<PotholeReport> get _filteredReports {
    return _store.allReports.where((r) {
      final matchesSeverity = switch (_severityFilter) {
        'High' => r.severity == 'High',
        'Medium' => r.severity == 'Medium',
        'Low' => r.severity == 'Low',
        _ => true,
      };

      final matchesStatus = switch (_statusFilter) {
        'Open' => !r.isResolved && !r.isCancelled,
        'Resolved' => r.isResolved,
        _ => true,
      };

      return matchesSeverity && matchesStatus;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final reports = _filteredReports;

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Pothole map'),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Filter & Search Controls Header
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
              child: Column(
                children: [
                  // Search bar
                  TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search road / location',
                      hintStyle: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 13,
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: AppColors.muted,
                        size: 20,
                      ),
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
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                          color: AppColors.subtleBorder,
                        ),
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
                  const SizedBox(height: 10),

                  // Severity Pills
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: ['All severity', 'High', 'Medium', 'Low']
                          .map(
                            (s) => _pill(
                              s,
                              _severityFilter == s,
                              () => setState(() => _severityFilter = s),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Status & Distance Pills
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        ...['All statuses', 'Open', 'Resolved'].map(
                          (st) => _pill(
                            st,
                            _statusFilter == st,
                            () => setState(() => _statusFilter = st),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ...['Within 2 km', 'Within 5 km', 'Citywide'].map(
                          (d) => _pill(
                            d,
                            _distanceFilter == d,
                            () => setState(() => _distanceFilter = d),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Use my location button
                  SizedBox(
                    height: 40,
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _isLocating ? null : _locateUser,
                      icon: _isLocating
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(
                              Icons.my_location_rounded,
                              size: 18,
                              color: AppColors.navy,
                            ),
                      label: const Text(
                        'Use my location',
                        style: TextStyle(
                          color: AppColors.navy,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.subtleBorder),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Map Section
            SizedBox(
              height: 280,
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: _selectedReport.location,
                  initialZoom: 14.5,
                  minZoom: 10,
                  maxZoom: 19,
                ),
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.luba.canfindit',
                  ),
                  MarkerLayer(
                    markers: [
                      for (final report in reports)
                        Marker(
                          point: report.location,
                          width: 42,
                          height: 48,
                          alignment: Alignment.topCenter,
                          child: GestureDetector(
                            onTap: () {
                              setState(() => _selectedReport = report);
                              _mapController.move(report.location, 15);
                            },
                            child: RoundPushpinMarker(
                              color: report.severityColor,
                              size: 36,
                              isSelected: _selectedReport.id == report.id,
                            ),
                          ),
                        ),
                      if (_userLocation != null)
                        Marker(
                          point: _userLocation!,
                          width: 22,
                          height: 22,
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF2471C8),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 3),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),

            // Legend Row
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  _legend('High', AppColors.severityHigh),
                  const Spacer(),
                  _legend('Medium', AppColors.severityMedium),
                  const Spacer(),
                  _legend('Low', AppColors.severityLow),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(
                      Icons.my_location_rounded,
                      color: AppColors.navy,
                      size: 20,
                    ),
                    onPressed: _locateUser,
                    tooltip: 'Current location',
                  ),
                ],
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Text(
                'Illustrative Malolos map · 3 sample pins shown. Not live routing. Severity describes reported damage, not current repair status.',
                style: TextStyle(color: AppColors.muted, fontSize: 11),
              ),
            ),
            const SizedBox(height: 8),

            // Selected Report Bottom Card
            Container(
              margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.subtleBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Selected · ${_selectedReport.id}',
                        style: const TextStyle(
                          color: AppColors.navy,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      StatusBadge(status: _selectedReport.status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _selectedReport.roadName,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_selectedReport.address} · ${_selectedReport.severity} severity',
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${_selectedReport.location.latitude.toStringAsFixed(4)}° N, ${_selectedReport.location.longitude.toStringAsFixed(4)}° E · Approved 21 Oct, 11:20 AM PHT',
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.of(context).pushNamed(
                          AppRoutes.reportDetails,
                          arguments: _selectedReport.id,
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.navy,
                        side: const BorderSide(color: AppColors.subtleBorder),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        'View report',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.orange,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        'Return to home',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
    );
  }

  Widget _pill(String label, bool active, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
              fontSize: 11,
              fontWeight: active ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _legend(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.muted,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
