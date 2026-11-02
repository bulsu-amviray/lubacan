import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../app_routes.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_header.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/info_banner.dart';
import '../widgets/luba_logo.dart';
import '../widgets/primary_button.dart';
import '../widgets/secondary_button.dart';
import '../core/auth/auth_service.dart';
import '../core/auth/session_manager.dart';
import '../data/reports_store.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();

  bool _rememberMe = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final registeredEmail = SessionManager.instance.currentUser?.email ??
        ReportsStore.instance.profile.email;
    if (registeredEmail.isNotEmpty &&
        registeredEmail != 'mika.reyes@example.com') {
      _emailController.text = registeredEmail;
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    FocusScope.of(context).unfocus();

    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isLoading = true);

    try {
      final user = await AuthService.instance.signIn(
        email: _emailController.text,
        password: _passwordController.text,
      );

      if (!mounted) return;

      if (!user.isActive) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your account is currently inactive. Please contact support.'),
          ),
        );
        return;
      }

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
              const AuthHeader(title: 'Sign in', eyebrow: 'CITIZEN / BULACAN'),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 12),
                        // Navy Luba Logo
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: LubaLogo(
                            isWhite: false,
                            size: 42,
                            includeText: true,
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Headings
                        Text(
                          'Welcome back, neighbor.',
                          style: GoogleFonts.montserrat(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: AppColors.deepNavy,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Sign in to report road damage and track your community\'s progress.',
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
                            ).requestFocus(_passwordFocusNode);
                          },
                        ),
                        const SizedBox(height: 16),

                        // Password Field
                        CustomTextField(
                          label: 'Password',
                          hintText: 'Enter your password',
                          controller: _passwordController,
                          focusNode: _passwordFocusNode,
                          isPassword: true,
                          textInputAction: TextInputAction.done,
                          autofillHints: const [AutofillHints.password],
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Password is required';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) => _handleSignIn(),
                        ),
                        const SizedBox(height: 12),

                        // Remember Me and Forgot Password
                        Wrap(
                          alignment: WrapAlignment.spaceBetween,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: Checkbox(
                                    value: _rememberMe,
                                    onChanged: (val) {
                                      setState(() {
                                        _rememberMe = val ?? false;
                                      });
                                    },
                                  ),
                                ),
                                const SizedBox(width: 8),
                                GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _rememberMe = !_rememberMe;
                                    });
                                  },
                                  child: Text(
                                    'Remember me',
                                    style: GoogleFonts.poppins(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.darkGray,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.pushNamed(
                                  context,
                                  AppRoutes.resetPassword,
                                );
                              },
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 4,
                                ),
                                minimumSize: const Size(48, 44),
                              ),
                              child: Text(
                                'Forgot password?',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.azureBlue,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Primary Sign In Button
                        PrimaryButton(
                          text: 'Sign in',
                          isLoading: _isLoading,
                          trailingIcon: const Icon(
                            Icons.arrow_forward_rounded,
                            color: AppColors.white,
                            size: 18,
                          ),
                          onPressed: _handleSignIn,
                        ),
                        const SizedBox(height: 20),

                        // Info Banner
                        const InfoBanner(
                          title: 'Your reports help your community',
                          message:
                              'Your contact details are shared only with authorized LGU staff.',
                          tone: InfoBannerTone.info,
                          icon: Icon(
                            Icons.info_outline_rounded,
                            color: AppColors.azureBlue,
                            size: 20,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // New to LUBA CanFindIT
                        Center(
                          child: Text(
                            'New to LUBA CanFindIT?',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: AppColors.darkGray,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Create an Account Button
                        SecondaryButton(
                          text: 'Create an account',
                          onPressed: () {
                            Navigator.pushNamed(context, AppRoutes.register);
                          },
                        ),
                        const SizedBox(height: 20),

                        // Terms / Privacy text
                        Center(
                          child: Text(
                            'By signing in, you agree to our Terms of Service and Privacy Notice.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                              color: AppColors.neutralGray,
                              height: 1.4,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
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
