<?php
include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($product) {
                $product['shipping'] = json_decode($product['shipping']);
                $product['options'] = json_decode($product['options']);
                $product['isVisible'] = (bool)$product['isVisible'];
            }
            echo json_encode($product ? $product : null);
        }
        else {
            $stmt = $conn->prepare("SELECT * FROM products ORDER BY name ASC");
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($products as &$product) {
                $product['shipping'] = json_decode($product['shipping']);
                $product['options'] = json_decode($product['options']);
                $product['isVisible'] = (bool)$product['isVisible'];
            }
            echo json_encode($products);
        }
        break;

    case 'POST':
        // V prípade potreby pridávania produktov
        break;

    case 'PATCH':
        if ($id) {
            $data = json_decode(file_get_contents("php://input"), true);
            $fields = [];
            $values = [];
            foreach ($data as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "`$key` = ?";
                    if (is_array($value) || is_object($value)) {
                        $values[] = json_encode($value);
                    }
                    else if (is_bool($value)) {
                        $values[] = $value ? 1 : 0;
                    }
                    else {
                        $values[] = $value;
                    }
                }
            }
            if (!empty($fields)) {
                $values[] = $id;
                $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                if ($stmt->execute($values)) {
                    $stmt2 = $conn->prepare("SELECT * FROM products WHERE id = ?");
                    $stmt2->execute([$id]);
                    $product = $stmt2->fetch(PDO::FETCH_ASSOC);
                    $product['shipping'] = json_decode($product['shipping']);
                    $product['options'] = json_decode($product['options']);
                    $product['isVisible'] = (bool)$product['isVisible'];
                    echo json_encode($product);
                }
                else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update product."));
                }
            }
        }
        break;

    case 'DELETE':
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
            if ($stmt->execute([$id])) {
                http_response_code(200);
                echo json_encode(array("message" => "Product deleted."));
            }
            else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete product."));
            }
        }
        break;
}
?>
