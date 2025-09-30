// src/pages/profile/ProfilePageOther.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileHeader from "../../components/profile/ProfileHeader";
import BioCard from "../../components/profile/BioCard";
import PostFeed from "../../components/profile/PostFeed";
import { userInfoApi } from "../../services/user_infoServices";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";

// Map BE → FE
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
  const { userId } = useParams();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);

  // follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // counts
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Lấy thông tin user
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

  // Lấy danh sách bài viết của user
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setPostsLoading(true);
        const raw = await postService.listUserPosts(userId);
        const mapped = (Array.isArray(raw) ? raw : []).map(normalizePostForProfile);
        setUserPosts(mapped);
      } catch (e) {
        setPostsError(e.message || "Không tải được bài viết");
      } finally {
        setPostsLoading(false);
      }
    })();
  }, [userId]);

  // Check follow (mình đang follow user này không?)
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await user_followServices.userFollowing(); // danh sách mình đang follow
        const followingIds = res?.data?.map((f) => String(f?.user_id));
        setIsFollowing(followingIds?.includes(String(userId)));
      } catch (e) {
        console.error("Check follow failed:", e);
      }
    })();
  }, [userId]);

  // Load số followers/following của userId
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const f1 = await user_followServices.countFollowers(userId);
        const f2 = await user_followServices.countFollowing(userId);
        setFollowersCount(f1?.data?.count || 0);
        setFollowingCount(f2?.data?.count || 0);
      } catch (e) {
        console.error("Lỗi lấy số follow:", e);
      }
    })();
  }, [userId, isFollowing]);

  const toggleFollow = async () => {
    console.log("🔘 Toggle clicked for user:", userId);
    try {
      setFollowLoading(true);
      const res = await user_followServices.toggle(userId);
      console.log("🔁 Toggle API result:", res);

      if (res.status === "success") {
        setIsFollowing((prev) => !prev);
        window.dispatchEvent(new Event("follow-updated"));
        // khi đổi trạng thái follow → useEffect [isFollowing] sẽ chạy và reload count
      } else {
        console.error("Toggle follow error status:", res);
        alert("Không thực hiện được theo dõi. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error("Toggle follow failed:", e);
      alert(e?.message || "Không gọi được API follow (kiểm tra Network/CORS/đăng nhập).");
    } finally {
      setFollowLoading(false);
    }
  };

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
        followerCount={followersCount}
        followingCount={followingCount}
        birthday={birthday}
        actionButton={
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className={`px-4 py-1 rounded font-semibold ${
              isFollowing
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        }
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
