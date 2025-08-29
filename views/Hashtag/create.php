<h2>Thêm Hashtag mới</h2>
<form action="index.php?action=create_hashtag" method="POST">
    <label for="hashtag_name">Tên Hashtag:</label>
    <!-- Chỉ cần set value="#" -->
    <input type="text" id="hashtag_name" name="hashtag_name" value="#" required>
    <br><br>
    <button type="submit">Thêm</button>
</form>

<!-- 
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const input = document.getElementById('hashtag_name');
        
        input.addEventListener('input', function() {
            // Lấy giá trị hiện tại của ô nhập liệu
            let value = this.value;
            
            // Nếu ký tự đầu tiên không phải là '#'
            if (value.length > 0 && value[0] !== '#') {
                // Thêm '#' vào đầu chuỗi
                this.value = '#' + value;
            }
        });
    });
</script> -->