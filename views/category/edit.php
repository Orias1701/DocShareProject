<h2>Chỉnh sửa danh mục</h2>
<form action="index.php?action=update_category" method="POST">
    <input type="hidden" name="category_id" value="<?= htmlspecialchars($category['category_id']) ?>">
    <label for="category_name">Tên danh mục:</label>
    <input type="text" id="category_name" name="category_name" value="<?= htmlspecialchars($category['category_name']) ?>" required>
    <br><br>
    <button type="submit">Cập nhật</button>
</form>