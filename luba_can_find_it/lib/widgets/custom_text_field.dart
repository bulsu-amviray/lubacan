import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Reusable labeled text field with Figma-matched enclosed label,
/// focus/error border states, password show/hide toggle, and form validation.
class CustomTextField extends StatefulWidget {
  final String label;
  final TextEditingController? controller;
  final String? hintText;
  final bool isPassword;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onFieldSubmitted;
  final ValueChanged<String>? onChanged;
  final FocusNode? focusNode;
  final Iterable<String>? autofillHints;
  final bool enabled;
  final Widget? prefixIcon;
  final Widget? suffixIcon;

  const CustomTextField({
    super.key,
    required this.label,
    this.controller,
    this.hintText,
    this.isPassword = false,
    this.keyboardType,
    this.textInputAction,
    this.validator,
    this.onFieldSubmitted,
    this.onChanged,
    this.focusNode,
    this.autofillHints,
    this.enabled = true,
    this.prefixIcon,
    this.suffixIcon,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  late bool _obscured;
  late FocusNode _effectiveFocusNode;
  bool _ownsFocusNode = false;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _obscured = widget.isPassword;
    if (widget.focusNode == null) {
      _effectiveFocusNode = FocusNode();
      _ownsFocusNode = true;
    } else {
      _effectiveFocusNode = widget.focusNode!;
    }

    _effectiveFocusNode.addListener(_handleFocusChanged);
  }

  void _handleFocusChanged() {
    if (mounted && _isFocused != _effectiveFocusNode.hasFocus) {
      setState(() {
        _isFocused = _effectiveFocusNode.hasFocus;
      });
    }
  }

  @override
  void dispose() {
    _effectiveFocusNode.removeListener(_handleFocusChanged);
    if (_ownsFocusNode) {
      _effectiveFocusNode.dispose();
    }
    super.dispose();
  }

  void _toggleObscure() {
    setState(() {
      _obscured = !_obscured;
    });
  }

  @override
  Widget build(BuildContext context) {
    return FormField<String>(
      validator: widget.validator,
      initialValue: widget.controller?.text ?? '',
      enabled: widget.enabled,
      builder: (FormFieldState<String> state) {
        final hasError = state.hasError;
        final errorText = state.errorText;

        final Color borderColor = hasError
            ? AppColors.error
            : (_isFocused ? AppColors.azureBlue : AppColors.border);

        final double borderWidth = (_isFocused || hasError) ? 1.8 : 1.2;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              decoration: BoxDecoration(
                color: widget.enabled
                    ? AppColors.white
                    : AppColors.brightGray.withAlpha((255 * 0.4).round()),
                borderRadius: AppRadius.inputBorder,
                border: Border.all(color: borderColor, width: borderWidth),
              ),
              padding: const EdgeInsets.fromLTRB(16, 10, 8, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    widget.label,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: hasError
                          ? AppColors.error
                          : (_isFocused
                                ? AppColors.azureBlue
                                : AppColors.darkGray),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      if (widget.prefixIcon != null) ...[
                        widget.prefixIcon!,
                        const SizedBox(width: 8),
                      ],
                      Expanded(
                        child: TextField(
                          controller: widget.controller,
                          focusNode: _effectiveFocusNode,
                          obscureText: _obscured,
                          keyboardType: widget.keyboardType,
                          textInputAction: widget.textInputAction,
                          autofillHints: widget.autofillHints,
                          enabled: widget.enabled,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            color: AppColors.deepNavy,
                          ),
                          decoration: InputDecoration(
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 4,
                            ),
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            errorBorder: InputBorder.none,
                            focusedErrorBorder: InputBorder.none,
                            fillColor: Colors.transparent,
                            filled: false,
                            hintText: widget.hintText,
                            hintStyle: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                              color: AppColors.neutralGray,
                            ),
                          ),
                          onChanged: (val) {
                            state.didChange(val);
                            if (widget.onChanged != null) {
                              widget.onChanged!(val);
                            }
                          },
                          onSubmitted: widget.onFieldSubmitted,
                        ),
                      ),
                      if (widget.isPassword)
                        Semantics(
                          label: _obscured ? 'Show password' : 'Hide password',
                          button: true,
                          child: SizedBox(
                            width: 44,
                            height: 44,
                            child: IconButton(
                              icon: Icon(
                                _obscured
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: AppColors.deepNavy,
                                size: 22,
                              ),
                              tooltip: _obscured
                                  ? 'Show password'
                                  : 'Hide password',
                              onPressed: _toggleObscure,
                            ),
                          ),
                        )
                      else if (widget.suffixIcon != null)
                        widget.suffixIcon!,
                    ],
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
}
