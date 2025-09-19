<?php
// models/Post.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/IdGenerator.php';
require_once __DIR__ . '/../vendor/autoload.php';


class Post
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    /**
     * View A: user_infos, user_follows, albums, posts, post_comments, post_reactions, post_reports
     */
    public function getLatestPosts()
    {
        try {
            $sql = "
                SELECT
                    p.post_id, p.title, p.file_url, p.file_type,
                    LEFT(p.content, 400) AS excerpt,
                    p.created_at,
                    a.album_id, a.album_name,
                    ui.user_id AS author_id, ui.full_name AS author_name,
                    COALESCE((SELECT COUNT(*) FROM user_follows uf WHERE uf.following_id = ui.user_id), 0) AS author_followers,
                    COALESCE((SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.post_id), 0) AS comment_count,
                    COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id), 0) AS reaction_count,
                    COALESCE((SELECT COUNT(*) FROM post_reports rr WHERE rr.post_id = p.post_id), 0) AS report_count
                FROM posts p
                LEFT JOIN albums a ON p.album_id = a.album_id
                LEFT JOIN user_infos ui ON a.user_id = ui.user_id
                ORDER BY p.created_at DESC
            ";
            $stmt = $this->pdo->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getGroup1List: " . $e->getMessage());
            return [];
        }
    }

    /**
     * View B: posts, user_infos, categories, post_hashtags, albums, post_comments, post_reactions, post_reports
     */
    public function getPopularPosts()
    {
        try {
            $sql = "
                SELECT
                    p.post_id, p.title, p.file_url, p.file_type,
                    LEFT(p.content, 400) AS excerpt,
                    p.created_at,
                    a.album_id, a.album_name,
                    ui.user_id AS author_id, ui.full_name AS author_name,
                    c.category_id, c.category_name,
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
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getGroup2List: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Post detail: main post, album, author, category, hashtags, comments, reactions, reports, author follower count
     */
    public function getPostDetail($postId)
    {
        try {
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
            $post = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$post) return null;

            // hashtags
            $sql = "SELECT h.hashtag_id, h.hashtag_name
                    FROM post_hashtags ph
                    JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
                    WHERE ph.post_id = :pid";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':pid' => $postId]);
            $hashtags = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // comments
            $sql = "SELECT c.comment_id, c.content, c.created_at, c.user_id, ui.full_name
                    FROM post_comments c
                    LEFT JOIN user_infos ui ON c.user_id = ui.user_id
                    WHERE c.post_id = :pid
                    ORDER BY c.created_at ASC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':pid' => $postId]);
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // reactions
            $sql = "SELECT r.reaction_type, r.created_at, r.user_id, ui.full_name
                    FROM post_reactions r
                    LEFT JOIN user_infos ui ON r.user_id = ui.user_id
                    WHERE r.post_id = :pid";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':pid' => $postId]);
            $reactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // reports
            $sql = "SELECT rp.report_id, rp.reason, rp.created_at, rp.user_id, ui.full_name
                    FROM post_reports rp
                    LEFT JOIN user_infos ui ON rp.user_id = ui.user_id
                    WHERE rp.post_id = :pid";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':pid' => $postId]);
            $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
        } catch (Exception $e) {
            error_log("Error in getPostDetail: " . $e->getMessage());
            return null;
        }
    }

    /**
     * CREATE: Thêm bài viết mới vào database
     */
    public function createPost($title, $content, $description, $summary, $albumId, $categoryId, $bannerUrl, $fileUrl = null, $fileType = null)
    {
        try {
            // Khởi tạo content
            $processedContent = $content;
            if (!($fileUrl && $fileType)) {
                // Nếu không có file, xử lý ảnh base64
                $processedContent = $this->processBase64ImagesInContent($content);
            }

            // Tạo post_id
            $albumNumber = preg_replace('/[^0-9]/', '', $albumId);
            $categoryNumber = preg_replace('/[^0-9]/', '', $categoryId);
            $sqlLastPost = "SELECT post_id FROM posts WHERE album_id = ? AND category_id = ? ORDER BY post_id DESC LIMIT 1";
            $stmtLastPost = $this->pdo->prepare($sqlLastPost);
            $stmtLastPost->execute([$albumId, $categoryId]);
            $lastPost = $stmtLastPost->fetch(PDO::FETCH_ASSOC);

            $postNumber = $lastPost ? intval(substr($lastPost['post_id'], -6)) + 1 : 1;
            $idGenerator = new IdGenerator();
            $newId = $idGenerator->generatePostId($albumNumber, $categoryNumber, $postNumber);

            // Thêm vào DB
            $sql = "INSERT INTO posts (post_id, title, content, description, summary, album_id, category_id, banner_url, file_url, file_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $success = $stmt->execute([$newId, $title, $processedContent, $description, $summary, $albumId, $categoryId, $bannerUrl, $fileUrl, $fileType]);

            if (!$success) {
                error_log("Failed to create post: " . print_r($stmt->errorInfo(), true));
                throw new Exception("Lỗi khi lưu bài viết vào cơ sở dữ liệu.");
            }

            return $newId; // => trả về post_id vừa tạo để dùng tạo hashtag đồng thời
        } catch (Exception $e) {
            error_log("Error in createPost: " . $e->getMessage());
            throw $e;
        }
    }


    private function processBase64ImagesInContent($content)
    {
        if (empty($content) || strpos($content, 'data:image') === false) {
            return $content;
        }

        $dom = new DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $images = $dom->getElementsByTagName('img');
        if ($images->length == 0) {
            return $content;
        }

        $cloudinary = require __DIR__ . '/../config/cloudinary.php';

        foreach ($images as $img) {
            $src = $img->getAttribute('src');
            if (strpos($src, 'data:image') === 0) {
                try {
                    $uploadResult = $cloudinary->uploadApi()->upload($src, ['folder' => 'posts_content']);
                    if (isset($uploadResult['secure_url'])) {
                        $img->setAttribute('src', $uploadResult['secure_url']);
                    }
                } catch (Exception $e) {
                    error_log('Cloudinary base64 image upload failed: ' . $e->getMessage());
                }
            }
        }
        return $dom->saveHTML();
    }

    /**
     * READ: Lấy bài viết theo ID
     */
    public function getPostById($postId)
    {
        try {
            $sql = "
                SELECT p.*, a.user_id AS author_id, ui.full_name AS author_name, a.album_name, c.category_name
                FROM posts p
                LEFT JOIN albums a ON p.album_id = a.album_id
                LEFT JOIN user_infos ui ON a.user_id = ui.user_id
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.post_id = ?
                LIMIT 1
            ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$postId]);
            $post = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$post) {
                error_log("Post not found: post_id = $postId");
            }
            return $post;
        } catch (Exception $e) {
            error_log("Error in getPostById: " . $e->getMessage());
            return null;
        }
    }

    public function getPostByCategoryId($categoryId)
    {
        try {
            $sql = "
            SELECT p.*, a.user_id AS author_id, ui.full_name AS author_name, a.album_name, c.category_name
            FROM posts p
            LEFT JOIN albums a ON p.album_id = a.album_id
            LEFT JOIN user_infos ui ON a.user_id = ui.user_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.category_id = ?
        ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$categoryId]);
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!$posts) {
                // This is a normal case when a category has no posts, so we don't log it as an error
                // You can log this if you wish, but it's not a critical error.
                // error_log("No posts found for category_id: $categoryId");
                return []; // Return an empty array instead of null for better predictability
            }

            return $posts;
        } catch (Exception $e) {
            error_log("Error in getPostByCategoryId: " . $e->getMessage());
            return null;
        }
    }

    // Trong file models/Post.php

    public function getPostsByHashtagIds(array $hashtagIds)
    {
        // Kiểm tra xem mảng có rỗng không
        if (empty($hashtagIds)) {
            return [];
        }

        // Tạo chuỗi placeholders (?) cho mệnh đề IN
        // Ví dụ: ["id1", "id2"] sẽ tạo ra "?,?"
        $placeholders = implode(',', array_fill(0, count($hashtagIds), '?'));

        try {
            $sql = "
            SELECT
                p.*,
                a.user_id AS author_id,
                ui.full_name AS author_name,
                a.album_name,
                c.category_name
            FROM posts p
            LEFT JOIN albums a ON p.album_id = a.album_id
            LEFT JOIN user_infos ui ON a.user_id = ui.user_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            JOIN post_hashtags ph ON p.post_id = ph.post_id
            WHERE ph.hashtag_id IN ($placeholders)
            GROUP BY p.post_id -- Nhóm kết quả để tránh trùng lặp bài viết
        ";

            $stmt = $this->pdo->prepare($sql);

            // Truyền mảng các ID vào execute
            $stmt->execute($hashtagIds);

            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $posts ?: []; // Trả về mảng rỗng nếu không có kết quả
        } catch (Exception $e) {
            error_log("Error in getPostsByHashtagIds: " . $e->getMessage());
            return null;
        }
    }

    /**
     * READ: Lấy tất cả bài viết
     */
    public function getAllPosts()
    {
        try {
            $sql = "
                SELECT 
                    p.*, 
                    a.album_name, 
                    c.category_name, 
                    u.username
                FROM posts AS p
                LEFT JOIN albums AS a ON p.album_id = a.album_id
                LEFT JOIN categories AS c ON p.category_id = c.category_id
                LEFT JOIN users AS u ON a.user_id = u.user_id 
                ORDER BY p.created_at DESC
            ";
            $stmt = $this->pdo->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getAllPosts: " . $e->getMessage());
            return [];
        }
    }

    /**
     * UPDATE: Cập nhật bài viết
     */
    public function updatePost($id, $title, $content, $description, $summary, $albumId, $categoryId, $bannerUrl, $userId, $fileUrl = null, $fileType = null)
    {
        try {
            $processedContent = $content;

            // Nếu có file PDF, không ghi đè content
            if ($fileUrl && $fileType) {
                if ($fileType !== 'application/pdf') {
                    throw new Exception("Chỉ hỗ trợ file PDF khi cập nhật.");
                }
            } else {
                $processedContent = $this->processBase64ImagesInContent($content);
            }

            $sql = "UPDATE posts 
            SET 
                title = ?, 
                content = ?, 
                description = ?, 
                summary = ?, 
                album_id = ?, 
                category_id = ?, 
                banner_url = ?, 
                file_url = ?, 
                file_type = ?
            WHERE post_id = ? 
            AND album_id IN (SELECT album_id FROM albums WHERE user_id = ?)";

            $stmt = $this->pdo->prepare($sql);

            $success = $stmt->execute([
                $title,
                $processedContent,
                $description,
                $summary,
                $albumId,
                $categoryId,
                $bannerUrl,
                $fileUrl,
                $fileType,
                $id,
                $userId
            ]);

            if (!$success) {
                error_log("Failed to update post: " . print_r($stmt->errorInfo(), true));
                throw new Exception("Lỗi khi cập nhật bài viết.");
            }
            return true;
        } catch (Exception $e) {
            error_log("Error in updatePost: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * DELETE: Xóa bài viết
     */
    public function deletePost($id, $userId)
    {
        try {
            $sql = "DELETE FROM posts 
                    WHERE post_id = ? 
                    AND album_id IN (SELECT album_id FROM albums WHERE user_id = ?)";
            $stmt = $this->pdo->prepare($sql);
            $success = $stmt->execute([$id, $userId]);

            if (!$success) {
                error_log("Failed to delete post: " . print_r($stmt->errorInfo(), true));
                throw new Exception("Lỗi khi xóa bài viết.");
            }
            return true;
        } catch (Exception $e) {
            error_log("Error in deletePost: " . $e->getMessage());
            throw $e;
        }
    }

    public function getPostsByUserId($userId)
    {
        try {
            $sql = "
            SELECT 
                p.post_id, p.title, p.file_url, p.file_type,
                LEFT(p.content, 400) AS excerpt,
                p.created_at,
                a.album_id, a.album_name,
                ui.user_id AS author_id, ui.full_name AS author_name
            FROM posts p
            LEFT JOIN albums a ON p.album_id = a.album_id
            LEFT JOIN user_infos ui ON a.user_id = ui.user_id
            WHERE ui.user_id = ?
            ORDER BY p.created_at DESC
        ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getPostsByUserId: " . $e->getMessage());
            return [];
        }
    }

    public function getPostsFromFollowedUsers($followerId)
    {
        try {
            $sql = "
                SELECT 
                    p.post_id, p.title, p.file_url, p.file_type,
                    LEFT(p.content, 400) AS excerpt,
                    p.created_at,
                    a.album_id, a.album_name,
                    ui.user_id AS author_id, ui.full_name AS author_name
                FROM posts p
                LEFT JOIN albums a ON p.album_id = a.album_id
                LEFT JOIN user_infos ui ON a.user_id = ui.user_id
                WHERE ui.user_id IN (
                    SELECT uf.following_id 
                    FROM user_follows uf 
                    WHERE uf.follower_id = ?
                )
                ORDER BY p.created_at DESC
            ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$followerId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getPostsFromFollowedUsers: " . $e->getMessage());
            return [];
        }
    }

    // public function getHashtagsByUserId($userId)
    // {
    //     try {
    //         $sql = "
    //         SELECT DISTINCT h.hashtag_id, h.hashtag_name
    //         FROM posts p
    //         JOIN post_hashtags ph ON p.post_id = ph.post_id
    //         JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
    //         JOIN albums a ON p.album_id = a.album_id
    //         WHERE a.user_id = ?
    //         ORDER BY h.hashtag_name ASC
    //     ";
    //         $stmt = $this->pdo->prepare($sql);
    //         $stmt->execute([$userId]);
    //         return $stmt->fetchAll(PDO::FETCH_ASSOC);
    //     } catch (Exception $e) {
    //         error_log("Error in getHashtagsByUserId: " . $e->getMessage());
    //         return [];
    //     }
    // }
}
