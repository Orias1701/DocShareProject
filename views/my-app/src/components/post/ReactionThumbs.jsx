// src/components/reactions/ReactionThumbs.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import post_reactionService from "../../services/post_reactionService";

export default function ReactionThumbs({
  postId,
  initialCounts = { like: 0, dislike: 0 },
  initialMyReaction = null,
  onChange,
  onCountsChange,
  size = "md",
  className = "",
  autoRefresh = false,
  likeColor = "#3b82f6",
  dislikeColor = "#ef4444",
}) {
  const [counts, setCounts] = useState({
    like: Number(initialCounts.like) || 0,
    dislike: Number(initialCounts.dislike) || 0,
  });
  const [my, setMy] = useState(initialMyReaction);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!autoRefresh || !postId) return;
    (async () => {
      try {
        const res = await post_reactionService.getState(postId);
        if (res?.status === "success") {
          const d = res.data;
          setMy(d.myReaction ?? null);
          setCounts({
            like: Number(d.counts?.like || 0),
            dislike: Number(d.counts?.dislike || 0),
          });
        }
      } catch {}
    })();
  }, [autoRefresh, postId]);

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
    // 🔒 chặn điều hướng & bubbling lên Link/card
    e?.preventDefault();
    e?.stopPropagation();

    if (loading || !postId) return;
    setLoading(true);

    const prevMy = my;
    const prevCounts = counts;
    const { nextMy, next } = computeNext(prevMy, prevCounts, type);

    // optimistic
    setMy(nextMy);
    setCounts(next);
    onChange?.(nextMy);
    onCountsChange?.(next);

    try {
      const res = await post_reactionService.toggle(postId, type);
      if (res?.status === "success") {
        const d = res.data;
        setMy(d.myReaction ?? null);
        setCounts({
          like: Number(d.counts?.like || 0),
          dislike: Number(d.counts?.dislike || 0),
        });
        onChange?.(d.myReaction ?? null);
        onCountsChange?.({
          like: Number(d.counts?.like || 0),
          dislike: Number(d.counts?.dislike || 0),
        });
      }
    } catch (e2) {
      // rollback
      setMy(prevMy);
      setCounts(prevCounts);
      onChange?.(prevMy);
      onCountsChange?.(prevCounts);
      if (e2.code === "UNAUTHENTICATED") {
        window.location.href = "/index.php?action=login";
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
      onClick={(e) => e.stopPropagation()}        // 🔒 chặn từ container
      onMouseDown={(e) => e.stopPropagation()}    // 🔒 chặn mousedown
    >
      {/* LIKE */}
      <button
        type="button"
        disabled={loading}
        aria-pressed={my === "like"}
        aria-label={my === "like" ? "Bỏ like" : "Like"}
        onClick={(e) => handleClick("like", e)}    // 🔒 pass event
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
        onClick={(e) => handleClick("dislike", e)} // 🔒 pass event
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
