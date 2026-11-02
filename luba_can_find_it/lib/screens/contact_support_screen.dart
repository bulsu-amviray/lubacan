import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../data/reports_store.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class ContactSupportScreen extends StatefulWidget {
  const ContactSupportScreen({super.key, this.initialReportId});

  final String? initialReportId;

  @override
  State<ContactSupportScreen> createState() => _ContactSupportScreenState();
}

class _ContactSupportScreenState extends State<ContactSupportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reportIdController = TextEditingController();
  final _messageController = TextEditingController();
  final _replyContactController = TextEditingController();

  String _topic = 'Report status question';
  String _replyMode = 'Email'; // 'Email' or 'Mobile'
  String? _attachedFileName;
  bool _isSubmitting = false;
  bool _isSuccess = false;
  String _receiptId = '';

  final List<String> _topics = [
    'Report status question',
    'Duplicate report inquiry',
    'Account access / login',
    'Correction or cancellation',
    'General inquiry',
  ];

  @override
  void initState() {
    super.initState();
    final profile = ReportsStore.instance.profile;
    _reportIdController.text = widget.initialReportId ?? 'RW-2026-0842';
    _messageController.text =
        'Where can I see the LGU verification notes for the MacArthur Highway repair?';
    _replyContactController.text = profile.email;
  }

  @override
  void dispose() {
    _reportIdController.dispose();
    _messageController.dispose();
    _replyContactController.dispose();
    super.dispose();
  }

  Future<void> _pickAttachment() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery);
    if (file != null) {
      setState(() => _attachedFileName = file.name);
    }
  }

  Future<void> _handleSubmit() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (_messageController.text.trim().length < 20) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Message must be at least 20 characters.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    await Future<void>.delayed(const Duration(milliseconds: 650));
    if (!mounted) return;

    final now = DateTime.now();
    final rand = (now.millisecondsSinceEpoch % 9000 + 1000).toString();
    setState(() {
      _isSubmitting = false;
      _isSuccess = true;
      _receiptId = 'SUP-${now.year}-$rand';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Contact Support'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'For non-emergency questions about your account or report.',
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),

              // Topic Dropdown
              _buildFieldLabel('Topic *'),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: _topic,
                decoration: _inputDecoration(''),
                items: _topics.map((t) {
                  return DropdownMenuItem(value: t, child: Text(t));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _topic = val);
                },
              ),
              const SizedBox(height: 16),

              // Report ID (optional)
              _buildFieldLabel('Report ID (optional)'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _reportIdController,
                decoration: _inputDecoration('e.g. RW-2026-0842'),
              ),
              const SizedBox(height: 16),

              // Message
              _buildFieldLabel('Message *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _messageController,
                maxLines: 4,
                decoration: _inputDecoration(
                  'Describe your inquiry in detail...',
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Message is required';
                  }
                  if (val.trim().length < 20) {
                    return 'Minimum 20 characters required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 4),
              const Text(
                'Minimum 20 characters · Do not include passwords or OTPs.',
                style: TextStyle(color: AppColors.muted, fontSize: 11),
              ),
              const SizedBox(height: 16),

              // Reply preference toggles
              Row(
                children: [
                  _replyOption('Email'),
                  const SizedBox(width: 8),
                  _replyOption('Mobile'),
                ],
              ),
              const SizedBox(height: 12),

              // Reply Contact Field
              _buildFieldLabel('Reply $_replyMode.toLowerCase() *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _replyContactController,
                keyboardType: _replyMode == 'Email'
                    ? TextInputType.emailAddress
                    : TextInputType.phone,
                decoration: _inputDecoration(
                  _replyMode == 'Email'
                      ? 'e.g. mika.reyes@example.com'
                      : '+63 9XX XXX XXXX',
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Reply $_replyMode is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Attachment (optional) Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.subtleBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Attachment (optional)',
                      style: TextStyle(
                        color: AppColors.navy,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _attachedFileName != null
                          ? 'Attached: $_attachedFileName'
                          : 'No file attached · JPG / PNG / PDF, max 10 MB',
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: _pickAttachment,
                      icon: const Icon(Icons.attach_file_rounded, size: 18),
                      label: Text(
                        _attachedFileName != null
                            ? 'Replace file'
                            : 'Attach file',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.navy,
                        side: const BorderSide(color: AppColors.subtleBorder),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Submit Button
              SizedBox(
                height: 50,
                child: FilledButton(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.orange,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(11),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Submit request',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),

              // Success sample receipt
              if (_isSuccess) ...[
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.statusResolvedBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.statusResolved.withAlpha(50),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Request received · sample receipt',
                        style: TextStyle(
                          color: AppColors.statusResolved,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$_receiptId · 21 Oct 2026, 11:48 AM PHT. A copy is addressed to ${_replyContactController.text.trim()}. Your report status is unchanged.',
                        style: const TextStyle(
                          color: AppColors.statusResolved,
                          fontSize: 12,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 14),
              const Center(
                child: Text(
                  'Fictional demo support: support@example.com',
                  style: TextStyle(color: AppColors.muted, fontSize: 11),
                ),
              ),
              const SizedBox(height: 14),

              // Back to Help Center
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
                    'Back to Help Center',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }

  Widget _replyOption(String mode) {
    final active = _replyMode == mode;
    return InkWell(
      onTap: () {
        setState(() {
          _replyMode = mode;
          final profile = ReportsStore.instance.profile;
          _replyContactController.text = mode == 'Email'
              ? profile.email
              : profile.mobileNumber;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.navy : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active ? AppColors.navy : AppColors.subtleBorder,
          ),
        ),
        child: Text(
          mode,
          style: TextStyle(
            color: active ? Colors.white : AppColors.navy,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        color: AppColors.navy,
        fontSize: 13,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.subtleBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.subtleBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.orange, width: 1.5),
      ),
    );
  }
}
