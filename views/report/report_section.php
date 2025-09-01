<?php
// report_section.php
if (!isset($post)) return;

$hasReported = false;
$userReason = '';

if (isset($_SESSION['user_id'])) {
    require_once __DIR__ . '/../../models/PostReport.php';
    $postReport = new PostReport();
    $userReport = $postReport->getUserReport($post['post_id'], $_SESSION['user_id']);
    if (!empty($userReport)) {
        $hasReported = true;
        $userReason = $userReport['reason'];
    }
}
?>

<div class="report-section" style="margin-top: 20px;">
<?php if (isset($_SESSION['user_id'])): ?>
    <?php if ($hasReported): ?>
        <p style="color:red;">Bạn đã report bài viết này.</p>
        <p>Lý do: <?php echo htmlspecialchars($userReason); ?></p>
    <?php else: ?>
        <button id="reportBtn" style="margin-top:5px;">Report bài viết</button>
        <form id="reportForm" action="index.php?action=toggle_report" method="POST" style="display:none;">
            <input type="hidden" name="post_id" value="<?php echo $post['post_id']; ?>">
            <label for="reason">Lý do report:</label><br>
            <textarea name="reason" required></textarea>
            <button type="submit">Gửi report</button>
        </form>

        <script>
            const reportBtn = document.getElementById('reportBtn');
            const reportForm = document.getElementById('reportForm');

            reportBtn.addEventListener('click', () => {
                reportForm.style.display = reportForm.style.display === 'none' ? 'block' : 'none';
            });
        </script>
    <?php endif; ?>
<?php else: ?>
    <a href="index.php?action=login" style="text-decoration:none;">Đăng nhập để report</a>
<?php endif; ?>
</div>
