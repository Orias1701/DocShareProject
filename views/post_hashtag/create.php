<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thêm Hashtag cho Bài Viết</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
        }

        input[type="text"] {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }

        button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }

        button:hover {
            background-color: #45a049;
        }

        .message {
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #ccc;
            background-color: #f9f9f9;
        }

        .error {
            color: red;
            border-color: red;
            background-color: #ffe6e6;
        }
    </style>
</head>

<body>
    <h2>Thêm Hashtag cho Bài Viết <?php echo htmlspecialchars($_GET['post_id'] ?? 'Không xác định'); ?></h2>
    <form method="POST" action="index.php?action=create_post_hashtag">
        <input type="hidden" name="post_id" value="<?php echo htmlspecialchars($_GET['post_id'] ?? ''); ?>">
        <div class="form-group">
            <label for="hashtag_name">Hashtag (cách nhau bằng dấu phẩy):</label>
            <input type="text" id="hashtag_name" name="hashtag_name" value="#" placeholder="#tag1,#tag2,#tag3" required>
        </div>
        <button type="submit">Thêm Hashtag</button>
    </form>

    <?php if (!empty($message)): ?>
        <div class="message <?php echo strpos($message, 'Lỗi') === 0 ? 'error' : ''; ?>">
            <?php echo htmlspecialchars($message); ?>
        </div>
    <?php endif; ?>

    <script>
        const hashtagInput = document.getElementById('hashtag_name');

        // Xử lý khi nhập để đảm bảo định dạng hashtag và giữ dấu phẩy
        hashtagInput.addEventListener('input', function(e) {
            let value = e.target.value;
            // Tách chuỗi thành các hashtag bằng dấu phẩy
            let hashtags = value.split(',').map(tag => tag.trim());
            // Đảm bảo mỗi hashtag bắt đầu bằng # và không chứa ký tự không hợp lệ
            hashtags = hashtags.map(tag => {
                if (!tag.startsWith('#')) {
                    tag = '#' + tag.replace(/^#+/, '');
                }
                // Chỉ giữ #, chữ cái, số, dấu gạch dưới trong từng hashtag
                return tag.replace(/[^#a-zA-Z0-9_]/g, '');
            });
            // Nối lại với dấu phẩy và khoảng trắng thẩm mỹ
            e.target.value = hashtags.join(', ');
        });

        // Kiểm tra trước khi submit
        document.querySelector('form').addEventListener('submit', function(e) {
            const hashtags = hashtagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            if (hashtags.length === 0) {
                e.preventDefault();
                alert('Vui lòng nhập ít nhất một hashtag.');
                return;
            }
            for (let hashtag of hashtags) {
                if (!hashtag.match(/^#[a-zA-Z0-9_]+$/)) {
                    e.preventDefault();
                    alert('Mỗi hashtag phải bắt đầu bằng # và chỉ chứa chữ cái, số, hoặc dấu gạch dưới.');
                    return;
                }
            }
        });
    </script>
</body>

</html>