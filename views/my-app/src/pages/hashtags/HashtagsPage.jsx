import React from 'react';
import HashtagLink from '../../components/hashtag/HashtagLink';

// --- Dữ liệu mẫu ---
// Trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ API.
const viewedHashtags = [
    "hashtagishere", "hashtagishere", "hashtagishere", "hashtagishere",
    "hashtagishere", "hashtagishere", "hashtagishere", "hashtagishere",
    "hashtagishere", "hashtagishere", "hashtagishere", "hashtagishere",
];

const allHashtags = [
    "hashtagishere", "hashtagishere", "hashtagishere", "hashtagishere",
    "hashtagishere", "hashtagishere", "hashtagishere", "hashtagishere",
    "hashtagishere", "hashtagishere", "hashtagishere", "hashtagishere",
];

/**
 * Component Trang Hashtags
 * @description Hiển thị các khu vực hashtag, ví dụ như "đã xem" và "tất cả".
 */
function HashtagsPage() {
  return (
    <div className="text-white p-4">
      {/* Container cho tất cả các khu vực */}
      <div className="space-y-12">
        
        {/* Khu vực: Các hashtag bạn đã xem */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Hashtags you have viewed</h2>
          {/* Lưới hiển thị các hashtag, 4 cột trên màn hình lớn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Lặp qua dữ liệu và render mỗi mục thành một nút HashtagLink */}
            {viewedHashtags.map((tag, index) => (
              <HashtagLink key={`viewed-${index}`} tag={tag} />
            ))}
          </div>
        </section>
        
        {/* Khu vực: Tất cả hashtag */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All hashtags</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allHashtags.map((tag, index) => (
              <HashtagLink key={`all-${index}`} tag={tag} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default HashtagsPage;