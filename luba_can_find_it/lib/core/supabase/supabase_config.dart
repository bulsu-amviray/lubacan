/// Configuration for Supabase integration.
///
/// Can be customized at runtime or via compile-time definition:
/// flutter run --dart-define=SUPABASE_URL=https://boeukdabtzdvmqsqvtpq.supabase.co --dart-define=SUPABASE_ANON_KEY=...
class SupabaseConfig {
  static String url = const String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://boeukdabtzdvmqsqvtpq.supabase.co',
  );

  static String apiKey = const String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static String get restUrl {
    var base = url.trim();
    if (base.endsWith('/rest/v1/')) {
      return base.substring(0, base.length - 1);
    }
    if (base.endsWith('/rest/v1')) {
      return base;
    }
    if (base.endsWith('/')) {
      base = base.substring(0, base.length - 1);
    }
    return '$base/rest/v1';
  }
}
