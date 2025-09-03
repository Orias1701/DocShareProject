<?php
// controllers/PostController.php
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../models/Album.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/PostReaction.php';
// require_once __DIR__ . '/../services/ConvertPdftoDocx.php';
require_once __DIR__ . '/../vendor/autoload.php';




class PostController {
    private $postModel;
    private $albumModel;
    private $categoryModel;
    private $reactionModel;


    public function __construct() {
        $this->postModel = new Post();
        $this->albumModel = new Album();
        $this->categoryModel = new Category();
        $this->reactionModel = new PostReaction();


    }

    // ==== JSON API ====
    public function group1() {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = $this->postModel->getGroup1List();
            echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function group2() {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = $this->postModel->getGroup2List();
            echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function postDetail($postId = null) {
        header('Content-Type: application/json; charset=utf-8');
        try {
            if (!$postId && isset($_GET['post_id'])) $postId = $_GET['post_id'];
            if (!$postId) {
                echo json_encode(['status' => 'error', 'message' => 'post_id required']);
                return;
            }
            $data = $this->postModel->getPostDetail($postId);
            if ($data === null) {
                echo json_encode(['status' => 'error', 'message' => 'Post not found']);
                return;
            }
            echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

        // Hiển thị chi tiết bài viết (cho view, không phải JSON API)
    public function showPostDetail() {
    $postId = $_GET['post_id'] ?? null;
    if (!$postId) {
        echo "Thiếu post_id";
        return;
    }

    $post = $this->postModel->getPostById($postId);
    if (!$post) {
        echo "Bài viết không tồn tại";
        return;
    }

    // Lấy comment
    require_once __DIR__ . '/../models/PostComment.php';
    $comments = (new PostComment())->getByPost($postId);

    // Reaction counts
    $reactionCounts = $this->reactionModel->getReactionCounts($postId);

    // Reaction của user hiện tại
    $userReaction = null;
    if (isset($_SESSION['user_id'])) {
        $userReaction = $this->reactionModel->getUserReaction($postId, $_SESSION['user_id']);
    }

    // ✅ Bây giờ cả hai biến đều tồn tại
    include __DIR__ . '/../views/post_detail.php';
}





    // ==== CRUD ====
    // List all posts
    public function listAllPosts() {
        $posts = $this->postModel->getAllPosts();
        include __DIR__ . '/../views/post/list_all.php';
    }

    // Show create form
    public function showCreateForm() {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }
        $userId = $_SESSION['user_id'];
        $albums = $this->albumModel->getAlbumsByUserId($userId);
        $categories = $this->categoryModel->getAllCategories();
        include __DIR__ . '/../views/post/create.php';
    }

    // Create post
   public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
            $title = $_POST['title'] ?? '';
            $content = $_POST['content'] ?? '';
            $albumId = $_POST['album_id'] ?? '';
            $categoryId = $_POST['category_id'] ?? '';
            $bannerUrl = null;
            $fileUrl = null; // Biến lưu URL file từ Cloudinary
            $fileType = null;
            $cloudinary = require __DIR__ . '/../config/cloudinary.php';

            try {
                // Xử lý upload banner
                if (!empty($_FILES['banner']['tmp_name'])) {
                    $uploadBanner = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], [
                        'folder' => 'post_banners'
                    ]);
                    $bannerUrl = $uploadBanner['secure_url'];
                }

                // Xử lý upload file nội dung
                if (!empty($_FILES['content_file']['tmp_name'])) {
                    $uploadedFileType = $_FILES['content_file']['type'];
                    $allowedFileTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ];

                    if (!in_array($uploadedFileType, $allowedFileTypes)) {
                        throw new Exception("Định dạng file nội dung không được hỗ trợ.");
                    }

                    $uploadFile = $cloudinary->uploadApi()->upload($_FILES['content_file']['tmp_name'], [
                        'folder' => 'post_docs',
                        'resource_type' => 'raw' // Bắt buộc cho file tài liệu
                    ]);

                    $fileUrl = $uploadFile['secure_url'];
                    $fileType = $uploadedFileType;
                    $content = ''; // Đặt nội dung rỗng vì đã có file
                }

                // Gọi model để tạo bài viết, truyền URL file đã lưu trên Cloudinary
                $this->postModel->createPost($title, $content, $albumId, $categoryId, $bannerUrl, $fileUrl, $fileType);

                header("Location: index.php?action=list_all_posts");
                exit;

            } catch (Exception $e) {
                // Trong trường hợp lỗi, không cần xóa file vì Cloudinary tự quản lý
                die("Lỗi khi tạo bài viết: " . $e->getMessage());
            }
        }
    }

    // Show edit form
    public function showEditForm() {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $postId = $_GET['id'] ?? null;
        $post = $this->postModel->getPostById($postId);

        if (!$post || $post['author_id'] !== $_SESSION['user_id']) {
            echo "Bạn không có quyền chỉnh sửa bài viết này!";
            exit;
        }

        $userId = $_SESSION['user_id'];
        $albums = $this->albumModel->getAlbumsByUserId($userId);
        $categories = $this->categoryModel->getAllCategories();

        include __DIR__ . '/../views/post/edit.php';
    }

    // Update post
    public function update() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
        $postId = $_POST['post_id'] ?? null;
        $post = $this->postModel->getPostById($postId);

        if (!$post || $post['author_id'] !== $_SESSION['user_id']) {
            echo "Bạn không có quyền cập nhật bài viết này!";
            exit;
        }

        $title = $_POST['title'];
        $content = $_POST['content'];
        $albumId = $_POST['album_id'];
        $categoryId = $_POST['category_id'];
        $bannerUrl = $post['banner_url']; // giữ banner cũ nếu không upload mới

        // Upload banner mới nếu có file
        if (!empty($_FILES['banner']['tmp_name'])) {
            $cloudinary = require __DIR__ . '/../config/cloudinary.php';
            $upload = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name']);
            $bannerUrl = $upload['secure_url'];
        }

        $this->postModel->updatePost($postId, $title, $content, $albumId, $categoryId, $bannerUrl, $_SESSION['user_id']);

        header("Location: index.php?action=list_all_posts");
        exit;
    }
}

    // Delete post
    public function delete() {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $postId = $_GET['id'] ?? null;
        $post = $this->postModel->getPostById($postId);

        if (!$post || $post['author_id'] !== $_SESSION['user_id']) {
            echo "Bạn không có quyền xóa bài viết này!";
            exit;
        }

        $this->postModel->deletePost($postId, $_SESSION['user_id']);

        header("Location: index.php?action=list_all_posts");
        exit;
    }
}