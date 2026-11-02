import '../models/maintenance_task.dart';

/// Firebase schema reference and payload builders shared with the Admin Web
/// Dashboard. This class does not initialize Firebase or perform network I/O;
/// its security-rules text must be reviewed and deployed separately.
class FirebaseMaintenanceService {
  // Collection References
  static const String colUsers = 'users';
  static const String colReports = 'reports';
  static const String colMaintenanceTasks = 'maintenance_tasks';
  static const String colAuditLogs = 'audit_logs';

  // Storage Buckets & Folders
  static const String storageEvidenceFolder = 'evidence';
  static const String storageReportsFolder = 'reports';

  /// Generates the canonical storage path for task evidence photos.
  static String getEvidenceStoragePath({
    required String taskId,
    required bool isAfterPhoto,
  }) {
    final filename = isAfterPhoto ? 'after.jpg' : 'before.jpg';
    return '$storageEvidenceFolder/$taskId/$filename';
  }

  /// Firestore schema payload for updating inspection details.
  static Map<String, dynamic> buildInspectionPayload({
    required double widthMeters,
    required double depthCm,
    required double lengthMeters,
    required String siteHazards,
    required bool safetyChecklistCompleted,
    required String inspectorUid,
  }) {
    return {
      'inspection': {
        'widthMeters': widthMeters,
        'depthCm': depthCm,
        'lengthMeters': lengthMeters,
        'siteHazards': siteHazards,
        'safetyChecklistCompleted': safetyChecklistCompleted,
        'inspectorUid': inspectorUid,
        'inspectedAt': DateTime.now().toIso8601String(),
      },
    };
  }

  /// Firestore schema payload for starting work / updating progress.
  static Map<String, dynamic> buildProgressPayload({
    required String progressNotes,
    String? materialsEquipment,
    String? estimatedCompletion,
    required String workerUid,
  }) {
    return {
      'status': TaskStatus.inProgress.name,
      'progress': {
        'notes': progressNotes,
        'materials': materialsEquipment,
        'estimatedCompletion': estimatedCompletion,
        'updatedByUid': workerUid,
        'updatedAt': DateTime.now().toIso8601String(),
      },
    };
  }

  /// Firestore schema payload for submitting repair evidence for review.
  /// Note: Status is set to 'awaiting_review' (NOT 'resolved').
  static Map<String, dynamic> buildEvidenceSubmissionPayload({
    required String taskId,
    required String beforePhotoUrl,
    required String afterPhotoUrl,
    required String finalNotes,
    required String submittedByUid,
  }) {
    return {
      'status': TaskStatus.awaitingReview.name,
      'evidence': {
        'beforePhotoUrl': beforePhotoUrl,
        'afterPhotoUrl': afterPhotoUrl,
        'finalNotes': finalNotes,
        'submittedByUid': submittedByUid,
        'submittedAt': DateTime.now().toIso8601String(),
      },
    };
  }

  /// Firestore security rules requirements specification.
  static const String firestoreSecurityRules = '''
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function getUserRole() {
      return request.auth.token.role != null 
        ? request.auth.token.role 
        : get(/databases/\$(database)/documents/users/\$(request.auth.uid)).data.role;
    }
    function isCitizen() {
      return isAuthenticated() && getUserRole() == 'citizen';
    }
    function isMaintenance() {
      return isAuthenticated() && getUserRole() == 'maintenance';
    }
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }

    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      // Users can only write their own non-role fields during signup
      allow create: if isAuthenticated() && request.auth.uid == userId && request.resource.data.role == 'citizen';
      allow update: if isAdmin();
    }

    match /reports/{reportId} {
      allow read: if isAuthenticated();
      allow create: if isCitizen() || isAdmin();
      allow update: if (isCitizen() && resource.data.userId == request.auth.uid && resource.data.status == 'open') 
                    || isMaintenance() 
                    || isAdmin();
    }

    match /maintenance_tasks/{taskId} {
      allow read: if isMaintenance() || isAdmin();
      allow update: if isMaintenance() || isAdmin();
      allow create, delete: if isAdmin();
    }
  }
}
''';
}
