<?php
include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $user['newsletter'] = (bool)$user['newsletter'];
                $user['isAdmin'] = (bool)$user['isAdmin'];
                $user['priceModifier'] = (float)$user['priceModifier'];
                echo json_encode($user);
            } else {
                echo json_encode(null);
            }
        } else {
            $email = isset($_GET['email']) ? $_GET['email'] : null;
            $password = isset($_GET['password']) ? $_GET['password'] : null;

            if ($email && $password) {
                // Login
                $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
                $stmt->execute([$email, $password]);
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else if ($email) {
                // Check if exists
                $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
                $stmt->execute([$email]);
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                // Get all
                $stmt = $conn->prepare("SELECT * FROM users");
                $stmt->execute();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            foreach ($users as &$u) {
                $u['newsletter'] = (bool)$u['newsletter'];
                $u['isAdmin'] = (bool)$u['isAdmin'];
                $u['priceModifier'] = (float)$u['priceModifier'];
            }
            echo json_encode($users);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id;
        $email = $data->email;
        $password = isset($data->password) ? $data->password : 'default';
        $name = $data->name;
        $phone = isset($data->phone) ? $data->phone : '';
        $newsletter = isset($data->newsletter) && $data->newsletter ? 1 : 0;
        $city = isset($data->city) ? $data->city : '';
        $zip = isset($data->zip) ? $data->zip : '';
        $company = isset($data->company) ? $data->company : '';
        $isAdmin = isset($data->isAdmin) && $data->isAdmin ? 1 : 0;
        $priceModifier = isset($data->priceModifier) ? $data->priceModifier : 0;
        $street = isset($data->street) ? $data->street : '';

        $stmt = $conn->prepare("INSERT INTO users (id, email, password, name, phone, newsletter, city, zip, company, isAdmin, priceModifier, street) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$id, $email, $password, $name, $phone, $newsletter, $city, $zip, $company, $isAdmin, $priceModifier, $street])) {
            $stmt2 = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt2->execute([$id]);
            $user = $stmt2->fetch(PDO::FETCH_ASSOC);
            $user['newsletter'] = (bool)$user['newsletter'];
            $user['isAdmin'] = (bool)$user['isAdmin'];
            $user['priceModifier'] = (float)$user['priceModifier'];
            echo json_encode($user);
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create user."));
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
                    if (is_bool($value)) {
                        $values[] = $value ? 1 : 0;
                    } else {
                        $values[] = $value;
                    }
                }
            }
            if (!empty($fields)) {
                $values[] = $id;
                $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                if ($stmt->execute($values)) {
                    $stmt2 = $conn->prepare("SELECT * FROM users WHERE id = ?");
                    $stmt2->execute([$id]);
                    $user = $stmt2->fetch(PDO::FETCH_ASSOC);
                    $user['newsletter'] = (bool)$user['newsletter'];
                    $user['isAdmin'] = (bool)$user['isAdmin'];
                    $user['priceModifier'] = (float)$user['priceModifier'];
                    echo json_encode($user);
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update user."));
                }
            }
        }
        break;
}
?>