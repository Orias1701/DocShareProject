<h2>Thêm hashtag cho bài viết</h2>
<form action="index.php?action=create_post_hashtag" method="POST">
    <input type="hidden" name="post_id" value="<?= htmlspecialchars($_GET['post_id']) ?>">
    <label>Tên hashtag:</label>
    <input type="text" name="hashtag_name" required>
    <button type="submit">Thêm</button>
</form>
