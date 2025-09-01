<?php
if (!$comment) {
    echo "<p>Comment không tồn tại.</p>";
    return;
}
?>

<h3>Sửa bình luận</h3>
<form method="POST" action="index.php?action=update_comment">
    <input type="hidden" name="comment_id" value="<?php echo htmlspecialchars($comment['comment_id']); ?>">
    <textarea name="content" required><?php echo htmlspecialchars($comment['content']); ?></textarea><br>
    <button type="submit">Cập nhật</button>
</form>
