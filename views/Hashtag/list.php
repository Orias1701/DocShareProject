<h2>Quản lý Hashtag</h2>
<a href="index.php?action=create_hashtag_form">Thêm Hashtag mới</a>
<br><br>
<table border="1">
    <thead>
        <tr>
            <th>ID</th>
            <th>Tên Hashtag</th>
            <th>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($hashtags as $hashtag): ?>
            <tr>
                <td><?= htmlspecialchars($hashtag['hashtag_id']) ?></td>
                <td><?= htmlspecialchars($hashtag['hashtag_name']) ?></td>
                <td>
                    <a href="index.php?action=edit_hashtag_form&id=<?= htmlspecialchars($hashtag['hashtag_id']) ?>">Sửa</a>
                    <a href="index.php?action=delete_hashtag&id=<?= htmlspecialchars($hashtag['hashtag_id']) ?>" onclick="return confirm('Bạn có chắc chắn muốn xóa?');">Xóa</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>