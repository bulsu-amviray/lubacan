import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../theme/app_theme.dart';

class ReportTimelineEvent {
  const ReportTimelineEvent({
    required this.status,
    required this.timestamp,
    required this.description,
  });

  final String status;
  final String timestamp;
  final String description;

  Map<String, dynamic> toMap() => {
    'status': status,
    'timestamp': timestamp,
    'description': description,
  };

  factory ReportTimelineEvent.fromMap(Map<String, dynamic> map) =>
      ReportTimelineEvent(
        status: (map['status'] as String?) ?? '',
        timestamp: (map['timestamp'] as String?) ?? '',
        description: (map['description'] as String?) ?? '',
      );
}

class PotholeReport {
  PotholeReport({
    required this.id,
    required this.roadName,
    required this.address,
    required this.description,
    required this.severity,
    required this.status,
    required this.reportedBy,
    required this.reportedAt,
    this.repairTeam,
    required this.location,
    this.imageUrl,
    this.afterPhotoUrl,
    this.approvedBy,
    this.approvedAt,
    this.approvalNote,
    this.timeline = const [],
    this.rating,
    this.feedbackComment,
    this.feedbackDate,
    this.cancellationReason,
    this.barangay,
    this.citizenEmail,
  });

  final String id;
  String roadName;
  String address;
  String? barangay;
  String? citizenEmail;
  String description;
  String severity;
  String status;
  final String reportedBy;
  final String reportedAt;
  String? repairTeam;
  LatLng location;
  String? imageUrl;
  String? afterPhotoUrl;
  String? approvedBy;
  String? approvedAt;
  String? approvalNote;
  List<ReportTimelineEvent> timeline;
  int? rating;
  String? feedbackComment;
  String? feedbackDate;
  String? cancellationReason;

  bool get isSubmitted => status == 'Submitted';
  bool get isResolved => status == 'Resolved';
  bool get isInProgress => status == 'In Progress';
  bool get isCancelled => status == 'Cancelled';
  bool get isUnderReview => status == 'Under Review';
  bool get isAssigned => status == 'Assigned';
  bool get isVerified => status == 'Verified';

  bool get canEdit => status == 'Submitted';
  bool get canCancel => status == 'Submitted';

  Color get severityColor => switch (severity) {
    'High' => AppColors.severityHigh,
    'Medium' => AppColors.severityMedium,
    _ => AppColors.severityLow,
  };

  Color get statusColor => switch (status) {
    'Resolved' => AppColors.statusResolved,
    'In Progress' => AppColors.statusInProgress,
    'Cancelled' => AppColors.statusDanger,
    'Verified' => AppColors.statusInProgress,
    'Assigned' => AppColors.statusInProgress,
    _ => AppColors.statusPending,
  };

  Color get statusBackground => switch (status) {
    'Resolved' => AppColors.statusResolvedBg,
    'In Progress' => AppColors.statusInProgressBg,
    'Cancelled' => AppColors.statusDangerBg,
    'Verified' => AppColors.statusInProgressBg,
    'Assigned' => AppColors.statusInProgressBg,
    _ => AppColors.statusPendingBg,
  };

  PotholeReport copyWith({
    String? roadName,
    String? address,
    String? description,
    String? severity,
    String? status,
    LatLng? location,
    String? imageUrl,
    int? rating,
    String? feedbackComment,
    String? feedbackDate,
    String? cancellationReason,
    String? barangay,
    String? citizenEmail,
  }) {
    return PotholeReport(
      id: id,
      roadName: roadName ?? this.roadName,
      address: address ?? this.address,
      description: description ?? this.description,
      severity: severity ?? this.severity,
      status: status ?? this.status,
      reportedBy: reportedBy,
      reportedAt: reportedAt,
      repairTeam: repairTeam,
      location: location ?? this.location,
      imageUrl: imageUrl ?? this.imageUrl,
      afterPhotoUrl: afterPhotoUrl,
      approvedBy: approvedBy,
      approvedAt: approvedAt,
      approvalNote: approvalNote,
      timeline: timeline,
      rating: rating ?? this.rating,
      feedbackComment: feedbackComment ?? this.feedbackComment,
      feedbackDate: feedbackDate ?? this.feedbackDate,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      barangay: barangay ?? this.barangay,
      citizenEmail: citizenEmail ?? this.citizenEmail,
    );
  }

  Map<String, dynamic> toSupabaseMap({
    String? citizenEmail,
    String? citizenMobile,
    String? barangay,
  }) {
    final lat = location.latitude;
    final lng = location.longitude;
    final coordStr =
        '${lat.toStringAsFixed(4)}° N, ${lng.toStringAsFixed(4)}° E';
    final effectiveEmail = citizenEmail ?? this.citizenEmail ?? '';

    return {
      'code': id,
      'road': roadName,
      'barangay': barangay ?? this.barangay ?? '',
      'jurisdiction': 'City',
      'severity': severity,
      'status': status,
      'coordinates': coordStr,
      'latitude': lat,
      'longitude': lng,
      'landmark': address,
      'description': description,
      'photo_url': imageUrl,
      'repair_photo_url': afterPhotoUrl,
      'assigned_team': repairTeam,
      'citizen_name': reportedBy,
      'citizen_email': effectiveEmail,
      'citizen_mobile': citizenMobile ?? '',
      'rejection_reason': cancellationReason,
      'reported_date': reportedAt,
    };
  }

  Map<String, dynamic> toMap({
    String? citizenEmail,
    String? citizenMobile,
    String? barangay,
  }) {
    final lat = location.latitude;
    final lng = location.longitude;
    final coordStr =
        '${lat.toStringAsFixed(4)}° N, ${lng.toStringAsFixed(4)}° E';

    final effectiveEmail = citizenEmail ?? this.citizenEmail ?? '';

    return {
      'id': id,
      'code': id,
      'road': roadName,
      'roadName': roadName,
      'address': address,
      'landmark': address,
      'barangay': barangay ?? this.barangay ?? '',
      'description': description,
      'severity': severity,
      'status': status,
      'reportedBy': reportedBy,
      'reportedAt': reportedAt,
      'reportedDate': reportedAt,
      'repairTeam': repairTeam,
      'coordinates': coordStr,
      'latitude': lat,
      'longitude': lng,
      'citizenEmail': effectiveEmail,
      'citizen': {
        'name': reportedBy,
        'email': effectiveEmail,
        'mobile': citizenMobile ?? '',
      },
      'jurisdiction': 'City',
      'imageUrl': imageUrl,
      'photoUrl': imageUrl,
      'photo': imageUrl,
      'citizenPhoto': imageUrl,
      'image': imageUrl,
      'evidencePhoto': imageUrl,
      if (imageUrl != null) 'photos': [imageUrl],
      'afterPhotoUrl': afterPhotoUrl,
      'completionPhotoUrl': afterPhotoUrl,
      'repairedPhotoUrl': afterPhotoUrl,
      'afterRepairPhoto': afterPhotoUrl,
      if (afterPhotoUrl != null)
        'repairEvidence': {
          'photoUrl': afterPhotoUrl,
          'completedAt': approvedAt ?? reportedAt,
          'leadNotes': approvalNote ?? '',
        },
      'approvedBy': approvedBy,
      'approvedAt': approvedAt,
      'approvalNote': approvalNote,
      'timeline': timeline.map((e) => e.toMap()).toList(),
      'rating': rating,
      'feedbackComment': feedbackComment,
      'feedbackDate': feedbackDate,
      'cancellationReason': cancellationReason,
    };
  }

  factory PotholeReport.fromMap(
    Map<String, dynamic> map, {
    required String id,
  }) {
    double lat = 14.8562;
    double lng = 120.8175;
    if (map['latitude'] is num) {
      lat = (map['latitude'] as num).toDouble();
    }
    if (map['longitude'] is num) {
      lng = (map['longitude'] as num).toDouble();
    }
    if (map['coordinates'] is String) {
      final coordStr = map['coordinates'] as String;
      final parts = coordStr.split(',');
      if (parts.length == 2) {
        final parsedLat =
            double.tryParse(parts[0].replaceAll(RegExp(r'[^0-9.]'), ''));
        final parsedLng =
            double.tryParse(parts[1].replaceAll(RegExp(r'[^0-9.]'), ''));
        if (parsedLat != null && parsedLng != null) {
          lat = parsedLat;
          lng = parsedLng;
        }
      }
    }

    String reportedBy = 'Citizen';
    String? citizenEmail = (map['citizen_email'] as String?)?.trim() ??
        (map['citizenEmail'] as String?)?.trim();
    if (map['citizen_name'] is String &&
        (map['citizen_name'] as String).isNotEmpty) {
      reportedBy = map['citizen_name'] as String;
    } else if (map['reportedBy'] is String &&
        (map['reportedBy'] as String).isNotEmpty) {
      reportedBy = map['reportedBy'] as String;
    } else if (map['citizen'] is Map) {
      final citizenMap = Map<String, dynamic>.from(map['citizen'] as Map);
      if (citizenMap['name'] is String &&
          (citizenMap['name'] as String).isNotEmpty) {
        reportedBy = citizenMap['name'] as String;
      }
      if ((citizenEmail == null || citizenEmail.isEmpty) &&
          citizenMap['email'] is String &&
          (citizenMap['email'] as String).isNotEmpty) {
        citizenEmail = (citizenMap['email'] as String).trim();
      }
    }
    if ((citizenEmail == null || citizenEmail.isEmpty) &&
        map['email'] is String &&
        (map['email'] as String).isNotEmpty) {
      citizenEmail = (map['email'] as String).trim();
    }

    final road =
        (map['roadName'] as String?) ?? (map['road'] as String?) ?? '';
    final landmark = (map['landmark'] as String?) ?? '';
    final barangay = (map['barangay'] as String?) ?? '';
    var address = (map['address'] as String?) ?? '';
    if (address.isEmpty) {
      address = [landmark, barangay].where((s) => s.isNotEmpty).join(', ');
      if (address.isEmpty) address = road;
    }

    final reportedAt = (map['reported_date'] as String?) ??
        (map['reportedDate'] as String?) ??
        (map['reportedAt'] as String?) ??
        (map['created_at'] as String?) ??
        '';

    final rawTimeline = map['timeline'];
    final List<ReportTimelineEvent> timelineEvents = [];
    if (rawTimeline is List) {
      for (final item in rawTimeline) {
        if (item is Map) {
          timelineEvents.add(
            ReportTimelineEvent.fromMap(Map<String, dynamic>.from(item)),
          );
        }
      }
    }

    if (timelineEvents.isEmpty) {
      timelineEvents.add(
        ReportTimelineEvent(
          status: (map['status'] as String?) ?? 'Submitted',
          timestamp: reportedAt.isNotEmpty ? reportedAt : 'Recently',
          description: 'Report recorded in database',
        ),
      );
    }

    final resolvedImageUrl = (map['photo_url'] as String?) ??
        (map['photoUrl'] as String?) ??
        (map['imageUrl'] as String?) ??
        (map['photo'] as String?) ??
        (map['citizenPhoto'] as String?) ??
        (map['image'] as String?) ??
        (map['evidencePhoto'] as String?) ??
        (map['photos'] is List && (map['photos'] as List).isNotEmpty
            ? (map['photos'] as List).first.toString()
            : null);

    final resolvedAfterPhoto = (map['repair_photo_url'] as String?) ??
        (map['afterPhotoUrl'] as String?) ??
        (map['completionPhotoUrl'] as String?) ??
        (map['repairedPhotoUrl'] as String?) ??
        (map['afterRepairPhoto'] as String?) ??
        (map['repairEvidence'] is Map
            ? (map['repairEvidence']['photoUrl'] as String?)
            : null);

    return PotholeReport(
      id: id,
      roadName: road,
      address: address,
      description: (map['description'] as String?) ?? '',
      severity: (map['severity'] as String?) ?? 'Medium',
      status: (map['status'] as String?) ?? 'Submitted',
      reportedBy: reportedBy,
      reportedAt: reportedAt,
      repairTeam: (map['assigned_team'] as String?) ??
          (map['assignedTeam'] as String?) ??
          (map['repairTeam'] as String?),
      location: LatLng(lat, lng),
      imageUrl: resolvedImageUrl,
      afterPhotoUrl: resolvedAfterPhoto,
      approvedBy: (map['verified_by'] as String?) ?? (map['approvedBy'] as String?),
      approvedAt: (map['verified_at'] as String?) ?? (map['approvedAt'] as String?),
      approvalNote: (map['verification_notes'] as String?) ?? (map['approvalNote'] as String?),
      timeline: timelineEvents,
      rating: (map['rating'] as num?)?.toInt(),
      feedbackComment: (map['feedback_notes'] as String?) ?? (map['feedbackComment'] as String?),
      feedbackDate: map['feedbackDate'] as String?,
      cancellationReason: (map['rejection_reason'] as String?) ??
          (map['cancellationReason'] as String?),
      barangay: barangay.isNotEmpty ? barangay : null,
      citizenEmail: (citizenEmail != null && citizenEmail.isNotEmpty) ? citizenEmail : null,
    );
  }
}
