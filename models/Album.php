<?php
// models/Album.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/IdGenerator.php';

class Album {
    public $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    public function getAlbumsByUserId($userId) {
    $sql = "SELECT 
                a.*,
                u.username AS author_name
            FROM albums AS a
            LEFT JOIN users AS u ON a.user_id = u.user_id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC";
    
    $stmt = $this->conn->prepare($sql);
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}


    public function getAllAlbums() {
        $stmt = $this->conn->query("SELECT * FROM albums ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAlbumById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM albums WHERE album_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createAlbum($albumName, $description, $userId) {
        $stmt = $this->conn->prepare("SELECT album_id FROM albums WHERE user_id = ? ORDER BY album_id DESC LIMIT 1");
        $stmt->execute([$userId]);
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        // Lấy số thứ tự album cuối cùng
        $num = $last ? intval(substr($last['album_id'], -3)) + 1 : 1;

        // Trích xuất phần số từ $userId
        $userNumber = preg_replace('/[^0-9]/', '', $userId);

        $idGenerator = new IdGenerator();
        $newId = $idGenerator->generateAlbumId($userNumber, $num);

        $sql = "INSERT INTO albums (album_id, album_name, description, user_id) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$newId, $albumName, $description, $userId]);
    }

    public function updateAlbum($id, $albumName, $description) {
        $sql = "UPDATE albums SET album_name = ?, description = ? WHERE album_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$albumName, $description, $id]);
    }

    public function deleteAlbum($id) {
        $sql = "DELETE FROM albums WHERE album_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}