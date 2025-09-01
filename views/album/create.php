<h2>Thêm album mới</h2>

<form action="index.php?action=create_album" method="POST">
    <label for="album_name">Tên album:</label>
    <input type="text" id="album_name" name="album_name" required>
    <br><br>

    <label for="description">Mô tả:</label><br>
    <textarea id="description" name="description"></textarea>
    <br><br>

    <button type="submit">Thêm</button>
</form>
