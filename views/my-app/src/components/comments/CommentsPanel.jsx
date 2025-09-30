import React, { useEffect, useState, useCallback } from "react";
import post_commentServices from "../../services/post_commentServices";

/* Icon chat */
function IconMessage(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className || "w-5 h-5"}
    >
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
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

/* Một comment item */
function CommentItem({ cmt, canManage, onStartEdit, onDelete }) {
  return (
    <div className="flex items-start gap-2 mt-3">
      {cmt.avatar_url ? (
        <img
          src={cmt.avatar_url}
          alt={cmt.full_name}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          onError={(e) => { e.currentTarget.src = "/images/default-avatar.png"; }}
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
          {(cmt.full_name || "?").charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-gray-300">
            {cmt.full_name}
          </span>
          <span className="text-[11px] text-gray-500">
            {fmtDate(cmt.created_at)}
          </span>

          {canManage && (
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => onStartEdit(cmt)}
                className="text-[11px] px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200"
                aria-label="Sửa bình luận"
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => onDelete(cmt)}
                className="text-[11px] px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-200"
                aria-label="Xoá bình luận"
              >
                Xoá
              </button>
            </div>
          )}
        </div>

        <div className="mt-1 bg-gray-800/70 rounded-lg px-3 py-2">
          <p className="text-sm text-gray-200 whitespace-pre-wrap">
            {cmt.content}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Props:
 * - postId: string (bắt buộc)
 * - currentUserId: string | null
 * - initialCount?: number (để hiện count tức thời)
 * - onCountChange?: (n: number) => void (callback cho parent cập nhật nút "Bình luận • n")
 */
export default function CommentsPanel({
  postId,
  currentUserId,
  initialCount = 0,
  onCountChange,
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [comments, setComments] = useState([]);

  // create form
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const isLoggedIn = !!currentUserId;
  const canSubmit = isLoggedIn && content.trim().length > 0 && !posting;

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null);

  // nếu có initialCount → báo cho parent ngay (hiển thị tức thời)
  useEffect(() => {
    if (typeof initialCount === "number") {
      onCountChange?.(initialCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCount]);

  const loadComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await post_commentServices.listByPost(postId);
      if (res?.ok) {
        const arr = Array.isArray(res.data) ? res.data.slice() : [];
        arr.sort(
          (a, b) =>
            parseLocalDatetime(a.created_at) - parseLocalDatetime(b.created_at)
        );
        setComments(arr);
        onCountChange?.(arr.length); // 🔔 cập nhật count cho parent
      } else {
        setErr(res?.message || "Không lấy được bình luận");
      }
    } catch (e) {
      setErr(e?.message || "Lỗi tải bình luận");
    } finally {
      setLoading(false);
    }
  }, [postId, onCountChange]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // create
  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!canSubmit) return;
    try {
      setPosting(true);
      await post_commentServices.create({
        post_id: postId,
        content: content.trim(),
      });
      setContent("");
      await loadComments(); // load lại → tự cập nhật count qua onCountChange
    } catch (e) {
      alert(e?.message || "Gửi bình luận thất bại");
    } finally {
      setPosting(false);
    }
  }

  // edit
  function startEdit(cmt) {
    if (String(cmt.user_id) !== String(currentUserId)) return;
    setEditingId(cmt.comment_id);
    setEditingText(cmt.content);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
    setSavingEdit(false);
  }
  async function saveEdit() {
    if (!editingId || !editingText.trim()) return;
    try {
      setSavingEdit(true);
      await post_commentServices.update({
        comment_id: editingId,
        content: editingText.trim(),
      });
      cancelEdit();
      await loadComments();
    } catch (e) {
      alert(e?.message || "Cập nhật bình luận thất bại");
      setSavingEdit(false);
    }
  }

  // delete
  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    try {
      await post_commentServices.remove(confirmDelete.comment_id);
      setConfirmDelete(null);
      await loadComments();
    } catch (e) {
      alert(e?.message || "Xoá bình luận thất bại");
    }
  }

  return (
    <div className="bg-[#1C2028] border border-gray-700 rounded-lg text-left">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <IconMessage className="w-5 h-5 text-gray-300" />
        <h3 className="text-gray-100 font-semibold">Bình luận</h3>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 pt-3">
        <div className="flex items-start gap-2">
          <textarea
            className="flex-1 text-sm bg-[#0F1520] border border-gray-700 rounded-md p-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 min-h-[40px] max-h-40 resize-y"
            placeholder={
              isLoggedIn
                ? "Viết bình luận của bạn…"
                : "Bạn cần đăng nhập để bình luận"
            }
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isLoggedIn}
            aria-label="Nội dung bình luận"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className={`h-[40px] px-3 text-sm rounded-md ${
              canSubmit
                ? "bg-green-600 hover:bg-green-500"
                : "bg-gray-700 cursor-not-allowed"
            } text-white`}
            aria-label="Gửi bình luận"
          >
            {posting ? "Đang gửi…" : "Gửi"}
          </button>
        </div>
        {!isLoggedIn && (
          <p className="mt-2 text-xs text-amber-300">
            Bạn cần đăng nhập để gửi bình luận.
          </p>
        )}
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
            {comments.map((c) =>
              editingId === c.comment_id ? (
                <div key={c.comment_id} className="py-3">
                  <div className="bg-gray-800/70 rounded-lg p-3">
                    <textarea
                      className="w-full text-sm bg-transparent outline-none text-gray-100 placeholder-gray-500"
                      rows={3}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      placeholder="Nội dung bình luận…"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={savingEdit || !editingText.trim()}
                        className={`px-3 py-1.5 text-sm rounded ${
                          savingEdit || !editingText.trim()
                            ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                        aria-label="Lưu chỉnh sửa"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-gray-100"
                        aria-label="Huỷ chỉnh sửa"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <CommentItem
                  key={c.comment_id}
                  cmt={c}
                  canManage={String(currentUserId) === String(c.user_id)}
                  onStartEdit={startEdit}
                  onDelete={(cmt) => setConfirmDelete(cmt)}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Modal xác nhận xoá */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1C2028] p-6 rounded-lg border border-gray-700 w-[300px]">
            <h4 className="text-lg font-semibold text-white mb-2">
              Xác nhận xoá
            </h4>
            <p className="text-sm text-gray-300 mb-4">
              Bạn có chắc chắn muốn xoá bình luận này?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-sm"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
