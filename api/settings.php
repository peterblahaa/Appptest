<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$user = 'root'; // DEFAULT MYSQL USER, zmeňte podľa potrieb produkcie
$pass = ''; // DEFAULT MYSQL PASS, zmeňte podľa potrieb produkcie
$dbname = 'tlaciaren'; // NAZOV VASEJ DATABÁZY

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
}
catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Route handling
if ($method === 'GET') {
    // GET /settings - get all settings
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
        $results = $stmt->fetchAll();

        $settings = [];
        foreach ($results as $row) {
            // Skúsime dekódovať JSON, ak to padne, necháme to ako string
            $decoded = json_decode($row['setting_value'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settings[$row['setting_key']] = $decoded;
            }
            else {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
        }

        echo json_encode($settings);
    }
    catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch settings: ' . $e->getMessage()]);
    }
}
elseif ($method === 'POST') {
    // POST /settings - update multiple settings at once
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input data']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE setting_value = :value");

        foreach ($input as $key => $value) {
            $valueToSave = is_array($value) ? json_encode($value) : $value;
            $stmt->execute([
                ':key' => $key,
                ':value' => $valueToSave
            ]);
        }

        $pdo->commit();
        echo json_encode(['success' => true]);
    }
    catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update settings: ' . $e->getMessage()]);
    }
}
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
