<?php
require_once __DIR__ . '/../models/Album.php';

class AlbumController {
    private $albumModel;

    public function __construct() {
        $this->albumModel = new Album();
    }

    public function showCreateForm() {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }
        include __DIR__ . '/../views/album/create.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!isset($_SESSION['user_id'])) {
                header("Location: index.php?action=login");
                exit;
            }
            $albumName = $_POST['album_name'];
            $description = $_POST['description'];
            $userId = $_SESSION['user_id'];
            $this->albumModel->createAlbum($albumName, $description, $userId);
            header("Location: index.php?action=list_user_albums");
            exit;
        }
    }

    public function showEditForm() {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $id = $_GET['id'];
        $album = $this->albumModel->getAlbumById($id);
        if ($album['user_id'] !== $_SESSION['user_id']) {
            echo "Bạn không có quyền chỉnh sửa album này!";
            exit;
        }
        include __DIR__ . '/../views/album/edit.php';
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!isset($_SESSION['user_id'])) {
                header("Location: index.php?action=login");
                exit;
            }

            $id = $_POST['album_id'];
            $album = $this->albumModel->getAlbumById($id);
            if ($album['user_id'] !== $_SESSION['user_id']) {
                echo "Bạn không có quyền cập nhật album này!";
                exit;
            }

            $albumName = $_POST['album_name'];
            $description = $_POST['description'];
            $this->albumModel->updateAlbum($id, $albumName, $description);
            header("Location: index.php?action=list_user_albums");
            exit;
        }
    }

    public function delete() {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $id = $_GET['id'];
        $album = $this->albumModel->getAlbumById($id);
        if ($album['user_id'] !== $_SESSION['user_id']) {
            echo "Bạn không có quyền xóa album này!";
            exit;
        }

        $this->albumModel->deleteAlbum($id);
        header("Location: index.php?action=list_user_albums");
        exit;
    }

    public function listUserAlbums() {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }
        $userId = $_SESSION['user_id'];
        $stmt = $this->albumModel->conn->prepare("SELECT * FROM albums WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $albums = $stmt->fetchAll(PDO::FETCH_ASSOC);
        include __DIR__ . '/../views/album/list_user.php';
    }

    public function listAllAlbums() {
        $albums = $this->albumModel->getAllAlbums();
        include __DIR__ . '/../views/album/list_all.php';
    }

    public function listAlbumsByUserId() {
        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            echo "Không có user_id!";
            exit;
        }

        $stmt = $this->albumModel->conn->prepare("SELECT * FROM albums WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $albums = $stmt->fetchAll(PDO::FETCH_ASSOC);

        include __DIR__ . '/../views/album/list_by_user.php';
    }
}
