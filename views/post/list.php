<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Danh sách bài viết theo danh mục</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }

        .post-list {
            max-width: 800px;
            margin: auto;
            padding: 20px;
        }

        .post-item {
            border-bottom: 1px solid #ccc;
            padding: 15px 0;
        }

        .post-item:last-child {
            border-bottom: none;
        }

        .post-title {
            font-size: 1.5em;
            color: #333;
        }

        .post-meta {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }

        .post-content {
            margin-top: 10px;
        }

        .no-posts {
            text-align: center;
            color: #888;
            margin-top: 50px;
        }
    </style>
</head>

<body>

    <div class="post-list">
        <h1>Danh sách bài viết trong danh mục:
            <?php
            echo !empty($posts) ? htmlspecialchars($posts[0]['category_name']) : 'Không xác định';
            ?>
        </h1>

        <?php if (!empty($posts)): ?>
            <?php foreach ($posts as $post): ?>
                <div class="post-item">
                    <h2 class="post-title">
                        <a href="#"><?php echo htmlspecialchars($post['title']); ?></a>
                    </h2>
                    <p class="post-meta">
                        Tác giả: <strong><?php echo htmlspecialchars($post['author_name']); ?></strong>
                        | Ngày đăng: <?php echo date("d/m/Y", strtotime($post['created_at'])); ?>
                    </p>
                    <div class="post-content">
                        <p><?php echo htmlspecialchars(substr($post['content'], 0, 200)) . '...'; ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="no-posts">Không có bài viết nào trong danh mục này.</p>
        <?php endif; ?>
    </div>

</body>

</html>