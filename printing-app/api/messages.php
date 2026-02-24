<?php
include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM messages ORDER BY date DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id;
        $name = $data->name;
        $email = $data->email;
        $message = $data->message;
        $date = str_replace('T', ' ', substr($data->date, 0, 19));
        $status = $data->status;

        $stmt = $conn->prepare("INSERT INTO messages (id, name, email, message, date, status) VALUES (?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$id, $name, $email, $message, $date, $status])) {
            $stmt2 = $conn->prepare("SELECT * FROM messages WHERE id = ?");
            $stmt2->execute([$id]);
            echo json_encode($stmt2->fetch(PDO::FETCH_ASSOC));
        }
        else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create message."));
        }
        break;

    case 'PATCH':
        if ($id) {
            $data = json_decode(file_get_contents("php://input"), true);
            $fields = [];
            $values = [];
            foreach ($data as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "`$key` = ?";
                    $values[] = $value;
                }
            }
            if (!empty($fields)) {
                $values[] = $id;
                $sql = "UPDATE messages SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                if ($stmt->execute($values)) {
                    $stmt2 = $conn->prepare("SELECT * FROM messages WHERE id = ?");
                    $stmt2->execute([$id]);
                    echo json_encode($stmt2->fetch(PDO::FETCH_ASSOC));
                }
                else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update message."));
                }
            }
        }
        break;
}
?>
