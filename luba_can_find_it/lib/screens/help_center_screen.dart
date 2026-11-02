import 'package:flutter/material.dart';
import '../app_routes.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/app_top_bar.dart';

class _FaqItem {
  const _FaqItem({
    required this.question,
    required this.answer,
    required this.category,
  });

  final String question;
  final String answer;
  final String category;
}

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'All';
  final Set<int> _expandedIndices = {
    0,
    1,
    2,
    3,
    4,
  }; // expanded by default as in PDF

  final List<_FaqItem> _faqItems = const [
    _FaqItem(
      category: 'Reports',
      question: 'How do I track a report?',
      answer:
          'Open My Reports and choose the report ID. Its history shows review, verification, assignment, work start and LGU-approved resolution. Enable status updates to receive alerts.',
    ),
    _FaqItem(
      category: 'Reports',
      question: 'Why is my report a Duplicate?',
      answer:
          'The LGU found the same damage in an earlier report. Open the linked original for repair updates. RW-2026-0835 links to RW-2026-0826 on Aurora Boulevard, Project 4.',
    ),
    _FaqItem(
      category: 'Repairs',
      question: 'Why is a repair still pending review?',
      answer:
          'A team\'s completion submission does not close the report. It stays In Progress while the LGU checks before-and-after photos and repair notes. Only approval marks it Resolved.',
    ),
    _FaqItem(
      category: 'Reports',
      question: 'Can I edit or cancel a report?',
      answer:
          'Only Submitted reports can be edited or cancelled before review starts. For Under Review, Verified, Assigned, In Progress, Resolved, Rejected or Duplicate, use Contact Support.',
    ),
    _FaqItem(
      category: 'Repairs',
      question: 'What if a repair needs more work?',
      answer:
          'Use Report an issue with this repair or Contact Support with the report ID. Describe the concern from a safe place; do not enter the road to inspect it.',
    ),
    _FaqItem(
      category: 'Account',
      question: 'How do I update my contact information?',
      answer:
          'Go to Profile > Edit profile to update your name, mobile number, or registered barangay.',
    ),
    _FaqItem(
      category: 'Privacy',
      question: 'Who can view my submitted photos?',
      answer:
          'Photos of road damage are shared with authorized LGU highway maintenance teams to inspect and repair the road.',
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<_FaqItem> get _filteredFaqs {
    final query = _searchController.text.trim().toLowerCase();
    return _faqItems.where((item) {
      final matchesCategory =
          _selectedCategory == 'All' ||
          item.category.toLowerCase() == _selectedCategory.toLowerCase();
      final matchesQuery =
          query.isEmpty ||
          item.question.toLowerCase().contains(query) ||
          item.answer.toLowerCase().contains(query);
      return matchesCategory && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final faqs = _filteredFaqs;

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: const AppTopBar(title: 'Help Center'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Search Input
            TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Search reports, repairs or account help',
                hintStyle: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                ),
                prefixIcon: const Icon(
                  Icons.search_rounded,
                  color: AppColors.muted,
                  size: 20,
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.subtleBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.subtleBorder),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: AppColors.orange,
                    width: 1.5,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Category Pills
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Reports', 'Repairs', 'Account', 'Privacy']
                    .map((cat) {
                      final active = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(cat),
                          selected: active,
                          showCheckmark: false,
                          onSelected: (_) =>
                              setState(() => _selectedCategory = cat),
                          backgroundColor: Colors.white,
                          selectedColor: AppColors.navy,
                          labelStyle: TextStyle(
                            color: active ? Colors.white : AppColors.muted,
                            fontSize: 12,
                            fontWeight: active
                                ? FontWeight.w600
                                : FontWeight.w500,
                          ),
                          side: BorderSide(
                            color: active
                                ? AppColors.navy
                                : AppColors.subtleBorder,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      );
                    })
                    .toList(),
              ),
            ),
            const SizedBox(height: 16),

            // Accordion Items
            for (int i = 0; i < faqs.length; i++) ...[
              _buildAccordionCard(i, faqs[i]),
              const SizedBox(height: 10),
            ],

            const SizedBox(height: 14),

            // Still need help card
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
                    'Still need help?',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Send a non-emergency support request. Never share a password or verification code.',
                    style: TextStyle(
                      color: AppColors.statusInProgress,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Contact Support Button
            SizedBox(
              height: 50,
              child: FilledButton(
                onPressed: () =>
                    Navigator.of(context).pushNamed(AppRoutes.contactSupport),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
                child: const Text(
                  'Contact Support',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Back button
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
                  'Back to account settings',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }

  Widget _buildAccordionCard(int index, _FaqItem item) {
    final isExpanded = _expandedIndices.contains(index);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.subtleBorder),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: isExpanded,
          onExpansionChanged: (expanded) {
            setState(() {
              if (expanded) {
                _expandedIndices.add(index);
              } else {
                _expandedIndices.remove(index);
              }
            });
          },
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          title: Text(
            item.question,
            style: const TextStyle(
              color: AppColors.navy,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          trailing: Icon(
            isExpanded
                ? Icons.keyboard_arrow_up_rounded
                : Icons.keyboard_arrow_down_rounded,
            color: AppColors.navy,
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                item.answer,
                style: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                  height: 1.45,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
