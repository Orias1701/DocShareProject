<h2>Quản lý Thông tin người dùng</h2>
<a href="index.php?action=create_user_info_form">Thêm Thông tin người dùng mới</a>
<br><br>
<table border="1">
    <thead>
        <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Họ và tên</th>
            <th>Avatar URL</th>
            <th>Bio</th>
            <th>Ngày sinh</th>
            <th>Thao tác</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($userInfos as $userInfo): ?>
            <tr>
                <td><?= htmlspecialchars($userInfo['user_id']) ?></td>
                <td><?= htmlspecialchars($userInfo['username']) ?></td>
                <td><?= htmlspecialchars($userInfo['email']) ?></td>
                <td><?= htmlspecialchars($userInfo['full_name']) ?></td>
                <td><?= htmlspecialchars($userInfo['avatar_url'] ?? 'N/A') ?></td>
                <td><?= htmlspecialchars($userInfo['bio'] ?? 'N/A') ?></td>
                <td><?= htmlspecialchars($userInfo['birth_date'] ?? 'N/A') ?></td>
                <td>
                    <a href="index.php?action=edit_user_info_form&id=<?= htmlspecialchars($userInfo['user_id']) ?>">Sửa</a>
                    <a href="index.php?action=delete_user_info&id=<?= htmlspecialchars($userInfo['user_id']) ?>" onclick="return confirm('Bạn có chắc chắn muốn xóa?');">Xóa</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>