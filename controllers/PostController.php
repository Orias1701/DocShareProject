<?php
// controllers/PostController.php
require_once __DIR__ . '/../models/Post.php';
require_once __DIR__ . '/../models/Album.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/PostReaction.php';


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
    private function processBase64Images($content) {
        require_once __DIR__ . '/../config/cloudinary.php';
        $dom = new DOMDocument();
        @$dom->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $images = $dom->getElementsByTagName('img');

        foreach ($images as $img) {
            $src = $img->getAttribute('src');
            if (preg_match('/^data:image\/(\w+);base64,/', $src, $matches)) {
                $imageData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $src));
                $imageMime = $matches[1];
                $tempFile = tempnam(sys_get_temp_dir(), 'img_');
                file_put_contents($tempFile, $imageData);

                try {
                    $upload = $cloudinary->uploadApi()->upload($tempFile, [
                        'folder' => 'docshareproject',
                        'resource_type' => 'image'
                    ]);
                    if (isset($upload['secure_url'])) {
                        $img->setAttribute('src', $upload['secure_url']);
                    } else {
                        error_log('Failed to upload base64 image to Cloudinary: No secure_url');
                    }
                } catch (Exception $e) {
                    error_log('Failed to upload base64 image to Cloudinary: ' . $e->getMessage());
                }
                unlink($tempFile);
            }
        }

        return $dom->saveHTML();
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
            $title = $_POST['title'] ?? '';
            $content = $_POST['content'] ?? '';
            $albumId = $_POST['album_id'] ?? '';
            $categoryId = $_POST['category_id'] ?? '';
            $bannerUrl = '';
            $filePath = null;
            $fileType = null;

            // Xử lý banner
            if (!empty($_FILES['banner']['tmp_name'])) {
                try {
                    $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                    $upload = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], [
                        'folder' => 'docshareproject',
                        'resource_type' => 'image'
                    ]);
                    if (isset($upload['secure_url'])) {
                        $bannerUrl = $upload['secure_url'];
                    } else {
                        throw new Exception('Lỗi upload banner lên Cloudinary');
                    }
                } catch (Exception $e) {
                    error_log('Lỗi upload banner: ' . $e->getMessage());
                    echo "Lỗi khi upload banner: " . $e->getMessage();
                    exit;
                }
            }

            // Xử lý file Word/PDF nếu được upload
            if (!empty($_FILES['content_file']['tmp_name'])) {
                $fileType = $_FILES['content_file']['type'];
                $filePath = $_FILES['content_file']['tmp_name'];

                if (!in_array($fileType, [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ])) {
                    echo "Chỉ hỗ trợ file PDF hoặc Word!";
                    exit;
                }
            }

            // Lọc nội dung HTML và xử lý ảnh base64
            require_once __DIR__ . '/../vendor/autoload.php';
            $config = HTMLPurifier_Config::createDefault();
            $config->set('HTML.Allowed', 'p,span,table,tr,td,img[src|alt|style|class],br,div');
            $config->set('CSS.AllowedProperties', 'float,margin,margin-left,margin-right,margin-top,margin-bottom,text-align,max-width,height');
            $purifier = new HTMLPurifier($config);
            $content = $this->processBase64Images($content);
            $content = $purifier->purify($content);

            try {
                $postId = $this->postModel->createPost($title, $content, $albumId, $categoryId, $bannerUrl, $_SESSION['user_id'], $filePath, $fileType);
                if ($postId) {
                    header("Location: index.php?action=view&post_id=" . urlencode($postId));
                    exit;
                } else {
                    echo "Lỗi khi tạo bài viết: Không thể lưu bài viết.";
                    exit;
                }
            } catch (Exception $e) {
                error_log('Lỗi tạo bài viết: ' . $e->getMessage());
                echo "Lỗi khi tạo bài viết: " . $e->getMessage();
                exit;
            }
        }
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
            $postId = $_POST['post_id'] ?? null;
            $post = $this->postModel->getPostById($postId);

            if (!$post || $post['author_id'] !== $_SESSION['user_id']) {
                echo "Bạn không có quyền cập nhật bài viết này!";
                exit;
            }

            $title = $_POST['title'] ?? '';
            $content = $_POST['content'] ?? '';
            $albumId = $_POST['album_id'] ?? '';
            $categoryId = $_POST['category_id'] ?? '';
            $bannerUrl = $post['banner_url'];
            $filePath = null;
            $fileType = null;

            // Xử lý banner mới nếu được upload
            if (!empty($_FILES['banner']['tmp_name'])) {
                try {
                    $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                    $upload = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name'], [
                        'folder' => 'docshareproject',
                        'resource_type' => 'image'
                    ]);
                    if (isset($upload['secure_url'])) {
                        $bannerUrl = $upload['secure_url'];
                    } else {
                        throw new Exception('Lỗi upload banner lên Cloudinary');
                    }
                } catch (Exception $e) {
                    error_log('Lỗi upload banner: ' . $e->getMessage());
                    echo "Lỗi khi upload banner: " . $e->getMessage();
                    exit;
                }
            }

            // Xử lý file Word/PDF nếu được upload
            if (!empty($_FILES['content_file']['tmp_name'])) {
                $fileType = $_FILES['content_file']['type'];
                $filePath = $_FILES['content_file']['tmp_name'];

                if (!in_array($fileType, [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ])) {
                    echo "Chỉ hỗ trợ file PDF hoặc Word!";
                    exit;
                }
                // Cảnh báo nếu có nội dung CKEditor
                if (!empty($content)) {
                    echo "Cảnh báo: Upload file Word/PDF sẽ ghi đè nội dung CKEditor. Bạn có muốn tiếp tục?";
                    // Có thể thêm logic để yêu cầu xác nhận từ người dùng
                }
            }

            // Lọc nội dung HTML và xử lý ảnh base64
            require_once __DIR__ . '/../vendor/autoload.php';
            $config = HTMLPurifier_Config::createDefault();
            $config->set('HTML.Allowed', 'p,span,table,tr,td,img[src|alt|style|class],br,div');
            $config->set('CSS.AllowedProperties', 'float,margin,margin-left,margin-right,margin-top,margin-bottom,text-align,max-width,height');
            $purifier = new HTMLPurifier($config);
            if (!empty($content)) {
                $content = $this->processBase64Images($content);
                $content = $purifier->purify($content);
            }

            try {
                $result = $this->postModel->updatePost($postId, $title, $content, $albumId, $categoryId, $bannerUrl, $_SESSION['user_id'], $filePath, $fileType);
                if ($result) {
                    header("Location: index.php?action=view&post_id=" . urlencode($postId));
                    exit;
                } else {
                    echo "Lỗi khi cập nhật bài viết: Không thể lưu bài viết.";
                    exit;
                }
            } catch (Exception $e) {
                error_log('Lỗi cập nhật bài viết: ' . $e->getMessage());
                echo "Lỗi khi cập nhật bài viết: " . $e->getMessage();
                exit;
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

    // public function update() {
    //     if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    //         $postId = $_POST['post_id'] ?? null;
    //         $post = $this->postModel->getPostById($postId);

    //         if (!$post || $post['author_id'] !== $_SESSION['user_id']) {
    //             echo "Bạn không có quyền cập nhật bài viết này!";
    //             exit;
    //         }

    //         $title = $_POST['title'] ?? '';
    //         $content = $_POST['content'] ?? '';
    //         $albumId = $_POST['album_id'] ?? '';
    //         $categoryId = $_POST['category_id'] ?? '';
    //         $bannerUrl = $post['banner_url']; // Giữ banner cũ nếu không upload mới
    //         $filePath = null;
    //         $fileType = null;

    //         // Xử lý banner mới nếu được upload
    //         if (!empty($_FILES['banner']['tmp_name'])) {
    //             try {
    //                 $cloudinary = require __DIR__ . '/../config/cloudinary.php';
    //                 $upload = $cloudinary->uploadApi()->upload($_FILES['banner']['tmp_name']);
    //                 if (isset($upload['secure_url'])) {
    //                     $bannerUrl = $upload['secure_url'];
    //                 } else {
    //                     throw new Exception('Lỗi upload banner lên Cloudinary');
    //                 }
    //             } catch (Exception $e) {
    //                 error_log('Lỗi upload banner: ' . $e->getMessage());
    //                 echo "Lỗi khi upload banner: " . $e->getMessage();
    //                 exit;
    //             }
    //         }

    //         // Xử lý file Word/PDF nếu được upload
    //         if (!empty($_FILES['content_file']['tmp_name'])) {
    //             $fileType = $_FILES['content_file']['type'];
    //             $filePath = $_FILES['content_file']['tmp_name'];

    //             if (!in_array($fileType, [
    //                 'application/pdf',
    //                 'application/msword',
    //                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    //             ])) {
    //                 echo "Chỉ hỗ trợ file PDF hoặc Word!";
    //                 exit;
    //             }
    //         }

    //         // Lọc nội dung HTML từ CKEditor
    //         require_once __DIR__ . '/../vendor/autoload.php';
    //         $config = HTMLPurifier_Config::createDefault();
    //         $config->set('HTML.Allowed', 'p,span,table,tr,td,img[src|alt|style|class],br,div');
    //         $config->set('CSS.AllowedProperties', 'float,margin,margin-left,margin-right,margin-top,margin-bottom,text-align,max-width,height');
    //         $purifier = new HTMLPurifier($config);
    //         $content = $purifier->purify($content);

    //         try {
    //             $result = $this->postModel->updatePost($postId, $title, $content, $albumId, $categoryId, $bannerUrl, $_SESSION['user_id'], $filePath, $fileType);
    //             if ($result) {
    //                 header("Location: index.php?action=view&post_id=" . urlencode($postId));
    //                 exit;
    //             } else {
    //                 echo "Lỗi khi cập nhật bài viết: Không thể lưu bài viết.";
    //                 exit;
    //             }
    //         } catch (Exception $e) {
    //             error_log('Lỗi cập nhật bài viết: ' . $e->getMessage());
    //             echo "Lỗi khi cập nhật bài viết: " . $e->getMessage();
    //                 exit;
    //         }
    //     }
    // }

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

