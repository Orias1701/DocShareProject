// src/pages/hashtags/HashtagDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import post_hashtagService from "../../services/post_hastagService";

function normalizeTagName(s) {
  // bỏ dấu #, trim, so sánh không phân biệt hoa/thường
  return String(s || "").replace(/^#/, "").trim();
}

export default function HashtagDetailPage() {
  const { slug } = useParams(); // ví dụ: "algorithm" hoặc "Toán"
  const [title, setTitle] = useState(slug);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 1) Lấy tất cả hashtag để map name -> id
        const tags = await postService.listHashtags(); // [{id, name}]
        const wanted = normalizeTagName(decodeURIComponent(slug)).toLowerCase();

        const found = (tags || []).find((t) => {
          const nm = normalizeTagName(t.name).toLowerCase();
          return nm === wanted;
        });

        if (!found) {
          setTitle(slug);
          setPosts([]);
          setErr("Không tìm thấy hashtag này.");
          return;
        }

        setTitle(found.name.startsWith("#") ? found.name.slice(1) : found.name);

        // 2) Lấy bài viết theo hashtag_id
        const res = await post_hashtagService.getPostsByHashtagId(found.id);
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (mounted) setPosts(rows);
      } catch (e) {
        if (mounted) setErr(e?.message || "Không tải được dữ liệu hashtag.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [slug]);

  if (loading) return <div className="text-white p-4">Đang tải hashtag…</div>;

  return (
    <div className="text-white p-4">
      <h2 className="text-2xl font-bold mb-4"># {title}</h2>

      {err ? (
        <div className="bg-red-900/40 border border-red-700 rounded p-3">{err}</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-400">Chưa có bài viết nào cho hashtag này.</div>
      ) : (
        <PostSection
          title={`Có ${posts.length} bài viết`}
          posts={posts}
          hideReactions={false}
        />
      )}
    </div>
  );
}
