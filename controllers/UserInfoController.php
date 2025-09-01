<?php
require_once __DIR__ . '/../models/UserInfo.php';
require_once __DIR__ . '/../models/User.php';

class UserInfoController {
    private $userInfoModel;
    private $userModel;

    public function __construct() {
        $this->userInfoModel = new UserInfo();
        $this->userModel = new User();
    }

    public function listUserInfos() {
        $userInfos = $this->userInfoModel->getAllUserInfos();
        include __DIR__ . '/../views/user_info/list.php';
    }

    public function showCreateForm() {
        $availableUsers = $this->userInfoModel->getAvailableUserIds();
        include __DIR__ . '/../views/user_info/create.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userId = $_POST['user_id'];
            $fullName = $_POST['full_name'];
            $bio = $_POST['bio'] ?? null;
            $birthDate = $_POST['birth_date'] ?? null;

            $avatarUrl = null;
            if (!empty($_FILES['avatar']['tmp_name'])) {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload = $cloudinary->uploadApi()->upload($_FILES['avatar']['tmp_name']);
                $avatarUrl = $upload['secure_url'];
            }

            $this->userInfoModel->createUserInfo($userId, $fullName, $avatarUrl, $bio, $birthDate);
            header("Location: index.php?action=list_user_infos");
            exit;
        }
    }

    public function showEditForm() {
        $userId = $_GET['id'];
        $userInfo = $this->userInfoModel->getUserInfoById($userId);
        include __DIR__ . '/../views/user_info/edit.php';
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userId = $_POST['user_id'];
            $fullName = $_POST['full_name'];
            $bio = $_POST['bio'] ?? null;
            $birthDate = $_POST['birth_date'] ?? null;

            $userInfo = $this->userInfoModel->getUserInfoById($userId);
            $avatarUrl = $userInfo['avatar_url'];

            if (!empty($_FILES['avatar']['tmp_name'])) {
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload = $cloudinary->uploadApi()->upload($_FILES['avatar']['tmp_name']);
                $avatarUrl = $upload['secure_url'];
            }

            $this->userInfoModel->updateUserInfo($userId, $fullName, $avatarUrl, $bio, $birthDate);

            header("Location: index.php?action=list_user_infos");
            exit;
        }
    }

    public function delete() {
        $userId = $_GET['id'];
        $this->userInfoModel->deleteUserInfo($userId);
        header("Location: index.php?action=list_user_infos");
        exit;
    }

    public function showUserInfo() {
    $userId = $_GET['id'] ?? null;
    if (!$userId) {
        echo "Thiếu user_id";
        return;
    }

    $userInfo = $this->userInfoModel->getUserInfoById($userId);
    if (!$userInfo) {
        echo "Người dùng không tồn tại";
        return;
    }

    // Kiểm tra follow
    $myUserId = $_SESSION['user_id'] ?? null;
    $isFollowing = false;
    if ($myUserId && $myUserId !== $userId) {
        require_once __DIR__ . '/../models/UserFollow.php';
        $isFollowing = (new UserFollow())->isFollowing($myUserId, $userId);
    }

    // Truyền $userInfo và $isFollowing xuống view
    include __DIR__ . '/../views/user_info/detail.php';
}


}