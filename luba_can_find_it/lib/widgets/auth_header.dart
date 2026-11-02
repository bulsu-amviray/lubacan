import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Reusable authenticated header with back navigation, eyebrow badge, and title
class AuthHeader extends StatelessWidget {
  final String title;
  final String eyebrow;
  final VoidCallback? onBack;
  final Widget? trailing;

  const AuthHeader({
    super.key,
    required this.title,
    this.eyebrow = 'CITIZEN / BULACAN',
    this.onBack,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64.0,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Semantics(
              label: 'Back',
              button: true,
              child: SizedBox(
                width: 48,
                height: 48,
                child: IconButton(
                  icon: const Icon(
                    Icons.arrow_back_rounded,
                    color: AppColors.deepNavy,
                    size: 22,
                  ),
                  onPressed: () {
                    if (onBack != null) {
                      onBack!();
                    } else {
                      Navigator.maybePop(context);
                    }
                  },
                  tooltip: 'Back',
                ),
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    eyebrow,
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.3,
                      color: AppColors.azureBlue,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.montserrat(
                      fontSize: 19,
                      fontWeight: FontWeight.w700,
                      color: AppColors.deepNavy,
                      height: 1.2,
                    ),
                  ),
                ],
              ),
            ),
            if (trailing != null) trailing! else const SizedBox(width: 48),
          ],
        ),
      ),
    );
  }
}
