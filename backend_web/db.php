<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "fire_detect"; // 🔥 FIX DI SINI

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    // 1049 = Unknown database
    $isUnknownDatabase = $conn->connect_errno === 1049;
    if (!$isUnknownDatabase) {
        die("Koneksi gagal: " . $conn->connect_error);
    }

    // 1) Connect ke server tanpa memilih database
    $serverConn = new mysqli($host, $user, $pass);
    if ($serverConn->connect_error) {
        die("Koneksi server gagal: " . $serverConn->connect_error);
    }
    $serverConn->set_charset("utf8mb4");

    // 2) Buat database
    $dbEscaped = $serverConn->real_escape_string($db);
    if (!$serverConn->query("CREATE DATABASE IF NOT EXISTS `{$dbEscaped}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")) {
        die("Gagal membuat database: " . $serverConn->error);
    }
    if (!$serverConn->select_db($db)) {
        die("Gagal memilih database: " . $serverConn->error);
    }

    // 3) Import schema/data dari file SQL (sekali saat DB baru dibuat)
    $root = dirname(__DIR__);
    $sqlFile = $root . DIRECTORY_SEPARATOR . "database" . DIRECTORY_SEPARATOR . "fire_detect.sql";
    if (!file_exists($sqlFile)) {
        die("File SQL tidak ditemukan: " . $sqlFile);
    }

    $sql = file_get_contents($sqlFile);
    if ($sql === false || trim($sql) === "") {
        die("File SQL kosong atau gagal dibaca");
    }

    if (!$serverConn->multi_query($sql)) {
        die("Gagal import database: " . $serverConn->error);
    }

    // Wajib habiskan semua result dari multi_query
    do {
        if ($result = $serverConn->store_result()) {
            $result->free();
        }
    } while ($serverConn->more_results() && $serverConn->next_result());

    if ($serverConn->errno) {
        die("Gagal menyelesaikan import database: " . $serverConn->error);
    }

    $serverConn->close();

    // 4) Re-connect ke database yang sudah dibuat
    $conn = new mysqli($host, $user, $pass, $db);
    if ($conn->connect_error) {
        die("Koneksi gagal setelah setup DB: " . $conn->connect_error);
    }
}

$conn->set_charset("utf8mb4");

// ---- Lightweight migration: ensure users.chat_id exists ----
// This keeps existing installs working even if the database was created
// before we introduced the chat_id field.
try {
    $checkSql = "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS\n"
        . "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'chat_id'";
    $res = $conn->query($checkSql);
    if ($res) {
        $row = $res->fetch_assoc();
        $cnt = isset($row['cnt']) ? (int)$row['cnt'] : 0;
        $res->free();
        if ($cnt === 0) {
            $conn->query("ALTER TABLE users ADD COLUMN chat_id VARCHAR(64) NULL AFTER location");
        }
    }
} catch (Throwable $e) {
    // Best-effort migration; do not block app startup.
}
?>
