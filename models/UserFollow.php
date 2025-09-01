<?php
// models/UserFollow.php
require_once __DIR__ . '/../config/Database.php';

class UserFollow {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    public function isFollowing($followerId, $followingId) {
    $stmt = $this->pdo->prepare("SELECT 1 FROM user_follows WHERE follower_id=? AND following_id=?");
    $stmt->execute([$followerId, $followingId]);
    return (bool)$stmt->fetch();
}

public function follow($followerId, $followingId) {
    $stmt = $this->pdo->prepare("INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?)");
    $stmt->execute([$followerId, $followingId]);
}

public function unfollow($followerId, $followingId) {
    $stmt = $this->pdo->prepare("DELETE FROM user_follows WHERE follower_id=? AND following_id=?");
    $stmt->execute([$followerId, $followingId]);
}

}
