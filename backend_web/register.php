<?php
include "db.php";

$name     = $_POST['name'];
$username = $_POST['username'];
$password = $_POST['password'];
$location = $_POST['location'];

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
  "INSERT INTO users (name, username, password, location)
   VALUES (?, ?, ?, ?)"
);

$stmt->bind_param("ssss", $name, $username, $hash, $location);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Username sudah digunakan"]);
}
