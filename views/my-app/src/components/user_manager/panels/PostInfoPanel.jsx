import React, { useEffect, useState } from "react";
import postService from "../../../services/postService";
import post_reactionService from "../../../services/post_reactionService";

export default function PostInfoPanel({ postId }) {
  const [post, setPost] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      postService.getByIdCompact(postId).catch(() => null),
      post_reactionService.count(postId).catch(() => null),
    ])
      .then(([detailRes, reactRes]) => {
        const detail = detailRes?.data?.post || detailRes?.post || detailRes;
        setPost(detail || null);

        const hashtagsData = detailRes?.data?.hashtags ?? [];
        setHashtags(hashtagsData);

        const likes =
          reactRes?.data?.total_likes ?? reactRes?.total_likes ?? 0;
        const dislikes =
          reactRes?.data?.total_dislikes ?? reactRes?.total_dislikes ?? 0;
        setCounts({ likes, dislikes });
      })
      .catch(() => setError("Không thể tải thông tin bài viết"))
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) {
    return (
      <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-2/3 bg-white/10 rounded" />
          <div className="h-4 w-1/2 bg-white/10 rounded" />
          <div className="h-px bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-2/3 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
        {error || "Không có dữ liệu bài viết."}
      </div>
    );
  }

  const title = post.title || "Untitled";
  const author = post.full_name || "Ẩn danh";
  const album = post.album_name || "Không có album";

  return (
    <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white">
      {/* Header giống panel bên phải */}
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
          <i className="fa-regular fa-file-lines" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold leading-snug text-white/90 line-clamp-2">
            {title}
          </div>
          <div className="text-sm text-white/60 truncate">
            #{postId}
          </div>
        </div>
      </div>

      <div className="mt-4 h-px bg-white/10" />

      {/* Section: Overview */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-white/80 mb-2">
          Overview
        </div>
        <ul className="text-sm text-white/80 space-y-2">
          <li className="flex items-center">
            <i className="fa-regular fa-user mr-2 text-white/50" />
            <span className="text-white/60 mr-2">Author:</span>
            <span className="text-white/90">{author}</span>
          </li>

          <li className="flex items-center">
            <i className="fa-regular fa-folder-open mr-2 text-white/50" />
            <span className="text-white/60 mr-2">Album:</span>
            <span className="text-white/90">{album}</span>
          </li>

          <li className="flex items-start">
            <i className="fa-solid fa-tag mr-2 mt-0.5 text-white/50" />
            <span className="text-white/60 mr-2">Hashtags:</span>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {hashtags.length > 0 ? (
                hashtags.map((h) => (
                  <span key={h.hashtag_id} className="text-white/90">
                    #{h.hashtag_name}
                  </span>
                ))
              ) : (
                <span className="text-white/50">Không có</span>
              )}
            </div>
          </li>

          <li className="flex items-center">
            <i className="fa-regular fa-clock mr-2 text-white/50" />
            <span className="text-white/60 mr-2">Created:</span>
            <span className="text-white/90">
              {post.created_at || "—"}
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-4 h-px bg-white/10" />

      {/* Section: Reactions */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-white/80 mb-2">
          Reactions
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center text-white/80">
            <i className="fa-regular fa-thumbs-up mr-2 text-white/50" />
            <span className="text-white/60 mr-1">Likes:</span>
            <span className="text-white/90">{counts.likes}</span>
          </div>
          <div className="flex items-center text-white/80">
            <i className="fa-regular fa-thumbs-down mr-2 text-white/50" />
            <span className="text-white/60 mr-1">Dislikes:</span>
            <span className="text-white/90">{counts.dislikes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
