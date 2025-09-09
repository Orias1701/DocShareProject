<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/IdGenerator.php';


class User
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getByEmail($email)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function getByUsername($username)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function getByEmailOrUsername($identifier)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$identifier, $identifier]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function createUser($username, $email, $password, $role_id = "ROLE011", $full_name, $avatar_url = null, $bio = null, $birth_date)
    {
        $idGenerator = new IdGenerator();

        // Lấy user_id cuối cùng
        $stmt = $this->conn->query("SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1");
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        $lastUserNumber = $last ? intval(substr($last['user_id'], 4)) : 0;
        $newUserId = $idGenerator->generateUserId($lastUserNumber);

        // Thêm user mới
        $sql = "INSERT INTO users (user_id, username, email, password, role_id) 
            VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $userInserted = $stmt->execute([$newUserId, $username, $email, $password, $role_id]);

        if ($userInserted) {

            $sqlInfo = "INSERT INTO user_infos (user_id, full_name, avatar_url, bio, birth_date) VALUES (?, ?, ?, ?, ?)";
            $stmtInfo = $this->conn->prepare($sqlInfo);
            $stmtInfo->execute([
                $newUserId,
                $full_name,   // <- đảm bảo biến này thực sự là họ tên (không phải role_id!)
                $avatar_url,
                $bio,
                $birth_date
            ]);
            // Lấy album_id cuối cùng của user này
            $stmtAlbum = $this->conn->prepare("SELECT album_id FROM albums WHERE user_id = ? ORDER BY album_id DESC LIMIT 1");
            $stmtAlbum->execute([$newUserId]);
            $lastAlbum = $stmtAlbum->fetch(PDO::FETCH_ASSOC);

            $lastAlbumNumber = $lastAlbum ? intval(substr($lastAlbum['album_id'], -3)) + 1 : 1;

            // Trích số trong user_id (vd: USER0000000001 => 1)
            $userNumber = intval(preg_replace('/[^0-9]/', '', $newUserId));

            // Sinh album_id từ IdGenerator
            $newAlbumId = $idGenerator->generateAlbumId($userNumber, $lastAlbumNumber);

            // Insert album mặc định
            $sqlAlbum = "INSERT INTO albums (album_id, album_name, description, user_id) VALUES (?, ?, ?, ?)";
            $stmtAlbumInsert = $this->conn->prepare($sqlAlbum);
            $stmtAlbumInsert->execute([$newAlbumId, "macdinh", "Album mặc định của user", $newUserId]);
        }


        return $userInserted;
    }
}
