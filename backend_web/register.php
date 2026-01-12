<?php
include "db.php";

header('Content-Type: application/json');

$name     = trim($_POST['name'] ?? '');
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$location = trim($_POST['location'] ?? '');
$telegramToken = trim($_POST['telegram_token'] ?? '');
$chatId   = trim($_POST['chat_id'] ?? '');
$hasStartedBot = ($_POST['has_started_bot'] ?? '') === '1';

if ($name === '' || $username === '' || $password === '' || $location === '' || $chatId === '' || $telegramToken === '') {
    echo json_encode(["status" => "error", "message" => "Semua field wajib diisi"]);
    exit;
}

// Token Bot Telegram format umumnya: 123456:ABCDEF...
if (!preg_match('/^\d+:[A-Za-z0-9_-]{20,}$/', $telegramToken)) {
    echo json_encode(["status" => "error", "message" => "Format token Telegram tidak valid"]);
    exit;
}

// Tanpa verifikasi Telegram dulu, tapi tetap minta user konfirmasi sudah /start bot.
if (!$hasStartedBot) {
    echo json_encode(["status" => "error", "message" => "Silakan klik /start ke bot Telegram terlebih dahulu lalu centang konfirmasi"]);
    exit;
}

// Accept numeric chat_id (userinfobot). Also allow negative (group).
if (!preg_match('/^-?\d+$/', $chatId)) {
    echo json_encode(["status" => "error", "message" => "Format chat_id tidak valid. Gunakan chat_id numerik dari @userinfobot"]);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "INSERT INTO users (name, username, password, location, chat_id, telegram_bot_token)
     VALUES (?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param("ssssss", $name, $username, $hash, $location, $chatId, $telegramToken);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Username sudah digunakan"]);
}
