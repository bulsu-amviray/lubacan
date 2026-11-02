import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// LUBA CanFindIT Logo Widget
class LubaLogo extends StatelessWidget {
  final bool isWhite;
  final double size;
  final bool includeText;

  const LubaLogo({
    super.key,
    this.isWhite = false,
    this.size = 48.0,
    this.includeText = true,
  });

  @override
  Widget build(BuildContext context) {
    final assetPath = isWhite
        ? 'assets/images/luba_logo_white.png'
        : 'assets/images/luba_logo.png';
    final textColor = isWhite ? AppColors.white : AppColors.deepNavy;

    final imageWidget = Image.asset(
      assetPath,
      height: size,
      width: size,
      fit: BoxFit.contain,
      semanticLabel: 'LUBA CanFindIT logo mark',
    );

    if (!includeText) {
      return imageWidget;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        imageWidget,
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'LUBA',
              style: GoogleFonts.montserrat(
                fontSize: size * 0.42,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.5,
                color: textColor,
                height: 1.1,
              ),
            ),
            Text(
              'CanFindIT',
              style: GoogleFonts.montserrat(
                fontSize: size * 0.32,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
                color: textColor.withAlpha((255 * 0.85).round()),
                height: 1.1,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
