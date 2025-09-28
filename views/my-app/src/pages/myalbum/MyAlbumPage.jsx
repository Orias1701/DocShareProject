import React, { useEffect, useState } from "react";
import AlbumSection from "../../components/album/AlbumSection";
import albumService from "../../services/albumService";

export default function MyAlbumPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapAlbumToCard = (a = {}) => ({
    id: a.album_id || a.id,
    album_id: a.album_id || a.id,
    title: a.album_name || a.name || "Album",
    authorName: "Tôi",
    authorAvatar:
      "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg",
    uploadTime: a.created_at || "",
    banner: a.url_thumbnail || null,
    link: `/albums/${a.album_id || a.id}`, // click mở trang album
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await albumService.listMyAlbums();
        setAlbums((rows || []).map(mapAlbumToCard));
      } catch (e) {
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
      <AlbumSection
        title="Your albums"
        albums={albums}
        emptyText="Bạn chưa có album nào."
      />
    </div>
  );
}
