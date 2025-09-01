<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Danh sách Report</title>
<style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
</style>
</head>
<body>

<h1>Danh sách tất cả Report</h1>

<table>
    <thead>
        <tr>
            <th>Report ID</th>
            <th>Bài viết</th>
            <th>Người báo cáo</th>
            <th>Lý do</th>
            <th>Ngày báo cáo</th>
        </tr>
    </thead>
    <tbody>
        <?php if(!empty($reports)): ?>
            <?php foreach($reports as $r): ?>
                <tr>
                    <td><?php echo htmlspecialchars($r['report_id']); ?></td>
                    <td><?php echo htmlspecialchars($r['post_title']); ?></td>
                    <td><?php echo htmlspecialchars($r['full_name']); ?></td>
                    <td><?php echo htmlspecialchars($r['reason']); ?></td>
                    <td><?php echo htmlspecialchars($r['created_at']); ?></td>
                </tr>
            <?php endforeach; ?>
        <?php else: ?>
            <tr><td colspan="5">Chưa có report nào</td></tr>
        <?php endif; ?>
    </tbody>
</table>

</body>
</html>
