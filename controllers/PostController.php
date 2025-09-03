<?php
// controllers/PostController.php
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../models/Album.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/PostReaction.php';
require_once __DIR__ . '/../vendor/autoload.php';

class PostController
{
    private $postModel;
    private $albumModel;
    private $categoryModel;
    private $reactionModel;

    public function __construct()
    {
        $this->postModel = new Post();
        $this->albumModel = new Album();
        $this->categoryModel = new Category();
        $this->reactionModel = new PostReaction();
    }

    // ==== JSON API ====
    public function group1()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = $this->postModel->getGroup1List();
            echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function group2()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = $this->postModel->getGroup2List();
            echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function postDetail($postId = null)
    {
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

    //Lấy bài viết theo categoryId
    public function getPostsByCategory()
    {
        $categoryId = $_GET['category_id'] ?? null;

        if ($categoryId === null || $categoryId === '') {
            echo "Category ID không hợp lệ.";
            return;
        }

        $posts = $this->postModel->getPostByCategoryId($categoryId);
        include __DIR__ . '/../views/post/list.php';
    }

    // Trong file controllers/PostController.php

    public function getPostsByHashtag()
    {
        // Lấy chuỗi hashtag ID từ URL, ví dụ: ?hashtag_ids=HASHTAG00001,HASHTAG00002
        $hashtagIdsString = $_GET['hashtag_ids'] ?? '';

        // Tách chuỗi thành mảng các ID
        $hashtagIds = array_map('trim', explode(',', $hashtagIdsString));

        // Lọc các ID rỗng
        $hashtagIds = array_filter($hashtagIds);

        if (empty($hashtagIds)) {
            echo "Vui lòng cung cấp ít nhất một Hashtag ID hợp lệ.";
            return;
        }

        // Gọi hàm từ Model với mảng các ID
        $posts = $this->postModel->getPostsByHashtagIds($hashtagIds);

        // Nạp View và truyền dữ liệu posts vào
        include __DIR__ . '/../views/post/list_by_hashtag.php';
    }


    public function showPostDetail()
    {
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

        require_once __DIR__ . '/../models/PostComment.php';
        $comments = (new PostComment())->getByPost($postId);

        $reactionCounts = $this->reactionModel->getReactionCounts($postId);

        $userReaction = null;
        if (isset($_SESSION['user_id'])) {
            $userReaction = $this->reactionModel->getUserReaction($postId, $_SESSION['user_id']);
        }

        include __DIR__ . '/../views/post_detail.php';
    }

    // ==== CRUD ====
    public function listAllPosts()
    {
        $posts = $this->postModel->getAllPosts();
        include __DIR__ . '/../views/post/list_all.php';
    }

    public function showCreateForm()
    {
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }
        $userId = $_SESSION['user_id'];
        $albums = $this->albumModel->getAlbumsByUserId($userId);
        $categories = $this->categoryModel->getAllCategories();
        include __DIR__ . '/../views/post/create.php';
    }

    public function create()
    {
        // Chỉ cho phép POST và user đã đăng nhập
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $title = $_POST['title'] ?? '';
        $content = $_POST['content'] ?? '';
        $description = $_POST['description'] ?? '';
        $summary = $_POST['summary'] ?? '';
        $albumId = $_POST['album_id'] ?? '';
        $categoryId = $_POST['category_id'] ?? '';
        $bannerUrl = null;
        $fileUrl = null;
        $fileType = null;

        // Khởi tạo Cloudinary
        $cloudinary = require __DIR__ . '/../config/cloudinary.php';
        $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/'; // Điều chỉnh theo cấu hình server

        try {
            // Upload banner nếu có
            if (!empty($_FILES['banner']['tmp_name'])) {
                $uploadBanner = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], [
                    'folder' => 'post_banners'
                ]);
                $bannerUrl = $uploadBanner['secure_url'];
            }

            // Upload file PDF nếu có
            if (!empty($_FILES['content_file']['tmp_name'])) {
                $uploadedFile = $_FILES['content_file'];
                $uploadedFileType = $uploadedFile['type'];
                $uploadedFileExt = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
                $maxFileSize = 10 * 1024 * 1024; // 10MB

                // Chỉ chấp nhận PDF
                $allowedFileTypes = ['application/pdf'];
                if (!in_array($uploadedFileType, $allowedFileTypes) || $uploadedFileExt !== 'pdf') {
                    throw new Exception("Định dạng file không được hỗ trợ. Chỉ hỗ trợ PDF.");
                }

                if ($uploadedFile['size'] > $maxFileSize) {
                    throw new Exception("File quá lớn. Kích thước tối đa là 10MB.");
                }

                if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
                    error_log("Upload error: " . $uploadedFile['error']);
                    throw new Exception("Lỗi upload file: Mã lỗi " . $uploadedFile['error']);
                }

                // Tạo tên file mới và di chuyển
                $fileName = uniqid() . '.' . $uploadedFileExt;
                $uploadDir = __DIR__ . '/../uploads/posts/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $targetPath = $uploadDir . $fileName;
                if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                    $fileUrl = $baseUrl . 'uploads/posts/' . $fileName;
                    $fileType = $uploadedFileType;
                    error_log("File uploaded successfully: $fileUrl");
                } else {
                    error_log("Failed to move uploaded file to: $targetPath");
                    throw new Exception("Lỗi khi di chuyển file đã tải lên.");
                }
            }

            // Tạo bài viết
            $this->postModel->createPost($title, $content, $description, $summary, $albumId, $categoryId, $bannerUrl, $fileUrl, $fileType);

            // Chuyển hướng về danh sách bài viết
            header("Location: index.php?action=list_all_posts");
            exit;
        } catch (Exception $e) {
            error_log("Error in create: " . $e->getMessage());
            die("Lỗi khi tạo bài viết: " . htmlspecialchars($e->getMessage()));
        }
    }


    public function showEditForm()
    {
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

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
            header("Location: index.php?action=login");
            exit;
        }

        $postId = $_POST['post_id'] ?? null;
        $post = $this->postModel->getPostById($postId);

        if (!$post || $post['author_id'] !== $_SESSION['user_id']) {
            echo "Bạn không có quyền cập nhật bài viết này!";
            exit;
        }

        $title = $_POST['title'] ?? '';
        $content = $_POST['content'] ?? '';
        $description = $_POST['description'] ?? '';
        $summary = $_POST['summary'] ?? '';

        $albumId = $_POST['album_id'] ?? '';
        $categoryId = $_POST['category_id'] ?? '';
        $bannerUrl = $post['banner_url'];
        $fileUrl = $post['file_url'];
        $fileType = $post['file_type'];
        $cloudinary = require __DIR__ . '/../config/cloudinary.php';
        $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/'; // Điều chỉnh theo cấu hình server

        try {
            // Upload banner
            if (!empty($_FILES['banner']['tmp_name'])) {
                $upload = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], ['folder' => 'post_banners']);
                $bannerUrl = $upload['secure_url'];
            }

            // Upload content file (chỉ PDF)
            if (!empty($_FILES['content_file']['tmp_name'])) {
                $uploadedFile = $_FILES['content_file'];
                $uploadedFileType = $uploadedFile['type'];
                $uploadedFileExt = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
                $maxFileSize = 10 * 1024 * 1024; // 10MB

                $allowedFileTypes = ['application/pdf'];

                if (!in_array($uploadedFileType, $allowedFileTypes) || $uploadedFileExt !== 'pdf') {
                    throw new Exception("Định dạng file không được hỗ trợ. Chỉ hỗ trợ PDF.");
                }

                if ($uploadedFile['size'] > $maxFileSize) {
                    throw new Exception("File quá lớn. Kích thước tối đa là 10MB.");
                }

                if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
                    error_log("Upload error: " . $uploadedFile['error']);
                    throw new Exception("Lỗi upload file: Mã lỗi " . $uploadedFile['error']);
                }

                // Xóa file cũ nếu có
                if ($post['file_url'] && file_exists(__DIR__ . '/../' . parse_url($post['file_url'], PHP_URL_PATH))) {
                    unlink(__DIR__ . '/../' . parse_url($post['file_url'], PHP_URL_PATH));
                    error_log("Deleted old file: " . $post['file_url']);
                }

                $fileName = uniqid() . '.' . $uploadedFileExt;
                $uploadDir = __DIR__ . '/../uploads/posts/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                    $fileUrl = $baseUrl . 'uploads/posts/' . $fileName;
                    $fileType = $uploadedFileType;
                    error_log("File updated successfully: $fileUrl");
                } else {
                    error_log("Failed to move uploaded file to: $targetPath");
                    throw new Exception("Lỗi khi di chuyển file đã tải lên.");
                }
            }

            // Cập nhật bài viết
            $this->postModel->updatePost($postId, $title, $content, $description, $summary, $albumId, $categoryId, $bannerUrl, $_SESSION['user_id'], $fileUrl, $fileType);

            header("Location: index.php?action=list_all_posts");
            exit;
        } catch (Exception $e) {
            error_log("Error in update: " . $e->getMessage());
            die("Lỗi khi cập nhật bài viết: " . htmlspecialchars($e->getMessage()));
        }
    }


    public function delete()
    {
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

        try {
            // Xóa file liên quan trước
            if ($post['file_url'] && file_exists(__DIR__ . '/../' . parse_url($post['file_url'], PHP_URL_PATH))) {
                unlink(__DIR__ . '/../' . parse_url($post['file_url'], PHP_URL_PATH));
                error_log("Deleted file: " . $post['file_url']);
            }

            $this->postModel->deletePost($postId, $_SESSION['user_id']);
            header("Location: index.php?action=list_all_posts");
            exit;
        } catch (Exception $e) {
            error_log("Error in delete: " . $e->getMessage());
            die("Lỗi khi xóa bài viết: " . htmlspecialchars($e->getMessage()));
        }
    }
}
