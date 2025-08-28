<?php
// models/Album.php
require_once __DIR__ . '/../config/Database.php';

class Album {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    public function getByAlbumId($albumId) {
        $stmt = $this->pdo->prepare("SELECT * FROM albums WHERE album_id = :aid");
        $stmt->execute([':aid' => $albumId]);
        return $stmt->fetch();
    }

    public function getAllByUser($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM albums WHERE user_id = :uid");
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll();
    }
}
