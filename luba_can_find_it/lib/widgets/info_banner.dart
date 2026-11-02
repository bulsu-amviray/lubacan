import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

enum InfoBannerTone { info, success }

class InfoBanner extends StatelessWidget {
  final String title;
  final String message;
  final InfoBannerTone tone;
  final Widget? icon;

  const InfoBanner({
    super.key,
    required this.title,
    required this.message,
    this.tone = InfoBannerTone.info,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isSuccess = tone == InfoBannerTone.success;
    final backgroundColor = isSuccess
        ? AppColors.lightGreen
        : AppColors.lightBlue;
    final titleColor = isSuccess ? AppColors.darkEmerald : AppColors.deepNavy;
    final messageColor = isSuccess ? AppColors.darkEmerald : AppColors.darkGray;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: AppRadius.cardBorder,
        border: Border.all(
          color: isSuccess
              ? AppColors.darkEmerald.withAlpha((255 * 0.15).round())
              : AppColors.azureBlue.withAlpha((255 * 0.15).round()),
          width: 1.0,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            Padding(
              padding: const EdgeInsets.only(top: 2, right: 12),
              child: icon!,
            ),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: GoogleFonts.montserrat(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: messageColor,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
