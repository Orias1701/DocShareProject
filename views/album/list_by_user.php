<h2>Album của user: <?= htmlspecialchars($_GET['user_id']) ?></h2>

<a href="index.php?action=list_all_albums">Xem tất cả album</a>
<br><br>

<table border="1">
    <thead>
        <tr>
            <th>ID</th>
            <th>Tên album</th>
            <th>Mô tả</th>
            <th>Ngày tạo</th>
        </tr>
    </thead>
    <tbody>
        <?php if (!empty($albums)): ?>
            <?php foreach ($albums as $album): ?>
                <tr>
                    <td><?= htmlspecialchars($album['album_id']) ?></td>
                    <td><?= htmlspecialchars($album['album_name']) ?></td>
                    <td><?= htmlspecialchars($album['description']) ?></td>
                    <td><?= htmlspecialchars($album['created_at']) ?></td>
                </tr>
            <?php endforeach; ?>
        <?php else: ?>
            <tr>
                <td colspan="4">Không có album nào</td>
            </tr>
        <?php endif; ?>
    </tbody>
</table>
