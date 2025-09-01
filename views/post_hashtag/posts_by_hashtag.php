<?php if (empty($posts)): ?> 
    <div class="card">
        <p>Không có bài viết nào với hashtag này.</p>
    </div>
<?php else: ?>
    <div class="post-list">
        <?php foreach ($posts as $post): ?>
            <div class="card">
                <h2><?php echo htmlspecialchars($post['title']); ?></h2>
                <p><?php echo nl2br(htmlspecialchars($post['content'])); ?></p>
                <small>
                    Album: <?php echo htmlspecialchars($post['album_name']); ?> | 
                    Người đăng: <?php echo htmlspecialchars($post['username']); ?> | 
                    Ngày đăng: <?php echo $post['created_at']; ?>
                </small>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
