import React, { useEffect, useState, useCallback } from "react";
import AlbumSection from "../../components/album/AlbumSection";
import albumService from "../../services/albumService";
import NewAlbumForm from "../../components/common/NewAlbumForm"; // ✅ Sửa path

export default function MyAlbumPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreate, setOpenCreate] = useState(false); // mở/đóng modal tạo

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

  const fetchAlbums = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // ✅ Khi tạo xong: thêm vào đầu danh sách nếu có id; nếu không có id → refetch
  const handleCreated = async (createdAlbum) => {
    const hasId = Boolean(createdAlbum?.album_id || createdAlbum?.id);
    if (hasId) {
      setAlbums((prev) => [mapAlbumToCard(createdAlbum), ...prev]);
      return;
    }
    // Trường hợp BE chưa trả id rõ ràng → reload list để chắc chắn
    await fetchAlbums();
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
      {/* Header (không cần nút nếu bạn đã có ở navbar) */}
      <h1 className="text-lg font-semibold text-white mb-4">Your albums</h1>

      <AlbumSection
        title=""
        albums={albums}
        emptyText="Bạn chưa có album nào."
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
                handleCreated(album); // cập nhật UI ngay hoặc refetch
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
