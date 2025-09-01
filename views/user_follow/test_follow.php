<!-- <?php
// Giả lập user đăng nhập
$_SESSION['user_id'] = 'USER0000000001';
$loggedInUserId = $_SESSION['user_id'];

// Giả sử muốn follow user khác
$targetUserId = 'USER0000000002';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Test Follow</title>
</head>
<body>
    <h2>Test Follow/Unfollow</h2>
    <button id="followBtn" data-follower-id="<?= $loggedInUserId ?>" data-following-id="<?= $targetUserId ?>">Theo dõi</button>

<script>
document.getElementById("followBtn").addEventListener("click", function () {
    const btn = this;
    const followerId = btn.getAttribute("data-follower-id");
    const followingId = btn.getAttribute("data-following-id");

    fetch("index.php?action=toggle_follow", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "follower_id=" + followerId + "&following_id=" + followingId
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "followed") {
            btn.innerText = "Đang theo dõi";
        } else if (data.status === "need_confirm") {
            if (confirm("Bạn có chắc muốn hủy theo dõi không?")) {
                fetch("index.php?action=toggle_follow", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: "follower_id=" + followerId + "&following_id=" + followingId + "&confirm_unfollow=yes"
                })
                .then(r => r.json())
                .then(result => {
                    if (result.status === "unfollowed") {
                        btn.innerText = "Theo dõi";
                    }
                });
            }
        } else if (data.status === "unfollowed") {
            btn.innerText = "Theo dõi";
        }
    });
});
</script>
</body>
</html> -->
