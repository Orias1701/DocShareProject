<h2>Chỉnh sửa bài viết</h2>
<form action="index.php?action=update_post" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="post_id" value="<?= htmlspecialchars($post['post_id']) ?>">

    <label for="title">Tiêu đề:</label>
    <input type="text" id="title" name="title" value="<?= htmlspecialchars($post['title']) ?>" required>
    <br><br>
    
    <label for="content">Nội dung:</label>
    <textarea id="content" name="content" required><?= htmlspecialchars($post['content']) ?></textarea>
    <br><br>
    
    <label for="album_id">Chọn Album:</label>
    <select id="album_id" name="album_id" required>
        <?php foreach ($albums as $album): ?>
            <option value="<?= htmlspecialchars($album['album_id']) ?>"
                <?= ($album['album_id'] === $post['album_id']) ? 'selected' : '' ?>>
                <?= htmlspecialchars($album['album_name']) ?>
            </option>
        <?php endforeach; ?>
    </select>
    <br><br>

    <label for="category_id">Chọn Thể loại:</label>
    <select id="category_id" name="category_id" required>
        <?php foreach ($categories as $category): ?>
            <option value="<?= htmlspecialchars($category['category_id']) ?>"
                <?= ($category['category_id'] === $post['category_id']) ? 'selected' : '' ?>>
                <?= htmlspecialchars($category['category_name']) ?>
            </option>
        <?php endforeach; ?>
    </select>
    <br><br>
    
    <label for="banner">Banner (Upload hình mới nếu muốn):</label>
    <input type="file" id="banner" name="banner" accept="image/*">
    <br>
    <?php if (!empty($post['banner_url'])): ?>
        <p>Banner hiện tại:</p>
        <img src="<?= htmlspecialchars($post['banner_url']) ?>" alt="Banner" style="max-width: 300px;">
    <?php endif; ?>
    <br><br>

    <button type="submit">Cập nhật bài viết</button>
</form>

<!-- Nhúng CKEditor 5 -->
<script src="https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js"></script>
<script>
    ClassicEditor
        .create(document.querySelector('#content'), {
            ckfinder: {
                uploadUrl: 'upload.php' // đường dẫn upload ảnh
            }
        })
        .catch(error => {
            console.error(error);
        });
</script>
