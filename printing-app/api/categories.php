<?php
include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $category = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($category ? $category : null);
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM categories ORDER BY `order` ASC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id;
        $order = isset($data->order) ? $data->order : 0;
        $name = $data->name;
        $image = isset($data->image) ? $data->image : '';
        $hoverImage = isset($data->hoverImage) ? $data->hoverImage : '';

        $stmt = $conn->prepare("INSERT INTO categories (id, `order`, name, image, hoverImage) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$id, $order, $name, $image, $hoverImage])) {
            http_response_code(201);
            echo json_encode(array("message" => "Category created."));
        }
        else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create category."));
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
                $sql = "UPDATE categories SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                if ($stmt->execute($values)) {
                    // return updated category
                    $stmt2 = $conn->prepare("SELECT * FROM categories WHERE id = ?");
                    $stmt2->execute([$id]);
                    echo json_encode($stmt2->fetch(PDO::FETCH_ASSOC));
                }
                else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update category."));
                }
            }
        }
        break;

    case 'DELETE':
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
            if ($stmt->execute([$id])) {
                http_response_code(200);
                echo json_encode(array("message" => "Category deleted."));
            }
            else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete category."));
            }
        }
        break;
}
?>
