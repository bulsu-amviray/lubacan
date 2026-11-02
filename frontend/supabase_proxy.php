<?php
// Supabase Bridge Proxy for LUBA CanFindIT
// Seamlessly proxies Supabase REST requests with the server-side key
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, apikey, Prefer, Range');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$supabaseUrl = 'https://boeukdabtzdvmqsqvtpq.supabase.co';
$supabaseKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('SUPABASE_ANON_KEY') ?: '';

$rawUri = $_SERVER['REQUEST_URI'] ?? '';
$endpoint = '';

if (isset($_GET['endpoint'])) {
    $endpoint = $_GET['endpoint'];
} else {
    $parts = parse_url($rawUri);
    $path = $parts['path'] ?? '';
    // Strip script name
    $endpoint = preg_replace('/^.*?supabase_proxy\.php\/?/', '', $path);
    if (!empty($parts['query'])) {
        $endpoint .= '?' . $parts['query'];
    }
}

if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing endpoint']);
    exit;
}

$targetUrl = rtrim($supabaseUrl, '/') . '/rest/v1/' . ltrim($endpoint, '/');

$ch = curl_init($targetUrl);
$headers = [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey,
    'Content-Type: application/json',
    'User-Agent: Dart/3.0 (dart:io)'
];

if (isset($_SERVER['HTTP_PREFER'])) {
    $headers[] = 'Prefer: ' . $_SERVER['HTTP_PREFER'];
}
if (isset($_SERVER['HTTP_RANGE'])) {
    $headers[] = 'Range: ' . $_SERVER['HTTP_RANGE'];
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if (in_array($method, ['POST', 'PATCH', 'PUT'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Curl error: ' . $curlErr]);
    exit;
}

http_response_code($httpCode ?: 200);
header('Content-Type: application/json');
echo $response;
