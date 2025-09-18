<?php
// controllers/HashtagController.php
require_once __DIR__ . '/../models/Hashtag.php';

class HashtagController
{
    private $hashtagModel;

    public function __construct()
    {
        $this->hashtagModel = new Hashtag();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /* ============ Helpers ============ */
    private function respondJson($payload, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function respondError(string $msg, int $code = 400, array $extra = []): void
    {
        $this->respondJson(array_merge([
            'status'  => 'error',
            'message' => $msg,
        ], $extra), $code);
    }

    private function requireMethod(string $method): void
    {
        $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
        if ($m !== strtoupper($method)) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => strtoupper($method)]);
        }
    }

    private function readJsonBody(): array
    {
        $raw  = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Chuẩn hoá tên hashtag:
     * - Bỏ hết dấu # ở đầu rồi thêm lại đúng 1 dấu #
     * - Trim
     * - Thay khoảng trắng thành '-'
     * - Chỉ giữ: chữ (Unicode), số (Unicode), '_', '-'  (regex \p{L}\p{N})
     * - Lowercase
     * - Trả '' nếu sau chuẩn hoá rỗng
     */
    private function normalizeName(string $name): string
    {
        $name = trim($name);
        if ($name === '') return '';

        // bỏ tất cả '#' ở đầu:
        $name = ltrim($name, '#');

        // thay nhiều khoảng trắng thành '-'
        $name = preg_replace('/\s+/u', '-', $name);

        // chỉ giữ chữ/số unicode, '_' và '-'
        $name = preg_replace('/[^\p{L}\p{N}_-]/u', '', $name);

        // lowercase
        $name = mb_strtolower($name, 'UTF-8');

        if ($name === '') return '';
        return '#' . $name;
    }

    /* ============ JSON Endpoints ============ */

    /** GET /?action=list_hashtags */
    public function listHashtags()
    {
        $this->requireMethod('GET');
        try {
            $hashtags = $this->hashtagModel->getAllHashtags();
            $this->respondJson(['status' => 'ok', 'data' => $hashtags]);
        } catch (Throwable $e) {
            $this->respondError('Lỗi lấy danh sách hashtag', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** GET /?action=hashtag_detail&id=... */
    public function detail()
    {
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
    public function create()
    {
        $this->requireMethod('POST');

        $isJson = isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
        $body   = $isJson ? $this->readJsonBody() : $_POST;

        $raw  = $body['hashtag_name'] ?? '';
        $name = $this->normalizeName($raw);

        if ($name === '' || $name === '#') {
            $this->respondError('hashtag_name không hợp lệ', 422);
        }

        try {
            $id  = $this->hashtagModel->createHashtag($name);
            $tag = $this->hashtagModel->getHashtagById($id);
            $this->respondJson(['status' => 'ok', 'data' => $tag], 201);
        } catch (Throwable $e) {
            // Gợi ý: nếu DB có unique index, duplicate nên trả 409
            // Ở đây tạm trả 500 kèm detail
            $this->respondError('Tạo hashtag thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** POST|PUT /?action=update_hashtag  (JSON hoặc form) */
    public function update()
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
        if (!in_array($method, ['POST', 'PUT'], true)) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => 'POST, PUT']);
        }

        $isJson = isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
        $body   = $isJson ? $this->readJsonBody() : $_POST;

        $id  = $body['hashtag_id']   ?? null;
        $raw = $body['hashtag_name'] ?? null;
        if (!$id)                  $this->respondError('Thiếu hashtag_id', 422);
        if ($raw === null)         $this->respondError('Thiếu hashtag_name', 422);

        $name = $this->normalizeName($raw);
        if ($name === '' || $name === '#') {
            $this->respondError('hashtag_name không hợp lệ', 422);
        }

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
    public function delete()
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        if (!in_array($method, ['DELETE', 'POST'], true)) {
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

    public function getUserHashtags()
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Bạn chưa đăng nhập']);
            exit;
        }

        $userId = $_SESSION['user_id'];
        $hashtags = $this->hashtagModel->getHashtagsByUser($userId);

        header('Content-Type: application/json');
        echo json_encode($hashtags);
    }
}
