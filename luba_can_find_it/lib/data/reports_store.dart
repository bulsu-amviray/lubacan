import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:latlong2/latlong.dart';
import '../models/notification_model.dart';
import '../models/pothole_report.dart';
import '../core/supabase/supabase_service.dart';
import '../core/auth/auth_user.dart';
import '../core/auth/session_manager.dart';
import 'bulacan_locations.dart';

class UserProfile {
  UserProfile({
    required this.fullName,
    required this.email,
    required this.mobileNumber,
    required this.municipality,
    required this.barangay,
    this.joinedDate = 'October 2026',
    this.status = 'Active',
  });

  String fullName;
  String email;
  String mobileNumber;
  String municipality;
  String barangay;
  final String joinedDate;
  final String status;
}

class NotificationSettings {
  NotificationSettings({
    this.statusUpdates = true,
    this.repairFeedback = true,
    this.pushNotifications = true,
    this.emailNotifications = true,
    this.dailyDigest = false,
    this.digestTime = '6:00 PM PHT',
  });

  bool statusUpdates;
  bool repairFeedback;
  bool pushNotifications;
  bool emailNotifications;
  bool dailyDigest;
  String digestTime;
}

class DraftReport {
  DraftReport({
    this.roadName = 'MacArthur Highway',
    this.address =
        'Northbound lane near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan',
    this.description = '',
    this.severity = 'High',
    this.latitude = 14.8524,
    this.longitude = 120.8168,
    this.photoCount = 1,
    this.photoSize = '2.4 MB',
    this.savedAt = '19 Oct 2026 · 9:23 AM',
  });

  String roadName;
  String address;
  String description;
  String severity;
  double latitude;
  double longitude;
  int photoCount;
  String photoSize;
  String savedAt;
}

class ReportsStore extends ChangeNotifier {
  ReportsStore._internal() {
    _initReports();
    _initNotifications();
    syncFromFirebase();
    _startPeriodicSync();
  }

  static final ReportsStore instance = ReportsStore._internal();

  Timer? _autoSyncTimer;

  bool get _isInTestEnvironment {
    if (kIsWeb) return false;
    try {
      return Platform.environment.containsKey('FLUTTER_TEST');
    } catch (_) {
      return false;
    }
  }

  void _startPeriodicSync() {
    if (_isInTestEnvironment) return;
    _autoSyncTimer?.cancel();
    _autoSyncTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      syncFromFirebase();
    });
  }

  void stopAutoSync() {
    _autoSyncTimer?.cancel();
    _autoSyncTimer = null;
  }

  /// Synchronizes reports with Supabase Database.
  Future<void> syncFromSupabase() async {
    try {
      final data =
          await SupabaseService.instance.get('reports', order: 'id.desc');
      if (data is List && data.isNotEmpty) {
        final List<PotholeReport> remoteReports = [];
        for (final val in data) {
          if (val is Map) {
            final rawId = (val['code'] as String?) ??
                (val['id']?.toString()) ??
                '';
            remoteReports.add(
              PotholeReport.fromMap(
                Map<String, dynamic>.from(val),
                id: rawId,
              ),
            );
          }
        }
        if (remoteReports.isNotEmpty) {
          _reports.clear();
          _reports.addAll(remoteReports);
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('ReportsStore Supabase sync error: $e');
    }
  }

  /// Backward-compatible alias for syncFromSupabase.
  Future<void> syncFromFirebase() => syncFromSupabase();

  final UserProfile profile = UserProfile(
    fullName: 'Alexa Viray',
    email: 'alexam@gmail.com',
    mobileNumber: '09236648115',
    municipality: 'Malolos',
    barangay: 'Catmon',
  );

  final NotificationSettings notificationSettings = NotificationSettings();
  DraftReport savedDraft = DraftReport();
  bool rememberAccount = true;

  final List<PotholeReport> _reports = [];
  final List<AppNotification> _notifications = [];
  final Set<String> _userUploadedReportIds = <String>{};

  List<PotholeReport> get allReports => List.unmodifiable(_reports);

  /// Validates whether a specific report was submitted by the currently logged-in citizen.
  bool isMyReport(PotholeReport report) {
    if (_userUploadedReportIds.contains(report.id)) {
      return true;
    }

    final user = SessionManager.instance.currentUser;
    final userEmail = (user?.email ?? profile.email).trim().toLowerCase();
    final userName = (user?.fullName ?? profile.fullName).trim().toLowerCase();

    // Check citizenEmail
    if (report.citizenEmail != null && report.citizenEmail!.trim().isNotEmpty) {
      if (report.citizenEmail!.trim().toLowerCase() == userEmail) {
        return true;
      }
    }

    // Check reportedBy name if not generic "Citizen"
    final reporter = report.reportedBy.trim().toLowerCase();
    if (reporter.isNotEmpty && reporter != 'citizen') {
      if (reporter == userName) {
        return true;
      }
    }

    return false;
  }

  /// Returns only the reports submitted by the active user.
  List<PotholeReport> get myReports =>
      List.unmodifiable(_reports.where(isMyReport));

  List<AppNotification> get notifications => List.unmodifiable(_notifications);

  int get unreadNotificationsCount =>
      _notifications.where((n) => !n.isRead).length;

  void _initReports() {
    _reports.addAll([
      PotholeReport(
        id: 'RW-2026-0842',
        roadName: 'MacArthur Highway (Manila North Road)',
        address:
            'Northbound lane near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan',
        description:
            'Deep pothole along MacArthur Highway northbound lane. Motorcycles and jeepneys swerve around it; water collects after rain.',
        severity: 'High',
        status: 'Resolved',
        reportedBy: 'Mika Reyes',
        reportedAt: '19 Oct, 9:24 AM',
        repairTeam: 'Malolos Team Alpha',
        location: const LatLng(14.8524, 120.8168),
        approvedBy: 'Ana Dela Cruz',
        approvedAt: '21 Oct 2026 at 11:20 AM',
        approvalNote:
            'Ana Dela Cruz approved the repair on 21 Oct 2026 at 11:20 AM, after reviewing completion evidence.',
        timeline: const [
          ReportTimelineEvent(
            status: 'Submitted',
            timestamp: '19 Oct · 9:24 AM',
            description: 'Report received from Mika Reyes',
          ),
          ReportTimelineEvent(
            status: 'Under Review',
            timestamp: '19 Oct · 9:31 AM',
            description: 'Location and photo checked',
          ),
          ReportTimelineEvent(
            status: 'Verified',
            timestamp: '19 Oct · 10:15 AM',
            description: 'High severity confirmed by LGU',
          ),
          ReportTimelineEvent(
            status: 'Assigned',
            timestamp: '19 Oct · 10:30 AM',
            description: 'Malolos Team Alpha',
          ),
          ReportTimelineEvent(
            status: 'In Progress',
            timestamp: '20 Oct · 8:10 AM',
            description: 'Repair started; evidence submitted 21 Oct',
          ),
          ReportTimelineEvent(
            status: 'Resolved',
            timestamp: '21 Oct · 11:20 AM',
            description: 'Repair approved by Ana Dela Cruz',
          ),
        ],
        rating: 5,
        feedbackComment:
            'The road is smooth now and much safer for motorcycles. Thank you for the quick response!',
        feedbackDate: '21 Oct 2026 · 11:32 AM PHT',
      ),
      PotholeReport(
        id: 'RW-2026-0843',
        roadName: 'Capitol Compound Road',
        address:
            'Provincial Capitol building approach road, Brgy. Guinhawa, City of Malolos',
        description:
            'Surface depression and broken pavement near the government center exit gate.',
        severity: 'Medium',
        status: 'Submitted',
        reportedBy: 'Mika Reyes',
        reportedAt: '19 Oct 2026 · 9:15 AM',
        location: const LatLng(14.8512, 120.8145),
        timeline: const [
          ReportTimelineEvent(
            status: 'Submitted',
            timestamp: '19 Oct · 9:15 AM',
            description: 'Report received. Awaiting LGU initial review.',
          ),
        ],
      ),
      PotholeReport(
        id: 'RW-2026-0798',
        roadName: 'Paseo del Congreso',
        address:
            'Barasoain Church plaza frontage, Brgy. San Vicente (Poblacion), City of Malolos',
        description:
            'Pothole along the main thoroughfare causing vehicular slowdown.',
        severity: 'Medium',
        status: 'Resolved',
        reportedBy: 'Mika Reyes',
        reportedAt: '16 Oct 2026 · 3:42 PM',
        location: const LatLng(14.8465, 120.8122),
        timeline: const [
          ReportTimelineEvent(
            status: 'Submitted',
            timestamp: '16 Oct · 3:42 PM',
            description: 'Report submitted by citizen',
          ),
          ReportTimelineEvent(
            status: 'Resolved',
            timestamp: '18 Oct · 2:00 PM',
            description: 'Repair verified and completed',
          ),
        ],
      ),
      PotholeReport(
        id: 'RW-2026-0771',
        roadName: 'Blas Ople Diversion Road',
        address: 'Near junction, Brgy. Bulihan, City of Malolos',
        description: 'Surface depression near curb line with standing water.',
        severity: 'Low',
        status: 'In Progress',
        reportedBy: 'Mika Reyes',
        reportedAt: '12 Oct 2026 · 8:15 AM',
        location: const LatLng(14.8460, 120.8110),
        repairTeam: 'Malolos Team Alpha',
        timeline: const [
          ReportTimelineEvent(
            status: 'Submitted',
            timestamp: '12 Oct · 8:15 AM',
            description: 'Report submitted',
          ),
          ReportTimelineEvent(
            status: 'In Progress',
            timestamp: '13 Oct · 9:00 AM',
            description: 'Team deployed to site',
          ),
        ],
      ),
      PotholeReport(
        id: 'RW-2026-0723',
        roadName: 'Malolos–Bulakan Road',
        address: 'Near Panasahan bridge, Brgy. Panasahan, City of Malolos',
        description: 'Road crack and pothole near pedestrian crossing.',
        severity: 'Medium',
        status: 'Resolved',
        reportedBy: 'Mika Reyes',
        reportedAt: '08 Oct 2026 · 10:30 AM',
        location: const LatLng(14.8415, 120.8150),
        timeline: const [
          ReportTimelineEvent(
            status: 'Submitted',
            timestamp: '08 Oct · 10:30 AM',
            description: 'Report submitted',
          ),
          ReportTimelineEvent(
            status: 'Resolved',
            timestamp: '10 Oct · 4:15 PM',
            description: 'Asphalt patching completed',
          ),
        ],
      ),
      PotholeReport(
        id: 'RW-2026-0819',
        roadName: 'Fausta Road / Mabolo–San Jose Road',
        address: 'Brgy. Mabolo, City of Malolos',
        description: 'Pothole on inner lane near barangay hall.',
        severity: 'High',
        status: 'Assigned',
        reportedBy: 'Citizen',
        reportedAt: '18 Oct 2026 · 4:10 PM',
        location: const LatLng(14.8390, 120.8180),
        repairTeam: 'Malolos Team Alpha',
      ),
    ]);
  }

  void _initNotifications() {
    _notifications.addAll([
      AppNotification(
        id: 'notif-1',
        title: 'Repair verified & resolved',
        body:
            'Your MacArthur Highway report is resolved. View the repair and share your feedback.',
        statusBadge: 'Resolved',
        reportId: 'RW-2026-0842',
        timestamp: '21 Oct · 11:20 AM',
        isRead: false,
        iconType: NotificationIconType.check,
      ),
      AppNotification(
        id: 'notif-2',
        title: 'Repair submitted for review',
        body:
            'Malolos Team Alpha uploaded completion photos. Your LGU still needs to verify the repair.',
        statusBadge: 'In Progress',
        reportId: 'RW-2026-0842',
        timestamp: '21 Oct · 10:45 AM',
        isRead: false,
        iconType: NotificationIconType.camera,
      ),
      AppNotification(
        id: 'notif-3',
        title: 'Repair work has started',
        body: 'Malolos Team Alpha is repairing the pothole near BSU crossing.',
        statusBadge: 'In Progress',
        reportId: 'RW-2026-0842',
        timestamp: '20 Oct · 8:10 AM',
        isRead: true,
        iconType: NotificationIconType.repair,
      ),
      AppNotification(
        id: 'notif-4',
        title: 'A team is on the way',
        body: 'Malolos Team Alpha has been assigned to your report.',
        statusBadge: 'Assigned',
        reportId: 'RW-2026-0842',
        timestamp: '19 Oct · 10:30 AM',
        isRead: true,
        iconType: NotificationIconType.assigned,
      ),
      AppNotification(
        id: 'notif-5',
        title: 'Your report is verified',
        body: 'The LGU confirmed the location and High severity.',
        statusBadge: 'Verified',
        reportId: 'RW-2026-0842',
        timestamp: '19 Oct · 10:15 AM',
        isRead: true,
        iconType: NotificationIconType.verified,
      ),
    ]);
  }

  PotholeReport? getReportById(String id) {
    try {
      return _reports.firstWhere((r) => r.id == id);
    } catch (_) {
      return null;
    }
  }

  String _resolveReportBarangay(PotholeReport report) {
    if (report.barangay != null && report.barangay!.trim().isNotEmpty) {
      return report.barangay!.trim();
    }
    for (final brgy in BulacanLocations.malolosBarangays) {
      if (report.address.toLowerCase().contains(brgy.toLowerCase())) {
        return brgy;
      }
    }
    return profile.barangay;
  }

  void addReport(PotholeReport report) {
    _userUploadedReportIds.add(report.id);
    final user = SessionManager.instance.currentUser;
    final currentEmail = (user?.email ?? profile.email).trim();
    if (report.citizenEmail == null || report.citizenEmail!.isEmpty) {
      report.citizenEmail = currentEmail;
    }
    final reportBarangay = _resolveReportBarangay(report);
    report.barangay = reportBarangay;
    _reports.insert(0, report);
    notifyListeners();
    final payload = report.toSupabaseMap(
      citizenEmail: currentEmail,
      citizenMobile: profile.mobileNumber,
      barangay: reportBarangay,
    );
    unawaited(
      SupabaseService.instance.post(
        'reports',
        payload,
      ),
    );
  }

  bool updateReport(PotholeReport updated) {
    final index = _reports.indexWhere((r) => r.id == updated.id);
    if (index != -1) {
      if (_reports[index].status == 'Submitted') {
        final reportBarangay = _resolveReportBarangay(updated);
        updated.barangay = reportBarangay;
        _reports[index] = updated;
        notifyListeners();
        final payload = updated.toSupabaseMap(
          citizenEmail: profile.email,
          citizenMobile: profile.mobileNumber,
          barangay: reportBarangay,
        );
        unawaited(
          SupabaseService.instance.patch(
            'reports',
            'code',
            updated.id,
            payload,
          ),
        );
        return true;
      }
    }
    return false;
  }

  bool cancelReport(String id, String reason) {
    final report = getReportById(id);
    if (report != null && report.canCancel) {
      report.status = 'Cancelled';
      report.cancellationReason = reason;
      report.timeline = [
        ...report.timeline,
        ReportTimelineEvent(
          status: 'Cancelled',
          timestamp: 'Just now',
          description: 'Report withdrawn: $reason',
        ),
      ];
      notifyListeners();
      unawaited(
        SupabaseService.instance.patch(
          'reports',
          'code',
          id,
          {
            'status': 'Cancelled',
            'rejection_reason': reason,
          },
        ),
      );
      return true;
    }
    return false;
  }

  void submitFeedback(String id, int rating, String feedback) {
    final report = getReportById(id);
    if (report != null) {
      report.rating = rating;
      report.feedbackComment = feedback;
      final now = DateTime.now();
      report.feedbackDate = '${now.day} Oct ${now.year} · 11:32 AM PHT';
      notifyListeners();
      unawaited(
        SupabaseService.instance.patch(
          'reports',
          'code',
          id,
          {
            'verification_notes': feedback,
          },
        ),
      );
    }
  }

  void markAllNotificationsRead() {
    for (final n in _notifications) {
      n.isRead = true;
    }
    notifyListeners();
  }

  void markNotificationRead(String id) {
    final notif = _notifications.firstWhere((n) => n.id == id);
    notif.isRead = true;
    notifyListeners();
  }

  void setProfileFromAuthUser(AuthUser user) {
    if (user.fullName.trim().isNotEmpty) {
      profile.fullName = user.fullName.trim();
    }
    if (user.email.trim().isNotEmpty) {
      profile.email = user.email.trim();
    }
    if (user.mobileNumber != null && user.mobileNumber!.trim().isNotEmpty) {
      profile.mobileNumber = user.mobileNumber!.trim();
    }
    if (user.municipality != null && user.municipality!.trim().isNotEmpty) {
      profile.municipality = user.municipality!.trim();
    }
    if (user.barangay != null && user.barangay!.trim().isNotEmpty) {
      profile.barangay = user.barangay!.trim();
    }
    notifyListeners();
  }

  void resetProfileToDefaults() {
    _userUploadedReportIds.clear();
    profile.fullName = 'Alexa Viray';
    profile.email = 'alexam@gmail.com';
    profile.mobileNumber = '09236648115';
    profile.municipality = 'Malolos';
    profile.barangay = 'Catmon';
    notifyListeners();
  }

  void updateProfile({
    required String fullName,
    required String email,
    required String mobileNumber,
    required String municipality,
    required String barangay,
  }) {
    profile.fullName = fullName;
    profile.email = email;
    profile.mobileNumber = mobileNumber;
    profile.municipality = municipality;
    profile.barangay = barangay;
    notifyListeners();

    SessionManager.instance.updateUser(
      fullName: fullName,
      email: email,
      mobileNumber: mobileNumber,
      municipality: municipality,
      barangay: barangay,
    );

    unawaited(
      SupabaseService.instance.patch(
        'users',
        'email',
        email,
        {
          'full_name': fullName,
          'mobile': mobileNumber,
          'area': municipality,
          'updated_at': DateTime.now().toIso8601String(),
        },
      ),
    );
  }

  void updateNotificationSettings({
    required bool statusUpdates,
    required bool repairFeedback,
    required bool pushNotifications,
    required bool emailNotifications,
    required bool dailyDigest,
    required String digestTime,
  }) {
    notificationSettings.statusUpdates = statusUpdates;
    notificationSettings.repairFeedback = repairFeedback;
    notificationSettings.pushNotifications = pushNotifications;
    notificationSettings.emailNotifications = emailNotifications;
    notificationSettings.dailyDigest = dailyDigest;
    notificationSettings.digestTime = digestTime;
    notifyListeners();
  }
}
