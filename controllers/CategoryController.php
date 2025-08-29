<?php
require_once __DIR__ . '/../models/Category.php';

class CategoryController {
    private $categoryModel;

    public function __construct() {
        $this->categoryModel = new Category();
    }

    public function listCategories() {
        $categories = $this->categoryModel->getAllCategories();
        include __DIR__ . '/../views/category/list.php';
    }

    public function showCreateForm() {
        include __DIR__ . '/../views/category/create.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $categoryName = $_POST['category_name'];
            $this->categoryModel->createCategory($categoryName);
            header("Location: index.php?action=list_categories");
            exit;
        }
    }

    public function showEditForm() {
        $id = $_GET['id'];
        $category = $this->categoryModel->getCategoryById($id);
        include __DIR__ . '/../views/category/edit.php';
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['category_id'];
            $categoryName = $_POST['category_name'];
            $this->categoryModel->updateCategory($id, $categoryName);
            header("Location: index.php?action=list_categories");
            exit;
        }
    }

    public function delete() {
        $id = $_GET['id'];
        $this->categoryModel->deleteCategory($id);
        header("Location: index.php?action=list_categories");
        exit;
    }
}