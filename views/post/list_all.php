<style>
    /* CSS để căn giữa và giới hạn kích thước ảnh trong cột nội dung */
    .content-cell img {
        display: block;
        max-width: 100%;
        max-height: 350px;
        margin: 0 auto;
    }
</style>

<h2>Tất cả bài viết</h2>
<a href="index.php?action=create_post_form">Thêm bài viết mới</a>
<br><br>
<table border="1">
    <thead>
        <tr>
            <th>Mã bài</th>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Nội dung</th>
            <th>Album</th>
            <th>Thể loại</th>
            <th>Banner</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($posts as $post): ?>
            <tr>
                <td><?= $post['post_id'] ?></td>
                <td><?= htmlspecialchars($post['title']) ?></td>
                <td><?= htmlspecialchars($post['username']) ?></td>
                <td class="content-cell">
                    <?php if (isset($post['content']) && !empty($post['content'])): ?>
                        <?= $post['content'] ?>
                    <?php else: ?>
                        Không có nội dung.
                    <?php endif; ?>
                </td>
                <td><?= htmlspecialchars($post['album_name']) ?></td>
                <td><?= htmlspecialchars($post['category_name']) ?></td>
                <td><img src="<?= htmlspecialchars($post['banner_url']) ?>" alt="Banner" style="max-width: 100px;"></td>
                <td><?= htmlspecialchars($post['created_at']) ?></td>
                <td>
                    <a href="index.php?action=edit_post_form&id=<?= htmlspecialchars($post['post_id']) ?>">Sửa</a>
                    <a href="index.php?action=delete_post&id=<?= htmlspecialchars($post['post_id']) ?>" onclick="return confirm('Bạn có chắc chắn muốn xóa?');">Xóa</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>