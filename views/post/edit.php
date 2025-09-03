<?php
// views/post/edit.php

if (empty($post)) {
    echo "<p>Bài viết không tồn tại.</p>";
    return;
}

// Sử dụng HTMLPurifier để lọc nội dung HTML khi hiển thị
require_once __DIR__ . '/../../vendor/autoload.php';
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML.Allowed', 'p,span,table,tr,td,img[src|alt|style|class],br,div,b,strong,i,em,u,ul,ol,li,a[href]');
$config->set('CSS.AllowedProperties', 'float,margin,margin-left,margin-right,margin-top,margin-bottom,text-align,max-width,height,display,vertical-align');
$purifier = new HTMLPurifier($config);
$cleanContent = $purifier->purify($post['content']);
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Chỉnh sửa bài viết - <?= htmlspecialchars($post['title']) ?></title>
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }

        form {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input[type="text"],
        input[type="file"],
        select,
        textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }

        textarea {
            min-height: 100px;
        }

        #editor {
            min-height: 300px;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .warning {
            color: red;
            font-size: 0.9em;
            margin-top: 5px;
            display: none;
        }

        button[type="submit"] {
            background-color: #4CAF50;
            color: white;
            padding: 15px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }

        button[type="submit"]:hover {
            background-color: #45a049;
        }

        .ql-editor {
            min-height: 300px;
        }
    </style>
</head>

<body>
    <h2>Chỉnh sửa bài viết</h2>
    <form id="postForm" action="index.php?action=update_post" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="post_id" value="<?= htmlspecialchars($post['post_id']) ?>">

        <label for="title">Tiêu đề:</label>
        <input type="text" id="title" name="title" value="<?= htmlspecialchars($post['title']) ?>" required>
        <br><br>

        <label for="content">Nội dung:</label>
        <div id="editor"><?= $cleanContent ?></div>
        <input type="hidden" name="content" id="hiddenContent">
        <br><br>

        <label for="content_file">Upload file mới để thay thế (PDF):</label>
        <input type="file" id="content_file" name="content_file" accept=".pdf">
        <div id="fileWarning" class="warning">Lưu ý: Upload file sẽ ghi đè nội dung trong trình soạn thảo!</div>
        <br><br>

        <label for="description">Mô tả:</label>
        <textarea id="description" name="description" placeholder="Nhập mô tả ngắn cho bài viết..."><?= htmlspecialchars($post['description'] ?? '') ?></textarea>
        <br><br>

        <label for="summary">Tóm tắt:</label>
        <textarea id="summary" name="summary" placeholder="Nhập tóm tắt của bài viết..."><?= htmlspecialchars($post['summary'] ?? '') ?></textarea>
        <br><br>

        <label for="album_id">Chọn Album:</label>
        <select id="album_id" name="album_id" required>
            <?php foreach ($albums as $album): ?>
                <option value="<?= htmlspecialchars($album['album_id']) ?>" <?= ($album['album_id'] === $post['album_id']) ? 'selected' : '' ?>>
                    <?= htmlspecialchars($album['album_name']) ?>
                </option>
            <?php endforeach; ?>
        </select>
        <br><br>

        <label for="category_id">Chọn Thể loại:</label>
        <select id="category_id" name="category_id" required>
            <?php foreach ($categories as $category): ?>
                <option value="<?= htmlspecialchars($category['category_id']) ?>" <?= ($category['category_id'] === $post['category_id']) ? 'selected' : '' ?>>
                    <?= htmlspecialchars($category['category_name']) ?>
                </option>
            <?php endforeach; ?>
        </select>
        <br><br>

        <label for="banner">Banner (Upload hình mới nếu muốn):</label>
        <input type="file" id="banner" name="banner" accept="image/*">
        <?php if (!empty($post['banner_url'])): ?>
            <p>Banner hiện tại:</p>
            <img src="<?= htmlspecialchars($post['banner_url']) ?>" alt="Banner" style="max-width: 300px; margin-top: 10px;">
        <?php endif; ?>
        <br><br>

        <button type="submit">Cập nhật bài viết</button>
    </form>

    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const quill = new Quill('#editor', {
                theme: 'snow',
                placeholder: 'Nhập nội dung bài viết...',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        ['link', 'image'],
                        [{
                            list: 'ordered'
                        }, {
                            list: 'bullet'
                        }],
                        ['clean']
                    ]
                }
            });

            const form = document.getElementById('postForm');
            const contentFileInput = document.getElementById('content_file');
            const fileWarning = document.getElementById('fileWarning');
            const hiddenContent = document.getElementById('hiddenContent');

            contentFileInput.addEventListener('change', function() {
                if (contentFileInput.files.length > 0) {
                    fileWarning.style.display = 'block';
                    // Ẩn editor khi có file PDF
                    document.getElementById('editor').style.display = 'none';
                    hiddenContent.value = '';
                } else {
                    fileWarning.style.display = 'none';
                    document.getElementById('editor').style.display = 'block';
                }
            });

            form.addEventListener('submit', function() {
                if (contentFileInput.files.length === 0) {
                    hiddenContent.value = quill.root.innerHTML;
                } else {
                    hiddenContent.value = ''; // PDF ghi đè editor
                }
            });
        });
    </script>
</body>

</html>