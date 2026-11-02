import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../app_routes.dart';
import '../theme/app_theme.dart';
import '../widgets/app_top_bar.dart';

class VerifyEmailScreen extends StatefulWidget {
  const VerifyEmailScreen({
    super.key,
    this.email = 'mika.reyes@example.com',
    this.userName = 'Mika',
  });

  final String email;
  final String userName;

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (_) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  int _resendCountdown = 42;
  int _expireCountdown = 258; // 04:18
  Timer? _timer;
  bool _isVerifying = false;
  bool _showError = false;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill with the demo code shown in PDF [2, 7, 4, 1, 0, 8]
    const demoDigits = ['2', '7', '4', '1', '0', '8'];
    for (int i = 0; i < 6; i++) {
      _controllers[i].text = demoDigits[i];
    }

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_resendCountdown > 0) _resendCountdown--;
        if (_expireCountdown > 0) _expireCountdown--;
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String _formatTimer(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  String _obfuscateEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final name = parts[0];
    final domain = parts[1];
    if (name.length <= 2) return email;
    return '${name[0]}••••${name[name.length - 1]}@$domain';
  }

  Future<void> _handleVerify() async {
    FocusScope.of(context).unfocus();
    final code = _controllers.map((c) => c.text).join();
    if (code.length < 6) {
      setState(() => _showError = true);
      return;
    }

    setState(() {
      _isVerifying = true;
      _showError = false;
    });

    await Future<void>.delayed(const Duration(milliseconds: 650));
    if (!mounted) return;

    // In demo flow, 274108 is accepted as valid code
    if (code == '274108' || code == '123456') {
      setState(() {
        _isVerifying = false;
        _isSuccess = true;
      });
      await Future<void>.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;
      Navigator.of(
        context,
      ).pushNamedAndRemoveUntil(AppRoutes.home, (route) => false);
    } else {
      setState(() {
        _isVerifying = false;
        _showError = true;
      });
    }
  }

  void _handleResend() {
    setState(() => _resendCountdown = 60);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Demo code resent. Please check your inbox.'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Verify your email'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Mail Icon Badge
            Center(
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F1FC),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.mail_outline_rounded,
                  color: AppColors.azureBlue,
                  size: 30,
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Heading
            Center(
              child: Text(
                'One last step, ${widget.userName}.',
                style: const TextStyle(
                  color: AppColors.navy,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                'Enter the six-digit code sent to ${_obfuscateEmail(widget.email)} to finish registration.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Expiry countdown label
            Center(
              child: Text(
                'Verification code · expires in ${_formatTimer(_expireCountdown)}',
                style: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 14),

            // 6-digit boxes
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(6, (index) {
                return SizedBox(
                  width: 48,
                  height: 54,
                  child: TextFormField(
                    controller: _controllers[index],
                    focusNode: _focusNodes[index],
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(1),
                    ],
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: EdgeInsets.zero,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                          color: AppColors.subtleBorder,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                          color: AppColors.subtleBorder,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                          color: AppColors.orange,
                          width: 1.5,
                        ),
                      ),
                    ),
                    onChanged: (val) {
                      if (val.isNotEmpty && index < 5) {
                        _focusNodes[index + 1].requestFocus();
                      } else if (val.isEmpty && index > 0) {
                        _focusNodes[index - 1].requestFocus();
                      }
                    },
                  ),
                );
              }),
            ),
            const SizedBox(height: 22),

            // Verify email button
            SizedBox(
              height: 50,
              child: FilledButton(
                onPressed: _isVerifying ? null : _handleVerify,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
                child: _isVerifying
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        _isSuccess ? 'Verified!' : 'Verify email',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),

            // Error banner
            if (_showError) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDE8E8),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFF8B4B4)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Code not accepted?',
                      style: TextStyle(
                        color: Color(0xFF9B1C1C),
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'If the code is invalid, check all six digits. If it has expired, request a new code and use only the latest one.',
                      style: TextStyle(
                        color: Color(0xFF9B1C1C),
                        fontSize: 12,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Resend code timer
            Center(
              child: _resendCountdown > 0
                  ? Text(
                      'Resend code available in ${_formatTimer(_resendCountdown)}',
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 13,
                      ),
                    )
                  : TextButton(
                      onPressed: _handleResend,
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.orange,
                      ),
                      child: const Text('Resend verification code'),
                    ),
            ),
            const SizedBox(height: 16),

            // Notice Banner
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
                    'Registration verification only',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Password recovery still uses the secure email reset link, not this code.',
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

            // Back to registration
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
                  'Back to registration',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
