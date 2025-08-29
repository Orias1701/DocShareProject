<h2>Chỉnh sửa Hashtag</h2>
<form action="index.php?action=update_hashtag" method="POST">
    <input type="hidden" name="hashtag_id" value="<?= htmlspecialchars($hashtag['hashtag_id']) ?>">
    <label for="hashtag_name">Tên Hashtag:</label>
    <input type="text" id="hashtag_name" name="hashtag_name" value="<?= htmlspecialchars($hashtag['hashtag_name']) ?>" required>
    <br><br>
    <button type="submit">Cập nhật</button>
</form>