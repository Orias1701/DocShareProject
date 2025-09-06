import React from "react";
import CategorySection from "../../components/common/CategorySection";

/**
 * DỮ LIỆU DEMO
 * Tránh dùng Array(n).fill({...}) vì sẽ trỏ chung 1 reference.
 */
const makePosts = (avatarIdx) =>
  Array.from({ length: 8 }, (_, i) => ({
    id: `demo-${avatarIdx}-${i}`,
    authorName: "Name",
    authorAvatar: `https://i.pravatar.cc/32?img=${avatarIdx}`,
    title: "Post title\nMaximum of Post title is 3 lines.",
    hashtags: ["#hashtag-1", "#hashtag-2", "#hashtag-3"],
    uploadTime: "Post upload time",
    sourceName: "google/mangle",
    sourceIcon: "https://www.google.com/favicon.ico",
    stats: { likes: 1, comments: 1, shares: 0, saves: 0 },
  }));

const categoriesData = [
  { title: "Album 1", posts: makePosts(3) },
];

/**
 * LAYOUT TỔNG:
 * - Cột trái: sidebar/layout (cố định chiều rộng)
 * - Cột phải: content (phần dưới là CategorySection)
 *
 * Giả định phần LAYOUT TRÁI đã được bọc ở component cha (vd: AppLayout).
 * File này chỉ render CONTENT PHẢI, nhưng mình thêm container chuẩn để khớp layout.
 */
export default function MyAlbumPage() {
  return (
    <div className="w-full">
      {/* Header tabs của content */}
      <div className="flex justify-end items-center mb-8 gap-6">
        <button
          className="text-white font-semibold border-b-2 border-white pb-1"
          type="button"
        >
          Posts
        </button>
        <button
          className="text-gray-400 font-semibold pb-1 hover:text-white"
          type="button"
        >
          Follower
        </button>
      </div>

      {/* Nội dung các category */}
      <div className="space-y-12">
        {categoriesData.map((c, idx) => (
          <CategorySection key={c.title + idx} title={c.title} posts={c.posts} />
        ))}
      </div>
    </div>
  );
}
