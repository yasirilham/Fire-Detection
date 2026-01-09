<?php
session_start();
include "db.php";

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $conn->prepare(
  "SELECT id, name, password, location FROM users WHERE username = ? LIMIT 1"
);
$stmt->bind_param("s", $username);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();

    if (password_verify($password, $row['password'])) {

        $_SESSION['user'] = [
            "id" => $row["id"],
            "name" => $row["name"],
            "location" => $row["location"]
        ];

        echo json_encode([
            "status" => "success",
            "user" => $_SESSION['user']
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Password salah"
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "User tidak ditemukan"
    ]);
}
