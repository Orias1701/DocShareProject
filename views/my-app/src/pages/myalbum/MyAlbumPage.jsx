// src/pages/myposts/MyAlbumPage.jsx
import React, { useEffect, useState } from "react";
import AlbumSection from "../../components/album/AlbumSection";
import albumService from "../../services/albumService";
import NewAlbumForm from "../../components/common/NewAlbumForm";

export default function MyAlbumPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreate, setOpenCreate] = useState(false); // 👈 mở/đóng modal tạo

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

  // ✅ Khi tạo xong: thêm album vào đầu danh sách (không cần reload)
  const handleCreated = (createdAlbum) => {
    setAlbums((prev) => [mapAlbumToCard(createdAlbum), ...prev]);
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
      {/* Header + nút tạo album */}
    

      <AlbumSection
        title="Your albums"
        albums={albums}
        emptyText="Bạn chưa có album nào."
      />

      {/* Modal tạo album (native, không cần lib ngoài) */}
      {openCreate && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpenCreate(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 p-6 rounded-2xl border border-gray-700 bg-[#111827]">


            {/* Form tạo mới */}
            <NewAlbumForm
              onClose={() => setOpenCreate(false)}
              onCreated={(album) => {
                handleCreated(album); // cập nhật UI ngay
                // NewAlbumForm sẽ tự đóng modal qua onClose khi Toast success đóng
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
