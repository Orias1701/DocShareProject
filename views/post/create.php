<h2>Thêm bài viết mới</h2>
<form id="postForm" action="index.php?action=create_post" method="POST" enctype="multipart/form-data">
    <label for="title">Tiêu đề:</label>
    <input type="text" id="title" name="title" required>
    <br><br>
    
    <label for="content">Nội dung:</label>
    <!-- Quill editor container -->
    <div id="editor" style="height: 300px; background: #fff;"></div>
    <!-- Hidden input để lưu dữ liệu thực sự -->
    <input type="hidden" name="content" id="hiddenContent" required>
    <br><br>
    
    <label for="album_id">Chọn Album:</label>
    <select id="album_id" name="album_id" required>
        <?php foreach ($albums as $album): ?>
            <option value="<?= htmlspecialchars($album['album_id']) ?>">
                <?= htmlspecialchars($album['album_name']) ?>
            </option>
        <?php endforeach; ?>
    </select>
    <br><br>

    <label for="category_id">Chọn Thể loại:</label>
    <select id="category_id" name="category_id" required>
        <?php foreach ($categories as $category): ?>
            <option value="<?= htmlspecialchars($category['category_id']) ?>">
                <?= htmlspecialchars($category['category_name']) ?>
            </option>
        <?php endforeach; ?>
    </select>
    <br><br>
    
    <label for="banner">Banner (Upload hình):</label>
    <input type="file" id="banner" name="banner" accept="image/*">
    <br><br>

    <button type="submit">Đăng bài</button>
</form>

<!-- Quill scripts -->
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>

<script>
let quill;

document.addEventListener("DOMContentLoaded", function() {
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

    const form = document.getElementById('postForm');
    form.addEventListener('submit', function(e) {
        // Đồng bộ dữ liệu Quill vào hidden input
        document.getElementById('hiddenContent').value = quill.root.innerHTML;
    });
});
</script>
