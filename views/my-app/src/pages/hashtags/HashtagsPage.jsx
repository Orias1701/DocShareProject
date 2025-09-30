// src/pages/hashtags/HashtagsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";

function normalizeTagName(s) {
  return String(s || "").replace(/^#/, "").trim();
}

export default function HashtagsPage() {
  const { slug } = useParams(); // ví dụ: /hashtags/Toán → slug="Toán"
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
        const wantedName = normalizeTagName(decodeURIComponent(slug));

        // Gọi trực tiếp theo tên hashtag
        let rows = await postService.getPostsByHashtag({ hashtag_name: wantedName });

        // Nếu không có, fallback sang tìm id
        if (!Array.isArray(rows) || rows.length === 0) {
          const tags = await postService.listHashtags();
          const found = (tags || []).find(
            (t) => normalizeTagName(t.name).toLowerCase() === wantedName.toLowerCase()
          );
          if (found?.id) {
            rows = await postService.getPostsByHashtag({ hashtag_id: found.id });
            setTitle(found.name.startsWith("#") ? found.name.slice(1) : found.name);
          } else {
            setTitle(wantedName);
            setPosts([]);
            setErr("Không tìm thấy hashtag này.");
            return;
          }
        } else {
          setTitle(wantedName);
        }

        if (mounted) setPosts(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (mounted) setErr(e?.message || "Không tải được dữ liệu hashtag.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
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
