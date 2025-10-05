<?php
require __DIR__ . '/../vendor/autoload.php';

use Cloudinary\Cloudinary;

$cloudinary = new Cloudinary(
    [
        'cloud' => [
            'cloud_name' => 'ducl8m3ky',
            'api_key'    => '164675829699855',
            'api_secret' => '3OiUbIjlOnN_Rx6Q1KWh3y09YmI',
        ],
        'url' => [
            'secure' => true // luôn dùng https
        ]
    ]
);

return $cloudinary;
