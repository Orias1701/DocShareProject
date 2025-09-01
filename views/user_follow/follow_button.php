<!-- <button id="followBtn" data-following-id="123">Theo dõi</button>

<script>
document.getElementById("followBtn").addEventListener("click", function () {
    const btn = this;
    const followingId = btn.getAttribute("data-following-id");

    fetch("index.php?action=toggleFollow", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "follower_id=1&following_id=" + followingId
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "followed") {
            btn.innerText = "Đang theo dõi";
        } else if (data.status === "need_confirm") {
            if (confirm("Bạn có chắc chắn muốn hủy theo dõi không?")) {
                // Gửi lại request kèm confirm
                fetch("index.php?action=toggleFollow", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: "follower_id=1&following_id=" + followingId + "&confirm_unfollow=yes"
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
</script> -->
