// src/pages/user_manager/tabs/PostsTab.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

import PostItem from "../../../components/user_manager/list/PostItem";
import PostInfoPanel from "../../../components/user_manager/panels/PostInfoPanel";
import ConfirmModal from "../../../components/user_manager/modals/ConfirmModal";

import postService from "../../../services/postService"; // ✅ nhất quán tên import

const FALLBACK_AVATAR = "https://i.pravatar.cc/100?img=12";
const slugHash = (name) =>
  name ? `#${name.toString().trim().replace(/\s+/g, "")}` : undefined;

const mapApiPost = (p) => {
  const authorName =
    (p.full_name && p.full_name.trim()) ||
    (p.username && p.username.trim()) ||
    "unknown";
  return {
    id: p.post_id,
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

export default function PostsTab() {
  const navigate = useNavigate();

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [fetched, setFetched] = React.useState(false);

  const [selectedId, setSelectedId] = React.useState();
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const [confirm, setConfirm] = React.useState({ open: false, target: null });

  // 🔔 banner gọn
  const [banner, setBanner] = React.useState(null); // {type:'success'|'error'|'info', text}
  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
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
        setSelectedId(mapped[0]?.id);
      } else {
        throw new Error(res?.message || "Invalid post list response");
      }
    } catch (e) {
      setError(e?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!fetched && !loading) fetchPosts();
  }, []); // once

  React.useEffect(() => setPage(1), [fetched]);

  // ====== THỰC THI XOÁ ======
  // ====== THỰC THI XOÁ ======
const doDelete = async (postId) => {
  console.log("[PostsTab] 🔸 Bắt đầu xoá post", postId);

  let res;
  try {
    console.log("[PostsTab] → gọi POST form-data removeViaPost(post_id)");
    res = await postService.removeViaPost(postId);
    console.log("[PostsTab] ← removeViaPost response:", res);
  } catch (e) {
    console.error("[PostsTab] removeViaPost THROW:", e);
  }

  if (!res || (res?.status !== "ok" && res?.status !== "success")) {
    try {
      console.log("[PostsTab] → fallback GET remove(post_id) (query)");
      res = await postService.remove(postId);
      console.log("[PostsTab] ← remove response:", res);
    } catch (e2) {
      console.error("[PostsTab] remove THROW:", e2);
      throw e2; // ném cho caller xử lý
    }
  }

  return res;
};


  // ====== CẬP NHẬT UI SAU XOÁ (không reload) ======
  const removeFromLocal = (postId) => {
    setData((prev) => {
      const next = prev.filter((x) => x.id !== postId);

      // sửa selected nếu đang trỏ vào post vừa xoá
      setSelectedId((prevSel) => {
        if (prevSel === postId) {
          return next[0]?.id;
        }
        return prevSel;
      });

      // điều chỉnh page nếu trang hiện tại rỗng
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotalPages));
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* 🔔 banner */}
        {banner && (
          <div
            className={
              "px-3 py-2 rounded-md text-sm border " +
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
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        )}

        {error && data.length === 0 && (
          <div className="text-red-300 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            Failed to load posts: {error}
            <div className="mt-3">
              <button onClick={fetchPosts} className="px-3 py-1.5 rounded-md bg-white text-black">
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
              className={`rounded-xl transition ring-0 ${p.id === selectedId ? "ring-1 ring-white/40" : ""}`}
            >
              <PostItem
                post={p}
                compact
                onEdit={() => alert("Edit post")}
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

      <aside>
        {currentPost ? (
          <PostInfoPanel post={currentPost} />
        ) : (
          <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
            Nothing to show here.
          </div>
        )}
      </aside>

      <ConfirmModal
  open={confirm.open}
  message={`Are you sure you want to delete ${confirm.target?.title || "this post"}?`}
  onClose={() => setConfirm({ open: false, target: null })}
  onConfirm={async () => {
    const targetId = confirm.target?.id;
    try {
      console.log("[PostsTab] ✅ Confirm delete, targetId=", targetId);
      const res = await doDelete(targetId);

      if (res?.status === "ok" || res?.status === "success") {
        console.log("[PostsTab] 🟢 Xoá thành công trên server. res=", res);
        removeFromLocal(targetId);
        showBanner("success", "Đã xoá bài viết.");
      } else {
        console.warn("[PostsTab] 🟠 Server trả status lỗi:", res);
        throw new Error(res?.message || "Delete failed");
      }
    } catch (e) {
      // 401/403/422/... từ BE: e.message sẽ chứa msg của BE nếu fetchJson parse được
      console.error("[PostsTab] 🔴 Xoá thất bại:", e);
      showBanner("error", e?.message || "Delete failed");
    } finally {
      setConfirm({ open: false, target: null });
    }
  }}
/>

    </div>
  );
}
