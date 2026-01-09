<?php
// check_session.php
header('Content-Type: application/json');
session_start();

/**
 * Struktur SESSION yang DIHARAPKAN:
 * $_SESSION['user'] = [
 *   'id' => int,
 *   'name' => string,
 *   'location' => string
 * ];
 */

if (
    isset($_SESSION['user']) &&
    isset($_SESSION['user']['id']) &&
    isset($_SESSION['user']['name']) &&
    isset($_SESSION['user']['location'])
) {
    echo json_encode([
        "logged_in" => true,
        "user" => [
            "id" => $_SESSION['user']['id'],
            "name" => $_SESSION['user']['name'],
            "location" => $_SESSION['user']['location']
        ]
    ]);
} else {
    echo json_encode([
        "logged_in" => false
    ]);
}
