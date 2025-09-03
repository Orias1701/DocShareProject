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
            <label for="hashtag_name">Tên Hashtag:</label>
            <input type="text" id="hashtag_name" name="hashtag_name" value="#" required>
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

        // Đảm bảo ô input luôn bắt đầu bằng #
        hashtagInput.addEventListener('input', function(e) {
            if (!e.target.value.startsWith('#')) {
                e.target.value = '#' + e.target.value.replace(/^#+/, '');
            }
            // Chỉ cho phép chữ cái, số, dấu gạch dưới sau #
            e.target.value = e.target.value.replace(/[^#a-zA-Z0-9_]/g, '');
        });

        // Ngăn submit nếu hashtag không hợp lệ
        document.querySelector('form').addEventListener('submit', function(e) {
            const hashtag = hashtagInput.value;
            if (!hashtag.match(/^#[a-zA-Z0-9_]+$/)) {
                e.preventDefault();
                alert('Hashtag phải bắt đầu bằng # và chỉ chứa chữ cái, số, hoặc dấu gạch dưới.');
            }
        });
    </script>
</body>

</html>