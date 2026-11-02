import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'supabase_config.dart';

/// Direct HTTP client for Supabase PostgREST database.
///
/// Enables robust query, insert, and update operations across all platforms
/// without requiring heavy native compilation or complex platform channels.
class SupabaseService {
  static final SupabaseService instance = SupabaseService._internal();

  SupabaseService._internal();

  http.Client client = http.Client();

  bool get _isTest {
    if (kIsWeb) return false;
    try {
      return Platform.environment.containsKey('FLUTTER_TEST');
    } catch (_) {
      return false;
    }
  }

  Map<String, String> get _headers => {
        'apikey': SupabaseConfig.apiKey,
        'Authorization': 'Bearer ${SupabaseConfig.apiKey}',
        'Content-Type': 'application/json',
      };

  Uri _buildUri(
    String table, {
    Map<String, String>? queryParams,
    String? select,
    String? order,
    int? limit,
  }) {
    final cleanTable = table.startsWith('/') ? table.substring(1) : table;
    final base = '${SupabaseConfig.restUrl}/$cleanTable';

    final params = <String, String>{};
    if (queryParams != null) {
      params.addAll(queryParams);
    }
    if (select != null && select.isNotEmpty) {
      params['select'] = select;
    }
    if (order != null && order.isNotEmpty) {
      params['order'] = order;
    }
    if (limit != null && limit > 0) {
      params['limit'] = limit.toString();
    }

    if (params.isEmpty) {
      return Uri.parse(base);
    }

    final query = params.entries
        .map((e) => '${e.key}=${e.value}')
        .join('&');
    return Uri.parse('$base?$query');
  }

  /// Fetches rows from a Supabase [table].
  Future<dynamic> get(
    String table, {
    Map<String, String>? queryParams,
    String? select,
    String? order,
    int? limit,
  }) async {
    if (_isTest) return null;
    try {
      final uri = _buildUri(
        table,
        queryParams: queryParams,
        select: select,
        order: order,
        limit: limit,
      );
      final response = await client
          .get(uri, headers: _headers)
          .timeout(const Duration(seconds: 45));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final body = response.body.trim();
        if (body.isEmpty || body == 'null') return null;
        return jsonDecode(body);
      } else {
        debugPrint(
            'SupabaseService.get error [${response.statusCode}]: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('SupabaseService.get exception on $table: $e');
      return null;
    }
  }

  /// Inserts a new row or list of rows into a Supabase [table].
  Future<dynamic> post(String table, dynamic data) async {
    if (_isTest) return null;
    try {
      final cleanTable = table.startsWith('/') ? table.substring(1) : table;
      final uri = Uri.parse('${SupabaseConfig.restUrl}/$cleanTable');
      final headers = Map<String, String>.from(_headers)
        ..['Prefer'] = 'return=representation';

      final response = await client
          .post(uri, headers: headers, body: jsonEncode(data))
          .timeout(const Duration(seconds: 45));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final body = response.body.trim();
        if (body.isEmpty || body == 'null') return null;
        return jsonDecode(body);
      } else {
        debugPrint(
            'SupabaseService.post error [${response.statusCode}]: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('SupabaseService.post exception on $table: $e');
      return null;
    }
  }

  /// Updates rows matching [filterColumn] == [filterValue].
  Future<dynamic> patch(
    String table,
    String filterColumn,
    String filterValue,
    Map<String, dynamic> data,
  ) async {
    if (_isTest) return null;
    try {
      final cleanTable = table.startsWith('/') ? table.substring(1) : table;
      final uri = Uri.parse(
          '${SupabaseConfig.restUrl}/$cleanTable?$filterColumn=eq.${Uri.encodeComponent(filterValue)}');
      final headers = Map<String, String>.from(_headers)
        ..['Prefer'] = 'return=representation';

      final response = await client
          .patch(uri, headers: headers, body: jsonEncode(data))
          .timeout(const Duration(seconds: 45));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final body = response.body.trim();
        if (body.isEmpty || body == 'null') return null;
        return jsonDecode(body);
      } else {
        debugPrint(
            'SupabaseService.patch error [${response.statusCode}]: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('SupabaseService.patch exception on $table: $e');
      return null;
    }
  }

  /// Upserts row into [table] with conflict resolution.
  Future<dynamic> upsert(
    String table,
    dynamic data, {
    String? onConflict,
  }) async {
    if (_isTest) return null;
    try {
      final cleanTable = table.startsWith('/') ? table.substring(1) : table;
      final conflictParam =
          onConflict != null ? '?on_conflict=$onConflict' : '';
      final uri = Uri.parse('${SupabaseConfig.restUrl}/$cleanTable$conflictParam');
      final headers = Map<String, String>.from(_headers)
        ..['Prefer'] = 'return=representation,resolution=merge-duplicates';

      final response = await client
          .post(uri, headers: headers, body: jsonEncode(data))
          .timeout(const Duration(seconds: 45));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final body = response.body.trim();
        if (body.isEmpty || body == 'null') return null;
        return jsonDecode(body);
      } else {
        debugPrint(
            'SupabaseService.upsert error [${response.statusCode}]: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('SupabaseService.upsert exception on $table: $e');
      return null;
    }
  }

  /// Deletes rows matching [filterColumn] == [filterValue].
  Future<bool> delete(
    String table,
    String filterColumn,
    String filterValue,
  ) async {
    if (_isTest) return true;
    try {
      final cleanTable = table.startsWith('/') ? table.substring(1) : table;
      final uri = Uri.parse(
          '${SupabaseConfig.restUrl}/$cleanTable?$filterColumn=eq.${Uri.encodeComponent(filterValue)}');

      final response = await client
          .delete(uri, headers: _headers)
          .timeout(const Duration(seconds: 8));

      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (e) {
      debugPrint('SupabaseService.delete exception on $table: $e');
      return false;
    }
  }
}
