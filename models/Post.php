<?php
// models/Post.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/IdGenerator.php';
require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload

use PhpOffice\PhpWord\IOFactory;
use Smalot\PdfParser\Parser as PdfParser;

class Post {
    private $pdo;
    public function __construct() { $this->pdo = Database::getConnection(); }

    /**
     * View A:
     * user_infos, user_follows, albums, posts, post_comments, post_reactions, post_reports
     * For each post: author info (from album -> user_infos), author followers, album, counts
     */
    public function getGroup1List() {
        $sql = "
            SELECT
                p.post_id,
                p.title,
                LEFT(p.content, 400) AS excerpt,
                p.created_at,
                a.album_id,
                a.album_name,
                ui.user_id AS author_id,
                ui.full_name AS author_name,
                COALESCE(
                  (SELECT COUNT(*) FROM user_follows uf WHERE uf.following_id = ui.user_id), 0
                ) AS author_followers,
                COALESCE((SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.post_id), 0) AS comment_count,
                COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id), 0) AS reaction_count,
                COALESCE((SELECT COUNT(*) FROM post_reports rr WHERE rr.post_id = p.post_id), 0) AS report_count
            FROM posts p
            LEFT JOIN albums a ON p.album_id = a.album_id
            LEFT JOIN user_infos ui ON a.user_id = ui.user_id
            ORDER BY p.created_at DESC
        ";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * View B:
     * posts, user_infos, categories, post_hashtags, albums, post_comments, post_reactions, post_reports
     */
    public function getGroup2List() {
        $sql = "
            SELECT
                p.post_id,
                p.title,
                LEFT(p.content, 400) AS excerpt,
                p.created_at,
                a.album_id,
                a.album_name,
                ui.user_id AS author_id,
                ui.full_name AS author_name,
                c.category_id,
                c.category_name,
                GROUP_CONCAT(DISTINCT h.hashtag_name SEPARATOR ', ') AS hashtags,
                COALESCE((SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.post_id), 0) AS comment_count,
                COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id), 0) AS reaction_count,
                COALESCE((SELECT COUNT(*) FROM post_reports rr WHERE rr.post_id = p.post_id), 0) AS report_count
            FROM posts p
            LEFT JOIN albums a ON p.album_id = a.album_id
            LEFT JOIN user_infos ui ON a.user_id = ui.user_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN post_hashtags ph ON p.post_id = ph.post_id
            LEFT JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
            GROUP BY p.post_id
            ORDER BY p.created_at DESC
        ";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Post detail: main post, album, author, category, hashtags, comments, reactions, reports, author follower count
     */
    public function getPostDetail($postId) {
        // main
        $sql = "
            SELECT p.*, a.album_id, a.album_name, a.user_id AS album_owner_id, ui.full_name AS author_name,
                   c.category_id, c.category_name
            FROM posts p
            LEFT JOIN albums a ON p.album_id = a.album_id
            LEFT JOIN user_infos ui ON a.user_id = ui.user_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.post_id = :pid
            LIMIT 1
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':pid' => $postId]);
        $post = $stmt->fetch();
        if (!$post) return null;

        // hashtags
        $sql = "SELECT h.hashtag_id, h.hashtag_name
                FROM post_hashtags ph
                JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
                WHERE ph.post_id = :pid";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':pid' => $postId]);
        $hashtags = $stmt->fetchAll();

        // comments
        $sql = "SELECT c.comment_id, c.content, c.created_at, c.user_id, ui.full_name
                FROM post_comments c
                LEFT JOIN user_infos ui ON c.user_id = ui.user_id
                WHERE c.post_id = :pid
                ORDER BY c.created_at ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':pid' => $postId]);
        $comments = $stmt->fetchAll();

        // reactions
        $sql = "SELECT r.reaction_type, r.created_at, r.user_id, ui.full_name
                FROM post_reactions r
                LEFT JOIN user_infos ui ON r.user_id = ui.user_id
                WHERE r.post_id = :pid";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':pid' => $postId]);
        $reactions = $stmt->fetchAll();

        // reports
        $sql = "SELECT rp.report_id, rp.reason, rp.created_at, rp.user_id, ui.full_name
                FROM post_reports rp
                LEFT JOIN user_infos ui ON rp.user_id = ui.user_id
                WHERE rp.post_id = :pid";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':pid' => $postId]);
        $reports = $stmt->fetchAll();

        // author follower count
        $authorFollowerCount = 0;
        if (!empty($post['album_owner_id'])) {
            $sql = "SELECT COUNT(*) FROM user_follows WHERE following_id = :aid";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':aid' => $post['album_owner_id']]);
            $authorFollowerCount = (int)$stmt->fetchColumn();
        }

        return [
            'post' => $post,
            'hashtags' => $hashtags,
            'comments' => $comments,
            'reactions' => $reactions,
            'reports' => $reports,
            'author_follower_count' => $authorFollowerCount
        ];
    }
    // CREATE: Thêm bài viết mới vào database
     public function createPost($title, $content, $albumId, $categoryId, $bannerUrl) {
        // 1. Trích xuất phần số từ các ID đã có
        // Ví dụ: "ALBUM0000000007001" -> "0000000007001"
        $albumNumber = preg_replace('/[^0-9]/', '', $albumId);
        // Ví dụ: "CATEGORY00001" -> "00001"
        $categoryNumber = preg_replace('/[^0-9]/', '', $categoryId);

        // 2. Tìm post_id cuối cùng thuộc album và category này
        // Điều này đảm bảo số thứ tự không bị trùng lặp trong cùng một album và thể loại
        $sqlLastPost = "SELECT post_id FROM posts 
                        WHERE album_id = ? AND category_id = ?
                        ORDER BY post_id DESC LIMIT 1";
        $stmtLastPost = $this->pdo->prepare($sqlLastPost);
        $stmtLastPost->execute([$albumId, $categoryId]);
        $lastPost = $stmtLastPost->fetch(PDO::FETCH_ASSOC);

        // 3. Tính số thứ tự bài viết mới
        $postNumber = $lastPost ? intval(substr($lastPost['post_id'], -6)) + 1 : 1;
        
        // 4. Khởi tạo và sử dụng IdGenerator với 3 tham số
        $idGenerator = new IdGenerator();
        $newId = $idGenerator->generatePostId($albumNumber, $categoryNumber, $postNumber);

        // 5. Chèn bài viết mới vào database
        $sql = "INSERT INTO posts (post_id, title, content, album_id, category_id, banner_url) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$newId, $title, $content, $albumId, $categoryId, $bannerUrl]);
    }
    
    // READ: Lấy một bài viết theo ID
    public function getPostById($postId) {
    $sql = "
        SELECT p.*, a.user_id AS author_id, ui.full_name AS author_name
        FROM posts p
        LEFT JOIN albums a ON p.album_id = a.album_id
        LEFT JOIN user_infos ui ON a.user_id = ui.user_id
        WHERE p.post_id = ?
        LIMIT 1
    ";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([$postId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}  
    // READ: Lấy tất cả bài viết
   public function getAllPosts() {
    $sql = "SELECT 
                p.*, 
                a.album_name, 
                c.category_name, 
                u.username
            FROM posts AS p
            LEFT JOIN albums AS a ON p.album_id = a.album_id
            LEFT JOIN categories AS c ON p.category_id = c.category_id
            LEFT JOIN users AS u ON a.user_id = u.user_id 
            ORDER BY p.created_at DESC";
            
    $stmt = $this->pdo->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

    // UPDATE: Cập nhật thông tin bài viết
    public function updatePost($id, $title, $content, $albumId, $categoryId, $bannerUrl, $userId) {
    $sql = "UPDATE posts 
            SET title = ?, content = ?, album_id = ?, category_id = ?, banner_url = ?
            WHERE post_id = ? 
              AND album_id IN (SELECT album_id FROM albums WHERE user_id = ?)"; // xác thực quyền
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$title, $content, $albumId, $categoryId, $bannerUrl, $id, $userId]);
}

public function deletePost($id, $userId) {
    $sql = "DELETE FROM posts 
            WHERE post_id = ? 
              AND album_id IN (SELECT album_id FROM albums WHERE user_id = ?)";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$id, $userId]);
}



    
}
