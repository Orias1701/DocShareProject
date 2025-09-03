<?php
// public/upload.php

require_once __DIR__ . '/../vendor/autoload.php';

// Load cấu hình Cloudinary
$cloudinary = require __DIR__ . '/../config/cloudinary.php';

header('Content-Type: application/json');

if (!isset($_FILES['upload']) || !is_uploaded_file($_FILES['upload']['tmp_name'])) {
    echo json_encode(['error' => 'No file uploaded or invalid file']);
    error_log('Upload error: No file uploaded or invalid file');
    exit;
}

try {
    $file = $_FILES['upload']['tmp_name'];
    if (!file_exists($file) || !is_readable($file)) {
        throw new Exception('Temporary file not found or not readable');
    }

    $upload = $cloudinary->uploadApi()->upload($file, [
        'folder' => 'docshareproject',
        'resource_type' => 'image'
    ]);

    if (isset($upload['secure_url'])) {
        echo json_encode(['url' => $upload['secure_url']]);
    } else {
        throw new Exception('Failed to upload image to Cloudinary: No secure_url');
    }
} catch (Exception $e) {
    error_log('Upload error: ' . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>