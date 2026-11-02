/// Configuration for Firebase Realtime Database.
///
/// Can be customized at runtime or via compile-time definition:
/// flutter run --dart-define=FIREBASE_RTDB_URL=https://your-project-default-rtdb.firebaseio.com
class FirebaseConfig {
  static String databaseUrl = const String.fromEnvironment(
    'FIREBASE_RTDB_URL',
    defaultValue: 'https://lubacanfindit-default-rtdb.firebaseio.com',
  );

  static String? apiKey = const String.fromEnvironment(
    'FIREBASE_API_KEY',
    defaultValue: '',
  );

  /// Helper to convert email or IDs to valid Firebase Realtime Database keys.
  /// Firebase keys cannot contain '.', '#', '$', '[', ']', or '/'.
  static String sanitizeKey(String key) {
    return key
        .replaceAll('.', '_dot_')
        .replaceAll('#', '_hash_')
        .replaceAll(r'$', '_dollar_')
        .replaceAll('[', '_lb_')
        .replaceAll(']', '_rb_')
        .replaceAll('/', '_slash_');
  }

  /// Restores sanitized keys back to original form.
  static String desanitizeKey(String key) {
    return key
        .replaceAll('_dot_', '.')
        .replaceAll('_hash_', '#')
        .replaceAll('_dollar_', r'$')
        .replaceAll('_lb_', '[')
        .replaceAll('_rb_', ']')
        .replaceAll('_slash_', '/');
  }
}
