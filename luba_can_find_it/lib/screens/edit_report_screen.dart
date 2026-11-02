import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';
import '../app_routes.dart';
import '../data/reports_store.dart';
import '../models/pothole_report.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/round_pushpin.dart';
import '../widgets/status_badge.dart';

class EditReportScreen extends StatefulWidget {
  const EditReportScreen({super.key, this.reportId});

  final String? reportId;

  @override
  State<EditReportScreen> createState() => _EditReportScreenState();
}

class _EditReportScreenState extends State<EditReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _store = ReportsStore.instance;

  late PotholeReport _report;
  late final TextEditingController _roadController;
  late final TextEditingController _addressController;
  late final TextEditingController _descriptionController;

  late String _severity;
  late LatLng _location;
  bool _isSaving = false;
  String? _photoLabel = 'sample_malolos_0843.jpg · 2.4 MB · Demo evidence';
  String? _newPhotoBase64;

  @override
  void initState() {
    super.initState();
    // Default to RW-2026-0843 if not specified
    final targetId = widget.reportId ?? 'RW-2026-0843';
    _report = _store.getReportById(targetId) ?? _store.allReports.first;

    _roadController = TextEditingController(text: _report.roadName);
    _addressController = TextEditingController(text: _report.address);
    _descriptionController = TextEditingController(text: _report.description);
    _severity = _report.severity;
    _location = _report.location;
  }

  @override
  void dispose() {
    _roadController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _replacePhoto() async {
    final picker = ImagePicker();
    final photo = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 75,
      maxWidth: 1024,
      maxHeight: 1024,
    );
    if (photo != null) {
      String? base64Data;
      try {
        final bytes = await photo.readAsBytes();
        base64Data = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      } catch (_) {
        base64Data = photo.path;
      }
      setState(() {
        _photoLabel = '${photo.name} · Updated photo';
        _newPhotoBase64 = base64Data;
      });
    }
  }

  Future<void> _adjustLocation() async {
    final result = await Navigator.of(
      context,
    ).pushNamed(AppRoutes.setPotholeLocation, arguments: _location);
    if (result is LatLng) {
      setState(() => _location = result);
    }
  }

  Future<void> _handleSave() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (!_report.canEdit) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'This report cannot be edited because review has already started.',
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    final updated = _report.copyWith(
      roadName: _roadController.text.trim(),
      address: _addressController.text.trim(),
      description: _descriptionController.text.trim(),
      severity: _severity,
      location: _location,
      imageUrl: _newPhotoBase64 ?? _report.imageUrl,
    );

    _store.updateReport(updated);

    setState(() {
      _isSaving = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Changes to submitted report saved successfully.'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Edit submitted report'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Report Header & Status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${_report.id} · Separate sample report',
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  StatusBadge(status: _report.status),
                ],
              ),
              const SizedBox(height: 12),

              // Editing Policy Banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF2FC),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Editing is available before review',
                      style: TextStyle(
                        color: AppColors.statusInProgress,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Save or cancel this report only while Submitted. Once Under Review or later, contact support instead. Resolved RW-2026-0842 cannot be edited.',
                      style: TextStyle(
                        color: AppColors.statusInProgress,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Road Name
              _buildFieldLabel('Road name *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _roadController,
                decoration: _inputDecoration('e.g. MacArthur Highway'),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Road name is required'
                    : null,
              ),
              const SizedBox(height: 16),

              // Address / Landmark
              _buildFieldLabel('Address / landmark *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _addressController,
                maxLines: 2,
                decoration: _inputDecoration('e.g. Near BSU crossing, Brgy. Guinhawa...'),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Address or landmark is required'
                    : null,
              ),
              const SizedBox(height: 16),

              // Describe the damage
              _buildFieldLabel('Describe the damage *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: _inputDecoration('Describe the road damage...'),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Description is required';
                  }
                  if (v.trim().length < 10) {
                    return 'Add a little more detail (at least 10 characters)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 18),

              // Severity
              _buildFieldLabel('Severity *'),
              const SizedBox(height: 8),
              Row(
                children: ['Low', 'Medium', 'High'].map((s) {
                  final active = _severity == s;
                  final color = switch (s) {
                    'High' => AppColors.severityHigh,
                    'Medium' => AppColors.severityMedium,
                    _ => AppColors.severityLow,
                  };
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: InkWell(
                        onTap: () => setState(() => _severity = s),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: active ? color.withAlpha(25) : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: active ? color : AppColors.subtleBorder,
                              width: active ? 1.8 : 1,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              s,
                              style: TextStyle(
                                color: active ? color : AppColors.navy,
                                fontWeight: active
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 18),

              // Photo Section
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.subtleBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppColors.navy,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.image_outlined,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _photoLabel ?? 'Evidence photo',
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: _replacePhoto,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.navy,
                          side: const BorderSide(color: AppColors.subtleBorder),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('Replace photo'),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Location Section
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 130,
                  child: FlutterMap(
                    options: MapOptions(
                      initialCenter: _location,
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
                            point: _location,
                            width: 38,
                            height: 44,
                            alignment: Alignment.topCenter,
                            child: const RoundPushpinMarker(
                              color: AppColors.orange,
                              size: 34,
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
                'Location · ${_location.latitude.toStringAsFixed(4)}° N, ${_location.longitude.toStringAsFixed(4)}° E · Manual pin',
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: _adjustLocation,
                icon: const Icon(Icons.edit_location_alt_outlined, size: 18),
                label: const Text('Adjust location'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.navy,
                  side: const BorderSide(color: AppColors.subtleBorder),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 22),

              // Save changes
              SizedBox(
                height: 50,
                child: FilledButton(
                  onPressed: _isSaving ? null : _handleSave,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.orange,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(11),
                    ),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Save changes',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 10),

              // Cancel editing
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
                  child: const Text('Cancel editing'),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  'Saving rechecks the current status. If review has started, no changes are saved; use Contact Support.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.muted, fontSize: 11),
                ),
              ),
              const SizedBox(height: 16),

              // Cancel Submitted report button
              TextButton.icon(
                onPressed: () {
                  Navigator.of(
                    context,
                  ).pushNamed(AppRoutes.cancelReport, arguments: _report.id);
                },
                icon: const Icon(
                  Icons.delete_outline_rounded,
                  color: AppColors.statusDanger,
                  size: 18,
                ),
                label: const Text(
                  'Cancel Submitted report',
                  style: TextStyle(
                    color: AppColors.statusDanger,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        color: AppColors.navy,
        fontSize: 13,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
        borderSide: const BorderSide(color: AppColors.orange, width: 1.5),
      ),
    );
  }
}
