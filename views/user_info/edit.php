<h2>Chỉnh sửa Thông tin người dùng</h2>

<form action="index.php?action=update_user_info" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="user_id" value="<?= htmlspecialchars($userInfo['user_id']) ?>">

    <p><strong>User ID:</strong> <?= htmlspecialchars($userInfo['user_id']) ?></p>
    <p><strong>Username:</strong> <?= htmlspecialchars($userInfo['username']) ?></p>
    <p><strong>Email:</strong> <?= htmlspecialchars($userInfo['email']) ?></p>

    <label for="full_name">Họ và tên:</label>
    <input type="text" id="full_name" name="full_name" 
           value="<?= htmlspecialchars($userInfo['full_name'] ?? '') ?>" required>
    <br><br>

    <label for="avatar">Avatar:</label>
    <input type="file" id="avatar" name="avatar" accept="image/*">
    <br>
    <?php if (!empty($userInfo['avatar_url'])): ?>
        <p>Ảnh hiện tại:</p>
        <img src="<?= htmlspecialchars($userInfo['avatar_url']) ?>" alt="Avatar" width="120">
    <?php endif; ?>
    <br><br>

    <label for="bio">Bio:</label>
    <textarea id="bio" name="bio"><?= htmlspecialchars($userInfo['bio'] ?? '') ?></textarea>
    <br><br>

    <label for="birth_date">Ngày sinh:</label>
    <input type="date" id="birth_date" name="birth_date" 
           value="<?= htmlspecialchars($userInfo['birth_date'] ?? '') ?>">
    <br><br>

    <button type="submit">Cập nhật</button>
</form>