<?php
require_once __DIR__ . '/../config/Database.php';

class Hashtag {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    public function getAllHashtags() {
        $stmt = $this->conn->query("SELECT * FROM hashtags ORDER BY hashtag_id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getHashtagById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM hashtags WHERE hashtag_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // C:\DocShareProject\models\Hashtag.php
public function createHashtag($hashtagName) {
    // Lấy hashtag_id mới: HASHTAG + 11 chữ số
    $stmt = $this->conn->query("SELECT hashtag_id FROM hashtags ORDER BY hashtag_id DESC LIMIT 1");
    $last = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($last) {
        $num = intval(substr($last['hashtag_id'], 7)) + 1;
    } else {
        $num = 1;
    }
    $newId = "HASHTAG" . str_pad($num, 11, "0", STR_PAD_LEFT);

    // Thêm dữ liệu
    $sql = "INSERT INTO hashtags (hashtag_id, hashtag_name) VALUES (?, ?)";
    $stmt = $this->conn->prepare($sql);
    return $stmt->execute([$newId, $hashtagName]);
}

    public function updateHashtag($id, $hashtagName) {
        $sql = "UPDATE hashtags SET hashtag_name = ? WHERE hashtag_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$hashtagName, $id]);
    }

    public function deleteHashtag($id) {
        $sql = "DELETE FROM hashtags WHERE hashtag_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}