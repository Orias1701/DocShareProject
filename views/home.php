<?php
// views/home.php
?>
<section class="card full">
  <h2>View A — Thông tin tác giả, album & social (user_infos, user_follows, albums, posts, comments, reactions, reports)</h2>
  <div id="group1-table" class="table-wrap">Đang tải...</div>
</section>

<section class="card full">
  <h2>View B — Bài viết, danh mục & hashtags (posts, user_infos, categories, post_hashtags, albums, comments, reactions, reports)</h2>
  <div id="group2-table" class="table-wrap">Đang tải...</div>
</section>

<!-- modal template (JS sẽ fill) -->
<div id="postModal" class="modal" aria-hidden="true">
  <div class="modal-inner">
    <button id="modalClose" class="modal-close">&times;</button>
    <div id="modalContent">Đang tải...</div>
  </div>
</div>
