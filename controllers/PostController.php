<?php
// controllers/PostController.php
require_once __DIR__ . '/../models/Post.php';

class PostController {
    private $postModel;
    public function __construct() {
        $this->postModel = new Post();
    }

    // trả JSON list cho group1
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

    // group2
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

    // post detail
    public function postDetail($postId = null) {
        header('Content-Type: application/json; charset=utf-8');
        try {
            if (!$postId) {
                if (isset($_GET['post_id'])) $postId = $_GET['post_id'];
                else {
                    echo json_encode(['status' => 'error', 'message' => 'post_id required']);
                    return;
                }
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
}
