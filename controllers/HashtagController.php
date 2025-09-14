<?php
// controllers/HashtagController.php
require_once __DIR__ . '/../models/Hashtag.php';

class HashtagController {
    private $hashtagModel;

    public function __construct() {
        $this->hashtagModel = new Hashtag();
    }

    /* ============ Helpers ============ */
    private function respondJson($payload, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function respondError(string $msg, int $code = 400, array $extra = []): void {
        $this->respondJson(array_merge([
            'status'  => 'error',
            'message' => $msg,
        ], $extra), $code);
    }

    private function requireMethod(string $method): void {
        $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
        if ($m !== strtoupper($method)) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => strtoupper($method)]);
        }
    }

    private function readJsonBody(): array {
        $raw  = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    private function normalizeName(string $name): string {
        $name = trim($name);
        if ($name === '') return $name;
        // thêm '#' nếu chưa có ở đầu
        if (strpos($name, '#') !== 0) {
            $name = '#' . $name;
        }
        return $name;
    }

    /* ============ JSON Endpoints ============ */

    /** GET /?action=list_hashtags */
    public function listHashtags() {
        $this->requireMethod('GET');
        try {
            $hashtags = $this->hashtagModel->getAllHashtags();
            $this->respondJson(['status' => 'ok', 'data' => $hashtags]);
        } catch (Throwable $e) {
            $this->respondError('Lỗi lấy danh sách hashtag', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** GET /?action=hashtag_detail&id=... (tuỳ chọn) */
    public function detail() {
        $this->requireMethod('GET');
        $id = $_GET['id'] ?? null;
        if (!$id) $this->respondError('Thiếu id', 422);

        try {
            $tag = $this->hashtagModel->getHashtagById($id);
            if (!$tag) $this->respondError('Hashtag không tồn tại', 404);
            $this->respondJson(['status' => 'ok', 'data' => $tag]);
        } catch (Throwable $e) {
            $this->respondError('Lỗi lấy chi tiết hashtag', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** POST /?action=create_hashtag  (JSON hoặc form) */
    public function create() {
        $this->requireMethod('POST');

        $isJson = isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
        $body   = $isJson ? $this->readJsonBody() : $_POST;

        $name = $body['hashtag_name'] ?? '';
        $name = $this->normalizeName($name);

        if ($name === '') {
            $this->respondError('Thiếu hashtag_name', 422);
        }

        try {
            $id   = $this->hashtagModel->createHashtag($name);
            $tag  = $this->hashtagModel->getHashtagById($id);
            $this->respondJson(['status' => 'ok', 'data' => $tag], 201);
        } catch (Throwable $e) {
            $this->respondError('Tạo hashtag thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** POST|PUT /?action=update_hashtag  (JSON hoặc form) */
    public function update() {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
        if (!in_array($method, ['POST','PUT'], true)) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => 'POST, PUT']);
        }

        $isJson = isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
        $body   = $isJson ? $this->readJsonBody() : $_POST;

        $id   = $body['hashtag_id']   ?? null;
        $name = $body['hashtag_name'] ?? null;
        if (!$id)  $this->respondError('Thiếu hashtag_id', 422);
        if ($name === null) $this->respondError('Thiếu hashtag_name', 422);

        $name = $this->normalizeName($name);

        try {
            $tag = $this->hashtagModel->getHashtagById($id);
            if (!$tag) $this->respondError('Hashtag không tồn tại', 404);

            $this->hashtagModel->updateHashtag($id, $name);
            $updated = $this->hashtagModel->getHashtagById($id);
            $this->respondJson(['status' => 'ok', 'data' => $updated]);
        } catch (Throwable $e) {
            $this->respondError('Cập nhật hashtag thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** DELETE|POST /?action=delete_hashtag&id=...  (id cũng có thể gửi trong body) */
    public function delete() {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        if (!in_array($method, ['DELETE','POST'], true)) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => 'DELETE, POST']);
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            $isJson = isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
            $body   = $isJson ? $this->readJsonBody() : $_POST;
            $id     = $body['id'] ?? null;
        }

        if (!$id) $this->respondError('Thiếu id', 422);

        try {
            $tag = $this->hashtagModel->getHashtagById($id);
            if (!$tag) $this->respondError('Hashtag không tồn tại', 404);

            $this->hashtagModel->deleteHashtag($id);
            $this->respondJson(['status' => 'ok', 'message' => 'Đã xoá', 'id' => (int)$id]);
        } catch (Throwable $e) {
            $this->respondError('Xoá hashtag thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }
}
