<h2>Chỉnh sửa album</h2>

<form action="index.php?action=update_album" method="POST">
    <input type="hidden" name="album_id" value="<?= htmlspecialchars($album['album_id']) ?>">

    <label for="album_name">Tên album:</label>
    <input type="text" id="album_name" name="album_name" value="<?= htmlspecialchars($album['album_name']) ?>" required>
    <br><br>

    <label for="description">Mô tả:</label><br>
    <textarea id="description" name="description"><?= htmlspecialchars($album['description']) ?></textarea>
    <br><br>

    <button type="submit">Cập nhật</button>
</form>
