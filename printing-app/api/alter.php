<?php
include_once 'db.php';
try {
    $conn->exec("ALTER TABLE employees ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '12345678' AFTER email");
    echo "Stlpec password bol pridany do tabulky employees";
}
catch (Exception $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Stlpec uz existuje.";
    }
    else {
        echo "Chyba: " . $e->getMessage();
    }
}
?>
