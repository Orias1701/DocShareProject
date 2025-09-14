<?php
// controllers/CategoryController.php
require_once __DIR__ . '/../models/Category.php';

class CategoryController {
    private $categoryModel;

    public function __construct() {
        $this->categoryModel = new Category();
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

    /* ============ JSON Endpoints ============ */

    /** GET /?action=list_categories */
    public function listCategories() {
        $this->requireMethod('GET');
        try {
            $categories = $this->categoryModel->getAllCategories();
            $this->respondJson(['status' => 'ok', 'data' => $categories]);
        } catch (Throwable $e) {
            $this->respondError('Lỗi lấy danh sách category', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** (Tuỳ chọn) GET /?action=category_detail&id=... */
    public function detail() {
        $this->requireMethod('GET');
        $id = $_GET['id'] ?? null;
        if (!$id) $this->respondError('Thiếu id', 422);

        try {
            $cat = $this->categoryModel->getCategoryById($id);
            if (!$cat) $this->respondError('Category không tồn tại', 404);
            $this->respondJson(['status' => 'ok', 'data' => $cat]);
        } catch (Throwable $e) {
            $this->respondError('Lỗi lấy chi tiết category', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** POST /?action=create_category  (JSON hoặc form) */
    public function create() {
        $this->requireMethod('POST');

        $isJson = isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
        $body   = $isJson ? $this->readJsonBody() : $_POST;

        $name = trim($body['category_name'] ?? '');
        if ($name === '') $this->respondError('Thiếu category_name', 422);

        try {
            $id   = $this->categoryModel->createCategory($name);
            $cat  = $this->categoryModel->getCategoryById($id);
            $this->respondJson(['status' => 'ok', 'data' => $cat], 201);
        } catch (Throwable $e) {
            $this->respondError('Tạo category thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** POST|PUT /?action=update_category  (JSON hoặc form) */
    public function update() {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
        if (!in_array($method, ['POST','PUT'], true)) {
            $this->respondError('Method Not Allowed', 405, ['allowed' => 'POST, PUT']);
        }

        $isJson = isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
        $body   = $isJson ? $this->readJsonBody() : $_POST;

        $id   = $body['category_id']   ?? null;
        $name = isset($body['category_name']) ? trim($body['category_name']) : null;

        if (!$id) $this->respondError('Thiếu category_id', 422);
        if ($name === null || $name === '') $this->respondError('Thiếu category_name', 422);

        try {
            $cat = $this->categoryModel->getCategoryById($id);
            if (!$cat) $this->respondError('Category không tồn tại', 404);

            $this->categoryModel->updateCategory($id, $name);
            $updated = $this->categoryModel->getCategoryById($id);
            $this->respondJson(['status' => 'ok', 'data' => $updated]);
        } catch (Throwable $e) {
            $this->respondError('Cập nhật category thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }

    /** DELETE|POST /?action=delete_category&id=... (id cũng có thể gửi trong body) */
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
            $cat = $this->categoryModel->getCategoryById($id);
            if (!$cat) $this->respondError('Category không tồn tại', 404);

            $this->categoryModel->deleteCategory($id);
            $this->respondJson(['status' => 'ok', 'message' => 'Đã xoá', 'id' => (int)$id]);
        } catch (Throwable $e) {
            $this->respondError('Xoá category thất bại', 500, ['detail' => $e->getMessage()]);
        }
    }
}
