<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Kết quả tìm kiếm theo Hashtag</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 900px;
            margin: auto;
            background: #fff;
            padding: 20px 30px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .post-item {
            border-bottom: 1px solid #e0e0e0;
            padding: 20px 0;
        }

        .post-item:last-child {
            border-bottom: none;
        }

        .post-title {
            font-size: 1.8em;
            color: #007BFF;
            margin: 0 0 5px 0;
        }

        .post-title a {
            text-decoration: none;
            color: inherit;
        }

        .post-meta {
            font-size: 0.9em;
            color: #6c757d;
            margin-bottom: 15px;
        }

        .post-content {
            color: #495057;
        }

        .no-posts {
            text-align: center;
            color: #888;
            padding: 50px;
        }

        .hashtags-list {
            font-style: italic;
            color: #009688;
            font-size: 1.1em;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>

    <div class="container">
        <h1>Kết quả tìm kiếm</h1>

        <?php if (!empty($posts)): ?>
            <p class="hashtags-list">
                Tìm kiếm với hashtag:
                <strong>
                    <?php
                    // Bạn cần truy vấn riêng để lấy tên hashtag nếu muốn hiển thị nhiều tên cùng lúc
                    // Ví dụ: echo htmlspecialchars($posts[0]['hashtag_name']);
                    ?>
                </strong>
            </p>

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
                        <p><?php echo htmlspecialchars(substr($post['content'], 0, 250)) . '...'; ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="no-posts">Không có bài viết nào với các hashtag này.</p>
        <?php endif; ?>
    </div>

</body>

</html>