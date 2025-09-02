<?php
// views/post/edit.php

if (empty($post)) {
    echo "<p>Bài viết không tồn tại.</p>";
    return;
}

// Kiểm tra và nạp autoload.php
$autoloadPath = dirname(__DIR__, 2) . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die('Lỗi: Không tìm thấy file vendor/autoload.php. Vui lòng chạy "composer install" trong thư mục gốc dự án.');
}
require_once $autoloadPath;

// Sử dụng HTMLPurifier để lọc nội dung HTML khi hiển thị
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML.Allowed', 'p,span,table,tr,td,img[src|alt|style|class],br,div');
$config->set('CSS.AllowedProperties', 'float,margin,margin-left,margin-right,margin-top,margin-bottom,text-align,max-width,height');
$purifier = new HTMLPurifier($config);
$cleanContent = $purifier->purify($post['content']);
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Chỉnh sửa bài viết - <?php echo htmlspecialchars($post['title']); ?></title>
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; }
        form { max-width: 800px; margin: 0 auto; }
        #editor { height: 300px; background: #fff; border: 1px solid #ccc; }
        .warning { color: red; font-size: 0.9em; margin-top: 5px; display: none; }
        label { display: block; margin-bottom: 5px; }
        input, select { width: 100%; padding: 8px; margin-bottom: 10px; }
        button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
    </style>
</head>
<body>
    <h2>Chỉnh sửa bài viết</h2>
    <form id="postForm" action="index.php?action=update_post" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="post_id" value="<?= htmlspecialchars($post['post_id']) ?>">

        <label for="title">Tiêu đề:</label>
        <input type="text" id="title" name="title" value="<?= htmlspecialchars($post['title']) ?>" required>
        
        <label for="content">Nội dung:</label>
        <div id="editor"><?= $cleanContent ?></div>
        <input type="hidden" name="content" id="hiddenContent">
        
        <label for="content_file">Hoặc upload file (PDF/Word):</label>
        <input type="file" id="content_file" name="content_file" accept=".pdf,.doc,.docx">
        <div id="fileWarning" class="warning">Lưu ý: Upload file sẽ ghi đè nội dung trong trình soạn thảo!</div>
        
        <label for="album_id">Chọn Album:</label>
        <select id="album_id" name="album_id" required>
            <?php foreach ($albums as $album): ?>
                <option value="<?= htmlspecialchars($album['album_id']) ?>"
                    <?= ($album['album_id'] === $post['album_id']) ? 'selected' : '' ?>>
                    <?= htmlspecialchars($album['album_name']) ?>
                </option>
            <?php endforeach; ?>
        </select>

        <label for="category_id">Chọn Thể loại:</label>
        <select id="category_id" name="category_id" required>
            <?php foreach ($categories as $category): ?>
                <option value="<?= htmlspecialchars($category['category_id']) ?>"
                    <?= ($category['category_id'] === $post['category_id']) ? 'selected' : '' ?>>
                    <?= htmlspecialchars($category['category_name']) ?>
                </option>
            <?php endforeach; ?>
        </select>
        
        <label for="banner">Banner (Upload hình mới nếu muốn):</label>
        <input type="file" id="banner" name="banner" accept="image/*">
        <?php if (!empty($post['banner_url'])): ?>
            <p>Banner hiện tại:</p>
            <img src="<?= htmlspecialchars($post['banner_url']) ?>" alt="Banner" style="max-width: 300px;">
        <?php endif; ?>

        <button type="submit">Cập nhật bài viết</button>
    </form>

    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script>
        let quill;

        document.addEventListener("DOMContentLoaded", function() {
            // Khởi tạo Quill
            quill = new Quill('#editor', {
                theme: 'snow',
                placeholder: 'Nhập nội dung bài viết...',
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ script: 'sub' }, { script: 'super' }],
                        [{ indent: '-1' }, { indent: '+1' }],
                        [{ direction: 'rtl' }],
                        [{ color: [] }, { background: [] }],
                        [{ align: [] }],
                        ['link', 'image', 'video'],
                        ['clean']
                    ]
                }
            });

            // Gắn nội dung từ Quill vào hidden input khi submit form
            const form = document.getElementById('postForm');
            const contentFileInput = document.getElementById('content_file');
            const fileWarning = document.getElementById('fileWarning');

            contentFileInput.addEventListener('change', function() {
                if (contentFileInput.files.length > 0) {
                    fileWarning.style.display = 'block';
                } else {
                    fileWarning.style.display = 'none';
                }
            });
            
            form.addEventListener('submit', function(e) {
                if (contentFileInput.files.length > 0) {
                    // Nếu có file, không lấy nội dung từ editor
                    document.getElementById('hiddenContent').value = '';
                } else {
                    // Nếu không có file, lấy nội dung từ Quill
                    document.getElementById('hiddenContent').value = quill.root.innerHTML;
                }
            });
        });
    </script>
</body>
</html>