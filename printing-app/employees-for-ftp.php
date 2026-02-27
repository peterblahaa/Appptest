<?php
include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM employees WHERE id = ?");
            $stmt->execute([$id]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($employee) {
                $employee['active'] = (bool)$employee['active'];
            }
            echo json_encode($employee ? $employee : null);
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM employees");
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($employees as &$e) {
                $e['active'] = (bool)$e['active'];
            }
            echo json_encode($employees);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id;
        $name = $data->name;
        $email = $data->email;
        $password = isset($data->password) ? $data->password : '12345678';
        $role = $data->role;
        $joinedDate = $data->joinedDate;
        $department = isset($data->department) ? $data->department : '';
        $active = isset($data->active) && $data->active ? 1 : 0;
        $color = isset($data->color) ? $data->color : '';

        $stmt = $conn->prepare("INSERT INTO employees (id, name, email, password, role, joinedDate, department, active, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$id, $name, $email, $password, $role, $joinedDate, $department, $active, $color])) {
            $stmt2 = $conn->prepare("SELECT * FROM employees WHERE id = ?");
            $stmt2->execute([$id]);
            $e = $stmt2->fetch(PDO::FETCH_ASSOC);
            $e['active'] = (bool)$e['active'];
            echo json_encode($e);
        }
        else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create employee."));
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
                    }
                    else {
                        $values[] = $value;
                    }
                }
            }
            if (!empty($fields)) {
                $values[] = $id;
                $sql = "UPDATE employees SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                if ($stmt->execute($values)) {
                    $stmt2 = $conn->prepare("SELECT * FROM employees WHERE id = ?");
                    $stmt2->execute([$id]);
                    $e = $stmt2->fetch(PDO::FETCH_ASSOC);
                    $e['active'] = (bool)$e['active'];
                    echo json_encode($e);
                }
                else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update employee."));
                }
            }
        }
        break;

    case 'DELETE':
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM employees WHERE id = ?");
            if ($stmt->execute([$id])) {
                http_response_code(200);
                echo json_encode(array("message" => "Employee deleted."));
            }
            else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete employee."));
            }
        }
        break;
}
?>
