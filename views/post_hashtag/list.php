<h2>Hashtags của bài viết <?= htmlspecialchars($postId) ?></h2>
<a href="index.php?action=create_post_hashtag_form&post_id=<?= $postId ?>">+ Thêm hashtag</a>
<br><br>
<table border="1">
    <thead>
        <tr>
            <th>ID</th>
            <th>Tên hashtag</th>
            <th>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($hashtags as $h): ?>
            <tr>
                <td><?= htmlspecialchars($h['hashtag_id']) ?></td>
                <td><?= htmlspecialchars($h['hashtag_name']) ?></td>
                <td>
                    <a href="index.php?action=edit_post_hashtag_form&post_id=<?= $postId ?>&old_hashtag_id=<?= $h['hashtag_id'] ?>">Sửa</a>
                    <a href="index.php?action=delete_post_hashtag&post_id=<?= $postId ?>&hashtag_id=<?= $h['hashtag_id'] ?>" onclick="return confirm('Bạn có chắc muốn xóa?');">Xóa</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>
