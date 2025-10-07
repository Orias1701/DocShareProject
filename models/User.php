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
    public function getAllUsers()
    {
        $stmt = $this->conn->query("SELECT u.user_id, u.username, u.email, r.role_name, ui.full_name, ui.avatar_url, ui.bio, ui.birth_date 
                                    FROM users u
                                    JOIN roles r ON u.role_id = r.role_id
                                    LEFT JOIN user_infos ui ON u.user_id = ui.user_id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function deleteUser($id)
    {
        // Xóa user
        $sql = "DELETE FROM users WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
    public function getRoleById($role_id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM roles WHERE role_id = ?");
        $stmt->execute([$role_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    // ================== BỔ SUNG TRONG class User ==================

/** Lấy theo user_id (tiện kiểm tra tồn tại) */
    public function getById($user_id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /** Kiểm tra username đã tồn tại chưa (trừ của chính user_id) */
    private function usernameExistsExcept($user_id, $username)
    {
        $sql = "SELECT 1 FROM users WHERE username = ? AND user_id <> ? LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$username, $user_id]);
        return (bool)$stmt->fetchColumn();
    }

    /** Kiểm tra email đã tồn tại chưa (trừ của chính user_id) */
    private function emailExistsExcept($user_id, $email)
    {
        $sql = "SELECT 1 FROM users WHERE email = ? AND user_id <> ? LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email, $user_id]);
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Sửa tài khoản: cập nhật username + email
     * Trả về mảng: ['status'=>'ok'|'error', 'message'=>...]
     */
    public function updateAccount($user_id, $username, $email)
    {
        // Tồn tại user?
        $user = $this->getById($user_id);
        if (!$user) {
            return ['status' => 'error', 'message' => 'User not found'];
        }

        // Validate cơ bản
        $username = trim($username ?? '');
        $email    = trim($email ?? '');
        if (strlen($username) < 3) {
            return ['status' => 'error', 'message' => 'Username must be at least 3 characters'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['status' => 'error', 'message' => 'Invalid email'];
        }

        // Không trùng của user khác
        if ($this->usernameExistsExcept($user_id, $username)) {
            return ['status' => 'error', 'message' => 'Username already taken'];
        }
        if ($this->emailExistsExcept($user_id, $email)) {
            return ['status' => 'error', 'message' => 'Email already taken'];
        }

        // Cập nhật
        $sql = "UPDATE users SET username = ?, email = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $ok = $stmt->execute([$username, $email, $user_id]);

        return $ok
            ? ['status' => 'ok', 'message' => 'Account updated']
            : ['status' => 'error', 'message' => 'Failed to update account'];
    }

    /**
     * Đặt lại mật khẩu (hash an toàn)
     * $newPassword là plaintext. Sử dụng password_hash (bcrypt).
     */
    public function resetPassword($user_id, $newPassword)
    {
        $user = $this->getById($user_id);
        if (!$user) {
            return ['status' => 'error', 'message' => 'User not found'];
        }
        if (strlen($newPassword ?? '') < 8) {
            return ['status' => 'error', 'message' => 'Password must be at least 8 characters'];
        }

        $hashed = password_hash($newPassword, PASSWORD_BCRYPT);

        $sql = "UPDATE users SET password = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $ok = $stmt->execute([$hashed, $user_id]);

        return $ok
            ? ['status' => 'ok', 'message' => 'Password reset']
            : ['status' => 'error', 'message' => 'Failed to reset password'];
    }

    /** Đổi role (nếu bảng users có cột role_id) */
    public function setRole($user_id, $role_id)
    {
        // (tuỳ chọn) kiểm tra role có tồn tại
        $role = $this->getRoleById($role_id);
        if (!$role) {
            return ['status' => 'error', 'message' => 'Role not found'];
        }

        $sql = "UPDATE users SET role_id = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $ok = $stmt->execute([$role_id, $user_id]);

        return $ok
            ? ['status' => 'ok', 'message' => 'Role updated']
            : ['status' => 'error', 'message' => 'Failed to update role'];
    }

    /** (Tuỳ chọn) Đổi trạng thái nếu có cột `status` trong users */
    public function setStatus($user_id, $status)
    {
        // gợi ý whitelist
        $allowed = ['active','disabled','banned'];
        if (!in_array($status, $allowed, true)) {
            return ['status' => 'error', 'message' => 'Invalid status'];
        }

        $sql = "UPDATE users SET status = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $ok = $stmt->execute([$status, $user_id]);

        return $ok
            ? ['status' => 'ok', 'message' => 'Status updated']
            : ['status' => 'error', 'message' => 'Failed to update status'];
    }

    /**
     * Cập nhật hồ sơ trong bảng user_infos
     * Các tham số có thể null (không cập nhật nếu null).
     */
    public function updateUserInfo($user_id, $full_name = null, $bio = null, $birth_date = null, $avatar_url = null)
    {
        // Xây câu update động theo trường gửi lên
        $fields = [];
        $params = [];

        if ($full_name !== null) { $fields[] = "full_name = ?"; $params[] = $full_name; }
        if ($bio !== null)       { $fields[] = "bio = ?";        $params[] = $bio; }
        if ($birth_date !== null){ $fields[] = "birth_date = ?"; $params[] = $birth_date; }
        if ($avatar_url !== null){ $fields[] = "avatar_url = ?"; $params[] = $avatar_url; }

        if (empty($fields)) {
            return ['status' => 'ok', 'message' => 'Nothing to update'];
        }

        $sql = "UPDATE user_infos SET " . implode(", ", $fields) . " WHERE user_id = ?";
        $params[] = $user_id;

        $stmt = $this->conn->prepare($sql);
        $ok = $stmt->execute($params);

        return $ok
            ? ['status' => 'ok', 'message' => 'Profile updated']
            : ['status' => 'error', 'message' => 'Failed to update profile'];
    }
    public function adminUpdateAccount($user_id, $email = null, $newPassword = null, $role_id = null)
    {
        // Kiểm tra tồn tại user
        $user = $this->getById($user_id);
        if (!$user) {
            return ['status' => 'error', 'message' => 'User not found'];
        }

        $results = [];
        try {
            $this->conn->beginTransaction();

            // 1) Email
            if ($email !== null) {
                $email = trim($email);
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    throw new Exception('Invalid email');
                }
                if ($this->emailExistsExcept($user_id, $email)) {
                    throw new Exception('Email already taken');
                }
                $stmt = $this->conn->prepare("UPDATE users SET email = ? WHERE user_id = ?");
                $stmt->execute([$email, $user_id]);
                $results['email'] = ['status' => 'ok', 'message' => 'Email updated'];
            }

            // 2) Password
            if ($newPassword !== null) {
                if (strlen($newPassword) < 8) {
                    throw new Exception('Password must be at least 8 characters');
                }
                $hashed = password_hash($newPassword, PASSWORD_BCRYPT);
                $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
                $stmt->execute([$hashed, $user_id]);
                $results['password'] = ['status' => 'ok', 'message' => 'Password updated'];
            }

            // 3) Role
            if ($role_id !== null) {
                // Kiểm tra role tồn tại
                $role = $this->getRoleById($role_id);
                if (!$role) {
                    throw new Exception('Role not found');
                }
                $stmt = $this->conn->prepare("UPDATE users SET role_id = ? WHERE user_id = ?");
                $stmt->execute([$role_id, $user_id]);
                $results['role'] = ['status' => 'ok', 'message' => 'Role updated'];
            }

            $this->conn->commit();

            return [
                'status'  => 'ok',
                'message' => 'Account updated',
                'results' => $results
            ];
        } catch (Exception $e) {
            $this->conn->rollBack();
            return [
                'status'  => 'error',
                'message' => $e->getMessage(),
                'results' => $results
            ];
        }
    }
}
