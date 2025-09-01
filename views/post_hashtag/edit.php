<h2>Sửa hashtag cho bài viết</h2>
<form action="index.php?action=update_post_hashtag" method="POST">
    <input type="hidden" name="post_id" value="<?= htmlspecialchars($_GET['post_id']) ?>">
    <input type="hidden" name="old_hashtag_id" value="<?= htmlspecialchars($_GET['old_hashtag_id']) ?>">
    
    <label>Chọn hashtag mới:</label>
    <select name="new_hashtag_id">
        <?php foreach ($allHashtags as $h): ?>
            <option value="<?= htmlspecialchars($h['hashtag_id']) ?>"><?= htmlspecialchars($h['hashtag_name']) ?></option>
        <?php endforeach; ?>
    </select>
    <button type="submit">Cập nhật</button>
</form>
