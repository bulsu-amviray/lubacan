import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'firebase_config.dart';

/// Direct HTTP client for Firebase Realtime Database.
///
/// Enables real-time REST synchronization across Android, iOS, and Web
/// without requiring heavy native build scripts or native asset compilation issues.
class FirebaseRealtimeService {
  static final FirebaseRealtimeService instance =
      FirebaseRealtimeService._internal();

  FirebaseRealtimeService._internal();

  http.Client client = http.Client();

  Uri _buildUri(String path) {
    var baseUrl = FirebaseConfig.databaseUrl.trim();
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$baseUrl$cleanPath.json');
  }

  /// Writes data to Firebase Realtime Database at [path].
  Future<dynamic> put(String path, dynamic data) async {
    try {
      final uri = _buildUri(path);
      final response = await client
          .put(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(data),
          )
          .timeout(const Duration(seconds: 8));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('FirebaseRealtimeService.put exception: $e');
      return null;
    }
  }

  /// Appends a new item into a list generating a unique Firebase ID.
  Future<String?> post(String path, dynamic data) async {
    try {
      final uri = _buildUri(path);
      final response = await client
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(data),
          )
          .timeout(const Duration(seconds: 8));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final decoded = jsonDecode(response.body);
        if (decoded is Map<String, dynamic>) {
          return decoded['name'] as String?;
        }
      }
      return null;
    } catch (e) {
      debugPrint('FirebaseRealtimeService.post exception: $e');
      return null;
    }
  }

  /// Fetches data from Firebase Realtime Database at [path].
  Future<dynamic> get(String path) async {
    try {
      final uri = _buildUri(path);
      final response = await client.get(uri).timeout(const Duration(seconds: 8));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final trimmed = response.body.trim();
        if (trimmed == 'null' || trimmed.isEmpty) {
          return null;
        }
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('FirebaseRealtimeService.get exception: $e');
      return null;
    }
  }

  /// Updates specific fields in Firebase Realtime Database at [path].
  Future<dynamic> patch(String path, Map<String, dynamic> data) async {
    try {
      final uri = _buildUri(path);
      final response = await client
          .patch(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(data),
          )
          .timeout(const Duration(seconds: 8));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('FirebaseRealtimeService.patch exception: $e');
      return null;
    }
  }

  /// Removes an item at [path].
  Future<bool> delete(String path) async {
    try {
      final uri = _buildUri(path);
      final response = await client.delete(uri).timeout(const Duration(seconds: 8));
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (e) {
      debugPrint('FirebaseRealtimeService.delete exception: $e');
      return false;
    }
  }
}
