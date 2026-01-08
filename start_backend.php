<?php
header('Content-Type: application/json; charset=utf-8');

// Only allow local requests (prevents remote code execution if this ever gets exposed)
$remote = $_SERVER['REMOTE_ADDR'] ?? '';
if ($remote !== '127.0.0.1' && $remote !== '::1') {
  http_response_code(403);
  echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
  exit;
}

$GOOGLE_DRIVE_ENV_LINK = 'https://drive.google.com/drive/folders/1IMXcdK6cZcv8W3cUfu5xhxGhZvV5vqXe?usp=drive_link';

function backend_is_running(): bool {
  $ctx = stream_context_create([
    'http' => [
      'method' => 'GET',
      'timeout' => 0.7,
    ],
  ]);

  $json = @file_get_contents('http://127.0.0.1:8000/status', false, $ctx);
  return $json !== false;
}

if (backend_is_running()) {
  echo json_encode(['status' => 'running']);
  exit;
}

$root = __DIR__;
$envFile = $root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . '.env';
$venvPython = $root . DIRECTORY_SEPARATOR . '.venv' . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe';
$apiFile = $root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'api.py';

if (!file_exists($envFile)) {
  http_response_code(400);
  echo json_encode([
    'status' => 'error',
    'message' => 'File backend/.env belum ada. Download dari Google Drive lalu taruh ke folder backend, kemudian jalankan setup_backend.bat dan klik Login lagi.',
    'google_drive' => $GOOGLE_DRIVE_ENV_LINK
  ]);
  exit;
}

if (!file_exists($venvPython)) {
  http_response_code(400);
  echo json_encode([
    'status' => 'error',
    'message' => 'Virtual environment .venv belum ada. Jalankan setup_backend.bat dulu, lalu klik Login lagi.'
  ]);
  exit;
}

if (!file_exists($apiFile)) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => 'File backend/api.py tidak ditemukan.'
  ]);
  exit;
}

$bat = $root . DIRECTORY_SEPARATOR . 'start_backend_bg.bat';

if (!file_exists($bat)) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'start_backend_bg.bat not found']);
  exit;
}

// Start detached in Windows (Laragon/Apache on Windows)
$cmd = 'cmd /c start "FireDetectionBackend" /min "' . $bat . '"';
@pclose(@popen($cmd, 'r'));

// Give it a moment, then re-check
usleep(350000);

if (backend_is_running()) {
  echo json_encode(['status' => 'started']);
  exit;
}

echo json_encode([
  'status' => 'starting',
  'message' => 'Backend is starting. If it does not become ready, run setup_backend.bat then start_backend.bat manually.'
]);
