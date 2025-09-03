<h2>Thêm Hashtag mới</h2>
<form action="index.php?action=create_hashtag" method="POST">
    <label for="hashtag_name">Tên Hashtag:</label>
    <!-- Chỉ cần set value="#" -->
    <input type="text" id="hashtag_name" name="hashtag_name" value="#" required>
    <br><br>
    <button type="submit">Thêm</button>
</form>