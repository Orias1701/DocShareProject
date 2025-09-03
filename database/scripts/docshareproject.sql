-- ============================================
-- Drop & Create Database
-- ============================================
DROP DATABASE IF EXISTS doc_share;
CREATE DATABASE IF NOT EXISTS doc_share;
USE doc_share;

-- ============================================
-- Table: roles
-- ============================================
CREATE TABLE roles (
  role_id VARCHAR(10) NOT NULL COMMENT 'ROLE000 (admin), ROLE001 (mod), ROLE010 (business), ROLE011 (user)',
  role_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (role_id),
  UNIQUE KEY uq_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
  user_id VARCHAR(15) NOT NULL COMMENT 'USER0000000001 -> USER9999999999',
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id VARCHAR(10) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_username (username),
  UNIQUE KEY uq_email (email),
  KEY idx_role_id (role_id),
  CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: user_infos
-- ============================================
CREATE TABLE user_infos (
  user_id VARCHAR(15) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  bio TEXT,
  birth_date DATE DEFAULT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_infos_users FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: user_follows
-- ============================================
CREATE TABLE user_follows (
  follower_id VARCHAR(15) NOT NULL COMMENT 'USERxxxxx',
  following_id VARCHAR(15) NOT NULL COMMENT 'USERxxxxx',
  followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  KEY idx_following_id (following_id),
  CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: albums
-- ============================================
CREATE TABLE albums (
  album_id VARCHAR(30) NOT NULL COMMENT 'ALBUM+(user_id_number)+001->999',
  album_name VARCHAR(100) NOT NULL,
  description TEXT,
  user_id VARCHAR(15) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (album_id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_albums_users FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE categories (
  category_id VARCHAR(20) NOT NULL COMMENT 'CATEGORY+00001 -> CATEGORY+99999',
  category_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: posts
-- ============================================
CREATE TABLE posts (
  post_id VARCHAR(40) NOT NULL COMMENT 'POST+(album_id_number)+(category_id_number)+000001->999999',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  summary TEXT,
  content TEXT,
  album_id VARCHAR(30) DEFAULT NULL,
  category_id VARCHAR(20) NOT NULL,
  banner_url VARCHAR(500) DEFAULT NULL,
  file_url VARCHAR(500) DEFAULT NULL,
  file_type VARCHAR(500) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id),
  KEY idx_album_id (album_id),
  KEY idx_category_id (category_id),
  CONSTRAINT fk_posts_albums FOREIGN KEY (album_id) REFERENCES albums (album_id) ON DELETE SET NULL,
  CONSTRAINT fk_posts_categories FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: post_comments
-- ============================================
CREATE TABLE post_comments (
  comment_id VARCHAR(50) NOT NULL COMMENT 'COMMENT+(post_id_number)+(user_id_number)+00001->99999',
  post_id VARCHAR(40) NOT NULL,
  user_id VARCHAR(15) NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  KEY idx_post_id (post_id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_comments_posts FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_users FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: hashtags
-- ============================================
CREATE TABLE hashtags (
  hashtag_id VARCHAR(20) NOT NULL COMMENT 'HASHTAG+00000000001->99999999999',
  hashtag_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (hashtag_id),
  UNIQUE KEY uq_hashtag_name (hashtag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: post_hashtags
-- ============================================
CREATE TABLE post_hashtags (
  post_id VARCHAR(40) NOT NULL,
  hashtag_id VARCHAR(20) NOT NULL,
  PRIMARY KEY (post_id, hashtag_id),
  KEY idx_hashtag_id (hashtag_id),
  CONSTRAINT fk_posthashtags_posts FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
  CONSTRAINT fk_posthashtags_hashtags FOREIGN KEY (hashtag_id) REFERENCES hashtags (hashtag_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: post_reactions
-- ============================================
CREATE TABLE post_reactions (
  post_id VARCHAR(40) NOT NULL,
  user_id VARCHAR(15) NOT NULL,
  reaction_type ENUM('like','love','haha','sad','angry') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id, reaction_type),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_reactions_posts FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
  CONSTRAINT fk_reactions_users FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Table: post_reports
-- ============================================
CREATE TABLE post_reports (
  report_id VARCHAR(50) NOT NULL COMMENT 'REPORT+(post_id_number)+(user_id_number)',
  post_id VARCHAR(40) NOT NULL,
  user_id VARCHAR(15) NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id),
  KEY idx_post_id (post_id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_reports_posts FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_users FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
