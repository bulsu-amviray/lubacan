enum NotificationIconType { check, camera, repair, assigned, verified }

class AppNotification {
  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.statusBadge,
    required this.reportId,
    required this.timestamp,
    this.isRead = false,
    required this.iconType,
  });

  final String id;
  final String title;
  final String body;
  final String statusBadge;
  final String reportId;
  final String timestamp;
  bool isRead;
  final NotificationIconType iconType;
}
