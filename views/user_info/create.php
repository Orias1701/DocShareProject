<h2>Thêm thông tin User</h2>
<form action="index.php?action=create_user_info" method="POST" enctype="multipart/form-data">
    <label for="user_id">Chọn User:</label>
    <select name="user_id" required>
        <?php foreach ($availableUsers as $user): ?>
            <option value="<?= htmlspecialchars($user['user_id']) ?>">
                <?= htmlspecialchars($user['username']) ?> - <?= htmlspecialchars($user['email']) ?>
            </option>
        <?php endforeach; ?>
    </select>
    <br><br>

    <label for="full_name">Họ và tên:</label>
    <input type="text" name="full_name" required>
    <br><br>

    <label for="bio">Tiểu sử:</label>
    <textarea name="bio"></textarea>
    <br><br>

    <label for="birth_date">Ngày sinh:</label>
    <input type="date" name="birth_date">
    <br><br>

    <label for="avatar">Ảnh đại diện:</label>
    <input type="file" name="avatar" accept="image/*">
    <br><br>

    <button type="submit">Lưu</button>
</form>