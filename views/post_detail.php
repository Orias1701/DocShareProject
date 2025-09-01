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

?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($post['title']); ?></title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
        .post-container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .post-title { font-size: 2.5em; margin-bottom: 10px; }
        .post-meta { font-size: 0.9em; color: #555; margin-bottom: 20px; }
        .post-content { font-size: 1.1em; line-height: 1.8; }
        .reaction-bar { margin-top: 20px; }
        .reaction-bar a {
            font-size: 20px;
            padding: 5px 10px;
            margin-right: 8px;
            text-decoration: none;
            border-radius: 6px;
        }
        .reaction-bar a.active {
            background: #007bff;
            color: #fff;
            font-weight: bold;
        }
        .reaction-bar a:hover { transform: scale(1.2); }
        .comment-section { margin-top: 40px; }
        .comment-box { border-left: 3px solid #007bff; padding-left: 10px; margin-bottom: 15px; }
        .comment-box small { color: #888; }
        .comment-form textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; resize: vertical; }
        .comment-form button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .comment-form button:hover { background-color: #0056b3; }
    </style>
</head>
<body>

<div class="post-container">
    <h1 class="post-title"><?php echo htmlspecialchars($post['title']); ?></h1>
    <div class="post-meta">
        Tác giả: <?php echo htmlspecialchars($post['author_name']); ?>
        | Ngày đăng: <?php echo htmlspecialchars($post['created_at']); ?>
    </div>
    <div class="post-content">
    <?php echo nl2br(strip_tags($post['content'])); ?>
</div>


    <!-- Reaction section -->
<div class="reaction-bar">
    <?php include __DIR__ . '/reaction/reaction_bar.php'; ?>
</div>

<!-- Report section -->
<div class="report-section" style="margin-top: 20px;">
        <?php include __DIR__ . '/report/report_section.php'; ?>

</div>

<div class="post-container comment-section">
    <h2>Bình luận</h2>
    <?php include __DIR__ . '/postcomment/comments_by_post.php'; ?>
</div>

</body>
</html>
