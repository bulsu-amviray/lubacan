import 'package:flutter/material.dart';
import '../core/auth/session_manager.dart';
import '../data/bulacan_locations.dart';
import '../data/reports_store.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _mobileController;

  final _store = ReportsStore.instance;

  String? _selectedCity;
  String? _selectedBarangay;
  bool _savedSuccess = false;
  bool _isSaving = false;

  final Map<String, List<String>> _cityBarangays = BulacanLocations.locations;

  @override
  void initState() {
    super.initState();
    final currentUser = SessionManager.instance.currentUser;
    final profile = _store.profile;

    final initialName =
        (currentUser != null && currentUser.fullName.trim().isNotEmpty)
            ? currentUser.fullName.trim()
            : profile.fullName;
    final initialEmail =
        (currentUser != null && currentUser.email.trim().isNotEmpty)
            ? currentUser.email.trim()
            : profile.email;
    final initialMobile = (currentUser != null &&
            currentUser.mobileNumber != null &&
            currentUser.mobileNumber!.trim().isNotEmpty)
        ? currentUser.mobileNumber!.trim()
        : profile.mobileNumber;
    final initialMuni = (currentUser != null &&
            currentUser.municipality != null &&
            currentUser.municipality!.trim().isNotEmpty)
        ? currentUser.municipality!.trim()
        : profile.municipality;
    final initialBarangay = (currentUser != null &&
            currentUser.barangay != null &&
            currentUser.barangay!.trim().isNotEmpty)
        ? currentUser.barangay!.trim()
        : profile.barangay;

    _nameController = TextEditingController(text: initialName);
    _emailController = TextEditingController(text: initialEmail);
    _mobileController = TextEditingController(text: initialMobile);

    _selectedCity = _cityBarangays.containsKey(initialMuni)
        ? initialMuni
        : 'Malolos';
    final barangays = _cityBarangays[_selectedCity] ?? [];
    _selectedBarangay = barangays.contains(initialBarangay)
        ? initialBarangay
        : (barangays.isNotEmpty ? barangays.first : null);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSaving = true);
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    _store.updateProfile(
      fullName: _nameController.text.trim(),
      email: _emailController.text.trim(),
      mobileNumber: _mobileController.text.trim(),
      municipality: _selectedCity ?? 'Malolos',
      barangay: _selectedBarangay ?? 'Catmon',
    );

    setState(() {
      _isSaving = false;
      _savedSuccess = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Edit profile'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Keep your contact details up to date. Fields marked * are required.',
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),

              // Full Name
              _buildFieldLabel('Full name *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameController,
                decoration: _inputDecoration('e.g. Mika Reyes'),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Full name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Email Address
              _buildFieldLabel('Email address *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: _inputDecoration('e.g. mika.reyes@example.com'),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Email address is required';
                  }
                  if (!val.contains('@') || !val.contains('.')) {
                    return 'Enter a valid email address';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 4),
              const Text(
                'Email changes require verification before replacing your verified address.',
                style: TextStyle(color: AppColors.muted, fontSize: 11),
              ),
              const SizedBox(height: 16),

              // Mobile Number
              _buildFieldLabel('Mobile number *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                decoration: _inputDecoration('+63 9XX XXX XXXX'),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Mobile number is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // City / Municipality
              _buildFieldLabel('City / municipality *'),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: _selectedCity,
                decoration: _inputDecoration('Select city'),
                items: _cityBarangays.keys.map((city) {
                  return DropdownMenuItem(value: city, child: Text(city));
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedCity = val;
                    final barangays = _cityBarangays[val] ?? [];
                    _selectedBarangay = barangays.isNotEmpty
                        ? barangays.first
                        : null;
                  });
                },
                validator: (val) =>
                    val == null ? 'Please select your city' : null,
              ),
              const SizedBox(height: 16),

              // Barangay
              _buildFieldLabel('Barangay *'),
              const SizedBox(height: 6),
              Builder(builder: (context) {
                final currentBarangays =
                    _cityBarangays[_selectedCity] ?? BulacanLocations.malolosBarangays;
                final safeBarangay = currentBarangays.contains(_selectedBarangay)
                    ? _selectedBarangay
                    : (currentBarangays.isNotEmpty ? currentBarangays.first : null);
                return DropdownButtonFormField<String>(
                  key: ValueKey('brgy_${_selectedCity}_$safeBarangay'),
                  initialValue: safeBarangay,
                  decoration: _inputDecoration('Select barangay'),
                  items: currentBarangays.map((brgy) {
                    return DropdownMenuItem(value: brgy, child: Text(brgy));
                  }).toList(),
                  onChanged: (val) {
                    setState(() => _selectedBarangay = val);
                  },
                  validator: (val) =>
                      val == null ? 'Please select your barangay' : null,
                );
              }),
              const SizedBox(height: 20),

              // Identity privacy card
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
                      'Your identity stays private',
                      style: TextStyle(
                        color: AppColors.statusInProgress,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Your contact information is restricted to authorized LGU staff, not shown on the public map.',
                      style: TextStyle(
                        color: AppColors.statusInProgress,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Save Button
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
                          'Save profile',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 10),

              // Cancel Button
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
                    'Cancel',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),

              // Sample Success Banner
              if (_savedSuccess) ...[
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.statusResolvedBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.statusResolved.withAlpha(50),
                    ),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Profile saved · sample feedback',
                        style: TextStyle(
                          color: AppColors.statusResolved,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'Your current name, mobile number and neighborhood were saved successfully.',
                        style: TextStyle(
                          color: AppColors.statusResolved,
                          fontSize: 12,
                          height: 1.35,
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
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
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
