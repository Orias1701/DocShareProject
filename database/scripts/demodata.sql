USE doc_share;

-- =====================
-- 1) ROLES
-- =====================
INSERT INTO roles (role_id, role_name) VALUES
('ROLE000', 'Admin'),
('ROLE001', 'Mod'),
('ROLE010', 'Doanh nghiệp'),
('ROLE011', 'Người dùng');

-- =====================
-- 2) USERS (6 người)
-- user_id dạng: USER + 10 chữ số
-- =====================
INSERT INTO users (user_id, username, email, password, role_id) VALUES
('USER0000000000','admin','admin@example.com','adminpass','ROLE000'),
('USER0000000001','nguyenvana','vana@example.com','pass1','ROLE011'),
('USER0000000002','tranthib','thib@example.com','pass2','ROLE011'),
('USER0000000003','phamvand','vand@example.com','pass3','ROLE011'),
('USER0000000004','lethingoc','ngocle@example.com','pass4','ROLE011'),
('USER0000000005','dangminh','minhdang@example.com','pass5','ROLE010');

-- =====================
-- 3) USER_INFOS (tương ứng 6 user)
-- user_infos columns: (user_id, full_name, avatar_url, bio, birth_date)
-- =====================
INSERT INTO user_infos (user_id, full_name, avatar_url, bio, birth_date) VALUES
('USER0000000000','Quản trị viên','/uploads/avatars/admin.jpg','Quản trị hệ thống','1990-01-01'),
('USER0000000001','Nguyễn Văn A','/uploads/avatars/u1.jpg','Sinh viên CNTT, thích chia sẻ tài liệu','1998-05-12'),
('USER0000000002','Trần Thị B','/uploads/avatars/u2.jpg','Đam mê ngôn ngữ và văn học','1997-03-21'),
('USER0000000003','Phạm Văn D','/uploads/avatars/u3.jpg','Nghiên cứu viên kinh tế','1996-07-09'),
('USER0000000004','Lê Thị Ngọc','/uploads/avatars/u4.jpg','Giảng viên môn toán','1995-11-15'),
('USER0000000005','Đặng Minh','/uploads/avatars/u5.jpg','Chuyên viên CNTT tại doanh nghiệp','1994-09-30');

-- =====================
-- 4) USER_FOLLOWS (ngẫu nhiên lẫn nhau) 
-- (follower_id, following_id)
-- =====================
INSERT INTO user_follows (follower_id, following_id) VALUES
('USER0000000001','USER0000000002'),
('USER0000000002','USER0000000003'),
('USER0000000003','USER0000000001'),
('USER0000000004','USER0000000005'),
('USER0000000005','USER0000000001'),
('USER0000000002','USER0000000001'),
('USER0000000003','USER0000000004');

-- =====================
-- 5) HASHTAGS (6 cái)
-- hashtag_id dạng: HASHTAG + 11 chữ số
-- =====================
INSERT INTO hashtags (hashtag_id, hashtag_name) VALUES
('HASHTAG00000000001','#Toán'),
('HASHTAG00000000002','#Văn'),
('HASHTAG00000000003','#TiếngAnh'),
('HASHTAG00000000004','#CNTT'),
('HASHTAG00000000005','#KinhTế'),
('HASHTAG00000000006','#LịchSử');

-- =====================
-- 6) CATEGORIES (6 cái)
-- category_id dạng: CATEGORY + 5 chữ số
-- =====================
INSERT INTO categories (category_id, category_name) VALUES
('CATEGORY00001','Toán học'),
('CATEGORY00002','Ngữ văn'),
('CATEGORY00003','Tiếng Anh'),
('CATEGORY00004','Công nghệ thông tin'),
('CATEGORY00005','Kinh tế'),
('CATEGORY00006','Lịch sử');

-- =====================
-- 7) ALBUMS (10 album chia cho 5 user đầu)
-- album_id dạng: ALBUM + userNumber(10) + seq(3)
-- Ví dụ: user1 (0000000001) album đầu -> ALBUM0000000001001
-- =====================
INSERT INTO albums (album_id, album_name, description, user_id) VALUES
('ALBUM0000000001001','Album Toán - A','Tập hợp bài tập toán cơ bản','USER0000000001'),
('ALBUM0000000001002','Album Văn - A','Sưu tập tác phẩm văn','USER0000000001'),
('ALBUM0000000002001','Album Tiếng Anh - B','Ngữ pháp và bài tập','USER0000000002'),
('ALBUM0000000002002','Album CNTT - B','Thuật toán và code mẫu','USER0000000002'),
('ALBUM0000000003001','Album Kinh tế - C','Bài giảng kinh tế','USER0000000003'),
('ALBUM0000000003002','Album Lịch sử - C','Tổng hợp sự kiện lịch sử','USER0000000003'),
('ALBUM0000000004001','Album Toán nâng cao - D','Chuyên đề giải tích','USER0000000004'),
('ALBUM0000000004002','Album Văn học - D','Phân tích văn học','USER0000000004'),
('ALBUM0000000005001','Album Tiếng Anh nâng cao - E','Đề thi và đáp án','USER0000000005'),
('ALBUM0000000005002','Album Công nghệ - E','Tài liệu hệ thống và mạng','USER0000000005');

-- =====================
-- 8) POSTS (10 bài)
-- posts gán cho 5 album đầu tiên (album seq 001 của user 1..5)
-- post_id pattern: POST + userNumber(10) + albumSeq(3) + categorySeq(5) + postSeq(6)
-- =====================
INSERT INTO posts (post_id, title, content, album_id, category_id, banner_url) VALUES
('POST000000000100100001000001','Bài tập Toán cơ bản','Tổng hợp bài tập Toán cơ bản và lời giải','ALBUM0000000001001','CATEGORY00001',NULL),
('POST000000000100100002000002','Phân tích đoạn trích','Bài phân tích đoạn trích văn học mẫu','ALBUM0000000001001','CATEGORY00002',NULL),('POST000000000200100003000003','Ngữ pháp tiếng Anh căn bản','Tổng hợp thì và cấu trúc thường gặp','ALBUM0000000002001','CATEGORY00003',NULL),
('POST000000000200100004000004','Thuật toán sắp xếp','Giải thích các thuật toán sắp xếp phổ biến','ALBUM0000000002001','CATEGORY00004',NULL),
('POST000000000300100005000005','Quản trị tài chính','Tổng quan quản trị tài chính doanh nghiệp','ALBUM0000000003001','CATEGORY00005',NULL),
('POST000000000300100001000006','Chiến tranh thế giới','Tổng hợp các mốc chính của thế chiến','ALBUM0000000003001','CATEGORY00006',NULL),
('POST000000000400100002000007','Toán tích phân','Bài tập tích phân có lời giải','ALBUM0000000004001','CATEGORY00001',NULL),
('POST000000000400100003000008','Phân tích thơ','Phương pháp phân tích bài thơ','ALBUM0000000004001','CATEGORY00002',NULL),
('POST000000000500100004000009','Đề thi tiếng Anh','Đề thi thử tiếng Anh có đáp án','ALBUM0000000005001','CATEGORY00003',NULL),
('POST000000000500100005000010','Cấu trúc dữ liệu cơ bản','Danh sách liên kết, cây và đồ thị','ALBUM0000000005001','CATEGORY00004',NULL);

-- =====================
-- 9) POST_HASHTAGS (gán hashtag cho mỗi bài, dùng 5 hashtag đầu)
-- columns: (post_id, hashtag_id)
-- =====================
INSERT INTO post_hashtags (post_id, hashtag_id) VALUES
('POST000000000100100001000001','HASHTAG00000000001'),
('POST000000000100100002000002','HASHTAG00000000002'),
('POST000000000200100003000003','HASHTAG00000000003'),
('POST000000000200100004000004','HASHTAG00000000004'),
('POST000000000300100005000005','HASHTAG00000000005'),
('POST000000000300100001000006','HASHTAG00000000001'),
('POST000000000400100002000007','HASHTAG00000000002'),
('POST000000000400100003000008','HASHTAG00000000003'),
('POST000000000500100004000009','HASHTAG00000000004'),
('POST000000000500100005000010','HASHTAG00000000005');

-- =====================
-- 10) POST_COMMENTS (10 comment chia cho 5 bài viết đầu tiên; sử dụng 5 user đầu tiên)
-- post_comments columns: (comment_id, post_id, user_id, content)
-- comment_id pattern: COMMENT + postSeq(6) + userNumber(10) + commentSeq(5)
-- =====================
INSERT INTO post_comments (comment_id, post_id, user_id, content) VALUES
('COMMENT000001000000000100001','POST000000000100100001000001','USER0000000001','Bài này rất hữu ích, cảm ơn tác giả'),
('COMMENT000001000000000200002','POST000000000100100001000001','USER0000000002','Mình làm theo và được kết quả giống'),
('COMMENT000002000000000300001','POST000000000100100002000002','USER0000000003','Phân tích rõ ràng, bổ ích'),
('COMMENT000002000000000400002','POST000000000100100002000002','USER0000000004','Bạn có ví dụ thêm không?'),
('COMMENT000003000000000500001','POST000000000200100003000003','USER0000000005','Ngữ pháp giải thích dễ hiểu'),
('COMMENT000003000000000100002','POST000000000200100003000003','USER0000000001','Cám ơn đã chia sẻ tài liệu'),
('COMMENT000004000000000200003','POST000000000200100004000004','USER0000000002','Thuật toán minh họa rõ ràng'),
('COMMENT000004000000000300004','POST000000000200100004000004','USER0000000003','Muốn có code ví dụ hơn nữa'),
('COMMENT000005000000000400005','POST000000000300100005000005','USER0000000004','Tài liệu kinh tế này rất cần thiết'),
('COMMENT000005000000000500001','POST000000000300100005000005','USER0000000005','Đang áp dụng vào thực tế, hữu ích');

-- =====================
-- 11) POST_REACTIONS (6 reaction cho 3 bài viết đầu tiên, 6 user)
-- reaction_type phải là một trong ('like','love','haha','sad','angry')
-- =====================
INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES
('POST000000000200100003000003','USER0000000000','love'),
('POST000000000100100001000001','USER0000000001','like'),
('POST000000000100100001000001','USER0000000002','love'),
('POST000000000100100002000002','USER0000000003','haha'),
('POST000000000100100002000002','USER0000000004','sad'),
('POST000000000200100003000003','USER0000000005','like');

-- =====================
-- 12) POST_REPORTS (1 report: user thứ 6 báo cáo bài viết đầu tiên)
-- report_id pattern: REPORT + postSeq(6) + userNumber(10)
-- =====================
INSERT INTO post_reports (report_id, post_id, user_id, reason) VALUES
('REPORT0000010000000000','POST000000000100100001000001','USER0000000000','Nội dung trùng lặp / khả nghi vi phạm');

-- =====================
-- Kết thúc dữ liệu demo
-- =====================
