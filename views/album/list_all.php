<h2>Quản lý album</h2>

<a href="index.php?action=create_album_form">Thêm album mới</a>
<br><br>

<table border="1">
    <thead>
        <tr>
            <th>ID</th>
            <th>Tên album</th>
            <th>Mô tả</th>
            <th>User ID</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($albums as $album): ?>
            <tr>
                <td><?= htmlspecialchars($album['album_id']) ?></td>
                <td><?= htmlspecialchars($album['album_name']) ?></td>
                <td><?= htmlspecialchars($album['description']) ?></td>
                <td><?= htmlspecialchars($album['user_id']) ?></td>
                <td><?= htmlspecialchars($album['created_at']) ?></td>
                <td>
                    <a href="index.php?action=edit_album_form&id=<?= htmlspecialchars($album['album_id']) ?>">Sửa</a>
                    <a href="index.php?action=delete_album&id=<?= htmlspecialchars($album['album_id']) ?>" onclick="return confirm('Bạn có chắc chắn muốn xóa?');">Xóa</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>
