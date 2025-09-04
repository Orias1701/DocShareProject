<!-- views/register.php -->
<?php if (session_status() === PHP_SESSION_NONE) session_start(); ?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Đăng ký</title>
</head>

<body>
    <h2>Đăng ký</h2>
    <form method="post" action="index.php?action=register_post">
        <input type="text" name="username" placeholder="Tên người dùng" required><br>
        <input type="email" name="email" placeholder="Email" required><br>
        <input type="password" name="password" placeholder="Mật khẩu" required><br>
        <button type="submit">Đăng ký</button>
    </form>
    <?php if (!empty($error)) echo "<p style='color:red'>$error</p>"; ?>
    <a href="index.php?action=login">Đã có tài khoản? Đăng nhập</a>
</body>

</html>