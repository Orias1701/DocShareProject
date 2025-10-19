import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PostItem from "../../../components/user_manager/list/PostItem";
import ConfirmModal from "../../common/ConfirmModal";
import ModalEditPost from "../../../components/user_manager/modals/ModalEditPost";
import PostInfoPanel from "../../../components/user_manager/panels/PostInfoPanel";

import postService from "../../../services/postService";
import albumService from "../../../services/albumService";
import categoryServices from "../../../services/categoryServices";

const FALLBACK_AVATAR = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";
const slugHash = (name) => (name ? `#${name.toString().trim().replace(/\s+/g, "")}` : undefined);

const mapApiPost = (p) => {
  const authorName =
    (p.full_name && p.full_name.trim()) ||
    (p.username && p.username.trim()) ||
    "unknown";
  return {
    id: p.post_id,
    user_id: p.user_id,
    authorId: p.user_id,
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

const getCurrentUserId = () =>
  window?.APP?.currentUser?.user_id ||
  window?.SESSION?.user_id ||
  window?.CURRENT_USER?.user_id ||
  null;

export default function PostsTab() {
  const navigate = useNavigate();

  // List state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  // Selection & paging (giống UsersTab)
  const [selectedId, setSelectedId] = useState();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modals
  const [confirm, setConfirm] = useState({ open: false, target: null });
  const [openEdit, setOpenEdit] = useState(false);
  const [editPost, setEditPost] = useState(null);

  // Banner
  const [banner, setBanner] = useState(null);
  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  // Data for edit modal
  const [albums, setAlbums] = useState([]);
  const [categories, setCategories] = useState([]);
  const isAdmin =
    (window?.APP?.currentUser?.role_id || window?.SESSION?.role_id) === "ROLE000";

  // Paging helpers (giống UsersTab)
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  // Item đang chọn: pick trong trang hiện tại giống UsersTab
  const currentPost =
    pageData.find((p) => p.id === selectedId) ?? pageData[0] ?? null;

  // Fetch list
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

  // Albums/Categories for edit modal (theo owner)
  const fetchAlbumsCategories = async () => {
    try {
      const userIdTarget =
        editPost?.user_id || editPost?.author_id || editPost?.raw?.user_id || getCurrentUserId();

      let albArr = [];
      if (userIdTarget) {
        albArr = await albumService.listAlbumsByUserId(userIdTarget);
      } else {
        albArr = await albumService.listMyAlbums();
        if (!Array.isArray(albArr) || !albArr.length) {
          albArr = await albumService.listAllAlbums();
        }
      }

      const normAlbums = (albArr || []).map((a) => ({
        album_id: a.album_id ?? a.id,
        album_name: a.album_name ?? a.name,
      }));

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

  // Effects
  useEffect(() => {
    if (!fetched && !loading) fetchPosts();
  }, []); // once

  useEffect(() => setPage(1), [fetched]);

  useEffect(() => {
    if (openEdit && (albums.length === 0 || categories.length === 0)) {
      fetchAlbumsCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEdit, editPost]);

  // Delete helpers
  const doDelete = async (postId) => {
    try {
      return await postService.removeViaPost(postId);
    } catch {
      return await postService.remove(postId);
    }
  };

  const removeFromLocal = (postId) => {
    setData((prev) => {
      const next = prev.filter((x) => x.id !== postId);
      // nếu đang đứng trên item vừa xóa, chuyển selection sang item đầu trang
      setSelectedId((prevSel) => (prevSel === postId ? next[0]?.id : prevSel));
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotalPages));
      return next;
    });
  };

  // Submit edit
  const handleSubmitEdit = async (payload) => {
    try {
      const res = await postService.update(payload);
      if (res?.status === "ok" || res?.status === "success") {
        showBanner("success", res?.message || "Đã cập nhật bài viết.");
        await fetchPosts(); // refresh list để đồng bộ
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Post List</h2>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-outline"
              onClick={fetchPosts}
              disabled={loading}
              title="Refresh"
            >
              <i className="fa-solid fa-rotate" />
            </button>
          </div>
        </div>

        {/* Banner */}
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

        {/* States */}
        {loading && !fetched && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10" />
            ))}
          </div>
        )}

        {error && !data.length && (
          <div className="panel panel-muted text-red-300">
            Failed to load posts: {error}
            <button onClick={fetchPosts} className="btn btn-primary mt-3">
              Retry
            </button>
          </div>
        )}

        {fetched && !data.length && (
          <div className="panel panel-muted">No posts found.</div>
        )}

        {/* List items */}
        <div className="space-y-3">
          {pageData.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(p.id)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedId(p.id)}
              className={`rounded-xl transition ring-0 cursor-pointer ${
                p.id === selectedId ? "ring-1 ring-white/40 bg-white/5" : "hover:bg-white/5"
              }`}
            >
              <PostItem
                post={p}
                compact
                onEdit={() => {
                  setEditPost(p.raw);      // để modal biết owner (user_id)
                  setOpenEdit(true);
                }}
                onDelete={() => setConfirm({ open: true, target: p })}
                onAuthorClick={() => navigate(`/profile/${p.authorId}`)}
              />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <div>
              Page <strong>{page}</strong> / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Detail panel – truyền thẳng object như UsersTab */}
      <aside>
        {currentPost ? (
          <PostInfoPanel post={currentPost} postId={currentPost.id} />
        ) : (
          <div className="panel panel-muted">Nothing to show here.</div>
        )}
      </aside>

      {/* Confirm delete */}
      <ConfirmModal
        open={confirm.open}
        message={`Delete ${confirm.target?.title || "this post"}?`}
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

      {/* Edit modal */}
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
