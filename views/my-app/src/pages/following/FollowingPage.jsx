import React, { useEffect, useState } from "react";
import FollowingSection from "../../components/following/FollowingSection";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";

export default function FollowingPostsPage() {
  const [users, setUsers] = useState([]);          // danh sách user đang follow
  const [posts, setPosts] = useState([]);          // tất cả bài viết
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Lấy danh sách user đang follow
        // const resUsers = await user_followServices.userFollowing();
        // if (resUsers.status !== "success") throw new Error("Không thể tải danh sách người theo dõi.");
        // console.log(resUsers);
        // setUsers(resUsers.data || []);
        // //map user thành mảng
        // const user = (resUsers.data || []).map(u => ({
        //   user_id: u.user_id,
        //   username: u.username,
        //   email: u.email,
        //   followers_name: u.followers_name,
        //   full_name: u.full_name,
        // }));
        
        // Lấy tất cả bài viết từ những người đang follow
        const postsArrays = await Promise.all(
          users.map(u => postService.listPostsByFollowing(u.user_id))
        );
        console.log("Posts arrays:", postsArrays);
        const allPosts = await postService.listPostsByFollowing();
        setPosts(allPosts);             
        //map post thành mảng
        // const post = (resPosts.data || []).map(p => ({
          
        // }));
      }
      catch (err) {
        setError(err.message || "Đã xảy ra lỗi không xác định.");
      }
      finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-white p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg"><strong>Lỗi:</strong> {error}</div>;

  return (
    <div className="w-full">
      <h2 className="text-white mb-4">Danh sách người bạn đang theo dõi</h2>
      <ul>
        {users.map(u => (
          <li key={u.user_id} className="text-white mb-2 flex items-center gap-2">
            <img src={u.avatar_url} alt={u.username} className="w-8 h-8 rounded-full" />
            <span>{u.full_name} ({u.username})</span>
          </li>
        ))}
      </ul>

      <FollowingSection
        title="Bài viết từ những người bạn đang theo dõi"
        posts={posts}
      />
    </div>
  );
}
