<h2>Quản lý Quyền hạn (Roles)</h2>
<a href="index.php?action=create_role_form">Thêm Quyền hạn mới</a>
<br><br>
<table border="1">
    <thead>
        <tr>
            <th>ID</th>
            <th>Tên Quyền hạn</th>
            <th>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($roles as $role): ?>
            <tr>
                <td><?= htmlspecialchars($role['role_id']) ?></td>
                <td><?= htmlspecialchars($role['role_name']) ?></td>
                <td>
                    <a href="index.php?action=edit_role_form&id=<?= htmlspecialchars($role['role_id']) ?>">Sửa</a>
                    <a href="index.php?action=delete_role&id=<?= htmlspecialchars($role['role_id']) ?>" onclick="return confirm('Bạn có chắc chắn muốn xóa?');">Xóa</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>