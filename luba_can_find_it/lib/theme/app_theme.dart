import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// LUBA CanFindIT Brand Colors
class AppColors {
  AppColors._();

  static const Color deepNavy = Color(0xFF0F172A);
  static const Color azureBlue = Color(0xFF3B82F6);
  static const Color brightGray = Color(0xFFEEEEEE);
  static const Color white = Color(0xFFFFFFFF);
  static const Color vividViolet = Color(0xFF6D28D9);
  static const Color darkEmerald = Color(0xFF166534);
  static const Color lightBlue = Color(0xFFD8E6FD);
  static const Color lightGreen = Color(0xFFBFF1D2);
  static const Color neutralGray = Color(0xFF999999);
  static const Color darkGray = Color(0xFF333333);
  static const Color error = Color(0xFFDC2626);

  // Surface and utility aliases mapped to the brand palette
  static const Color background = Color(0xFFF2F6FB);
  static const Color cardBackground = white;
  static const Color border = Color(0xFFDCE5EF);
  static const Color inputBorder = Color(0xFFDCE5EF);

  // LUBA CanFindIT Official Palette (luba.pdf)
  static const Color navy = Color(0xFF153456);
  static const Color orange = Color(0xFFE6531A);
  static const Color pageBackground = Color(0xFFF2F6FB);
  static const Color muted = Color(0xFF647B98);
  static const Color subtleBorder = Color(0xFFDCE5EF);

  // Status colors
  static const Color statusResolved = Color(0xFF168054);
  static const Color statusResolvedBg = Color(0xFFE4F4EC);
  static const Color statusInProgress = Color(0xFF185A9D);
  static const Color statusInProgressBg = Color(0xFFE8F1FC);
  static const Color statusPending = Color(0xFF986000);
  static const Color statusPendingBg = Color(0xFFFFF1DB);
  static const Color statusDanger = Color(0xFFC63838);
  static const Color statusDangerBg = Color(0xFFFDE8E8);

  // Severity colors
  static const Color severityHigh = Color(0xFFC63838);
  static const Color severityMedium = Color(0xFFE5A02D);
  static const Color severityLow = Color(0xFF2769A9);
}

/// Standardized border radiuses for LUBA CanFindIT
class AppRadius {
  AppRadius._();

  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double card = 16.0;
  static const double button = 12.0;
  static const double input = 12.0;
  static const double full = 999.0;

  static const BorderRadius smBorder = BorderRadius.all(Radius.circular(sm));
  static const BorderRadius mdBorder = BorderRadius.all(Radius.circular(md));
  static const BorderRadius lgBorder = BorderRadius.all(Radius.circular(lg));
  static const BorderRadius cardBorder = BorderRadius.all(
    Radius.circular(card),
  );
  static const BorderRadius buttonBorder = BorderRadius.all(
    Radius.circular(button),
  );
  static const BorderRadius inputBorder = BorderRadius.all(
    Radius.circular(input),
  );
}

/// AppTheme definition
class AppTheme {
  AppTheme._();

  static ThemeData get light {
    final baseTextTheme = GoogleFonts.poppinsTextTheme();

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.light(
        primary: AppColors.azureBlue,
        onPrimary: AppColors.white,
        secondary: AppColors.deepNavy,
        onSecondary: AppColors.white,
        surface: AppColors.white,
        onSurface: AppColors.deepNavy,
        error: AppColors.error,
        onError: AppColors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: AppColors.deepNavy),
        titleTextStyle: GoogleFonts.montserrat(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.deepNavy,
        ),
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.montserrat(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: AppColors.deepNavy,
        ),
        displayMedium: GoogleFonts.montserrat(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: AppColors.deepNavy,
        ),
        headlineLarge: GoogleFonts.montserrat(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: AppColors.deepNavy,
        ),
        headlineMedium: GoogleFonts.montserrat(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.deepNavy,
        ),
        titleLarge: GoogleFonts.montserrat(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.deepNavy,
        ),
        titleMedium: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.deepNavy,
        ),
        bodyLarge: GoogleFonts.poppins(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: AppColors.darkGray,
        ),
        bodyMedium: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColors.darkGray,
        ),
        bodySmall: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColors.darkGray,
        ),
        labelLarge: GoogleFonts.poppins(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: AppColors.white,
        ),
        labelSmall: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: AppColors.azureBlue,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        hintStyle: GoogleFonts.poppins(
          fontSize: 14,
          color: AppColors.neutralGray,
          fontWeight: FontWeight.w400,
        ),
        border: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.border, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.border, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.azureBlue, width: 1.8),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.error, width: 1.2),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.error, width: 1.8),
        ),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith<Color>((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.azureBlue;
          }
          return Colors.transparent;
        }),
        checkColor: const WidgetStatePropertyAll(AppColors.white),
        side: const BorderSide(color: AppColors.azureBlue, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4.0)),
      ),
    );
  }
}
