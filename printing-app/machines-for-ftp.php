<?php
include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM machines WHERE id = ?");
            $stmt->execute([$id]);
            $machine = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($machine) {
                if ($machine['digital_setup_fixed'] !== null) $machine['digital_setup_fixed'] = (float)$machine['digital_setup_fixed'];
                if ($machine['digital_price_per_side_1F'] !== null) $machine['digital_price_per_side_1F'] = (float)$machine['digital_price_per_side_1F'];
                if ($machine['digital_price_per_side_4F'] !== null) $machine['digital_price_per_side_4F'] = (float)$machine['digital_price_per_side_4F'];
                if ($machine['offset_run_price_per_sheet_side'] !== null) $machine['offset_run_price_per_sheet_side'] = (float)$machine['offset_run_price_per_sheet_side'];
                if ($machine['offset_setup_per_side'] !== null) $machine['offset_setup_per_side'] = (float)$machine['offset_setup_per_side'];
                if ($machine['plate_price'] !== null) $machine['plate_price'] = (float)$machine['plate_price'];
                
                echo json_encode($machine);
            } else {
                echo json_encode(null);
            }
        } else {
            $stmt = $conn->prepare("SELECT * FROM machines");
            $stmt->execute();
            $machines = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($machines as &$m) {
                if ($m['digital_setup_fixed'] !== null) $m['digital_setup_fixed'] = (float)$m['digital_setup_fixed'];
                if ($m['digital_price_per_side_1F'] !== null) $m['digital_price_per_side_1F'] = (float)$m['digital_price_per_side_1F'];
                if ($m['digital_price_per_side_4F'] !== null) $m['digital_price_per_side_4F'] = (float)$m['digital_price_per_side_4F'];
                if ($m['offset_run_price_per_sheet_side'] !== null) $m['offset_run_price_per_sheet_side'] = (float)$m['offset_run_price_per_sheet_side'];
                if ($m['offset_setup_per_side'] !== null) $m['offset_setup_per_side'] = (float)$m['offset_setup_per_side'];
                if ($m['plate_price'] !== null) $m['plate_price'] = (float)$m['plate_price'];
            }
            echo json_encode($machines);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id;
        $sheet_format = $data->sheet_format;
        $technology = $data->technology;
        $digital_setup_fixed = isset($data->digital_setup_fixed) ? $data->digital_setup_fixed : null;
        $digital_price_per_side_1F = isset($data->digital_price_per_side_1F) ? $data->digital_price_per_side_1F : null;
        $digital_price_per_side_4F = isset($data->digital_price_per_side_4F) ? $data->digital_price_per_side_4F : null;
        $offset_run_price_per_sheet_side = isset($data->offset_run_price_per_sheet_side) ? $data->offset_run_price_per_sheet_side : null;
        $offset_setup_per_side = isset($data->offset_setup_per_side) ? $data->offset_setup_per_side : null;
        $plate_price = isset($data->plate_price) ? $data->plate_price : null;

        $stmt = $conn->prepare("INSERT INTO machines (id, sheet_format, technology, digital_setup_fixed, digital_price_per_side_1F, digital_price_per_side_4F, offset_run_price_per_sheet_side, offset_setup_per_side, plate_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$id, $sheet_format, $technology, $digital_setup_fixed, $digital_price_per_side_1F, $digital_price_per_side_4F, $offset_run_price_per_sheet_side, $offset_setup_per_side, $plate_price])) {
            echo json_encode(array("message" => "Machine created successfully.", "id" => $id));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create machine."));
        }
        break;

    case 'PATCH':
    case 'PUT':
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
                $sql = "UPDATE machines SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                if ($stmt->execute($values)) {
                    echo json_encode(array("message" => "Machine updated successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update machine."));
                }
            }
        }
        break;

    case 'DELETE':
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM machines WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(array("message" => "Machine deleted successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete machine."));
            }
        }
        break;
}
?>