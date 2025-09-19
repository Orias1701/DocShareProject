import React, { useEffect, useState } from "react";
import FollowingSection from "../../components/following/FollowingSection";
import { postService } from "../../services/postService"; // giữ import dạng named

export default function FollowingPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const DEFAULT_FILE_URL = "https://via.placeholder.com/150?text=No+File";

  // Helper: chuẩn hóa hashtags về mảng string
  function parseHashtags(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string") {
      // Thử parse JSON first (nếu backend trả '["a","b"]')
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch (e) {
        // không phải JSON => tiếp tục xử lý
      }
      // Nếu là chuỗi phân cách bằng dấu phẩy "tag1,tag2"
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // fallback
    return [];
  }

  useEffect(() => {
    let mounted = true;

    async function fetchFollowingPosts() {
      setLoading(true);
      setError(null);

      try {
        const res = await postService.listPostsByFollowing();

        // res có thể là array hoặc { status, data }
        const rawPosts = Array.isArray(res) ? res : res?.data ?? [];

        if (!Array.isArray(rawPosts)) {
          throw new Error("API trả về dữ liệu không hợp lệ");
        }

        // Optional debug: bật console để thấy backend trả gì
        // console.log("rawPosts sample:", rawPosts[0]);

        const mappedPosts = rawPosts.map((p) => ({
          id: p.post_id,
          title: p.title,
          excerpt: p.excerpt,
          uploadTime: p.created_at,
          albumName: p.album_name || "Chưa có album",
          authorName: p.author_username || p.author_name || "Unknown",
          fileUrl: p.file_url || p.banner_url || DEFAULT_FILE_URL,
          fileType: p.file_type || "unknown",
          hashtags: parseHashtags(p.hashtags),
        }));

        if (mounted) setPosts(mappedPosts);
      } catch (err) {
        console.error("Lỗi tải danh sách bài viết:", err);
        if (mounted) setError(err.message || "Lỗi kết nối API");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFollowingPosts();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="text-white p-4">Đang tải danh sách...</div>;
  if (error)
    return (
      <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg">
        <strong>Lỗi:</strong> {error}
      </div>
    );

  return (
    <div className="w-full">
      <FollowingSection title="Bài viết từ những người bạn đang theo dõi" posts={posts} />
    </div>
  );
}
