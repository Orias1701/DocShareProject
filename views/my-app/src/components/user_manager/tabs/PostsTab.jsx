// src/pages/user_manager/tabs/PostsTab.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import PostItem from "../../../components/user_manager/list/PostItem";
import ConfirmModal from "../../common/ConfirmModal";
import ModalEditPost from "../../../components/user_manager/modals/ModalEditPost";
import PostInfoPanel from "../../../components/user_manager/panels/PostInfoPanel";

import postService from "../../../services/postService";
import albumService from "../../../services/albumService";
import categoryServices from "../../../services/categoryServices";

const FALLBACK_AVATAR = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
const slugHash = (name) =>
  name ? `#${name.toString().trim().replace(/\s+/g, "")}` : undefined;

const mapApiPost = (p) => {
  const authorName =
    (p.full_name && p.full_name.trim()) ||
    (p.username && p.username.trim()) ||
    "unknown";
  return {
    id: p.post_id,
    authorId: p.user_id,          // ← user_id của author
    authorName,
    authorAvatar: p.avatar_url || FALLBACK_AVATAR,
    title: p.title || p.summary || (p.description ?? "Untitled"),
    hashtags: [slugHash(p.category_name)].filter(Boolean),
    uploadTime: p.created_at,
    bannerUrl: p.banner_url || "",
    fileUrl: (p.file_url || "").trim(),
    albumName: p.album_name,
    categoryName: p.category_name,
    contentHtml: p.content || "",
    raw: p,
  };
};

function getCurrentUserId() {
  return (
    window?.APP?.currentUser?.user_id ||
    window?.SESSION?.user_id ||
    window?.CURRENT_USER?.user_id ||
    null
  );
}

export default function PostsTab() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  const [selectedId, setSelectedId] = useState();
  const [panelLoading, setPanelLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [confirm, setConfirm] = useState({ open: false, target: null });
  const [openEdit, setOpenEdit] = useState(false);
  const [editPost, setEditPost] = useState(null);

  // 🔔 banner gọn
  const [banner, setBanner] = useState(null);
  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  // Dữ liệu cho modal
  const [albums, setAlbums] = useState([]);
  const [categories, setCategories] = useState([]);
  const isAdmin =
    (window?.APP?.currentUser?.role_id || window?.SESSION?.role_id) ===
    "ROLE000";

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const currentPost =
    data.find((p) => p.id === selectedId) ?? pageData[0] ?? null;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await postService.listAll();
      if (res?.status === "ok" && Array.isArray(res.data)) {
        const mapped = res.data.map(mapApiPost);
        setData(mapped);
        setFetched(true);
        setSelectedId((prev) => prev ?? mapped[0]?.id);
      } else {
        throw new Error(res?.message || "Invalid post list response");
      }
    } catch (e) {
      setError(e?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Tải albums/categories cho đúng OWNER của post đang sửa
  const fetchAlbumsCategories = async () => {
    try {
      // ưu tiên owner của post đang sửa
      const userIdTarget =
        editPost?.user_id || editPost?.author_id || editPost?.raw?.user_id || getCurrentUserId();

      let albArr = [];
      if (userIdTarget) {
        albArr = await albumService.listAlbumsByUserId(userIdTarget);
      } else {
        // fallback nhẹ – thử lấy album của chính mình
        albArr = await albumService.listMyAlbums();
        if (!Array.isArray(albArr) || albArr.length === 0) {
          // dự phòng cuối cùng: all albums (không khuyến nghị)
          albArr = await albumService.listAllAlbums();
        }
      }

      const normAlbums = (albArr || []).map((a) => ({
        album_id: a.album_id ?? a.id,
        album_name: a.album_name ?? a.name,
      }));

      // categories
      const catRes = await categoryServices.list();
      const catArr = Array.isArray(catRes?.data)
        ? catRes.data
        : Array.isArray(catRes)
        ? catRes
        : [];
      const normCategories = catArr.map((c) => ({
        category_id: c.category_id ?? c.id,
        category_name: c.category_name ?? c.name,
      }));

      setAlbums(normAlbums);
      setCategories(normCategories);
    } catch {
      setAlbums([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (!fetched && !loading) fetchPosts();
  }, []); // once

  useEffect(() => setPage(1), [fetched]);

  // Khi mở modal edit, load albums/categories theo owner của post
  useEffect(() => {
    if (openEdit && (albums.length === 0 || categories.length === 0)) {
      fetchAlbumsCategories();
    }
    // phụ thuộc vào post đang sửa để đổi owner → reload list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEdit, editPost]);

  // ====== XOÁ ======
  const doDelete = async (postId) => {
    let res;
    try {
      res = await postService.removeViaPost(postId);
    } catch {
      res = await postService.remove(postId);
    }
    return res;
  };

  // ====== CẬP NHẬT UI SAU XOÁ ======
  const removeFromLocal = (postId) => {
    setData((prev) => {
      const next = prev.filter((x) => x.id !== postId);
      setSelectedId((prevSel) => (prevSel === postId ? next[0]?.id : prevSel));
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotalPages));
      return next;
    });
  };

  // ====== SUBMIT EDIT (goi postService.update) ======
  const handleSubmitEdit = async (payload) => {
    try {
      const res = await postService.update(payload);
      if (res?.status === "ok" || res?.status === "success") {
        showBanner("success", res?.message || "Đã cập nhật bài viết.");
        await fetchPosts();
        return { status: "ok", message: res?.message };
      }
      throw new Error(res?.message || "Update failed");
    } catch (e) {
      showBanner("error", e?.message || "Update failed");
      return { status: "error", message: e?.message || "Update failed" };
    } finally {
      setOpenEdit(false);
      setEditPost(null);
    }
  };

  // Loading nhỏ khi chuyển post
  useEffect(() => {
    if (selectedId) {
      setPanelLoading(true);
      const t = setTimeout(() => setPanelLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [selectedId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ====== DANH SÁCH ====== */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Post List</h2>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/20 text-white/90 hover:text-white"
              onClick={fetchPosts}
              disabled={loading}
              title="Refresh posts"
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>

        {/* banner */}
        {banner && (
          <div
            className={
              "px-3 py-2 rounded-md text-sm border transition-all " +
              (banner.type === "success"
                ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
                : banner.type === "error"
                ? "bg-red-900/30 text-red-200 border-red-700/40"
                : "bg-white/5 text-white/80 border-white/10")
            }
          >
            {banner.text}
          </div>
        )}

        {loading && !fetched && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/5 border border-white/10"
              />
            ))}
          </div>
        )}

        {error && data.length === 0 && (
          <div className="text-red-300 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            Failed to load posts: {error}
            <div className="mt-3">
              <button
                onClick={fetchPosts}
                className="px-3 py-1.5 rounded-md bg-white text-black"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {fetched && data.length === 0 && (
          <div className="text-white/70 bg-white/5 border border-white/10 rounded-xl p-4">
            No posts found.
          </div>
        )}

        <div className="space-y-3">
          {pageData.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedId(p.id)}
              role="button"
              tabIndex={0}
              className={`rounded-xl transition ring-0 cursor-pointer ${
                p.id === selectedId
                  ? "ring-1 ring-white/40 bg-white/5"
                  : "hover:bg-white/5"
              }`}
            >
              <PostItem
                post={p}
                compact
                onEdit={() => {
                  setEditPost(p.raw);     // để biết owner (p.raw.user_id)
                  setOpenEdit(true);
                }}
                onDelete={() => setConfirm({ open: true, target: p })}
                onAuthorClick={() => navigate(`/profile/${p.authorId}`)}
              />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="text-sm text-white/80">
              Page <span className="font-semibold">{page}</span> / {totalPages}
            </div>
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ====== PANEL CHI TIẾT ====== */}
      <aside className="relative">
        {panelLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1C2028] rounded-xl border border-[#2d2d33] text-white/60 animate-pulse">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading...
          </div>
        ) : currentPost ? (
          <PostInfoPanel postId={currentPost.id} />
        ) : (
          <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
            Nothing to show here.
          </div>
        )}
      </aside>

      {/* ====== MODAL XOÁ ====== */}
      <ConfirmModal
        open={confirm.open}
        message={`Are you sure you want to delete ${
          confirm.target?.title || "this post"
        }?`}
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={async () => {
          const targetId = confirm.target?.id;
          try {
            const res = await doDelete(targetId);
            if (res?.status === "ok" || res?.status === "success") {
              removeFromLocal(targetId);
              showBanner("success", "Đã xoá bài viết.");
            } else {
              throw new Error(res?.message || "Delete failed");
            }
          } catch (e) {
            showBanner("error", e?.message || "Delete failed");
          } finally {
            setConfirm({ open: false, target: null });
          }
        }}
      />

      {/* ====== MODAL EDIT ====== */}
      <ModalEditPost
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditPost(null);
        }}
        post={editPost || {}}
        albums={albums}
        categories={categories}
        isAdmin={isAdmin}
        onSave={handleSubmitEdit}
      />
    </div>
  );
}
