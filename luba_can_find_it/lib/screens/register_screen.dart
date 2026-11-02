import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../app_routes.dart';
import '../data/bulacan_locations.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_header.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/info_banner.dart';
import '../widgets/primary_button.dart';
import '../widgets/secondary_button.dart';
import '../core/auth/auth_service.dart';
import '../core/auth/session_manager.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _nameFocusNode = FocusNode();
  final _emailFocusNode = FocusNode();
  final _mobileFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();
  final _confirmPasswordFocusNode = FocusNode();

  String? _selectedBarangay;
  bool _termsAgreed = false;
  bool _termsError = false;
  bool _isLoading = false;

  // Live password checks
  bool _hasMinLength = false;
  bool _hasUppercase = false;
  bool _hasNumber = false;

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(_updatePasswordRequirements);
  }

  void _updatePasswordRequirements() {
    final text = _passwordController.text;
    setState(() {
      _hasMinLength = text.length >= 8;
      _hasUppercase = text.contains(RegExp(r'[A-Z]'));
      _hasNumber = text.contains(RegExp(r'[0-9]'));
    });
  }

  @override
  void dispose() {
    _passwordController.removeListener(_updatePasswordRequirements);
    _nameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();

    _nameFocusNode.dispose();
    _emailFocusNode.dispose();
    _mobileFocusNode.dispose();
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    FocusScope.of(context).unfocus();

    setState(() {
      _termsError = !_termsAgreed;
    });

    final formValid = _formKey.currentState?.validate() ?? false;

    if (!formValid || !_termsAgreed) return;

    setState(() => _isLoading = true);

    try {
      final user = await AuthService.instance.registerCitizen(
        fullName: _nameController.text,
        email: _emailController.text,
        mobileNumber: _mobileController.text,
        password: _passwordController.text,
        municipality: 'Malolos',
        barangay: _selectedBarangay ?? 'Catmon',
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account registered successfully! Welcome.'),
        ),
      );

      SessionManager.instance.setSession(user);
      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.home,
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;

      final message = e.toString().replaceFirst('Exception: ', '');

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildDropdownField({
    required String label,
    required String? value,
    required List<String> items,
    required String hintText,
    required ValueChanged<String?>? onChanged,
    required String? Function(String?) validator,
    bool enabled = true,
  }) {
    final safeValue = (value != null && items.contains(value)) ? value : null;

    return FormField<String>(
      key: ValueKey('$label-$safeValue'),
      initialValue: safeValue,
      validator: validator,
      builder: (FormFieldState<String> state) {
        final hasError = state.hasError;
        final errorText = state.errorText;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              decoration: BoxDecoration(
                color: enabled
                    ? AppColors.white
                    : AppColors.brightGray.withAlpha((255 * 0.4).round()),
                borderRadius: AppRadius.inputBorder,
                border: Border.all(
                  color: hasError ? AppColors.error : AppColors.border,
                  width: hasError ? 1.8 : 1.2,
                ),
              ),
              padding: const EdgeInsets.fromLTRB(16, 8, 12, 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: hasError ? AppColors.error : AppColors.darkGray,
                    ),
                  ),
                  DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: safeValue,
                      hint: Text(
                        hintText,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: AppColors.neutralGray,
                        ),
                      ),
                      icon: const Icon(
                        Icons.keyboard_arrow_down_rounded,
                        color: AppColors.deepNavy,
                      ),
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: AppColors.deepNavy,
                      ),
                      dropdownColor: AppColors.white,
                      items: items.map((item) {
                        return DropdownMenuItem<String>(
                          value: item,
                          child: Text(item),
                        );
                      }).toList(),
                      onChanged: enabled
                          ? (newVal) {
                              state.didChange(newVal);
                              if (onChanged != null) {
                                onChanged(newVal);
                              }
                            }
                          : null,
                    ),
                  ),
                ],
              ),
            ),
            if (hasError && errorText != null)
              Padding(
                padding: const EdgeInsets.only(left: 8.0, top: 4.0),
                child: Text(
                  errorText,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: AppColors.error,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildPasswordIndicator({required String text, required bool isMet}) {
    final color = isMet ? AppColors.darkEmerald : AppColors.neutralGray;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.check_rounded, size: 16, color: color),
        const SizedBox(width: 4),
        Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final barangays = BulacanLocations.malolosBarangays;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () => FocusScope.of(context).unfocus(),
          child: Column(
            children: [
              const AuthHeader(
                title: 'Create your account',
                eyebrow: 'CITIZEN / BULACAN',
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 8),
                        Text(
                          'Join your neighbors in building safer roads. Fields marked * are required.',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            color: AppColors.darkGray,
                            height: 1.45,
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Full name *
                        CustomTextField(
                          label: 'Full name *',
                          hintText: 'Enter your full name',
                          controller: _nameController,
                          focusNode: _nameFocusNode,
                          keyboardType: TextInputType.name,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.name],
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Full name is required';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) {
                            FocusScope.of(
                              context,
                            ).requestFocus(_emailFocusNode);
                          },
                        ),
                        const SizedBox(height: 16),

                        // Email address *
                        CustomTextField(
                          label: 'Email address *',
                          hintText: 'Enter your email address',
                          controller: _emailController,
                          focusNode: _emailFocusNode,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
                          validator: (value) {
                            final text = value?.trim() ?? '';
                            if (text.isEmpty) {
                              return 'Email address is required';
                            }
                            final emailRegex = RegExp(
                              r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                            );
                            if (!emailRegex.hasMatch(text)) {
                              return 'Enter a valid email address';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) {
                            FocusScope.of(
                              context,
                            ).requestFocus(_mobileFocusNode);
                          },
                        ),
                        const SizedBox(height: 16),

                        // Mobile number *
                        CustomTextField(
                          label: 'Mobile number *',
                          hintText: '09XXXXXXXXX or +639XXXXXXXXX',
                          controller: _mobileController,
                          focusNode: _mobileFocusNode,
                          keyboardType: TextInputType.phone,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.telephoneNumber],
                          validator: (value) {
                            final raw = value?.trim() ?? '';
                            if (raw.isEmpty) {
                              return 'Mobile number is required';
                            }
                            final cleaned = raw.replaceAll(
                              RegExp(r'[\s\-]'),
                              '',
                            );
                            final phRegex = RegExp(r'^(09|\+639)\d{9}$');
                            if (!phRegex.hasMatch(cleaned)) {
                              return 'Enter a valid PH mobile number (e.g. 09XXXXXXXXX)';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) {
                            FocusScope.of(
                              context,
                            ).requestFocus(_passwordFocusNode);
                          },
                        ),
                        const SizedBox(height: 16),

                        // Barangay *
                        _buildDropdownField(
                          label: 'Barangay *',
                          value: _selectedBarangay,
                          hintText: 'Select barangay',
                          items: barangays,
                          onChanged: (newVal) {
                            setState(() {
                              _selectedBarangay = newVal;
                            });
                          },
                          validator: (val) {
                            if (val == null || val.isEmpty) {
                              return 'Barangay is required';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Password *
                        CustomTextField(
                          label: 'Password *',
                          hintText: 'Enter password',
                          controller: _passwordController,
                          focusNode: _passwordFocusNode,
                          isPassword: true,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.newPassword],
                          validator: (value) {
                            final val = value ?? '';
                            if (val.isEmpty) {
                              return 'Password is required';
                            }
                            if (val.length < 8) {
                              return 'Password must be at least 8 characters';
                            }
                            if (!val.contains(RegExp(r'[A-Z]'))) {
                              return 'Password must contain an uppercase letter';
                            }
                            if (!val.contains(RegExp(r'[0-9]'))) {
                              return 'Password must contain a number';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) {
                            FocusScope.of(
                              context,
                            ).requestFocus(_confirmPasswordFocusNode);
                          },
                        ),
                        const SizedBox(height: 8),

                        // Live Password Requirements
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4.0),
                          child: Wrap(
                            spacing: 16,
                            runSpacing: 4,
                            children: [
                              _buildPasswordIndicator(
                                text: '8+ characters',
                                isMet: _hasMinLength,
                              ),
                              _buildPasswordIndicator(
                                text: 'Uppercase',
                                isMet: _hasUppercase,
                              ),
                              _buildPasswordIndicator(
                                text: 'Number',
                                isMet: _hasNumber,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Confirm password *
                        CustomTextField(
                          label: 'Confirm password *',
                          hintText: 'Confirm password',
                          controller: _confirmPasswordController,
                          focusNode: _confirmPasswordFocusNode,
                          isPassword: true,
                          textInputAction: TextInputAction.done,
                          autofillHints: const [AutofillHints.newPassword],
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please confirm your password';
                            }
                            if (value != _passwordController.text) {
                              return 'Passwords do not match';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) => _handleRegister(),
                        ),
                        const SizedBox(height: 16),

                        // Terms & Privacy Checkbox
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 24,
                              height: 24,
                              child: Checkbox(
                                value: _termsAgreed,
                                onChanged: (val) {
                                  setState(() {
                                    _termsAgreed = val ?? false;
                                    if (_termsAgreed) {
                                      _termsError = false;
                                    }
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _termsAgreed = !_termsAgreed;
                                    if (_termsAgreed) {
                                      _termsError = false;
                                    }
                                  });
                                },
                                child: Text(
                                  'I agree to the Terms of Service and Privacy Notice under the Data Privacy Act of 2012.',
                                  style: GoogleFonts.poppins(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w400,
                                    color: AppColors.darkGray,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (_termsError)
                          Padding(
                            padding: const EdgeInsets.only(
                              left: 34.0,
                              top: 4.0,
                            ),
                            child: Text(
                              'You must agree to the Terms of Service and Privacy Notice to continue',
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                fontWeight: FontWeight.w400,
                                color: AppColors.error,
                              ),
                            ),
                          ),
                        const SizedBox(height: 24),

                        // Create Account Primary Button
                        PrimaryButton(
                          text: 'Create account',
                          isLoading: _isLoading,
                          onPressed: _handleRegister,
                        ),
                        const SizedBox(height: 20),

                        // Info Banner
                        const InfoBanner(
                          title: 'Your identity stays private',
                          message:
                              'Your name and contact details are never shown on the public pothole map.',
                          tone: InfoBannerTone.info,
                          icon: Icon(
                            Icons.shield_outlined,
                            color: AppColors.azureBlue,
                            size: 20,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Already Registered? Sign in
                        SecondaryButton(
                          text: 'Already registered? Sign in',
                          onPressed: () {
                            Navigator.pushReplacementNamed(
                              context,
                              AppRoutes.login,
                            );
                          },
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
