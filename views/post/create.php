<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Thêm bài viết mới</title>
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        form {
            max-width: 800px;
            margin: 0 auto;
        }

        #editor {
            height: 300px;
            background: #fff;
            border: 1px solid #ccc;
        }

        .warning {
            color: red;
            font-size: 0.9em;
            margin-top: 5px;
            display: none;
        }
    </style>
</head>

<body>
    <h2>Thêm bài viết mới</h2>
    <form id="postForm" action="index.php?action=create_post" method="POST" enctype="multipart/form-data">
        <label for="title">Tiêu đề:</label>
        <input type="text" id="title" name="title" required>
        <br><br>

        <label for="content">Nội dung:</label>
        <div id="editor"></div>
        <input type="hidden" name="content" id="hiddenContent">
        <br><br>

        <label for="content_file">Hoặc upload file (PDF):</label>
        <input type="file" id="content_file" name="content_file" accept=".pdf">
        <div id="fileWarning" class="warning">Lưu ý: Upload file sẽ ghi đè nội dung trong trình soạn thảo!</div>
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

    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script>
        let quill;

        document.addEventListener("DOMContentLoaded", function() {
            quill = new Quill('#editor', {
                theme: 'snow',
                placeholder: 'Nhập nội dung bài viết...',
                modules: {
                    toolbar: [
                        [{
                            header: [1, 2, 3, false]
                        }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{
                            list: 'ordered'
                        }, {
                            list: 'bullet'
                        }],
                        [{
                            script: 'sub'
                        }, {
                            script: 'super'
                        }],
                        [{
                            'align': []
                        }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });

            const form = document.getElementById('postForm');
            form.onsubmit = function() {
                const fileInput = document.getElementById('content_file');
                if (fileInput.files.length > 0) {
                    document.getElementById('hiddenContent').value = '';
                } else {
                    document.getElementById('hiddenContent').value = quill.root.innerHTML;
                }
            };

            const contentFile = document.getElementById('content_file');
            const editor = document.getElementById('editor');
            const fileWarning = document.getElementById('fileWarning');

            contentFile.addEventListener('change', function() {
                if (this.files.length > 0) {
                    fileWarning.style.display = 'block';
                    editor.style.display = 'none';
                } else {
                    fileWarning.style.display = 'none';
                    editor.style.display = 'block';
                }
            });

            quill.on('text-change', function() {
                if (contentFile.files.length > 0) {
                    fileWarning.textContent = "Cảnh báo: Nội dung bạn đang gõ sẽ bị bỏ qua vì bạn đã chọn file PDF!";
                    fileWarning.style.display = 'block';
                }
            });
        });
    </script>
</body>

</html>