// src/components/reactions/ReactionThumbs.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import post_reactionService from "../../services/post_reactionService";
import useAuth  from "../../hook/useAuth"; // ⬅️ cần có context trả { user, isAuthenticated }

function readCache(userId, postId) {
  try {
    const k = `rx:${userId}:${postId}`;
    const raw = sessionStorage.getItem(k);
    return raw ? JSON.parse(raw) : null; // { my, counts:{like,dislike} }
  } catch {
    return null;
  }
}
function writeCache(userId, postId, data) {
  try {
    const k = `rx:${userId}:${postId}`;
    sessionStorage.setItem(k, JSON.stringify(data));
  } catch {}
}
function removeCache(userId, postId) {
  try {
    const k = `rx:${userId}:${postId}`;
    sessionStorage.removeItem(k);
  } catch {}
}

export default function ReactionThumbs({
  postId,
  initialCounts = { like: 0, dislike: 0 },
  initialMyReaction = null,
  onChange,
  onCountsChange,
  size = "md",
  className = "",
  autoRefresh = true,               // ⬅️ bật mặc định
  likeColor = "#3b82f6",
  dislikeColor = "#ef4444",
}) {
  const { user, isAuthenticated } = useAuth?.() || { user: null, isAuthenticated: false };
  const userId = user?.user_id || user?.id || "anon";

  // Hydrate nhanh từ props → cache (nếu có) → mặc định
  const cache = useMemo(() => readCache(userId, postId), [userId, postId]);
  const [counts, setCounts] = useState({
    like: Number(cache?.counts?.like ?? initialCounts.like) || 0,
    dislike: Number(cache?.counts?.dislike ?? initialCounts.dislike) || 0,
  });
  const [my, setMy] = useState(
    cache?.my ?? (initialMyReaction === "like" || initialMyReaction === "dislike" ? initialMyReaction : null)
  );
  const [loading, setLoading] = useState(false);

  // Refetch khi postId/userId thay đổi hoặc khi bật autoRefresh
  useEffect(() => {
    if (!autoRefresh || !postId || !isAuthenticated) return;

    let alive = true;
    (async () => {
      try {
        const res = await post_reactionService.getState(postId);
        if (!alive) return;
        if (res?.status === "success") {
          const d = res.data || {};
          const nextMy = d.myReaction ?? null;
          const nextCounts = {
            like: Number(d.counts?.like || 0),
            dislike: Number(d.counts?.dislike || 0),
          };
          setMy(nextMy);
          setCounts(nextCounts);
          onChange?.(nextMy);
          onCountsChange?.(nextCounts);
          writeCache(userId, postId, { my: nextMy, counts: nextCounts });
        }
      } catch {
        // im lặng; vẫn dùng giá trị hiện có (cache/props)
      }
    })();

    return () => {
      alive = false;
    };
  }, [autoRefresh, postId, userId, isAuthenticated]); // ⬅️ quan trọng: phụ thuộc userId

  const sizeCls =
    ({ sm: "text-xs px-2 py-1", md: "text-sm px-3 py-1.5", lg: "text-base px-4 py-2" }[size]) ||
    "text-sm px-3 py-1.5";

  function computeNext(prevMy, prevCounts, type) {
    const next = { ...prevCounts };
    let nextMy = prevMy;
    if (prevMy === type) {
      next[type] = Math.max(0, (next[type] || 0) - 1);
      nextMy = null;
    } else {
      if (prevMy) next[prevMy] = Math.max(0, (next[prevMy] || 0) - 1);
      next[type] = (next[type] || 0) + 1;
      nextMy = type;
    }
    return { nextMy, next };
  }

  async function handleClick(type, e) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!postId || loading) return;

    if (!isAuthenticated) {
      // tuỳ bạn điều hướng
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    const prevMy = my;
    const prevCounts = counts;
    const { nextMy, next } = computeNext(prevMy, prevCounts, type);

    // optimistic
    setMy(nextMy);
    setCounts(next);
    onChange?.(nextMy);
    onCountsChange?.(next);
    writeCache(userId, postId, { my: nextMy, counts: next });

    try {
      const res = await post_reactionService.toggle(postId, type);
      if (res?.status === "success") {
        const d = res.data || {};
        const srvMy = d.myReaction ?? null;
        const srvCounts = {
          like: Number(d.counts?.like || 0),
          dislike: Number(d.counts?.dislike || 0),
        };
        setMy(srvMy);
        setCounts(srvCounts);
        onChange?.(srvMy);
        onCountsChange?.(srvCounts);
        writeCache(userId, postId, { my: srvMy, counts: srvCounts });
      } else {
        // rollback
        setMy(prevMy);
        setCounts(prevCounts);
        onChange?.(prevMy);
        onCountsChange?.(prevCounts);
        writeCache(userId, postId, { my: prevMy, counts: prevCounts });
      }
    } catch (e2) {
      // rollback
      setMy(prevMy);
      setCounts(prevCounts);
      onChange?.(prevMy);
      onCountsChange?.(prevCounts);
      writeCache(userId, postId, { my: prevMy, counts: prevCounts });

      if (e2?.code === "UNAUTHENTICATED") {
        window.location.href = "/login";
      } else {
        console.error("toggleReaction failed:", e2);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* LIKE */}
      <button
        type="button"
        disabled={loading}
        aria-pressed={my === "like"}
        aria-label={my === "like" ? "Bỏ like" : "Like"}
        onClick={(e) => handleClick("like", e)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`rounded-full bg-[#2A303C] border border-gray-700/70 hover:border-gray-500 ${sizeCls} select-none flex items-center gap-2 transition active:scale-95 disabled:opacity-60`}
      >
        {my === "like" ? (
          <i className="fa-solid fa-thumbs-up text-lg" style={{ color: likeColor }} />
        ) : (
          <i className="fa-regular fa-thumbs-up text-lg text-gray-300" />
        )}
        <span className="text-gray-300 text-xs">{counts.like}</span>
      </button>

      {/* DISLIKE */}
      <button
        type="button"
        disabled={loading}
        aria-pressed={my === "dislike"}
        aria-label={my === "dislike" ? "Bỏ dislike" : "Dislike"}
        onClick={(e) => handleClick("dislike", e)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`rounded-full bg-[#2A303C] border border-gray-700/70 hover:border-gray-500 ${sizeCls} select-none flex items-center gap-2 transition active:scale-95 disabled:opacity-60`}
      >
        {my === "dislike" ? (
          <i className="fa-solid fa-thumbs-down text-lg" style={{ color: dislikeColor }} />
        ) : (
          <i className="fa-regular fa-thumbs-down text-lg text-gray-300" />
        )}
        <span className="text-gray-300 text-xs">{counts.dislike}</span>
      </button>
    </div>
  );
}

ReactionThumbs.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialCounts: PropTypes.shape({
    like: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dislike: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  initialMyReaction: PropTypes.oneOf([null, "like", "dislike"]),
  onChange: PropTypes.func,
  onCountsChange: PropTypes.func,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  autoRefresh: PropTypes.bool,
  likeColor: PropTypes.string,
  dislikeColor: PropTypes.string,
};
