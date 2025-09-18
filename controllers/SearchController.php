<?php
require_once __DIR__ . '/../models/Search.php';

class SearchController
{
    private $searchModel;

    public function __construct()
    {
        $this->searchModel = new Search();
    }

    public function search()
    {
        $keyword = $_GET['q'] ?? '';
        if (empty($keyword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Thiếu từ khóa tìm kiếm']);
            exit;
        }

        $results = [
            'posts'      => $this->searchModel->searchPosts($keyword),
            'albums'     => $this->searchModel->searchAlbums($keyword),
            'hashtags'   => $this->searchModel->searchHashtags($keyword),
            'categories' => $this->searchModel->searchCategories($keyword),
        ];

        header('Content-Type: application/json');
        echo json_encode($results);
    }
}
