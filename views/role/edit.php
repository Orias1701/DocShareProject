<h2>Chỉnh sửa Quyền hạn</h2>
<form action="index.php?action=update_role" method="POST">
    <input type="hidden" name="role_id" value="<?= htmlspecialchars($role['role_id']) ?>">
    <label for="role_name">Tên Quyền hạn:</label>
    <input type="text" id="role_name" name="role_name" value="<?= htmlspecialchars($role['role_name']) ?>" required>
    <br><br>
    <button type="submit">Cập nhật</button>
</form>