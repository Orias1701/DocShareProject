<?php
// views/postcomment/comments_by_post.php
// Debug: Kiểm tra biến $comments
error_log("Comments in comments_by_post.php: " . print_r($comments, true));

if (empty($comments)) {
    echo "<p>Chưa có bình luận nào.</p>";
} else {
    function displayComments($comments, $level = 0)
    {
        foreach ($comments as $c) {
            $margin = $level * 30;

            echo "<div class='comment-box' style='margin-left: {$margin}px; border-left:1px solid #ddd; padding-left:10px;'>";
            echo "<p><strong>" . htmlspecialchars($c['full_name'] ?? 'Unknown User') . ":</strong> " . nl2br(htmlspecialchars($c['content'])) . "</p>";
            echo "<small>Ngày: " . htmlspecialchars($c['created_at']) . "</small>";

            if (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $c['user_id']) {
                echo " | <a href='index.php?action=edit_comment&id=" . $c['comment_id'] . "'>Sửa</a>";
                echo " | <a href='index.php?action=delete_comment&id=" . $c['comment_id'] . "' onclick=\"return confirm('Xóa comment này?')\">Xóa</a>";
            }

            if (isset($_SESSION['user_id'])) {
                echo " | <a href='#' class='reply-toggle' data-id='" . $c['comment_id'] . "'>Trả lời</a>";
                echo "
                <form class='reply-form' id='reply-form-{$c['comment_id']}' method='POST' action='index.php?action=create_comment' style='display:none; margin-top:10px;'>
                    <input type='hidden' name='post_id' value='" . htmlspecialchars($_GET['post_id']) . "'>
                    <input type='hidden' name='parent_id' value='" . $c['comment_id'] . "'>
                    <textarea name='content' placeholder='Nhập phản hồi...' required></textarea><br>
                    <button type='submit'>Gửi phản hồi</button>
                </form>";
            }

            echo "</div><hr>";

            // Hiển thị reply con (nếu có)
            if (!empty($c['replies'])) {
                displayComments($c['replies'], $level + 1);
            }
        }
    }

    // Hiển thị bình luận gốc
    displayComments($comments);
}
?>

<!-- Form thêm comment gốc -->
<?php if (isset($_SESSION['user_id'])): ?>
    <form class="comment-form" method="POST" action="index.php?action=create_comment" style="margin-top:20px;">
        <input type="hidden" name="post_id" value="<?php echo htmlspecialchars($_GET['post_id']); ?>">
        <textarea name="content" placeholder="Nhập bình luận..." required></textarea><br>
        <button type="submit">Gửi bình luận</button>
    </form>
<?php else: ?>
    <p><a href="index.php?action=login">Đăng nhập</a> để bình luận.</p>
<?php endif; ?>

<!-- JS toggle reply form -->
<script>
    document.addEventListener("DOMContentLoaded", function() {
        document.querySelectorAll(".reply-toggle").forEach(function(btn) {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                let form = document.getElementById("reply-form-" + this.dataset.id);
                form.style.display = form.style.display === "none" ? "block" : "none";
            });
        });
    });
</script>