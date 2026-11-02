import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../app_routes.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_header.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/info_banner.dart';
import '../widgets/primary_button.dart';
import '../widgets/secondary_button.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _emailFocusNode = FocusNode();

  bool _isLoading = false;
  bool _submitted = false;
  int _secondsLeft = 30;
  Timer? _countdownTimer;

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _emailController.dispose();
    _emailFocusNode.dispose();
    super.dispose();
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    setState(() {
      _secondsLeft = 30;
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_secondsLeft > 1) {
        setState(() {
          _secondsLeft--;
        });
      } else {
        setState(() {
          _secondsLeft = 0;
        });
        timer.cancel();
      }
    });
  }

  void _handleSubmit() {
    FocusScope.of(context).unfocus();
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);

      Future.delayed(const Duration(milliseconds: 600), () {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
          _submitted = true;
        });
        _startCountdown();
      });
    }
  }

  void _handleResend() {
    _startCountdown();
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.deepNavy,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
        content: Text(
          'Demo only: simulated resend to ${_emailController.text.trim()}',
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.white,
          ),
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  String _formatCountdown(int seconds) {
    final s = seconds.toString().padLeft(2, '0');
    return '00:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () => FocusScope.of(context).unfocus(),
          child: Column(
            children: [
              const AuthHeader(
                title: 'Reset password',
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
                        const SizedBox(height: 4),
                        // Light Blue illustration card (matches prototype)
                        Container(
                          height: 128,
                          decoration: BoxDecoration(
                            color: AppColors.lightBlue,
                            borderRadius: AppRadius.cardBorder,
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.mark_email_read_outlined,
                              size: 64,
                              color: AppColors.azureBlue,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Heading
                        Text(
                          'Let\'s get you back in.',
                          style: GoogleFonts.montserrat(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: AppColors.deepNavy,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Instructions
                        Text(
                          'Enter the email address linked to your account. We\'ll send a secure password reset link.',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            color: AppColors.darkGray,
                            height: 1.45,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Email Field
                        CustomTextField(
                          label: 'Email address',
                          hintText: 'Enter your email',
                          controller: _emailController,
                          focusNode: _emailFocusNode,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
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
                          onFieldSubmitted: (_) => _handleSubmit(),
                        ),
                        const SizedBox(height: 24),

                        // Primary Button
                        PrimaryButton(
                          text: 'Send reset link',
                          isLoading: _isLoading,
                          onPressed: _handleSubmit,
                        ),
                        const SizedBox(height: 20),

                        // Success Banner and Countdown (Shown after submit)
                        if (_submitted) ...[
                          const InfoBanner(
                            title: 'Check your inbox',
                            message: 'Demo only: no email was actually sent.',
                            tone: InfoBannerTone.success,
                            icon: Icon(
                              Icons.check_circle_outline_rounded,
                              color: AppColors.darkEmerald,
                              size: 22,
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Didn't receive email Card
                          Container(
                            padding: const EdgeInsets.all(16.0),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: AppRadius.cardBorder,
                              border: Border.all(
                                color: AppColors.border,
                                width: 1.2,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Didn\'t receive an email?',
                                  style: GoogleFonts.montserrat(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.deepNavy,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Check your spam folder or try again after the countdown.',
                                  style: GoogleFonts.poppins(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w400,
                                    color: AppColors.darkGray,
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                if (_secondsLeft > 0)
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.timer_outlined,
                                        size: 16,
                                        color: AppColors.azureBlue,
                                      ),
                                      const SizedBox(width: 6),
                                      Flexible(
                                        child: Text(
                                          'Resend available in ${_formatCountdown(_secondsLeft)}',
                                          style: GoogleFonts.poppins(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.azureBlue,
                                          ),
                                        ),
                                      ),
                                    ],
                                  )
                                else
                                  TextButton.icon(
                                    onPressed: _handleResend,
                                    icon: const Icon(
                                      Icons.refresh_rounded,
                                      size: 18,
                                      color: AppColors.azureBlue,
                                    ),
                                    label: Text(
                                      'Resend reset email',
                                      style: GoogleFonts.poppins(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.azureBlue,
                                      ),
                                    ),
                                    style: TextButton.styleFrom(
                                      padding: EdgeInsets.zero,
                                      minimumSize: const Size(48, 36),
                                      alignment: Alignment.centerLeft,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],

                        // Back to Sign In Button
                        SecondaryButton(
                          text: 'Back to sign in',
                          onPressed: () {
                            if (Navigator.canPop(context)) {
                              Navigator.pop(context);
                            } else {
                              Navigator.pushReplacementNamed(
                                context,
                                AppRoutes.login,
                              );
                            }
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
