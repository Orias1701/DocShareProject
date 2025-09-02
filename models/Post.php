<?php
// models/Post.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/IdGenerator.php';
require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload

use Smalot\PdfParser\Parser;
use PhpOffice\PhpWord\IOFactory;

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
    public function extractContentFromFile($filePath, $fileType) {
        $content = '';

        try {
            if ($fileType === 'application/pdf') {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($filePath);
                $content = $this->convertPdfToHtml($pdf);
            } elseif (in_array($fileType, [
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ])) {
                $content = $this->convertWordToHtml($filePath);
            } else {
                throw new Exception('Định dạng file không hỗ trợ. Chỉ hỗ trợ PDF hoặc Word.');
            }
        } catch (Exception $e) {
            error_log('Lỗi khi đọc file: ' . $e->getMessage());
            return false;
        }

        return $content;
    }

    private function convertPdfToHtml($pdf) {
        $htmlContent = '<div style="font-family: Arial, sans-serif; line-height: 1.6;">';
        $pages = $pdf->getPages();
        foreach ($pages as $page) {
            $text = $page->getText();
            $htmlContent .= '<p>' . nl2br(htmlspecialchars($text)) . '</p>';
        }
        $htmlContent .= '</div>';
        return $htmlContent;
    }

    private function convertWordToHtml($filePath) {
        $htmlContent = '<div style="font-family: Arial, sans-serif; line-height: 1.6;">';
        try {
            $phpWord = IOFactory::load($filePath);
        } catch (Exception $e) {
            error_log('Lỗi khi tải file Word: ' . $e->getMessage());
            return $htmlContent . '<p>Lỗi: Không thể đọc file Word.</p></div>';
        }

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if ($element instanceof \PhpOffice\PhpWord\Element\Text) {
                    $fontStyle = $element->getFontStyle();
                    $style = $this->getFontStyleCss($fontStyle);
                    $htmlContent .= '<p style="' . $style . '">' . htmlspecialchars($element->getText()) . '</p>';
                } elseif ($element instanceof \PhpOffice\PhpWord\Element\TextRun) {
                    foreach ($element->getElements() as $subElement) {
                        if ($subElement instanceof \PhpOffice\PhpWord\Element\Text) {
                            $fontStyle = $subElement->getFontStyle();
                            $style = $this->getFontStyleCss($fontStyle);
                            $htmlContent .= '<span style="' . $style . '">' . htmlspecialchars($subElement->getText()) . '</span>';
                        } elseif ($subElement instanceof \PhpOffice\PhpWord\Element\Image) {
                            $htmlContent .= $this->processImage($subElement);
                        }
                    }
                    $htmlContent .= '<br>';
                } elseif ($element instanceof \PhpOffice\PhpWord\Element\Table) {
                    $htmlContent .= '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
                    foreach ($element->getRows() as $row) {
                        $htmlContent .= '<tr>';
                        foreach ($row->getCells() as $cell) {
                            $cellStyle = $cell->getStyle();
                            $cellCss = 'border: 1px solid #000; padding: 8px;';
                            if ($cellStyle && $cellStyle->getWidth()) {
                                $cellCss .= 'width: ' . ($cellStyle->getWidth() / 50) . '%;';
                            }
                            $htmlContent .= '<td style="' . $cellCss . '">';
                            foreach ($cell->getElements() as $cellElement) {
                                if ($cellElement instanceof \PhpOffice\PhpWord\Element\Text) {
                                    $fontStyle = $cellElement->getFontStyle();
                                    $style = $this->getFontStyleCss($fontStyle);
                                    $htmlContent .= '<span style="' . $style . '">' . htmlspecialchars($cellElement->getText()) . '</span>';
                                } elseif ($cellElement instanceof \PhpOffice\PhpWord\Element\TextRun) {
                                    foreach ($cellElement->getElements() as $subElement) {
                                        if ($subElement instanceof \PhpOffice\PhpWord\Element\Text) {
                                            $fontStyle = $subElement->getFontStyle();
                                            $style = $this->getFontStyleCss($fontStyle);
                                            $htmlContent .= '<span style="' . $style . '">' . htmlspecialchars($subElement->getText()) . '</span>';
                                        } elseif ($subElement instanceof \PhpOffice\PhpWord\Element\Image) {
                                            $htmlContent .= $this->processImage($subElement);
                                        }
                                    }
                                }
                            }
                            $htmlContent .= '</td>';
                        }
                        $htmlContent .= '</tr>';
                    }
                    $htmlContent .= '</table>';
                }
            }
        }
        $htmlContent .= '</div>';
        return $htmlContent;
    }

    private function processImage($imageElement) {
        try {
            $imageData = $imageElement->getImageStringData(true);
            $imageMime = $imageElement->getImageType();
            if ($imageData && $imageMime) {
                $imageName = uniqid('img_') . '.' . $imageMime;
                $cloudinary = require __DIR__ . '/../config/cloudinary.php';
                $upload = $cloudinary->uploadApi()->upload('data:image/' . $imageMime . ';base64,' . $imageData);
                if (isset($upload['secure_url'])) {
                    $imageUrl = $upload['secure_url'];
                    // Thêm lớp mặc định để căn giữa ảnh
                    return '<img src="' . htmlspecialchars($imageUrl) . '" alt="Image from Word" class="image-style-align-center" style="max-width: 100%; height: auto;">';
                } else {
                    error_log('Lỗi upload ảnh lên Cloudinary: Không có secure_url');
                    return '<p>[Lỗi: Không thể tải ảnh]</p>';
                }
            } else {
                error_log('Lỗi: Dữ liệu ảnh không hợp lệ hoặc định dạng không được hỗ trợ');
                return '<p>[Lỗi: Ảnh không hợp lệ]</p>';
            }
        } catch (Exception $e) {
            error_log('Lỗi khi xử lý ảnh: ' . $e->getMessage());
            return '<p>[Lỗi: Không thể xử lý ảnh]</p>';
        }
    }

    private function getFontStyleCss($fontStyle) {
        $style = '';
        if ($fontStyle instanceof \PhpOffice\PhpWord\Style\Font) {
            if ($fontStyle->isBold()) {
                $style .= 'font-weight: bold; ';
            }
            if ($fontStyle->isItalic()) {
                $style .= 'font-style: italic; ';
            }
            if ($fontStyle->getColor()) {
                $style .= 'color: #' . $fontStyle->getColor() . '; ';
            }
            if ($fontStyle->getSize()) {
                $style .= 'font-size: ' . ($fontStyle->getSize() / 12) . 'em; ';
            }
        }
        return $style;
    }

    public function updatePost($id, $title, $content, $albumId, $categoryId, $bannerUrl, $userId, $filePath = null, $fileType = null) {
        if ($filePath && $fileType && empty($content)) {
            $fileContent = $this->extractContentFromFile($filePath, $fileType);
            if ($fileContent !== false) {
                $config = HTMLPurifier_Config::createDefault();
                $config->set('HTML.Allowed', 'p,span,table,tr,td,img[src|alt|style|class],br,div');
                $config->set('CSS.AllowedProperties', 'float,margin,margin-left,margin-right,margin-top,margin-bottom,text-align,max-width,height');
                $purifier = new HTMLPurifier($config);
                $content = $purifier->purify($fileContent);
            } else {
                error_log('File processing failed, keeping CKEditor content');
            }
        }

        $sql = "UPDATE posts 
                SET title = ?, content = ?, album_id = ?, category_id = ?, banner_url = ?
                WHERE post_id = ? 
                  AND album_id IN (SELECT album_id FROM albums WHERE user_id = ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$title, $content, $albumId, $categoryId, $bannerUrl, $id, $userId]);
    }

    public function createPost($title, $content, $albumId, $categoryId, $bannerUrl, $filePath = null, $fileType = null) {
        if ($filePath && $fileType) {
            $fileContent = $this->extractContentFromFile($filePath, $fileType);
            if ($fileContent !== false) {
                $content = $fileContent; // Sử dụng nội dung từ file nếu thành công
            } else {
                error_log('File processing failed, falling back to Quill content');
            }
        }

        $albumNumber = preg_replace('/[^0-9]/', '', $albumId);
        $categoryNumber = preg_replace('/[^0-9]/', '', $categoryId);

        $sqlLastPost = "SELECT post_id FROM posts 
                        WHERE album_id = ? AND category_id = ?
                        ORDER BY post_id DESC LIMIT 1";
        $stmtLastPost = $this->pdo->prepare($sqlLastPost);
        $stmtLastPost->execute([$albumId, $categoryId]);
        $lastPost = $stmtLastPost->fetch(PDO::FETCH_ASSOC);

        $postNumber = $lastPost ? intval(substr($lastPost['post_id'], -6)) + 1 : 1;

        $idGenerator = new IdGenerator();
        $newId = $idGenerator->generatePostId($albumNumber, $categoryNumber, $postNumber);

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
//     public function updatePost($id, $title, $content, $albumId, $categoryId, $bannerUrl, $userId) {
//     $sql = "UPDATE posts 
//             SET title = ?, content = ?, album_id = ?, category_id = ?, banner_url = ?
//             WHERE post_id = ? 
//               AND album_id IN (SELECT album_id FROM albums WHERE user_id = ?)"; // xác thực quyền
//     $stmt = $this->pdo->prepare($sql);
//     return $stmt->execute([$title, $content, $albumId, $categoryId, $bannerUrl, $id, $userId]);
// }

public function deletePost($id, $userId) {
    $sql = "DELETE FROM posts 
            WHERE post_id = ? 
              AND album_id IN (SELECT album_id FROM albums WHERE user_id = ?)";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$id, $userId]);
}



    
}
