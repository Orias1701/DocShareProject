<?php
// views/layouts/header.php
session_start();
?><!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DocShare — Chia sẻ tài liệu</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    .gh-auth {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }
    .gh-auth a {
      padding: 6px 12px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .gh-auth a:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <header class="gh-header">
    <div class="gh-container" style="display:flex;align-items:center;justify-content:space-between;">
      <div class="gh-brand">DocShare</div>
      <div class="gh-search">
        <input id="searchBox" placeholder="Tìm bài viết, hashtag, tác giả..." />
      </div>
      <div class="gh-auth">
        <?php if (!isset($_SESSION['user'])): ?>
          <a href="index.php?action=login">Đăng nhập</a>
          <a href="index.php?action=register">Đăng ký</a>

        <?php else: ?>
          <span>Xin chào, <?= htmlspecialchars($_SESSION['user']['username']) ?></span>
          <a href="index.php?action=logout">Đăng xuất</a>
        <?php endif; ?>
      </div>
    </div>
  </header>
  <main class="gh-container main-area">
