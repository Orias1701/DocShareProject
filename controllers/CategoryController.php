<?php
// controllers/CategoryController.php
require_once __DIR__ . '/../models/Category.php';

class CategoryController
{
    private $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new Category();
        // THAY ĐỔI: Set header mặc định cho tất cả các response là JSON
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: http://localhost:5173'); // Cho phép cross-origin request (quan trọng khi FE và BE khác domain)
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }

    /**
     * Hàm helper để gửi response JSON và thoát
     */
    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }

    public function listCategories()
    {
        $categories = $this->categoryModel->getAllCategories();
        $this->sendResponse($categories);
    }

    // THAY ĐỔI: Tạo hàm mới để lấy một category
    public function getCategory()
    {
        if (!isset($_GET['id'])) {
            $this->sendResponse(['error' => 'Category ID is required'], 400);
        }
        $id = $_GET['id'];
        $category = $this->categoryModel->getCategoryById($id);
        if ($category) {
            $this->sendResponse($category);
        } else {
            $this->sendResponse(['error' => 'Category not found'], 404);
        }
    }

    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendResponse(['error' => 'Method not allowed'], 405);
        }

        // Lấy dữ liệu từ request body (thay vì chỉ $_POST)
        $data = json_decode(file_get_contents('php://input'), true);
        $categoryName = $data['category_name'] ?? null;

        if (empty($categoryName)) {
            $this->sendResponse(['error' => 'Category name is required'], 400);
        }

        $newCategory = $this->categoryModel->createCategory($categoryName);
        if ($newCategory) {
            $this->sendResponse($newCategory, 201); // 201 Created
        } else {
            $this->sendResponse(['error' => 'Failed to create category'], 500);
        }
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Trong API thực tế thường dùng PUT
            $this->sendResponse(['error' => 'Method not allowed'], 405);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['category_id'] ?? null;
        $categoryName = $data['category_name'] ?? null;

        if (empty($id) || empty($categoryName)) {
            $this->sendResponse(['error' => 'Category ID and name are required'], 400);
        }

        $updatedCategory = $this->categoryModel->updateCategory($id, $categoryName);
        if ($updatedCategory) {
            $this->sendResponse($updatedCategory);
        } else {
            $this->sendResponse(['error' => 'Failed to update category or category not found'], 500);
        }
    }

    public function delete()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Trong API thực tế thường dùng DELETE
            $this->sendResponse(['error' => 'Method not allowed'], 405);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;

        if (empty($id)) {
            $this->sendResponse(['error' => 'Category ID is required'], 400);
        }

        if ($this->categoryModel->deleteCategory($id)) {
            $this->sendResponse(['message' => 'Category deleted successfully']);
        } else {
            $this->sendResponse(['error' => 'Failed to delete category'], 500);
        }
    }

    public function listCategoryWithPostCounts()
    {
        header('Content-Type: application/json; charset=utf-8');

        $data = $this->categoryModel->getCategoryPostCounts();

        echo json_encode([
            "ok" => true,
            "total" => count($data),
            "categories" => $data
        ]);
        exit;
    }


    // Xóa các hàm show form vì frontend sẽ đảm nhiệm
    // public function showCreateForm() { ... }
    // public function showEditForm() { ... }
}
