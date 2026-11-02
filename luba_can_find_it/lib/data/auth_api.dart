import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthApi {
  static const String _baseUrl = 'http://10.0.2.2/luba_api';

  static http.Client client = http.Client();

  static Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String mobileNumber,
    required String password,
  }) async {
    final response = await client
        .post(
          Uri.parse('$_baseUrl/register.php'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'full_name': fullName.trim(),
            'email': email.trim(),
            'mobile_number': mobileNumber.trim(),
            'password': password,
          }),
        )
        .timeout(const Duration(seconds: 15));

    final data = _decodeResponse(response);

    if (response.statusCode >= 200 &&
        response.statusCode < 300 &&
        data['success'] == true) {
      return data;
    }

    throw Exception(data['message'] ?? 'Registration failed.');
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await client
        .post(
          Uri.parse('$_baseUrl/login.php'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'email': email.trim(), 'password': password}),
        )
        .timeout(const Duration(seconds: 5));

    final data = _decodeResponse(response);

    if (response.statusCode >= 200 &&
        response.statusCode < 300 &&
        data['success'] == true) {
      return data;
    }

    throw Exception(data['message'] ?? 'Login failed.');
  }

  static Map<String, dynamic> _decodeResponse(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) return decoded;
    } on FormatException {
      // The server did not return valid JSON.
    }

    throw Exception('Unexpected server response (${response.statusCode}).');
  }
}
