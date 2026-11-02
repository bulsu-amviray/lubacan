import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../app_routes.dart';
import '../theme/app_theme.dart';
import '../widgets/luba_logo.dart';
import '../widgets/primary_button.dart';
import '../widgets/secondary_button.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'CITIZEN / MALOLOS',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.0,
                  color: AppColors.azureBlue,
                ),
              ),
              const SizedBox(height: 4),
              Semantics(
                header: true,
                child: Text(
                  'Welcome to LUBA canFindIT',
                  style: GoogleFonts.montserrat(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.deepNavy,
                    height: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const _HeroCard(),
              const SizedBox(height: 28),

                    Text(
                      'See it. Report it.\nHelp make it safer.',
                      style: GoogleFonts.montserrat(
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
                        color: AppColors.deepNavy,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Report potholes in minutes, follow every repair, and help your LGU keep your neighborhood moving.',
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        fontWeight: FontWeight.w400,
                        color: AppColors.darkGray,
                        height: 1.55,
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Row(
                      children: [
                        Expanded(
                          child: _FeatureItem(
                            icon: Icons.camera_alt_outlined,
                            label: 'Report',
                          ),
                        ),
                        Expanded(
                          child: _FeatureItem(
                            icon: Icons.location_on_outlined,
                            label: 'Track',
                          ),
                        ),
                        Expanded(
                          child: _FeatureItem(
                            icon: Icons.verified_user_outlined,
                            label: 'Verify',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    PrimaryButton(
                      text: 'Get started',
                      trailingIcon: const Icon(
                        Icons.arrow_forward_rounded,
                        color: AppColors.white,
                        size: 20,
                      ),
                      onPressed: () {
                        Navigator.pushNamed(context, AppRoutes.register);
                      },
                    ),
                    const SizedBox(height: 12),
                    SecondaryButton(
                      text: 'I already have an account',
                      onPressed: () {
                        Navigator.pushNamed(context, AppRoutes.login);
                      },
                    ),
                    const SizedBox(height: 24),

                    Center(
                      child: Text(
                        'Road pothole reporting & monitoring system\nStatic demonstration · fictional sample data',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          fontWeight: FontWeight.w400,
                          color: AppColors.darkGray,
                          height: 1.45,
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

/// Hero card: photo if available, brand gradient otherwise.
/// To use the prototype's road photo, add an approved image at
/// assets/images/welcome_hero.jpg and declare assets/images/ in pubspec.yaml.
class _HeroCard extends StatelessWidget {
  const _HeroCard();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: AppRadius.cardBorder,
      child: AspectRatio(
        aspectRatio: 342 / 280,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/welcome_hero.jpg',
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.azureBlue, AppColors.deepNavy],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
            // Dark fade so the slogan is readable on any image
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0x330F172A), Color(0xCC0F172A)],
                ),
              ),
            ),
            Positioned(
              left: 20,
              top: 20,
              right: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const LubaLogo(isWhite: true, size: 34, includeText: true),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: AppColors.azureBlue,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            'Malolos, Philippines',
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: AppColors.deepNavy,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              left: 20,
              right: 20,
              bottom: 20,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  'Better roads.\nStronger communities.',
                  style: GoogleFonts.inter(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                    height: 1.2,
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

class _FeatureItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const _FeatureItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.azureBlue, size: 28),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.deepNavy,
          ),
        ),
      ],
    );
  }
}
