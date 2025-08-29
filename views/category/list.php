<h2>Quản lý danh mục</h2>
<a href="index.php?action=create_category_form">Thêm danh mục mới</a>
<br><br>
<table border="1">
    <thead>
        <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($categories as $category): ?>
            <tr>
                <td><?= htmlspecialchars($category['category_id']) ?></td>
                <td><?= htmlspecialchars($category['category_name']) ?></td>
                <td>
                    <a href="index.php?action=edit_category_form&id=<?= htmlspecialchars($category['category_id']) ?>">Sửa</a>
                    <a href="index.php?action=delete_category&id=<?= htmlspecialchars($category['category_id']) ?>" onclick="return confirm('Bạn có chắc chắn muốn xóa?');">Xóa</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>