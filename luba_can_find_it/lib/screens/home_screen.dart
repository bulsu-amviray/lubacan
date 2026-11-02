import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import '../app_routes.dart';
import '../core/auth/session_manager.dart';
import '../data/reports_store.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/round_pushpin.dart';
import 'my_reports_screen.dart';
import 'notifications_screen.dart';
import 'profile_screen.dart';

const _navy = Color(0xFF153456);
const _orange = Color(0xFFE6531A);
const _pageBackground = Color(0xFFF2F6FB);
const _muted = Color(0xFF647B98);
const _border = Color(0xFFDCE5EF);
const _malolosCenter = LatLng(14.8435, 120.8113);

class _DemoReport {
  const _DemoReport({
    required this.id,
    required this.road,
    required this.address,
    required this.location,
    required this.date,
    required this.severity,
    required this.status,
  });

  final String id;
  final String road;
  final String address;
  final String date;
  final String severity;
  final String status;
  final LatLng location;

  Color get severityColor => switch (severity) {
    'High' => const Color(0xFFC63838),
    'Medium' => const Color(0xFFE5A02D),
    _ => const Color(0xFF2769A9),
  };

  Color get statusColor => switch (status) {
    'Resolved' => const Color(0xFF168054),
    'In Progress' => const Color(0xFF185A9D),
    _ => const Color(0xFF986000),
  };

  Color get statusBackground => switch (status) {
    'Resolved' => const Color(0xFFE4F4EC),
    'In Progress' => const Color(0xFFE8F1FC),
    _ => const Color(0xFFFFF1DB),
  };
}

const _demoReports = <_DemoReport>[
  _DemoReport(
    id: 'RW-2026-0798',
    road: 'Blas Ople Diversion Road',
    address: 'Bulihan, Malolos',
    date: '16 Oct 2026 · 3:42 PM',
    severity: 'Medium',
    status: 'Resolved',
    location: LatLng(14.8460, 120.8110),
  ),
  _DemoReport(
    id: 'RW-2026-0771',
    road: 'Paseo del Congreso',
    address: 'Catmon, Malolos',
    date: '12 Oct 2026 · 8:15 AM',
    severity: 'Low',
    status: 'In Progress',
    location: LatLng(14.8415, 120.8150),
  ),
  _DemoReport(
    id: 'RW-2026-0842',
    road: 'MacArthur Highway',
    address: 'Guinhawa, Malolos',
    date: '19 Oct 2026 · 9:24 AM',
    severity: 'High',
    status: 'Submitted',
    location: LatLng(14.8524, 120.8168),
  ),
];

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _mapController = MapController();
  int _selectedTab = 0;
  LatLng? _userLocation;
  bool _isLocating = false;

  @override
  void initState() {
    super.initState();
    ReportsStore.instance.addListener(_onReportsChanged);
    SessionManager.instance.addListener(_onReportsChanged);
  }

  @override
  void dispose() {
    ReportsStore.instance.removeListener(_onReportsChanged);
    SessionManager.instance.removeListener(_onReportsChanged);
    super.dispose();
  }

  void _onReportsChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _findMyLocation() async {
    setState(() => _isLocating = true);
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!mounted) return;
      if (!serviceEnabled) {
        _showMessage('Turn on Location Services to find your location.');
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (!mounted) return;
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        _showMessage(
          'Location permission was not granted. The demo map is still available.',
        );
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );
      if (!mounted) return;
      final point = LatLng(position.latitude, position.longitude);
      setState(() => _userLocation = point);
      _mapController.move(point, 15);
    } on Exception {
      if (mounted) {
        _showMessage('Could not get your location. Please try again later.');
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  final List<int> _tabHistory = [0];

  void _onTabTapped(int index) {
    if (_selectedTab == index) return;
    setState(() {
      _selectedTab = index;
      _tabHistory.remove(index);
      _tabHistory.add(index);
    });
  }

  void _handleBack() {
    if (_tabHistory.length > 1) {
      setState(() {
        _tabHistory.removeLast();
        _selectedTab = _tabHistory.last;
      });
    } else if (_selectedTab != 0) {
      setState(() {
        _selectedTab = 0;
        _tabHistory.clear();
        _tabHistory.add(0);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      _buildHomePage(),
      const MyReportsScreen(isStandalone: false),
      const NotificationsScreen(isStandalone: false),
      const ProfileScreen(isStandalone: false),
    ];

    return PopScope(
      canPop: _tabHistory.length <= 1 && _selectedTab == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleBack();
      },
      child: Scaffold(
        backgroundColor: _pageBackground,
        body: SafeArea(
          bottom: false,
          child: IndexedStack(index: _selectedTab, children: pages),
        ),
        bottomNavigationBar: SafeArea(
          top: false,
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: _border)),
            ),
            padding: const EdgeInsets.only(top: 7, bottom: 4),
            child: Row(
              children: [
                _navItem(Icons.home_outlined, 'Home', 0),
                _navItem(Icons.assignment_outlined, 'My Reports', 1),
                _navItem(Icons.notifications_none_rounded, 'Alerts', 2),
                _navItem(Icons.person_outline_rounded, 'Profile', 3),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, String label, int index) {
    final active = _selectedTab == index;
    final color = active ? _orange : _muted;
    return Expanded(
      child: InkWell(
        onTap: () => _onTabTapped(index),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 5),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  color: color,
                  fontSize: 10,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHomePage() {
    final liveReports = ReportsStore.instance.myReports;
    final displayReports = liveReports
        .take(3)
        .map((r) => _DemoReport(
              id: r.id,
              road: r.roadName,
              address: r.address,
              location: r.location,
              date: r.reportedAt,
              severity: r.severity,
              status: r.status,
            ))
        .toList();

    return RefreshIndicator(
      onRefresh: () => ReportsStore.instance.syncFromSupabase(),
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _buildHeader()),
          SliverToBoxAdapter(child: _buildLocation()),
          SliverToBoxAdapter(child: _buildHero()),
          SliverToBoxAdapter(child: _buildNearbyMap()),
          SliverToBoxAdapter(child: _buildRecentHeading()),
          displayReports.isEmpty
              ? SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _border),
                    ),
                    child: const Column(
                      children: [
                        Icon(
                          Icons.assignment_outlined,
                          size: 38,
                          color: _muted,
                        ),
                        SizedBox(height: 8),
                        Text(
                          'No reports submitted yet',
                          style: TextStyle(
                            color: _navy,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Potholes you report will appear here so you can track repair progress.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: _muted,
                            fontSize: 12,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _ReportCard(report: displayReports[index]),
                      ),
                      childCount: displayReports.length,
                    ),
                  ),
                ),
        ],
      ),
    );
  }

  String _greetingText() {
    final hour = DateTime.now().hour;
    final timeGreeting = hour < 12
        ? 'Good morning'
        : hour < 18
            ? 'Good afternoon'
            : 'Good evening';
    final name = (SessionManager.instance.currentUser?.fullName ??
            ReportsStore.instance.profile.fullName)
        .trim();
    if (name.isEmpty) return timeGreeting;
    final firstName = name.split(' ').first;
    return '$timeGreeting, $firstName';
  }

  String _headerEyebrow() {
    final muni = (SessionManager.instance.currentUser?.municipality ??
            ReportsStore.instance.profile.municipality)
        .trim();
    return 'CITIZEN / ${muni.isNotEmpty ? muni.toUpperCase() : 'MALOLOS'}';
  }

  Widget _buildHeader() {
    return Container(
      height: AppTopBar.kHeaderHeight,
      padding: const EdgeInsets.fromLTRB(22, 0, 14, 0),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: _border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _headerEyebrow(),
                  style: const TextStyle(
                    color: _orange,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _greetingText(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: _navy,
                    fontSize: 19,
                    height: 1.2,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          Stack(
            children: [
              IconButton(
                tooltip: 'Alerts',
                onPressed: () => _onTabTapped(2),
                icon: const Icon(
                  Icons.notifications_none_rounded,
                  color: _navy,
                  size: 24,
                ),
              ),
              if (ReportsStore.instance.unreadNotificationsCount > 0)
                Positioned(
                  top: 8,
                  right: 9,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: _orange,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocation() {
    return const Padding(
      padding: EdgeInsets.fromLTRB(24, 13, 24, 12),
      child: Row(
        children: [
          Icon(Icons.location_on_outlined, color: _orange, size: 17),
          SizedBox(width: 8),
          Text(
            'Malolos, Bulacan',
            style: TextStyle(
              color: _muted,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(width: 5),
          Icon(Icons.keyboard_arrow_down_rounded, color: _navy, size: 18),
        ],
      ),
    );
  }

  Widget _buildHero() {
    return Container(
      margin: const EdgeInsets.fromLTRB(24, 0, 24, 20),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: _navy,
        borderRadius: BorderRadius.circular(19),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: Text(
                  'A safer road\nstarts with you.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 23,
                    height: 1.45,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Icon(
                Icons.tune_rounded,
                color: Color(0xFFFFA45D),
                size: 41,
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Spot a pothole? Let your LGU know.',
            style: TextStyle(color: Color(0xFFD1DDEC), fontSize: 12),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: FilledButton.icon(
              onPressed: () =>
                  Navigator.of(context).pushNamed(AppRoutes.report),
              icon: const Icon(Icons.add_rounded, size: 21),
              label: const Text(
                'Report a pothole',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              style: FilledButton.styleFrom(
                backgroundColor: _orange,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(11),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNearbyMap() {
    final liveReports = ReportsStore.instance.allReports;
    final mapReports = liveReports.isNotEmpty
        ? liveReports
            .map((r) => _DemoReport(
                  id: r.id,
                  road: r.roadName,
                  address: r.address,
                  location: r.location,
                  date: r.reportedAt,
                  severity: r.severity,
                  status: r.status,
                ))
            .toList()
        : _demoReports;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Near you',
                  style: TextStyle(
                    color: _navy,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              TextButton(
                onPressed: _openFullMap,
                style: TextButton.styleFrom(
                  foregroundColor: _orange,
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(48, 40),
                ),
                child: const Text(
                  'Full map',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: SizedBox(
              height: 230,
              child: FlutterMap(
                mapController: _mapController,
                options: const MapOptions(
                  initialCenter: _malolosCenter,
                  initialZoom: 14.5,
                  minZoom: 11,
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
                      for (final report in mapReports)
                        Marker(
                          point: report.location,
                          width: 38,
                          height: 44,
                          alignment: Alignment.topCenter,
                          child: GestureDetector(
                            onTap: () {
                              Navigator.of(context).pushNamed(
                                AppRoutes.reportDetails,
                                arguments: report.id,
                              );
                            },
                            child: RoundPushpinMarker(
                              color: report.severityColor,
                              size: 34,
                            ),
                          ),
                        ),
                      if (_userLocation != null)
                        Marker(
                          point: _userLocation!,
                          width: 20,
                          height: 20,
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
                  RichAttributionWidget(
                    attributions: [
                      TextSourceAttribution('OpenStreetMap contributors'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _legend('High', const Color(0xFFC63838)),
              const Spacer(),
              _legend('Medium', const Color(0xFFE5A02D)),
              const Spacer(),
              _legend('Low', const Color(0xFF2769A9)),
              const SizedBox(width: 4),
              Material(
                color: Colors.white,
                shape: const CircleBorder(),
                child: IconButton(
                  tooltip: 'Find my location',
                  onPressed: _isLocating ? null : _findMyLocation,
                  icon: _isLocating
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.my_location, color: _navy, size: 19),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          const Text(
            'Sample map markers only; not verified reports. Avoid stopping in traffic to take photos.',
            style: TextStyle(color: _muted, fontSize: 11, height: 1.45),
          ),
        ],
      ),
    );
  }

  Widget _legend(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 9,
          height: 9,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: const TextStyle(
            color: _muted,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildRecentHeading() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 0),
      child: Column(
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Your recent reports',
                  style: TextStyle(
                    color: _navy,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _selectedTab = 1),
                style: TextButton.styleFrom(
                  foregroundColor: _orange,
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(48, 40),
                ),
                child: const Text(
                  'View all',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: EdgeInsets.only(bottom: 3),
              child: Text(
                'Illustrative sample reports',
                style: TextStyle(color: _muted, fontSize: 10),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openFullMap() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute<void>(builder: (_) => const _FullMapScreen()));
  }
}

class _ReportCard extends StatelessWidget {
  const _ReportCard({required this.report});

  final _DemoReport report;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(17),
      onTap: () {
        Navigator.of(context).pushNamed(
          AppRoutes.reportDetails,
          arguments: report.id,
        );
      },
      child: Container(
        padding: const EdgeInsets.all(17),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: _border),
          borderRadius: BorderRadius.circular(17),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    report.id,
                    style: const TextStyle(
                      color: _muted,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: report.statusBackground,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    report.status,
                    style: TextStyle(
                      color: report.statusColor,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              report.road,
              style: const TextStyle(
                color: _navy,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 11),
            Text(
              report.address,
              style: const TextStyle(color: _muted, fontSize: 12),
            ),
            const SizedBox(height: 5),
            Text(
              report.date,
              style: const TextStyle(color: _muted, fontSize: 12),
            ),
            const SizedBox(height: 11),
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
                  size: 14,
                  color: report.severityColor,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FullMapScreen extends StatelessWidget {
  const _FullMapScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Potholes near you'),
        backgroundColor: Colors.white,
        foregroundColor: _navy,
      ),
      body: FlutterMap(
        options: const MapOptions(
          initialCenter: _malolosCenter,
          initialZoom: 14,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.luba.canfindit',
          ),
          MarkerLayer(
            markers: [
              for (final report in _demoReports)
                Marker(
                  point: report.location,
                  width: 38,
                  height: 44,
                  alignment: Alignment.topCenter,
                  child: RoundPushpinMarker(
                    color: report.severityColor,
                    size: 34,
                  ),
                ),
            ],
          ),
          RichAttributionWidget(
            attributions: [TextSourceAttribution('OpenStreetMap contributors')],
          ),
        ],
      ),
    );
  }
}
