<?php
// models/Album.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/IdGenerator.php';

class Album
{
    public $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAlbumsByUserId($userId)
    {
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


    public function getAllAlbums()
    {
        $stmt = $this->conn->query("SELECT * FROM albums ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAlbumById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM albums WHERE album_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createAlbum($albumName, $description, $urlThumbnail, $userId)
    {
        // Trích xuất số từ userId
        $userNumber = preg_replace('/[^0-9]/', '', $userId);

        // Lấy số thứ tự lớn nhất hiện có của user này trong DB
        $stmt = $this->conn->prepare(
            "SELECT MAX(CAST(SUBSTRING(album_id, LENGTH('ALBUM$userNumber') + 1) AS UNSIGNED)) AS max_num 
         FROM albums 
         WHERE album_id LIKE ?"
        );
        $stmt->execute(['ALBUM' . $userNumber . '%']);
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        $num = $last['max_num'] ? intval($last['max_num']) + 1 : 1;

        // Sinh album_id mới
        $idGenerator = new IdGenerator();
        $newId = $idGenerator->generateAlbumId($userNumber, $num);

        // Thêm album (có url_thumbnail)
        $sql = "INSERT INTO albums (album_id, album_name, description, url_thumbnail, user_id, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$newId, $albumName, $description, $urlThumbnail, $userId]);
    }




    public function updateAlbum($id, $albumName, $urlThumbnail, $description)
    {
        $sql = "UPDATE albums SET album_name = ?, description = ? WHERE album_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$albumName, $description, $urlThumbnail, $id]);
    }

    // AlbumModel.php
    public function deleteAlbumByOwner(string $albumId, string $userId): bool {
        $sql = "DELETE FROM albums WHERE album_id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$albumId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function adminDeleteAlbum(string $albumId): bool {
        $stmt = $this->conn->prepare("DELETE FROM albums WHERE album_id = ?");
        $stmt->execute([$albumId]);
        return $stmt->rowCount() > 0;
    }


}
