<?php
// public/upload.php

require_once __DIR__ . '/../vendor/autoload.php';

// Load cấu hình Cloudinary
$cloudinary = require __DIR__ . '/../config/cloudinary.php';

header('Content-Type: application/json');

if (!isset($_FILES['upload'])) {
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

try {
    $file = $_FILES['upload']['tmp_name'];
    $upload = $cloudinary->uploadApi()->upload($file, [
        'folder' => 'docshareproject',
        'resource_type' => 'image'
    ]);

    if (isset($upload['secure_url'])) {
        // Trả về URL theo định dạng CKEditor yêu cầu
        echo json_encode([
            'url' => $upload['secure_url']
        ]);
    } else {
        throw new Exception('Failed to upload image to Cloudinary');
    }
} catch (Exception $e) {
    error_log('Upload error: ' . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>