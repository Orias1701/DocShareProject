<?php
require_once __DIR__ . '/../models/Hashtag.php';

class HashtagController {
    private $hashtagModel;

    public function __construct() {
        $this->hashtagModel = new Hashtag();
    }

    public function listHashtags() {
        $hashtags = $this->hashtagModel->getAllHashtags();
        include __DIR__ . '/../views/hashtag/list.php';
    }

    public function showCreateForm() {
        include __DIR__ . '/../views/hashtag/create.php';
    }

     public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $hashtagName = $_POST['hashtag_name'];

            // === Logic xử lý thêm ký tự '#' ===
            // 1. Loại bỏ các ký tự khoảng trắng ở đầu và cuối chuỗi
            $hashtagName = trim($hashtagName);

            // 2. Kiểm tra xem chuỗi có bắt đầu bằng '#' không
            if (strpos($hashtagName, '#') !== 0) {
                // Nếu không có, thêm '#' vào đầu
                $hashtagName = '#' . $hashtagName;
            }
            // ===================================

            $this->hashtagModel->createHashtag($hashtagName);
            header("Location: index.php?action=list_hashtags");
            exit;
        }
    }

    public function showEditForm() {
        $id = $_GET['id'];
        $hashtag = $this->hashtagModel->getHashtagById($id);
        include __DIR__ . '/../views/hashtag/edit.php';
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['hashtag_id'];
            $hashtagName = $_POST['hashtag_name'];
            $this->hashtagModel->updateHashtag($id, $hashtagName);
            header("Location: index.php?action=list_hashtags");
            exit;
        }
    }

    public function delete() {
        $id = $_GET['id'];
        $this->hashtagModel->deleteHashtag($id);
        header("Location: index.php?action=list_hashtags");
        exit;
    }
}