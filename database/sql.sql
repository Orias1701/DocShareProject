-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: doc_share
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `albums`
--
create database doc_share;
use doc_share;
DROP TABLE IF EXISTS `albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `albums` (
  `album_id` varchar(30) NOT NULL COMMENT 'ALBUM+(user_id_number)+001->999',
  `album_name` varchar(100) NOT NULL,
  `description` text,
  `user_id` varchar(15) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`album_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_albums_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `albums`
--

LOCK TABLES `albums` WRITE;
/*!40000 ALTER TABLE `albums` DISABLE KEYS */;
INSERT INTO `albums` VALUES ('ALBUM0000000001001','Album Toán - A','Tập hợp bài tập toán cơ bản','USER0000000001','2025-09-03 14:27:27'),('ALBUM0000000001002','Album Văn - A','Sưu tập tác phẩm văn','USER0000000001','2025-09-03 14:27:27'),('ALBUM0000000002001','Album Tiếng Anh - B','Ngữ pháp và bài tập','USER0000000002','2025-09-03 14:27:27'),('ALBUM0000000002002','Album CNTT - B','Thuật toán và code mẫu','USER0000000002','2025-09-03 14:27:27'),('ALBUM0000000003001','Album Kinh tế - C','Bài giảng kinh tế','USER0000000003','2025-09-03 14:27:27'),('ALBUM0000000003002','Album Lịch sử - C','Tổng hợp sự kiện lịch sử','USER0000000003','2025-09-03 14:27:27'),('ALBUM0000000004001','Album Toán nâng cao - D','Chuyên đề giải tích','USER0000000004','2025-09-03 14:27:27'),('ALBUM0000000004002','Album Văn học - D','Phân tích văn học','USER0000000004','2025-09-03 14:27:27'),('ALBUM0000000005001','Album Tiếng Anh nâng cao - E','Đề thi và đáp án','USER0000000005','2025-09-03 14:27:27'),('ALBUM0000000005002','Album Công nghệ - E','Tài liệu hệ thống và mạng','USER0000000005','2025-09-03 14:27:27'),('ALBUM0000000006001','2222','1111','USER0000000006','2025-09-03 14:45:23'),('ALBUM7001','macdinh','Album mặc định của user','USER0000000007','2025-09-09 07:59:55');
/*!40000 ALTER TABLE `albums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` varchar(20) NOT NULL COMMENT 'CATEGORY+00001 -> CATEGORY+99999',
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('CATEGORY00004','Công nghệ thông tin'),('CATEGORY00005','Kinh tế'),('CATEGORY00006','Lịch sử'),('CATEGORY00002','Ngữ văn'),('CATEGORY00003','Tiếng Anh'),('CATEGORY00001','Toán học');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hashtags`
--

DROP TABLE IF EXISTS `hashtags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hashtags` (
  `hashtag_id` varchar(20) NOT NULL COMMENT 'HASHTAG+00000000001->99999999999',
  `hashtag_name` varchar(50) NOT NULL,
  PRIMARY KEY (`hashtag_id`),
  UNIQUE KEY `uq_hashtag_name` (`hashtag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hashtags`
--

LOCK TABLES `hashtags` WRITE;
/*!40000 ALTER TABLE `hashtags` DISABLE KEYS */;
INSERT INTO `hashtags` VALUES ('HASHTAG00000000007','#1'),('HASHTAG00000000015','#1111'),('HASHTAG00000000012','#111111'),('HASHTAG00000000014','#1111111'),('HASHTAG00000000016','#11111111'),('HASHTAG00000000017','#11111111111'),('HASHTAG00000000009','#2222'),('HASHTAG00000000010','#3333'),('HASHTAG00000000018','#4444'),('HASHTAG00000000019','#5555'),('HASHTAG00000000011','#666'),('HASHTAG00000000020','#6666'),('HASHTAG00000000004','#CNTT'),('HASHTAG00000000005','#KinhTế'),('HASHTAG00000000006','#LịchSử'),('HASHTAG00000000003','#TiếngAnh'),('HASHTAG00000000001','#Toán'),('HASHTAG00000000002','#Văn'),('HASHTAG00000000013','#vv'),('HASHTAG00000000008','3');
/*!40000 ALTER TABLE `hashtags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_comments`
--

DROP TABLE IF EXISTS `post_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_comments` (
  `comment_id` varchar(50) NOT NULL COMMENT 'COMMENT+(post_id_number)+(user_id_number)+00001->99999',
  `post_id` varchar(40) NOT NULL,
  `user_id` varchar(15) NOT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `parent_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `post_comments` (`comment_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_posts` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_comments`
--

LOCK TABLES `post_comments` WRITE;
/*!40000 ALTER TABLE `post_comments` DISABLE KEYS */;
INSERT INTO `post_comments` VALUES ('COMMENT000000000100100001000001000000000716954','POST000000000100100001000001','USER0000000007','222','2025-09-10 23:01:59',NULL),('COMMENT000000000100100001000001000000000737928','POST000000000100100001000001','USER0000000007','111','2025-09-10 22:56:55',NULL),('COMMENT000001000000000100001','POST000000000100100001000001','USER0000000001','Bài này rất hữu ích, cảm ơn tác giả','2025-09-03 14:27:27',NULL),('COMMENT000001000000000200002','POST000000000100100001000001','USER0000000002','Mình làm theo và được kết quả giống','2025-09-03 14:27:27',NULL),('COMMENT000002000000000300001','POST000000000100100002000002','USER0000000003','Phân tích rõ ràng, bổ ích','2025-09-03 14:27:27',NULL),('COMMENT000002000000000400002','POST000000000100100002000002','USER0000000004','Bạn có ví dụ thêm không?','2025-09-03 14:27:27',NULL),('COMMENT000003000000000100002','POST000000000200100003000003','USER0000000001','Cám ơn đã chia sẻ tài liệu','2025-09-03 14:27:27',NULL),('COMMENT000003000000000500001','POST000000000200100003000003','USER0000000005','Ngữ pháp giải thích dễ hiểu','2025-09-03 14:27:27',NULL),('COMMENT000004000000000200003','POST000000000200100004000004','USER0000000002','Thuật toán minh họa rõ ràng','2025-09-03 14:27:27',NULL),('COMMENT000004000000000300004','POST000000000200100004000004','USER0000000003','Muốn có code ví dụ hơn nữa','2025-09-03 14:27:27',NULL),('COMMENT000005000000000400005','POST000000000300100005000005','USER0000000004','Tài liệu kinh tế này rất cần thiết','2025-09-03 14:27:27',NULL),('COMMENT000005000000000500001','POST000000000300100005000005','USER0000000005','Đang áp dụng vào thực tế, hữu ích','2025-09-03 14:27:27',NULL);
/*!40000 ALTER TABLE `post_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_hashtags`
--

DROP TABLE IF EXISTS `post_hashtags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_hashtags` (
  `post_id` varchar(40) NOT NULL,
  `hashtag_id` varchar(20) NOT NULL,
  PRIMARY KEY (`post_id`,`hashtag_id`),
  KEY `idx_hashtag_id` (`hashtag_id`),
  CONSTRAINT `fk_posthashtags_hashtags` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtags` (`hashtag_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_posthashtags_posts` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_hashtags`
--

LOCK TABLES `post_hashtags` WRITE;
/*!40000 ALTER TABLE `post_hashtags` DISABLE KEYS */;
INSERT INTO `post_hashtags` VALUES ('POST000000000100100001000001','HASHTAG00000000001'),('POST000000000300100001000006','HASHTAG00000000001'),('POST000000000100100002000002','HASHTAG00000000002'),('POST000000000400100002000007','HASHTAG00000000002'),('POST000000000200100003000003','HASHTAG00000000003'),('POST000000000400100003000008','HASHTAG00000000003'),('POST000000000200100004000004','HASHTAG00000000004'),('POST000000000500100004000009','HASHTAG00000000004'),('POST000000000300100005000005','HASHTAG00000000005'),('POST000000000500100005000010','HASHTAG00000000005'),('POST000000000300100005000005','HASHTAG00000000009'),('POST000000000100100001000001','HASHTAG00000000010'),('POST000000000300100005000005','HASHTAG00000000010'),('POST000000000300100005000005','HASHTAG00000000011'),('POST000000000100100001000001','HASHTAG00000000012'),('POST000000000300100005000005','HASHTAG00000000012'),('POST000000000100100001000001','HASHTAG00000000013'),('POST000000000100100001000001','HASHTAG00000000014'),('POST000000000100100001000001','HASHTAG00000000015'),('POST000000000100100001000001','HASHTAG00000000016'),('POST000000000100100001000001','HASHTAG00000000017'),('POST000000000100100001000001','HASHTAG00000000018'),('POST000000000100100001000001','HASHTAG00000000019'),('POST000000000100100001000001','HASHTAG00000000020');
/*!40000 ALTER TABLE `post_hashtags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_reactions`
--

DROP TABLE IF EXISTS `post_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_reactions` (
  `post_id` varchar(40) NOT NULL,
  `user_id` varchar(15) NOT NULL,
  `reaction_type` enum('like','love','haha','sad','angry') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`,`user_id`,`reaction_type`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_reactions_posts` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reactions_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_reactions`
--

LOCK TABLES `post_reactions` WRITE;
/*!40000 ALTER TABLE `post_reactions` DISABLE KEYS */;
INSERT INTO `post_reactions` VALUES ('POST000000000100100001000001','USER0000000001','like','2025-09-03 14:27:27'),('POST000000000100100001000001','USER0000000002','love','2025-09-03 14:27:27'),('POST000000000100100002000002','USER0000000003','haha','2025-09-03 14:27:27'),('POST000000000100100002000002','USER0000000004','sad','2025-09-03 14:27:27'),('POST000000000200100003000003','USER0000000000','love','2025-09-03 14:27:27'),('POST000000000200100003000003','USER0000000005','like','2025-09-03 14:27:27');
/*!40000 ALTER TABLE `post_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_reports`
--

DROP TABLE IF EXISTS `post_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_reports` (
  `report_id` varchar(50) NOT NULL COMMENT 'REPORT+(post_id_number)+(user_id_number)',
  `post_id` varchar(40) NOT NULL,
  `user_id` varchar(15) NOT NULL,
  `reason` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_reports_posts` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_reports`
--

LOCK TABLES `post_reports` WRITE;
/*!40000 ALTER TABLE `post_reports` DISABLE KEYS */;
INSERT INTO `post_reports` VALUES ('REPORT0000010000000000','POST000000000100100001000001','USER0000000000','Nội dung trùng lặp / khả nghi vi phạm','2025-09-03 14:27:27'),('REPORTPOST000000000100100002000002USER0000000006','POST000000000100100002000002','USER0000000006','111','2025-09-03 20:26:39');
/*!40000 ALTER TABLE `post_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `post_id` varchar(40) NOT NULL COMMENT 'POST+(album_id_number)+(category_id_number)+000001->999999',
  `title` varchar(255) NOT NULL,
  `description` text,
  `summary` text,
  `content` text,
  `album_id` varchar(30) DEFAULT NULL,
  `category_id` varchar(20) NOT NULL,
  `banner_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `file_url` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `idx_album_id` (`album_id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_posts_albums` FOREIGN KEY (`album_id`) REFERENCES `albums` (`album_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_posts_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES ('POST000000000100100001000001','Bài tập Toán cơ bản','1','1','Tổng hợp bài tập Toán cơ bản và lời giải','ALBUM0000000001001','CATEGORY00001',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000100100002000002','Phân tích đoạn trích',NULL,NULL,'Bài phân tích đoạn trích văn học mẫu','ALBUM0000000001001','CATEGORY00002',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000200100003000003','Ngữ pháp tiếng Anh căn bản',NULL,NULL,'Tổng hợp thì và cấu trúc thường gặp','ALBUM0000000002001','CATEGORY00003',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000200100004000004','Thuật toán sắp xếp',NULL,NULL,'Giải thích các thuật toán sắp xếp phổ biến','ALBUM0000000002001','CATEGORY00004',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000300100001000006','Chiến tranh thế giới',NULL,NULL,'Tổng hợp các mốc chính của thế chiến','ALBUM0000000003001','CATEGORY00006',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000300100005000005','Quản trị tài chính',NULL,NULL,'Tổng quan quản trị tài chính doanh nghiệp','ALBUM0000000003001','CATEGORY00005',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000400100002000007','Toán tích phân',NULL,NULL,'Bài tập tích phân có lời giải','ALBUM0000000004001','CATEGORY00001',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000400100003000008','Phân tích thơ',NULL,NULL,'Phương pháp phân tích bài thơ','ALBUM0000000004001','CATEGORY00002',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000500100004000009','Đề thi tiếng Anh',NULL,NULL,'Đề thi thử tiếng Anh có đáp án','ALBUM0000000005001','CATEGORY00003',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000500100005000010','Cấu trúc dữ liệu cơ bản',NULL,NULL,'Danh sách liên kết, cây và đồ thị','ALBUM0000000005001','CATEGORY00004',NULL,'2025-09-03 14:27:27',NULL,NULL),('POST000000000600100001000001','1','1','1','<p>1</p>','ALBUM0000000006001','CATEGORY00001',NULL,'2025-09-03 17:11:24',NULL,NULL);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` varchar(10) NOT NULL COMMENT 'ROLE000 (admin), ROLE001 (mod), ROLE010 (business), ROLE011 (user)',
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('ROLE000','Admin'),('ROLE010','Doanh nghiệp'),('ROLE001','Mod'),('ROLE011','Người dùng');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_follows`
--

DROP TABLE IF EXISTS `user_follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_follows` (
  `follower_id` varchar(15) NOT NULL COMMENT 'USERxxxxx',
  `following_id` varchar(15) NOT NULL COMMENT 'USERxxxxx',
  `followed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`,`following_id`),
  KEY `idx_following_id` (`following_id`),
  CONSTRAINT `fk_follows_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follows_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_follows`
--

LOCK TABLES `user_follows` WRITE;
/*!40000 ALTER TABLE `user_follows` DISABLE KEYS */;
INSERT INTO `user_follows` VALUES ('USER0000000001','USER0000000002','2025-09-03 14:27:27'),('USER0000000002','USER0000000001','2025-09-03 14:27:27'),('USER0000000002','USER0000000003','2025-09-03 14:27:27'),('USER0000000003','USER0000000001','2025-09-03 14:27:27'),('USER0000000003','USER0000000004','2025-09-03 14:27:27'),('USER0000000004','USER0000000005','2025-09-03 14:27:27'),('USER0000000005','USER0000000001','2025-09-03 14:27:27');
/*!40000 ALTER TABLE `user_follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_infos`
--

DROP TABLE IF EXISTS `user_infos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_infos` (
  `user_id` varchar(15) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `bio` text,
  `birth_date` date DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_infos_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_infos`
--

LOCK TABLES `user_infos` WRITE;
/*!40000 ALTER TABLE `user_infos` DISABLE KEYS */;
INSERT INTO `user_infos` VALUES ('USER0000000000','Quản trị viên','/uploads/avatars/admin.jpg','Quản trị hệ thống','1990-01-01'),('USER0000000001','Nguyễn Văn A','/uploads/avatars/u1.jpg','Sinh viên CNTT, thích chia sẻ tài liệu','1998-05-12'),('USER0000000002','Trần Thị B','/uploads/avatars/u2.jpg','Đam mê ngôn ngữ và văn học','1997-03-21'),('USER0000000003','Phạm Văn D','/uploads/avatars/u3.jpg','Nghiên cứu viên kinh tế','1996-07-09'),('USER0000000004','Lê Thị Ngọc','/uploads/avatars/u4.jpg','Giảng viên môn toán','1995-11-15'),('USER0000000005','Đặng Minh','/uploads/avatars/u5.jpg','Chuyên viên CNTT tại doanh nghiệp','1994-09-30'),('USER0000000007','22','https://jbagy.me/wp-content/uploads/2025/03/anh-logo-avatar-bong-da-1.jpg','1','2025-09-03');
/*!40000 ALTER TABLE `user_infos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(15) NOT NULL COMMENT 'USER0000000001 -> USER9999999999',
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` varchar(10) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `followers_count` int DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_username` (`username`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('USER0000000000','admin','admin@example.com','adminpass','ROLE000','2025-09-03 14:27:27',1),('USER0000000001','nguyenvana','vana@example.com','pass1','ROLE011','2025-09-03 14:27:27',2),('USER0000000002','tranthib','thib@example.com','pass2','ROLE011','2025-09-03 14:27:27',3),('USER0000000003','phamvand','vand@example.com','pass3','ROLE011','2025-09-03 14:27:27',4),('USER0000000004','lethingoc','ngocle@example.com','pass4','ROLE011','2025-09-03 14:27:27',5),('USER0000000005','dangminh','minhdang@example.com','pass5','ROLE010','2025-09-03 14:27:27',0),('USER0000000006','1','1@gmail.com','$2y$10$fTqtimph01KeUqqvxdpNWOHzNtawglbd1duVjVb4sB3rbzp/lXyKS','ROLE011','2025-09-03 14:43:40',0),('USER0000000007','22','22@gmail.com','$2y$10$P5S.a34TbxkuHlqzq9nX6.fgA/JpjB0ziOGkgmrvgB7O3JY5u8NWq','ROLE001','2025-09-09 07:59:55',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-17 23:12:03
