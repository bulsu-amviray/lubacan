import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../theme/app_theme.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/round_pushpin.dart';

class SetPotholeLocationScreen extends StatefulWidget {
  const SetPotholeLocationScreen({super.key, this.initialLocation});

  final LatLng? initialLocation;

  @override
  State<SetPotholeLocationScreen> createState() =>
      _SetPotholeLocationScreenState();
}

class _SetPotholeLocationScreenState extends State<SetPotholeLocationScreen> {
  final _mapController = MapController();
  final _searchController = TextEditingController(
    text: 'MacArthur Highway, Malolos, Bulacan',
  );

  late LatLng _pin;
  bool _isLocating = false;
  String _accuracyText = 'GPS accuracy ±8 m';
  String _detectionTime = 'GPS · 19 Oct 2026, 9:20 AM';
  final String _roadName = 'MacArthur Highway';
  final String _address =
      'Northbound lane near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan';

  @override
  void initState() {
    super.initState();
    _pin = widget.initialLocation ?? const LatLng(14.8524, 120.8168);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _detectLocation() async {
    setState(() => _isLocating = true);
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please enable device location services.'),
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
      setState(() {
        _pin = point;
        _accuracyText = 'GPS accuracy ±${pos.accuracy.toStringAsFixed(0)} m';
        final now = DateTime.now();
        _detectionTime =
            'GPS · ${now.day} Oct ${now.year}, ${now.hour % 12 == 0 ? 12 : now.hour % 12}:${now.minute.toString().padLeft(2, '0')} ${now.hour < 12 ? 'AM' : 'PM'}';
      });
      _mapController.move(point, 16);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Unable to detect location. Tap the map to position.',
            ),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Set pothole location'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Search Input
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
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
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

            // Location detected banner
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
                    'Location detected',
                    style: TextStyle(
                      color: AppColors.statusResolved,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '$_accuracyText. Adjust the pin to the damaged road, not your current position.',
                    style: const TextStyle(
                      color: AppColors.statusResolved,
                      fontSize: 12,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Map with movable/draggable pin
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                height: 250,
                child: FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _pin,
                    initialZoom: 16,
                    onTap: (_, point) {
                      setState(() {
                        _pin = point;
                        _accuracyText = 'Manual pin adjusted';
                        _detectionTime =
                            'Manual pin · ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}';
                      });
                    },
                    onPositionChanged: (pos, hasGesture) {
                      if (hasGesture) {
                        setState(() {
                          _pin = pos.center;
                        });
                      }
                    },
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
                          point: _pin,
                          width: 44,
                          height: 50,
                          alignment: Alignment.topCenter,
                          child: const RoundPushpinMarker(
                            color: AppColors.orange,
                            size: 40,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 6),
            const Row(
              children: [
                Icon(
                  Icons.touch_app_outlined,
                  size: 15,
                  color: AppColors.muted,
                ),
                SizedBox(width: 4),
                Text(
                  'Drag map or tap to reposition the pothole pin.',
                  style: TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Location details card
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
                  Text(
                    _roadName,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _address,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Coordinates · ${_pin.latitude.toStringAsFixed(5)}° N, ${_pin.longitude.toStringAsFixed(5)}° E',
                    style: const TextStyle(color: AppColors.navy, fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Detection · $_detectionTime',
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Use this location button
            SizedBox(
              height: 50,
              child: FilledButton.icon(
                onPressed: () {
                  Navigator.of(context).pop(_pin);
                },
                icon: const Icon(Icons.check_rounded, size: 20),
                label: const Text(
                  'Use this location',
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

            // Detect my location again button
            SizedBox(
              height: 48,
              child: OutlinedButton.icon(
                onPressed: _isLocating ? null : _detectLocation,
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
                  'Detect my location again',
                  style: TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.subtleBorder),
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
