<?php
include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Route handling
if ($method === 'GET') {
    // GET /settings.php - get all settings
    try {
        $stmt = $conn->query("SELECT setting_key, setting_value FROM settings");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $settings = [];
        foreach ($results as $row) {
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
    // POST /settings.php - update multiple settings at once
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input data']);
        exit();
    }

    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE setting_value = :value");

        foreach ($input as $key => $value) {
            $valueToSave = is_array($value) ? json_encode($value) : $value;
            $stmt->execute([
                ':key' => $key,
                ':value' => $valueToSave
            ]);
        }

        $conn->commit();
        echo json_encode(['success' => true]);
    }
    catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update settings: ' . $e->getMessage()]);
    }
}
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
