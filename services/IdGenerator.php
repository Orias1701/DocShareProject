<!-- services/Idgenerator Tạm chưa dùng -->

<?php
class IdGenerator {

    private function pad($num, $length) {
        return str_pad($num, $length, "0", STR_PAD_LEFT);
    }

    public function generateUserId($lastNumber) {
        return "USER" . $this->pad($lastNumber + 1, 10);
    }

    public function generateAlbumId($userNumber, $albumNumber) {
        return "ALBUM" . $userNumber . $this->pad($albumNumber, 3);
    }

    public function generateCategoryId($lastNumber) {
        return "CATEGORY" . $this->pad($lastNumber + 1, 5);
    }

    public function generatePostId($albumNumber, $categoryNumber, $postNumber) {
        return "POST" . $albumNumber . $categoryNumber . $this->pad($postNumber, 6);
    }

    public function generateHashtagId($lastNumber) {
        return "HASHTAG" . $this->pad($lastNumber + 1, 10);
    }

    public function generateCommentId($postNumber, $userNumber, $commentNumber) {
        return "COMMENT" . $postNumber . $userNumber . $this->pad($commentNumber, 5);
    }

    public function generateReportId($postNumber, $userNumber) {
        return "REPORT" . $postNumber . $userNumber;
    }
}
