<?php
// $comments được truyền từ controller
if (empty($comments)) {
    echo "<p>Chưa có bình luận nào.</p>";
} else {
    foreach ($comments as $c) {
        echo "<div class='comment-box'>";
        echo "<p><strong>" . htmlspecialchars($c['full_name']) . ":</strong> " . htmlspecialchars($c['content']) . "</p>";
        echo "<small>Ngày: " . htmlspecialchars($c['created_at']) . "</small>";

        // Nếu user login và là người tạo thì cho phép sửa/xóa
        if (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $c['user_id']) {
            echo " | <a href='index.php?action=edit_comment&id=" . $c['comment_id'] . "'>Sửa</a>";
            echo " | <a href='index.php?action=delete_comment&id=" . $c['comment_id'] . "' onclick=\"return confirm('Xóa comment này?')\">Xóa</a>";
        }

        echo "</div><hr>";
    }
}
?>

<!-- Form thêm comment mới -->
<?php if (isset($_SESSION['user_id'])): ?>
    <form class="comment-form" method="POST" action="index.php?action=create_comment">
        <!-- Trường ẩn để gửi post_id -->
        <input type="hidden" name="post_id" value="<?php echo htmlspecialchars($_GET['post_id']); ?>">
        <textarea name="content" placeholder="Nhập bình luận..." required></textarea><br>
        <button type="submit">Gửi bình luận</button>
    </form>
<?php else: ?>
    <p><a href="index.php?action=login">Đăng nhập</a> để bình luận.</p>
<?php endif; ?>
