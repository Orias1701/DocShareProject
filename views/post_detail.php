<?php
// views/post_detail.php
// (tạm: server-side fallback nếu muốn render chi tiết page — hiện tại modal dùng AJAX)
if (!isset($data)) {
    echo "<div class='card'>Không có dữ liệu</div>";
    return;
}
$post = $data['post'];
?>
<div class="card">
  <h2><?php echo htmlspecialchars($post['title']); ?></h2>
  <p class="muted">Tác giả: <?php echo htmlspecialchars($post['author_name'] ?? '—'); ?> — Album: <?php echo htmlspecialchars($post['album_name'] ?? '—'); ?></p>
  <div><?php echo nl2br(htmlspecialchars($post['content'])); ?></div>

  <h3>Hashtags</h3>
  <?php if (!empty($data['hashtags'])): foreach ($data['hashtags'] as $h): ?>
    <span class="badge"><?php echo htmlspecialchars($h['hashtag_name']); ?></span>
  <?php endforeach; else: ?>
    <div class="muted">Không có hashtag</div>
  <?php endif; ?>

  <h3>Bình luận</h3>
  <?php if (!empty($data['comments'])): foreach ($data['comments'] as $c): ?>
    <div class="comment"><strong><?php echo htmlspecialchars($c['full_name'] ?? $c['user_id']); ?></strong>: <?php echo nl2br(htmlspecialchars($c['content'])); ?></div>
  <?php endforeach; else: ?>
    <div class="muted">Không có bình luận</div>
  <?php endif; ?>
</div>
