<?php
require_once __DIR__ . '/../config/Database.php';

class Hashtag
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAllHashtags()
    {
        $stmt = $this->conn->query("SELECT * FROM hashtags ORDER BY hashtag_id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getHashtagById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM hashtags WHERE hashtag_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // C:\DocShareProject\models\Hashtag.php
    public function createHashtag($hashtagName)
    {
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

        // ▼ THAY ĐỔI TẠI ĐÂY ▼
        $success = $stmt->execute([$newId, $hashtagName]);

        if ($success) {
            return $newId; // Trả về ID nếu tạo thành công
        } else {
            return false; // Trả về false nếu thất bại
        }
    }

    public function updateHashtag($id, $hashtagName)
    {
        $sql = "UPDATE hashtags SET hashtag_name = ? WHERE hashtag_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$hashtagName, $id]);
    }

    public function deleteHashtag($id)
    {
        $sql = "DELETE FROM hashtags WHERE hashtag_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
    // Tìm hashtag theo tên, nếu chưa có thì tạo mới
    public function findOrCreateHashtag($hashtagName)
    {
        // Chuẩn hóa tên hashtag (in thường, bỏ khoảng trắng thừa)
        $normalizedName = strtolower(trim($hashtagName));

        // 1. Tìm hashtag đã tồn tại theo tên
        $stmt = $this->conn->prepare("SELECT hashtag_id FROM hashtags WHERE hashtag_name = :name");
        $stmt->execute([':name' => $normalizedName]);
        $existingHashtag = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingHashtag) {
            // Nếu hashtag đã tồn tại, trả về ID của nó
            return $existingHashtag['hashtag_id'];
        } else {
            // Nếu hashtag chưa tồn tại, tạo mới bằng hàm createHashtag
            return $this->createHashtag($normalizedName);
        }
    }

    public function getHashtagsByUser($userId)
    {
        $sql = "
            SELECT DISTINCT h.hashtag_id, h.hashtag_name
            FROM hashtags h
            INNER JOIN post_hashtags ph ON h.hashtag_id = ph.hashtag_id
            INNER JOIN posts p ON ph.post_id = p.post_id
            INNER JOIN albums a ON p.album_id = a.album_id
            WHERE a.user_id = ?
            ORDER BY h.hashtag_name ASC
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
