-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: doc_share
-- ------------------------------------------------------
-- Server version	8.4.4

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

DROP TABLE IF EXISTS `albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `albums` (
  `album_id` varchar(30) NOT NULL COMMENT 'ALBUM+(user_id_number)+001->999',
  `album_name` varchar(100) NOT NULL,
  `description` text,
  `url_thumbnail` varchar(255) DEFAULT NULL,
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
INSERT INTO `albums` VALUES ('ALBUM0000000001001','Album Toán - A','Tập hợp bài tập toán cơ bản','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000001','2025-09-03 14:27:27'),('ALBUM0000000001002','Album Văn - A','Sưu tập tác phẩm văn','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000001','2025-09-03 14:27:27'),('ALBUM0000000002001','Album Tiếng Anh - B','Ngữ pháp và bài tập','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000002','2025-09-03 14:27:27'),('ALBUM0000000002002','Album CNTT','Thuật toán và code mẫu','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000002','2025-09-03 14:27:27'),('ALBUM0000000003001','Album Kinh tế - C','Bài giảng kinh tế','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000003','2025-09-03 14:27:27'),('ALBUM0000000003002','Album Lịch sử - C','Tổng hợp sự kiện lịch sử','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000003','2025-09-03 14:27:27'),('ALBUM0000000004001','Album Toán nâng cao - D','Chuyên đề giải tích','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000004','2025-09-03 14:27:27'),('ALBUM0000000004002','Album Văn học - D','Phân tích văn học','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000004','2025-09-03 14:27:27'),('ALBUM0000000005001','Album Tiếng Anh nâng cao - E','Đề thi và đáp án','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000005','2025-09-03 14:27:27'),('ALBUM0000000005002','Album Công nghệ - E','Tài liệu hệ thống và mạng','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','USER0000000005','2025-09-03 14:27:27'),('ALBUM0000000006001','macdinhtest','',NULL,'USER0000000006','2025-10-08 14:57:05'),('ALBUM0000000012003','aaa','',NULL,'USER0000000012','2025-10-12 02:39:35'),('ALBUM0000000012004','aaaaah','',NULL,'USER0000000012','2025-10-12 02:41:27'),('ALBUM0000000012005','77','',NULL,'USER0000000012','2025-10-12 02:42:12'),('ALBUM13001','macdinh','Album mặc định của user',NULL,'USER0000000013','2025-10-07 18:51:21'),('ALBUM14001','macdinh','Album mặc định của user',NULL,'USER0000000014','2025-10-19 19:46:23'),('ALBUM15001','macdinh','Album mặc định của user',NULL,'USER0000000015','2025-10-20 15:27:50'),('ALBUM16001','macdinh','Album mặc định của user',NULL,'USER0000000016','2025-10-20 18:31:52');
/*!40000 ALTER TABLE `albums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookmarks` (
  `user_id` varchar(15) NOT NULL,
  `post_id` varchar(40) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarks`
--

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;
INSERT INTO `bookmarks` VALUES ('USER0000000006','POST000000000200100004000004','2025-10-19 18:23:29');
/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
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
INSERT INTO `categories` VALUES ('CATEGORY00004','Công nghệ'),('CATEGORY00011','Địa lý'),('CATEGORY00008','Hóa học'),('CATEGORY00010','Khoa học'),('CATEGORY00005','Kinh tế'),('CATEGORY00006','Lịch sử'),('CATEGORY00002','Ngữ Văn'),('CATEGORY00012','Sinh học'),('CATEGORY00003','Tiếng Anh'),('CATEGORY00009','Tin học'),('CATEGORY00007','Toán'),('CATEGORY00001','Vật lý');
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
INSERT INTO `hashtags` VALUES ('HASHTAG00000000029','1'),('HASHTAG00000000030','11'),('HASHTAG00000000026','111'),('HASHTAG00000000034','1111'),('HASHTAG00000000047','111111'),('HASHTAG00000000031','11223'),('HASHTAG00000000032','2'),('HASHTAG00000000050','22'),('HASHTAG00000000009','2222'),('HASHTAG00000000008','3'),('HASHTAG00000000010','3333'),('HASHTAG00000000018','4444'),('HASHTAG00000000019','5555'),('HASHTAG00000000011','666'),('HASHTAG00000000020','6666'),('HASHTAG00000000024','aaa'),('HASHTAG00000000041','aaaa'),('HASHTAG00000000045','ada'),('HASHTAG00000000037','algorithm'),('HASHTAG00000000004','CNTT'),('HASHTAG00000000044','ddff'),('HASHTAG00000000042','fa'),('HASHTAG00000000036','geometry'),('HASHTAG00000000043','h'),('HASHTAG00000000040','hehe'),('HASHTAG00000000051','hh'),('HASHTAG00000000049','hhh'),('HASHTAG00000000005','KinhTế'),('HASHTAG00000000006','LịchSử'),('HASHTAG00000000038','pronunciation'),('HASHTAG00000000035','qqq'),('HASHTAG00000000046','sd'),('HASHTAG00000000039','studyTips'),('HASHTAG00000000025','test_nhe'),('HASHTAG00000000003','TiếngAnh'),('HASHTAG00000000001','Toán'),('HASHTAG00000000033','ttt'),('HASHTAG00000000048','uuu'),('HASHTAG00000000002','Văn');
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
INSERT INTO `post_comments` VALUES ('COMMENT000000000600100002000001000000000697513','POST000000000600100002000001','USER0000000006','qứ','2025-10-20 18:50:09',NULL),('COMMENT000004000000000200003','POST000000000200100004000004','USER0000000002','Thuật toán minh họa rõ ràng','2025-09-03 14:27:27',NULL),('COMMENT000004000000000300004','POST000000000200100004000004','USER0000000003','Muốn có code ví dụ hơn nữa','2025-09-03 14:27:27',NULL),('COMMENT000005000000000400005','POST000000000300100005000005','USER0000000004','Tài liệu kinh tế này rất cần thiết','2025-09-03 14:27:27',NULL),('COMMENT000005000000000500001','POST000000000300100005000005','USER0000000005','Đang áp dụng vào thực tế, hữu ích','2025-09-03 14:27:27',NULL);
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
INSERT INTO `post_hashtags` VALUES ('POST000000000200100004000004','HASHTAG00000000004'),('POST000000000500100004000009','HASHTAG00000000004'),('POST000000000300100005000005','HASHTAG00000000005'),('POST000000000500100005000010','HASHTAG00000000005'),('POST000000000300100005000005','HASHTAG00000000009'),('POST000000000300100005000005','HASHTAG00000000010'),('POST000000000300100005000005','HASHTAG00000000011');
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
  `reaction_type` enum('like','dislike') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`,`user_id`,`reaction_type`),
  UNIQUE KEY `uq_post_user` (`post_id`,`user_id`),
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
INSERT INTO `post_reactions` VALUES ('POST000000000200100004000004','USER0000000006','like','2025-09-21 14:02:25'),('POST000000000200100004000004','USER0000000012','like','2025-10-09 01:04:59'),('POST000000000300100005000005','USER0000000006','like','2025-10-19 22:32:02'),('POST000000000500100004000009','USER0000000006','like','2025-10-19 22:32:02'),('POST000000000500100005000010','USER0000000006','like','2025-10-19 22:32:03');
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
INSERT INTO `post_reports` VALUES ('REPORTPOST000000000200100004000004USER0000000012','POST000000000200100004000004','USER0000000012','Nội dung không phù hợp','2025-10-09 01:26:20');
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
INSERT INTO `posts` VALUES ('POST000000000200100004000004','Thuật toán sắp xếp 1245',NULL,NULL,'','ALBUM0000000012003','CATEGORY00002',NULL,'2025-09-03 14:27:27','http://localhost:3000/uploads/posts/68b7c151dd6eb.pdf','application/pdf'),('POST000000000300100005000005','Quản trị tài chính',NULL,NULL,'','ALBUM0000000003001','CATEGORY00005','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758355849/post_banners/rlhrfjlcog70di8cgpdc.jpg','2025-09-03 14:27:27','http://localhost:3000/uploads/posts/68b7c151dd6eb.pdf','application/pdf'),('POST000000000500100004000009','Đề thi tiếng Anh',NULL,NULL,'','ALBUM0000000005001','CATEGORY00003','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758355849/post_banners/rlhrfjlcog70di8cgpdc.jpg','2025-09-03 14:27:27','http://localhost:3000/uploads/posts/68b7c151dd6eb.pdf','application/pdf'),('POST000000000500100005000010','Cấu trúc dữ liệu cơ bản',NULL,NULL,'','ALBUM0000000005001','CATEGORY00004','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758355849/post_banners/rlhrfjlcog70di8cgpdc.jpg','2025-09-03 14:27:27','http://localhost:3000/uploads/posts/68b7c151dd6eb.pdf','application/pdf'),('POST000000000600100001000001','aaa','(Không thể kết nối AI)','(Không thể kết nối AI)','','ALBUM0000000006001','CATEGORY00001',NULL,'2025-10-20 15:28:50','http://localhost:3000/uploads/posts/68f5f2c23e76a.pdf','application/pdf'),('POST000000000600100002000001','11','(Không thể kết nối AI)','(Không thể kết nối AI)','','ALBUM0000000006001','CATEGORY00002',NULL,'2025-10-20 18:30:49','http://localhost:3000/uploads/posts/68f61d690e5de.pdf','application/pdf');
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
INSERT INTO `user_follows` VALUES ('USER0000000001','USER0000000002','2025-09-03 14:27:27'),('USER0000000002','USER0000000001','2025-09-03 14:27:27'),('USER0000000006','USER0000000001','2025-09-29 02:00:02'),('USER0000000006','USER0000000002','2025-10-20 04:18:44'),('USER0000000006','USER0000000003','2025-09-28 16:35:23'),('USER0000000006','USER0000000004','2025-09-30 17:57:48'),('USER0000000006','USER0000000005','2025-09-30 17:27:30'),('USER0000000012','USER0000000002','2025-10-08 22:06:44'),('USER0000000012','USER0000000004','2025-10-14 19:49:21');
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
INSERT INTO `user_infos` VALUES ('USER0000000001','Nguyễn Văn A','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','',NULL),('USER0000000002','Trần Thị B','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','Đam mê ngôn ngữ và văn học','1997-03-21'),('USER0000000003','Phạm Văn D','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','Nghiên cứu viên kinh tế','1996-07-09'),('USER0000000004','Lê Thị Ngọc','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','Giảng viên môn toán','1995-11-15'),('USER0000000005','Đặng Minh','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','Chuyên viên CNTT tại doanh nghiệp','1994-09-30'),('USER0000000006','test','https://res.cloudinary.com/ducl8m3ky/image/upload/v1758218271/ka5t07lzveodljtf8exw.jpg','1113','2025-09-08'),('USER0000000012','admin',NULL,NULL,'2025-10-06'),('USER0000000013','hagsfasf',NULL,'',NULL),('USER0000000014','222',NULL,NULL,'2025-10-13'),('USER0000000015','3e132e32',NULL,NULL,'0001-01-01'),('USER0000000016','3e132e32',NULL,NULL,'0001-01-01');
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
INSERT INTO `users` VALUES ('USER0000000001','nguyenvana','vana@example.com','pass1','ROLE011','2025-09-03 14:27:27',2),('USER0000000002','tranthib','thib@example.com','pass2','ROLE011','2025-09-03 14:27:27',3),('USER0000000003','phamvand','vand@example.com','pass3','ROLE011','2025-09-03 14:27:27',1),('USER0000000004','lethingoc','ngocle@example.com','pass4','ROLE011','2025-09-03 14:27:27',2),('USER0000000005','dangminh','minhdang@example.com','pass5','ROLE011','2025-09-03 14:27:27',1),('USER0000000006','1','1@gmail.com','$2y$10$F1vQjFnRMQlKc1aEXCskx.GTVVazsU2dNrFdjd89opbpuYCYxPzOu','ROLE000','2025-09-19 00:49:42',0),('USER0000000012','admin','admin@example.com','$2y$10$M/PY6t02sI2.JQ0fmArPSOjktThbYJuFvoobmijvMrSeDtygZOEQK','ROLE000','2025-10-06 18:13:20',0),('USER0000000013','had','ad@example.com','$2y$10$ZqEz7cwFgrDk4NBWytYv4eD.z5ymbrko7HouGe8ca5X729WrsHmbS','ROLE011','2025-10-07 18:51:21',0),('USER0000000014','222','223001695@daihocthudo.edu.vn','$2y$10$5e0iTj6sy.MmoTbXjJl9z.3aum.ShwQOKVz//1nSd1ep0PBCWqDOW','ROLE011','2025-10-19 19:46:23',0),('USER0000000015','1e4e1234e1','adasdas@gmail.com','$2y$10$O4UoQhNT/xcQiQ3Nm6oquuwRmjKVNxr6P4D2./SJzobgjm24io6RK','ROLE011','2025-10-20 15:27:50',0),('USER0000000016','113231','adasdas222@gmail.com','$2y$10$iH6n21OtVQqqvIVnzpTEEObkd..nUzU32hGh0x/GqhLEJ.QUqwYw6','ROLE011','2025-10-20 18:31:52',0);
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

-- Dump completed on 2025-10-21  0:04:50
