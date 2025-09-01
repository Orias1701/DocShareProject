<?php
if (empty($userInfo)) {
    echo "<p>Người dùng không tồn tại.</p>";
    return;
}

$myUserId = $_SESSION['user_id'] ?? null;

// Lấy trạng thái follow từ controller trước khi render view
$isFollowing = $myUserId && $myUserId !== $userInfo['user_id'] ? $isFollowing ?? false : false;
?>

<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title><?php echo htmlspecialchars($userInfo['full_name']); ?></title>
<style>
    body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        display: flex;
        justify-content: center;
        min-height: 100vh; /* chiều cao tối thiểu 100% viewport */
        background-color: #f9f9f9;
    }

    .profile-container { 
        width: 100%;
        max-width: 600px; 
        border: 1px solid #ddd; 
        padding: 20px; 
        border-radius: 8px; 
        text-align: center; /* căn giữa nội dung bên trong */
        background-color: #fff;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .avatar { 
        width: 120px; 
        height: 120px; 
        border-radius: 50%; 
        object-fit: cover; 
        margin-bottom: 15px; 
    }

    .full-name { 
        font-size: 1.8em; 
        margin-bottom: 10px; 
    }

    .bio { 
        font-size: 1em; 
        color: #555; 
        margin-bottom: 10px; 
    }

    .birth-date { 
        font-size: 0.9em; 
        color: #777; 
        margin-bottom: 15px; 
    }

    .follow-button { 
        padding: 8px 20px; 
        border: none; 
        border-radius: 4px; 
        background-color: #007bff; 
        color: #fff; 
        cursor: pointer; 
        font-size: 1em;
    }

    .follow-button.active { 
        background-color: #28a745; 
    }
</style>

</head>
<body>

<div class="profile-container">
    <?php if (!empty($userInfo['avatar_url'])): ?>
        <img src="<?php echo htmlspecialchars($userInfo['avatar_url']); ?>" class="avatar">
    <?php else: ?>
        <img src="https://via.placeholder.com/120" class="avatar">
    <?php endif; ?>

    <div class="full-name"><?php echo htmlspecialchars($userInfo['full_name']); ?></div>

    <!-- Nút follow/unfollow chỉ hiển thị khi không phải chính mình -->
    <?php if ($myUserId && $myUserId !== $userInfo['user_id']): ?>
        <button id="followBtn" class="follow-button <?php echo $isFollowing ? 'active' : ''; ?>" 
                data-user="<?php echo $userInfo['user_id']; ?>">
            <?php echo $isFollowing ? 'Đang theo dõi' : 'Theo dõi'; ?>
        </button>
    <?php endif; ?>

    <?php if (!empty($userInfo['bio'])): ?>
        <div class="bio"><?php echo nl2br(htmlspecialchars($userInfo['bio'])); ?></div>
    <?php endif; ?>
    
    <?php if (!empty($userInfo['birth_date'])): ?>
        <div class="birth-date">Ngày sinh: <?php echo htmlspecialchars($userInfo['birth_date']); ?></div>
    <?php endif; ?>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('followBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const followingId = btn.dataset.user;

        fetch('index.php?action=toggle_follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'following_id=' + encodeURIComponent(followingId)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                if (data.following) {
                    btn.textContent = 'Đang theo dõi';
                    btn.classList.add('active');
                } else {
                    btn.textContent = 'Theo dõi';
                    btn.classList.remove('active');
                }
            } else {
                alert(data.message);
            }
        })
        .catch(err => alert('Có lỗi xảy ra'));
    });
});
</script>

</body>
</html>
