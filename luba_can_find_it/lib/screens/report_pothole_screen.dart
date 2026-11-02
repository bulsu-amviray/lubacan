import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';

import '../app_routes.dart';
import '../core/auth/session_manager.dart';
import '../core/supabase/supabase_service.dart';
import '../data/reports_store.dart';
import '../models/pothole_report.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/duplicate_report_dialog.dart';
import '../widgets/round_pushpin.dart';
import 'report_submitted_screen.dart';
import 'set_pothole_location_screen.dart';

const _reportNavy = Color(0xFF153456);
const _reportOrange = Color(0xFFE6531A);
const _reportBackground = Color(0xFFF2F6FB);
const _reportMuted = Color(0xFF647B98);
const _reportBorder = Color(0xFFDCE5EF);
const _startingPoint = LatLng(14.8435, 120.8113);

class ReportPotholeScreen extends StatefulWidget {
  const ReportPotholeScreen({super.key});

  @override
  State<ReportPotholeScreen> createState() => _ReportPotholeScreenState();
}

class _ReportPotholeScreenState extends State<ReportPotholeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _roadController = TextEditingController();
  final _addressController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _mapController = MapController();
  final _imagePicker = ImagePicker();
  final List<XFile> _photos = [];

  LatLng _pin = _startingPoint;
  String? _severity;
  String? _severityError;
  String? _photoError;
  bool _isLocating = false;
  bool _isPickingPhoto = false;
  bool _isSubmitting = false;
  bool _hasGpsLocation = false;
  bool _duplicateChecked = false;
  bool _showValidationBanner = false;

  Future<void> _adjustLocationOnMap() async {
    final result = await Navigator.of(context).push<LatLng>(
      MaterialPageRoute(
        builder: (_) => SetPotholeLocationScreen(initialLocation: _pin),
      ),
    );
    if (result != null) {
      setState(() {
        _pin = result;
        _hasGpsLocation = true;
      });
      _mapController.move(result, 16);
    }
  }

  @override
  void dispose() {
    _roadController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _isLocating = true);
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!mounted) return;
      if (!serviceEnabled) {
        _showMessage(
          'Location Services are turned off. You can tap the map to set a pin.',
        );
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
          'Location permission was not granted. Tap the map to place the pin manually.',
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
      setState(() {
        _pin = point;
        _hasGpsLocation = true;
      });
      _mapController.move(point, 16);
    } on Exception {
      if (mounted) {
        _showMessage(
          'Could not get your location. You can tap the map to set the pin.',
        );
      }
    } finally {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  Future<void> _pickPhoto(ImageSource source) async {
    if (_photos.length >= 3) {
      _showMessage('You can attach up to 3 photos.');
      return;
    }

    setState(() => _isPickingPhoto = true);
    try {
      final photo = await _imagePicker.pickImage(
        source: source,
        imageQuality: 70,
        maxWidth: 960,
        maxHeight: 960,
      );
      if (!mounted || photo == null) return;
      setState(() {
        _photos.add(photo);
        _photoError = null;
      });
    } on PlatformException {
      if (mounted) {
        _showMessage(
          source == ImageSource.camera
              ? 'Camera could not be opened. Check camera access and try again.'
              : 'Gallery could not be opened. Check photo access and try again.',
        );
      }
    } on Exception {
      if (mounted) {
        _showMessage('The photo could not be selected. Please try again.');
      }
    } finally {
      if (mounted) setState(() => _isPickingPhoto = false);
    }
  }

  Future<void> _showPhotoOptions() async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(
                  Icons.photo_library_outlined,
                  color: _reportNavy,
                ),
                title: const Text('Choose from gallery'),
                onTap: () {
                  Navigator.pop(sheetContext);
                  _pickPhoto(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(
                  Icons.camera_alt_outlined,
                  color: _reportNavy,
                ),
                title: const Text('Take a photo'),
                onTap: () {
                  Navigator.pop(sheetContext);
                  _pickPhoto(ImageSource.camera);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitReport() async {
    FocusScope.of(context).unfocus();
    final formValid = _formKey.currentState?.validate() ?? false;
    setState(() {
      _severityError = _severity == null ? 'Select a severity level.' : null;
      _photoError = _photos.isEmpty
          ? 'Add at least one photo as evidence.'
          : null;
      _showValidationBanner =
          !formValid || _severity == null || _photos.isEmpty;
    });
    if (!formValid || _severity == null || _photos.isEmpty) {
      return;
    }

    // Check duplicate warning if near MacArthur Highway
    if (!_duplicateChecked &&
        (_roadController.text.toLowerCase().contains('macarthur') ||
            _roadController.text.toLowerCase().contains('mcarthur') ||
            (_pin.latitude - 14.8524).abs() < 0.005)) {
      final duplicate = ReportsStore.instance.getReportById('RW-2026-0819') ??
          ReportsStore.instance.getReportById('RW-2026-0842');
      if (duplicate != null) {
        _duplicateChecked = true;
        final continueAnyway = await DuplicateReportDialog.show(
          context,
          nearbyReport: duplicate,
          onContinueAnyway: () {
            _doFinalSubmit();
          },
        );
        if (continueAnyway != true) return;
      }
    }

    await _doFinalSubmit();
  }

  Future<void> _doFinalSubmit() async {
    setState(() => _isSubmitting = true);
    await Future<void>.delayed(const Duration(milliseconds: 650));
    if (!mounted) return;

    final now = DateTime.now();
    final serial = (now.microsecondsSinceEpoch % 10000).toString().padLeft(
      4,
      '0',
    );
    final referenceId = 'RW-${now.year}-$serial';

    // Convert citizen's uploaded photo to Base64 Data URI so it reflects immediately
    // on the Admin Web Dashboard from Firebase Realtime Database
    String? photoDataUri;
    if (_photos.isNotEmpty) {
      try {
        final bytes = await _photos.first.readAsBytes();
        photoDataUri = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      } catch (e) {
        debugPrint('Could not encode photo to base64: $e');
        photoDataUri = _photos.first.path;
      }
    }

    final currentEmail = (SessionManager.instance.currentUser?.email ??
            ReportsStore.instance.profile.email)
        .trim();
    final currentName = (SessionManager.instance.currentUser?.fullName ??
            ReportsStore.instance.profile.fullName)
        .trim();
    final reporter = currentName.isNotEmpty ? currentName : 'Citizen';

    final newReport = PotholeReport(
      id: referenceId,
      roadName: _roadController.text.trim(),
      address: _addressController.text.trim(),
      description: _descriptionController.text.trim(),
      severity: _severity!,
      status: 'Submitted',
      reportedBy: reporter,
      citizenEmail: currentEmail,
      reportedAt:
          '${now.day} ${_monthName(now.month)} · ${now.hour % 12 == 0 ? 12 : now.hour % 12}:${now.minute.toString().padLeft(2, '0')} ${now.hour < 12 ? 'AM' : 'PM'}',
      location: _pin,
      imageUrl: photoDataUri ?? (_photos.isNotEmpty ? _photos.first.path : null),
      timeline: [
        ReportTimelineEvent(
          status: 'Submitted',
          timestamp: 'Just now',
          description:
              'Report received from $reporter',
        ),
      ],
    );
    ReportsStore.instance.addReport(newReport);

    // ==============================================================
    // SYNCHRONIZE REPORT TO SUPABASE (Reflects instantly in Admin Portal)
    // ==============================================================
    try {
      final roadText = _roadController.text.trim().isNotEmpty
          ? _roadController.text.trim()
          : 'Unspecified Road';
      final addressText = _addressController.text.trim().isNotEmpty
          ? _addressController.text.trim()
          : 'Guinhawa';
      final isNational = roadText.toLowerCase().contains('macarthur') ||
          roadText.toLowerCase().contains('blas ople');

      final currentMobile = (SessionManager.instance.currentUser?.mobileNumber ??
              ReportsStore.instance.profile.mobileNumber)
          .trim();

      final supabasePayload = {
        'code': referenceId,
        'road': roadText,
        'barangay': addressText,
        'jurisdiction': isNational ? 'DPWH-National' : 'City',
        'severity': _severity ?? 'Medium',
        'status': 'Submitted',
        'coordinates':
            '${_pin.latitude.toStringAsFixed(4)}° N, ${_pin.longitude.toStringAsFixed(4)}° E',
        'latitude': _pin.latitude,
        'longitude': _pin.longitude,
        'landmark': addressText,
        'description': _descriptionController.text.trim(),
        'photo_url': photoDataUri ?? '/assets/pothole-citizen.jpg',
        'citizen_name': reporter,
        'citizen_email': currentEmail.isNotEmpty ? currentEmail : 'citizen@malolos.gov.ph',
        'citizen_mobile': currentMobile.isNotEmpty ? currentMobile : '+63 917 000 0000',
        'reported_date':
            '${now.day} ${_monthName(now.month)} ${now.year}',
      };

      await SupabaseService.instance.post('reports', supabasePayload);
      debugPrint('[Supabase] Successfully inserted citizen report $referenceId');
    } catch (err) {
      debugPrint('[Supabase] Could not insert citizen report: $err');
    }

    final submission = ReportSubmission(
      referenceId: referenceId,
      roadName: _roadController.text.trim(),
      address: _addressController.text.trim(),
      description: _descriptionController.text.trim(),
      severity: _severity!,
      latitude: _pin.latitude,
      longitude: _pin.longitude,
      submittedAt: now,
    );

    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(
        builder: (_) => ReportSubmittedScreen(submission: submission),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _reportBackground,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: Form(
                key: _formKey,
                child: SingleChildScrollView(
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildSafetyBanner(),
                      if (_showValidationBanner) ...[
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFDE8E8),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFF8B4B4)),
                          ),
                          child: const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Please check 2 required fields',
                                style: TextStyle(
                                  color: Color(0xFF9B1C1C),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              SizedBox(height: 3),
                              Text(
                                'Add a description and at least one photo before submitting.',
                                style: TextStyle(
                                  color: Color(0xFF9B1C1C),
                                  fontSize: 12,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 18),
                      _buildTextField(
                        controller: _roadController,
                        label: 'Road name *',
                        hint: 'e.g. McArthur Highway',
                        validator: (value) => _required(value, 'Road name'),
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _addressController,
                        label: 'Address / landmark *',
                        hint: 'Barangay, city, or nearby landmark',
                        maxLines: 2,
                        validator: (value) =>
                            _required(value, 'Address or landmark'),
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _descriptionController,
                        label: 'Describe the damage *',
                        hint:
                            'Tell us about the pothole and any safety concerns',
                        maxLines: 4,
                        validator: (value) {
                          final message = _required(value, 'Description');
                          if (message != null) return message;
                          if (value!.trim().length < 10) {
                            return 'Add a little more detail (at least 10 characters).';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 22),
                      _sectionTitle('Severity *'),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _severityOption('Low', const Color(0xFF2769A9)),
                          const SizedBox(width: 8),
                          _severityOption('Medium', const Color(0xFFE5A02D)),
                          const SizedBox(width: 8),
                          _severityOption('High', const Color(0xFFC63838)),
                        ],
                      ),
                      if (_severityError != null) ...[
                        const SizedBox(height: 6),
                        _errorText(_severityError!),
                      ] else ...[
                        const SizedBox(height: 8),
                        Text(
                          _severity == 'High'
                              ? 'High: deep damage or an immediate safety risk.'
                              : _severity == 'Medium'
                              ? 'Medium: noticeable damage that may affect road users.'
                              : 'Low: minor damage with limited impact.',
                          style: const TextStyle(
                            color: _reportMuted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                      const SizedBox(height: 22),
                      Row(
                        children: [
                          const Expanded(
                            child: _SectionTitle('Pothole location *'),
                          ),
                          if (_isLocating)
                            const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          else
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.circle,
                                  size: 8,
                                  color: _hasGpsLocation
                                      ? const Color(0xFF168054)
                                      : _reportMuted,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  _hasGpsLocation
                                      ? 'GPS location set'
                                      : 'Tap map to set pin',
                                  style: TextStyle(
                                    color: _hasGpsLocation
                                        ? const Color(0xFF168054)
                                        : _reportMuted,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      _buildMap(),
                      const SizedBox(height: 10),
                      Text(
                        '${_pin.latitude.toStringAsFixed(5)}° N, '
                        '${_pin.longitude.toStringAsFixed(5)}° E'
                        '${_hasGpsLocation ? ' · GPS' : ' · map pin'}',
                        style: const TextStyle(
                          color: _reportMuted,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: _isLocating ? null : _useCurrentLocation,
                        icon: const Icon(Icons.my_location_outlined, size: 19),
                        label: const Text('Use my current location'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _reportNavy,
                          backgroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          side: const BorderSide(color: _reportBorder),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(11),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      OutlinedButton.icon(
                        onPressed: _adjustLocationOnMap,
                        icon: const Icon(
                          Icons.edit_location_alt_outlined,
                          size: 19,
                        ),
                        label: const Text('Set pothole location on map'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _reportNavy,
                          backgroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          side: const BorderSide(color: _reportBorder),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(11),
                          ),
                        ),
                      ),
                      const SizedBox(height: 22),
                      Row(
                        children: [
                          const Expanded(
                            child: _SectionTitle('Photo evidence *'),
                          ),
                          Text(
                            '${_photos.length}/3',
                            style: const TextStyle(
                              color: _reportMuted,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 9),
                      if (_photos.isEmpty)
                        _emptyPhotoPicker()
                      else
                        _photoGallery(),
                      if (_photoError != null) ...[
                        const SizedBox(height: 6),
                        _errorText(_photoError!),
                      ],
                      const SizedBox(height: 8),
                      Text(
                        _photos.isEmpty
                            ? 'Add a clear photo of the road damage from your gallery or camera.'
                            : 'Photos are attached to this demo only and are not uploaded.',
                        style: const TextStyle(
                          color: _reportMuted,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        height: 50,
                        child: FilledButton.icon(
                          onPressed: _isSubmitting || _isPickingPhoto
                              ? null
                              : _submitReport,
                          icon: _isSubmitting
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(
                                  Icons.arrow_forward_rounded,
                                  size: 19,
                                ),
                          label: Text(
                            _isSubmitting
                                ? 'Preparing demo report...'
                                : 'Review and submit',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          style: FilledButton.styleFrom(
                            backgroundColor: _reportOrange,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(11),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Center(
                        child: Text(
                          'Your draft is saved on this device.',
                          style: TextStyle(
                            color: _reportMuted,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 13),
                      const Text(
                        'Demo only: this report is not sent to an LGU or stored on a server.',
                        style: TextStyle(
                          color: _reportMuted,
                          fontSize: 11,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            _buildBottomNavigation(),
          ],
        ),
      ),
    );
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) return '$label is required.';
    return null;
  }

  Widget _buildHeader() {
    return Container(
      height: AppTopBar.kHeaderHeight,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: _reportBorder)),
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
            icon: const Icon(Icons.arrow_back_rounded, color: _reportNavy, size: 22),
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
                    color: _reportOrange,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Report a pothole',
                  style: TextStyle(
                    color: _reportNavy,
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            tooltip: 'Options',
            icon: const Icon(Icons.more_horiz_rounded, color: _reportNavy),
            onSelected: (val) {
              if (val == 'safety') {
                _showMessage('Move to a safe spot before taking photos.');
              } else if (val == 'offline') {
                Navigator.of(context).pushNamed(AppRoutes.reportOffline);
              } else if (val == 'location') {
                _adjustLocationOnMap();
              }
            },
            itemBuilder: (ctx) => const [
              PopupMenuItem(value: 'safety', child: Text('Safety guidance')),
              PopupMenuItem(
                value: 'location',
                child: Text('Set location on map'),
              ),
              PopupMenuItem(
                value: 'offline',
                child: Text('Simulate offline/retry state'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSafetyBanner() {
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
            'Report safely',
            style: TextStyle(
              color: Color(0xFF185A9D),
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'Move to a safe spot before taking photos. For immediate danger, call 911.',
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required String? Function(String?) validator,
    int maxLines = 1,
  }) {
    return TextFormField(
      key: ValueKey('field_$label'),
      controller: controller,
      maxLines: maxLines,
      minLines: maxLines == 1 ? 1 : maxLines,
      textCapitalization: TextCapitalization.sentences,
      textInputAction: maxLines == 1
          ? TextInputAction.next
          : TextInputAction.newline,
      validator: validator,
      style: const TextStyle(color: _reportNavy, fontSize: 14, height: 1.45),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        alignLabelWithHint: maxLines > 1,
        labelStyle: const TextStyle(color: _reportMuted, fontSize: 12),
        hintStyle: const TextStyle(color: _reportMuted, fontSize: 13),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _reportBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _reportBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: _reportNavy, width: 1.4),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFB3261E)),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFB3261E), width: 1.4),
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) => _SectionTitle(title);

  Widget _severityOption(String value, Color color) {
    final selected = value == _severity;
    return Expanded(
      child: OutlinedButton(
        onPressed: () => setState(() {
          _severity = value;
          _severityError = null;
        }),
        style: OutlinedButton.styleFrom(
          backgroundColor: selected ? const Color(0xFFFFF0E9) : Colors.white,
          foregroundColor: selected ? _reportOrange : _reportMuted,
          side: BorderSide(
            color: selected ? _reportOrange : _reportBorder,
            width: selected ? 1.6 : 1,
          ),
          minimumSize: const Size(0, 46),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (selected) ...[
              Icon(Icons.circle, size: 9, color: color),
              const SizedBox(width: 5),
            ],
            Flexible(
              child: Text(
                value,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMap() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: SizedBox(
        height: 190,
        child: FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: _startingPoint,
            initialZoom: 14.5,
            minZoom: 11,
            maxZoom: 19,
            onTap: (tapPosition, point) {
              setState(() {
                _pin = point;
                _hasGpsLocation = false;
              });
            },
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
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
                    color: _reportOrange,
                    size: 40,
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
    );
  }

  Widget _emptyPhotoPicker() {
    return InkWell(
      onTap: _isPickingPhoto ? null : _showPhotoOptions,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 145,
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(
            color: _photoError == null
                ? _reportBorder
                : const Color(0xFFB3261E),
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: _isPickingPhoto
              ? const CircularProgressIndicator()
              : const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.add_a_photo_outlined,
                      color: _reportNavy,
                      size: 28,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Add photo evidence',
                      style: TextStyle(
                        color: _reportNavy,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Choose from gallery or take a photo',
                      style: TextStyle(color: _reportMuted, fontSize: 11),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _photoGallery() {
    return Column(
      children: [
        for (final photo in _photos)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Stack(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 180,
                    child: Image.file(
                      File(photo.path),
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: const Color(0xFFE8EDF3),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.broken_image_outlined,
                          color: _reportMuted,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 8,
                    top: 8,
                    child: IconButton.filledTonal(
                      tooltip: 'Remove photo',
                      onPressed: () => setState(() => _photos.remove(photo)),
                      icon: const Icon(Icons.delete_outline_rounded),
                    ),
                  ),
                ],
              ),
            ),
          ),
        if (_photos.length < 3)
          OutlinedButton.icon(
            onPressed: _isPickingPhoto ? null : _showPhotoOptions,
            icon: const Icon(Icons.add_photo_alternate_outlined),
            label: const Text('Add another photo'),
            style: OutlinedButton.styleFrom(
              foregroundColor: _reportNavy,
              backgroundColor: Colors.white,
              minimumSize: const Size.fromHeight(46),
              side: const BorderSide(color: _reportBorder),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
      ],
    );
  }

  Widget _errorText(String message) {
    return Text(
      message,
      style: const TextStyle(color: Color(0xFFB3261E), fontSize: 12),
    );
  }

  Widget _buildBottomNavigation() {
    return const AppBottomNav(currentIndex: 0);
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        color: _reportNavy,
        fontSize: 13,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

String _monthName(int month) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month - 1];
}
