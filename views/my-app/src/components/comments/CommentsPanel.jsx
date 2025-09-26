// src/components/comments/CommentsPanel.jsx
import React, { useEffect, useState, useCallback } from "react";
import post_commentServices from "../../services/post_commentServices";

/* Icon nội bộ */
function IconMessage(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         className={props.className || "w-5 h-5"}>
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
    </svg>
  );
}

/* time helpers */
function parseLocalDatetime(s) {
  if (!s) return new Date(NaN);
  const [d, t = "00:00:00"] = s.split(" ");
  const [Y, M, D] = d.split("-").map(Number);
  const [h, m, sec] = t.split(":").map(Number);
  return new Date(Y, (M || 1) - 1, D || 1, h || 0, m || 0, sec || 0);
}
function fmtDate(s) {
  const d = parseLocalDatetime(s);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/* Avatars */
function InitialsAvatar({ name, size = 24 }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: 11 }}
      aria-label={name}
      title={name}
    >
      {letter}
    </div>
  );
}
function Avatar({ src, name, size = 24 }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <InitialsAvatar name={name} size={size} />;
  return (
    <img
      src={src}
      alt={name || "avatar"}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
      onError={() => setBroken(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

/* 1 comment: AVATAR TRÊN  →  NỘI DUNG DƯỚI */
function CommentItem({ cmt, depth = 0 }) {
    return (
      <div className={`flex items-start gap-2 ${depth > 0 ? "mt-3" : "mt-4"}`}>
        {/* Avatar */}
        {cmt.avatar_url ? (
          <img
            src={cmt.avatar_url}
            alt={cmt.full_name}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
            {(cmt.full_name || "?").charAt(0).toUpperCase()}
          </div>
        )}
  
        {/* Nội dung */}
        <div className="flex-1">
          <div className="bg-gray-800/70 rounded-lg px-3 py-2">
            <p className="text-sm text-gray-200">{cmt.content}</p>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {cmt.full_name} • {fmtDate(cmt.created_at)}
          </div>
  
          {/* Replies */}
          {Array.isArray(cmt.replies) && cmt.replies.length > 0 && (
            <div className="pl-5 border-l border-gray-700 mt-2">
              {cmt.replies.map((r) => (
                <CommentItem key={r.comment_id} cmt={r} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  

export default function CommentsPanel({ postId }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [comments, setComments] = useState([]);

  // form
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const canSubmit = content.trim().length > 0 && !posting;

  const loadComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await post_commentServices.listByPost(postId);
      if (res?.ok) {
        const arr = Array.isArray(res.data) ? res.data.slice() : [];
        arr.sort((a, b) => parseLocalDatetime(a.created_at) - parseLocalDatetime(b.created_at));
        setComments(arr);
      } else setErr(res?.message || "Không lấy được bình luận");
    } catch (e) {
      setErr(e?.message || "Lỗi tải bình luận");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!canSubmit) return;
    try {
      setPosting(true);
      await post_commentServices.create({ post_id: postId, content: content.trim() });
      setContent("");
      await loadComments();
    } catch (e) {
      alert(e?.message || "Gửi bình luận thất bại");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="bg-[#1C2028] border border-gray-700 rounded-lg text-left">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <IconMessage className="w-5 h-5 text-gray-300" />
        <h3 className="text-gray-100 font-semibold">Bình luận</h3>
      </div>

      {/* Form: thấp & nút cùng chiều cao */}
      <form onSubmit={handleSubmit} className="px-4 pt-3">
        <div className="flex items-start gap-2">
          <textarea
            className="flex-1 text-sm bg-[#0F1520] border border-gray-700 rounded-md p-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px] max-h-40 resize-y"
            placeholder="Viết bình luận của bạn…"
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className={`h-[40px] px-3 text-sm rounded-md ${
              canSubmit ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 cursor-not-allowed"
            } text-white`}
          >
            {posting ? "Đang gửi…" : "Gửi"}
          </button>
        </div>
        <div className="h-3" />
      </form>

      {/* List */}
      <div className="px-4 pb-4">
        {loading && <p className="text-gray-400">Đang tải bình luận…</p>}
        {!loading && err && <p className="text-red-400">{err}</p>}
        {!loading && !err && comments.length === 0 && (
          <p className="text-gray-400">Chưa có bình luận nào.</p>
        )}

        {!loading && !err && comments.length > 0 && (
          <div className="divide-y divide-gray-800">
            {comments.map((c) => (
              <CommentItem key={c.comment_id} cmt={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
