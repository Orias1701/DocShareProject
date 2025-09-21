// src/pages/albums/MyAlbumPage.jsx
import React, { useEffect, useState } from "react";
import PostSection from "../../components/post/PostSection";
import albumService from "../../services/albumService";

export default function MyAlbumPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map 1 album -> shape card dùng bởi PostCard/PostSection
  const mapAlbumToCard = (a = {}) => ({
    id: a.album_id || a.id,
    title: a.album_name || a.name || "Album",
    authorName: "Tôi",
    authorAvatar: "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg",
    uploadTime: a.created_at || "",
    banner: a.url_thumbnail || null, // hiện ảnh bìa album
    // để PostCard chạy mượt (không cần file/hashtags cho album)
    file: null,
    hashtags: [],
    stats: { likes: 0, comments: 0, views: 0 },
    // nếu sau này cần điều hướng chi tiết album:
    album_id: a.album_id || a.id,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await albumService.listMyAlbums(); // trả mảng albums
        const cards = (rows || []).map(mapAlbumToCard);
        setAlbums(cards);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Không thể tải danh sách album.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-white p-4">Đang tải dữ liệu...</div>;
  if (error) {
    return (
      <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg">
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Một section duy nhất: “Your albums” -> grid các album card */}
      <PostSection
        title="Your albums"
        posts={albums}
        showAlbum={false}
        maxTags={0}
        hideReactions={true}  // 👈 thêm dòng này
        emptyText="Bạn chưa có album nào."
      />
    </div>
  );
}
