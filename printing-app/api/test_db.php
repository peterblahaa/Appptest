<?php
include_once 'db.php';

$stmt = $conn->prepare("SELECT * FROM employees");
$stmt->execute();
$emps = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt_users = $conn->prepare("SELECT * FROM users WHERE email = 'patrik@razga.sk' OR email LIKE '%patrik%'");
$stmt_users->execute();
$users_list = $stmt_users->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'employees_list' => $emps,
    'users_conflict' => $users_list
]);
?>
