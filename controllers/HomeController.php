<?php
// controllers/HomeController.php
// (dùng nếu bạn muốn server-side rendering logic; ở design hiện tại index.php trực tiếp include views)
class HomeController {
    public function index() {
        include __DIR__ . '/../views/home.php';
    }
}
