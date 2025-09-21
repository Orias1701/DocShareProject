import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileHeader from "../../components/profile/ProfileHeader";
import BioCard from "../../components/profile/BioCard";
import PostFeed from "../../components/profile/PostFeed";
import { userInfoApi } from "../../services/user_infoServices";
import postService from "../../services/postService";

/** Map JSON BE -> cấu trúc PostCardProfile */
function normalizePostForProfile(p) {
  const isPdf = String(p?.file_type || "").toLowerCase().includes("pdf");

  const banner =
    p?.banner_url && p.banner_url.trim() !== ""
      ? p.banner_url
      : isPdf
      ? "https://via.placeholder.com/112x112?text=PDF"
      : "https://via.placeholder.com/112x112?text=Image";

  return {
    id: p?.post_id || p?.id,
    author: {
      realName: p?.author_name || "Ẩn danh",
      avatar: p?.avatar_url || "https://i.pravatar.cc/40?img=1",
    },
    postDate: p?.created_at || "",
    mangles: [
      {
        title: p?.title || "Untitled",
        description: p?.excerpt || p?.album_name || "",
        image: banner,
        fileUrl: p?.file_url || null,
        fileType: p?.file_type || null,
      },
    ],
    reactionCounts: {
      like: Number(p?.reaction_like_count || 0),
      dislike: Number(p?.reaction_dislike_count || 0),
    },
    commentCount: Number(p?.comment_count || 0),
    my_reaction: null,
    hashtags: [],
  };
}

function ProfilePageOther() {
  const { userId } = useParams(); // 👈 lấy userId từ URL (/profile/:userId)

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  // Lấy thông tin user khác
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        const infoRes = await userInfoApi.showUserInfo(userId);
        const u = infoRes?.user ?? infoRes?.data?.user ?? infoRes?.data ?? infoRes;
        setUserData(u);
      } catch (e) {
        setError(e.message || "Không tải được thông tin người dùng");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Lấy bài viết của user khác
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setPostsLoading(true);
        const raw = await postService.listUserPosts(userId); // ⚡ cần API list bài viết của user khác
        const mapped = (Array.isArray(raw) ? raw : []).map(normalizePostForProfile);
        setUserPosts(mapped);
      } catch (e) {
        setPostsError(e.message || "Không tải được bài viết");
      } finally {
        setPostsLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <div className="text-white p-4">Đang tải hồ sơ...</div>;
  if (error) {
    return (
      <div className="text-white p-4 max-w-6xl mx-auto">
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-4">
          <div className="font-semibold">Không tải được hồ sơ</div>
          <div className="text-red-200 mt-1">{error}</div>
        </div>
      </div>
    );
  }

  const avatarUrl = userData?.avatar_url || "https://i.pravatar.cc/150?img=2";
  const fullName = userData?.full_name || "Anonymous";
  const userName = userData?.username || "no-username";
  const birthday = userData?.birth_date || "N/A";

  return (
    <div className="text-white p-4 max-w-6xl mx-auto">
      <ProfileHeader
        avatar={avatarUrl}
        realName={fullName}
        userName={userName}
        followerCount={userData?.followers_count ?? 0}
        birthday={birthday}
        onEdit={null} // ❌ không cho sửa vì là user khác
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-1">
          <BioCard user={userData} />
        </div>

        <div className="lg:col-span-2">
          {postsLoading ? (
            <div className="text-gray-300">Đang tải bài viết…</div>
          ) : postsError ? (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 text-sm">
              {postsError}
            </div>
          ) : (
            <PostFeed posts={userPosts} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePageOther;
