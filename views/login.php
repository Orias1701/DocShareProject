<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><title>Login</title></head>
<body>
  <h2>Đăng nhập</h2>
  <form method="post" action="index.php?action=login">
    <input type="email" name="email" placeholder="Email" required><br>
    <input type="password" name="password" placeholder="Mật khẩu" required><br>
    <button type="submit">Đăng nhập</button>
  </form>
  <?php if (!empty($error)) echo "<p style='color:red'>$error</p>"; ?>
  <a href="index.php?action=register">Chưa có tài khoản? Đăng ký</a>
</body>
</html>
