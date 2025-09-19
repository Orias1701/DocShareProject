import React, { useEffect, useState } from "react";
import FollowingSection from "../../components/following/FollowingSection";
import postService from "../../services/postService";

export default function FollowingPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Link mặc định cho file khi file_url null
  const DEFAULT_FILE_URL = "https://via.placeholder.com/150?text=No+File";

  useEffect(() => {
    const fetchFollowingPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Giả lập API list_posts_by_following
        const res = await postService.listPostsByFollowing?.() || 
                    await fetchJson("list_posts_by_following", { method: "GET" });

        if (!res || res.status !== "success" || !Array.isArray(res.data)) {
          throw new Error("API trả về dữ liệu không hợp lệ");
        }

        const mappedPosts = res.data.map(p => ({
          id: p.post_id,
          title: p.title,
          excerpt: p.excerpt,
          uploadTime: p.created_at,
          albumName: p.album_name || "Chưa có album",
          authorName: p.author_name || "Unknown",
          fileUrl: p.file_url || DEFAULT_FILE_URL, // ✅ Gán default nếu null
          fileType: p.file_type || "unknown",
        }));

        setPosts(mappedPosts);

      } catch (err) {
        console.error("Lỗi tải danh sách bài viết:", err);
        setError(err.message || "Lỗi kết nối API");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingPosts();
  }, []);

  if (loading) return <div className="text-white p-4">Đang tải danh sách...</div>;
  if (error) return <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg"><strong>Lỗi:</strong> {error}</div>;

  return (
    <div className="w-full">
      <FollowingSection
        title="Bài viết từ những người bạn đang theo dõi"
        posts={posts}
      />
    </div>
  );
}
