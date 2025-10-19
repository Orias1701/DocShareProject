import React, { useEffect, useState, useCallback } from "react";
import AlbumSection from "../../components/album/AlbumSection";
import albumService from "../../services/albumService";
import NewAlbumForm from "../../components/common/NewAlbumForm";

/**
 * Trang “My Albums”
 * - Hiển thị danh sách album của tôi
 * - Có modal tạo album mới (sử dụng biến CSS cho overlay + modal)
 */
export default function MyAlbumPage() {
  const [albums, setAlbums] = useState([]);     // danh sách album
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreate, setOpenCreate] = useState(false); // bật/tắt modal tạo album

  // Chuẩn hoá dữ liệu album thành “thẻ” đơn giản để render
  function mapAlbumToCard(a = {}) {
    const id = a.album_id || a.id;
    return {
      id,
      album_id: id,
      title: a.album_name || a.name || "Album",
      authorName: "Tôi",
      authorAvatar:
        "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg",
      uploadTime: a.created_at || "",
      banner: a.url_thumbnail || null,
      link: `/albums/${id}`, // khi bấm sẽ chuyển sang AlbumDetailPage
    };
  }

  // Gọi API lấy danh sách album của tôi
  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await albumService.listMyAlbums();
      setAlbums((rows || []).map(mapAlbumToCard));
    } catch (e) {
      console.error(e);
      setError(e?.message || "Không thể tải danh sách album.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lần đầu
  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Sau khi tạo xong album:
  // - Nếu có id → thêm ngay vào đầu danh sách (đỡ gọi lại API)
  // - Nếu BE không trả id rõ ràng → gọi lại API để chắc chắn
  async function handleCreated(createdAlbum) {
    const hasId = Boolean(createdAlbum?.album_id || createdAlbum?.id);
    if (hasId) {
      setAlbums((prev) => [mapAlbumToCard(createdAlbum), ...prev]);
      return;
    }
    await fetchAlbums();
  }

  // Loading
  if (loading) {
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div
        className="
          p-4 rounded-lg border
          bg-[rgba(255,0,0,0.1)]
          border-[var(--color-border-strong)]
          text-[var(--color-text)]
        "
      >
        <strong className="text-red-400">Lỗi:</strong> {error}
      </div>
    );
  }

  // UI
  return (
    <div className="w-full">
      {/* Header đơn giản */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-text)]">
          Your albums
        </h1>

      </div>

      {/* Lưới album */}
      <AlbumSection
        title=""
        albums={albums}
        emptyText="Bạn chưa có album nào."
      />

      {/* Modal tạo album */}
      {openCreate && (
        <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center">
          {/* Lớp nền mờ */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "var(--color-overlay-bg)" }}
            onClick={() => setOpenCreate(false)}
          />
          {/* Hộp modal */}
          <div
            className="
              relative z-10 w-full max-w-lg mx-4 p-6 rounded-2xl
              border bg-[var(--color-modal-bg)]
              border-[var(--color-modal-border)]
              shadow-2xl
            "
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[var(--color-text)] font-semibold">
                Create album
              </h2>
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="
                  px-2 py-1 rounded-md
                  text-[var(--color-icon-default)]
                  hover:text-[var(--color-icon-hover)]
                  transition
                "
                aria-label="Đóng"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <NewAlbumForm
              onClose={() => setOpenCreate(false)}
              onCreated={handleCreated}  // cập nhật UI ngay hoặc refetch nếu cần
            />
          </div>
        </div>
      )}
    </div>
  );
}
