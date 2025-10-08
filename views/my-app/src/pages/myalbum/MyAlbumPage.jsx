// src/pages/myposts/MyAlbumPage.jsx
import React, { useEffect, useState } from "react";
import AlbumSection from "../../components/album/AlbumSection";
import albumService from "../../services/albumService";
import NewAlbumForm from "../../components/common/NewAlbumForm"; // nếu form của bạn ở /components/albums thì đổi path cho đúng

export default function MyAlbumPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

  const mapAlbumToCard = (a = {}) => ({
    id: a.album_id || a.id,
    album_id: a.album_id || a.id,
    title: a.album_name || a.name || "Album",
    authorName: "Tôi",
    authorAvatar:
      "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg",
    uploadTime: a.created_at || "",
    banner: a.url_thumbnail || null,
    link: `/albums/${a.album_id || a.id}`,
    user_id: a.user_id, // để phòng khi cần ownerId phía dưới
  });

  // fetch danh sách của chính mình
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

  // ✅ Khi tạo xong: thêm album vào đầu danh sách
  const handleCreated = (createdAlbum) => {
    setAlbums((prev) => [mapAlbumToCard(createdAlbum), ...prev]);
  };

  // ✅ Khi xóa xong: gỡ album khỏi UI ngay
  const handleDeleted = (albumId) => {
    setAlbums((prev) =>
      prev.filter((a) => a.id !== albumId && a.album_id !== albumId)
    );
  };

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
        onDeleted={handleDeleted}     // 👈 truyền callback xóa
        forceIsOwner                  // 👈 tất cả album ở đây là của chính mình
      />

      {/* Modal tạo album */}
      {openCreate && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpenCreate(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 p-6 rounded-2xl border border-gray-700 bg-[#111827]">
            <NewAlbumForm
              onClose={() => setOpenCreate(false)}
              onCreated={(album) => {
                handleCreated(album);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
