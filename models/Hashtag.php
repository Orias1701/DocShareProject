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
    // Tìm hashtag theo tên, nếu chưa có thì tạo mới
    public function findOrCreateHashtag($hashtagName) {
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

    /**
     * Lấy số thứ tự cuối cùng từ ID hashtag lớn nhất trong database
     * @return int
     */
    private function _getLastHashtagNumber() {
        $stmt = $this->conn->query("SELECT hashtag_id FROM hashtags ORDER BY hashtag_id DESC LIMIT 1");
        $lastId = $stmt->fetchColumn();

        if ($lastId) {
            // Tách số từ chuỗi ID (ví dụ: 'HASHTAG00000000001' -> 1)
            return (int) substr($lastId, 7); // 'HASHTAG' có 7 ký tự
        }
        return 0; // Nếu không có hashtag nào, bắt đầu từ 0
    }
    
}