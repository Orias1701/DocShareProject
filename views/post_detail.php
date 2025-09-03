<?php
// views/post_detail.php

if (empty($post)) {
    echo "<p>Bài viết không tồn tại.</p>";
    return;
}

// Các emoji reaction
$reactions = [
    'like'  => '👍',
    'love'  => '❤️',
    'haha'  => '😂',
    'wow'   => '😮',
    'sad'   => '😢',
    'angry' => '😡'
];

// Sử dụng HTMLPurifier để lọc nội dung HTML
require_once __DIR__ . '/../vendor/autoload.php';
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML.Allowed', 'p,span,table,tr,td,img[src|alt|style],br,div,a[href],strong,em');
$purifier = new HTMLPurifier($config);
$cleanContent = $purifier->purify($post['content']);
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($post['title']); ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            background-color: #f4f4f4;
        }

        .post-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .post-title {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #333;
        }

        .post-meta {
            font-size: 0.9em;
            color: #555;
            margin-bottom: 20px;
        }

        .post-content {
            font-size: 1.1em;
            line-height: 1.8;
            color: #333;
        }

        .post-content img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px auto;
        }

        .post-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
        }

        .post-content td,
        .post-content th {
            border: 1px solid #000;
            padding: 8px;
        }

        .file-attachment {
            margin-top: 20px;
        }

        .file-attachment a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }

        .file-attachment a:hover {
            text-decoration: underline;
        }

        .reaction-bar {
            margin-top: 20px;
        }

        .reaction-bar a {
            font-size: 20px;
            padding: 5px 10px;
            margin-right: 8px;
            text-decoration: none;
            border-radius: 6px;
            transition: transform 0.2s;
        }

        .reaction-bar a.active {
            background: #007bff;
            color: #fff;
            font-weight: bold;
        }

        .reaction-bar a:hover {
            transform: scale(1.2);
        }

        .comment-section {
            margin-top: 40px;
        }

        .comment-box {
            border-left: 3px solid #007bff;
            padding-left: 10px;
            margin-bottom: 15px;
        }

        .comment-box small {
            color: #888;
        }

        .comment-form textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
            font-family: Arial, sans-serif;
        }

        .comment-form button {
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1em;
        }

        .comment-form button:hover {
            background-color: #0056b3;
        }
    </style>
</head>

<body>

    <div class="post-container">
        <h1 class="post-title"><?php echo htmlspecialchars($post['title']); ?></h1>
        <div class="post-meta">
            Tác giả: <?php echo htmlspecialchars($post['author_name']); ?>
            | Ngày đăng: <?php echo htmlspecialchars($post['created_at']); ?>
            | Album: <?php echo htmlspecialchars($post['album_name'] ?? 'Không có album'); ?>
            | Danh mục: <?php echo htmlspecialchars($post['category_name'] ?? 'Không có danh mục'); ?>
        </div>

        <div class="post-content">
            <?php if (!empty($post['file_url'])): ?>
                <?php if ($post['file_type'] === 'application/pdf'): ?>
                    <div class="file-attachment">
                        <p><strong>File đính kèm (PDF):</strong></p>
                        <iframe src="<?php echo htmlspecialchars($post['file_url']); ?>" width="100%" height="600px" style="border: none;"></iframe>
                        <p><a href="<?php echo htmlspecialchars($post['file_url']); ?>" download>Tải xuống file PDF</a></p>
                    </div>
                <?php elseif (in_array($post['file_type'], ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])): ?>
                    <div class="file-attachment">
                        <p><strong>Nội dung từ file Word:</strong></p>
                        <?php echo $cleanContent; ?>
                        <p><a href="<?php echo htmlspecialchars($post['file_url']); ?>" download>Tải xuống file Word gốc</a></p>
                    </div>
                <?php endif; ?>
            <?php else: ?>
                <?php echo $cleanContent; ?>
            <?php endif; ?>
        </div>

        <!-- Reaction section -->
        <div class="reaction-bar">
            <?php include __DIR__ . '/reaction/reaction_bar.php'; ?>
        </div>

        <!-- Report section -->
        <div class="report-section" style="margin-top: 20px;">
            <?php include __DIR__ . '/report/report_section.php'; ?>
        </div>

        <!-- Comment section -->
        <div class="comment-section">
            <h2>Bình luận</h2>
            <?php include __DIR__ . '/postcomment/comments_by_post.php'; ?>
        </div>
    </div>

</body>

</html>