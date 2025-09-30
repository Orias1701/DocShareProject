// src/pages/profile/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import ProfileHeader from "../../components/profile/ProfileHeader";
import BioCard from "../../components/profile/BioCard";
import PostFeed from "../../components/profile/PostFeed";
import { authApi } from "../../services/usersServices";
import { userInfoApi } from "../../services/user_infoServices";
import EditProfileModal from "../../components/profile/EditProfileModal";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";

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

function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [me, setMe] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  // follow counts
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Lấy me + info
  useEffect(() => {
    (async () => {
      try {
        const meRes = await authApi.me();
        if (!meRes?.user) throw new Error("API /me không trả user");

        const currentUser = meRes.user;
        const id = currentUser?.user_id;
        if (!id) throw new Error("Không tìm thấy user_id từ api_me");
        setMe(currentUser);

        try {
          const infoRes = await userInfoApi.showUserInfo(id);
          const fromInfo = infoRes?.user ?? null;
          setUserData(fromInfo || currentUser);
        } catch (err) {
          console.error("Lỗi lấy user info:", err);
          setUserData(currentUser);
        }
      } catch (e) {
        console.error("Lỗi lấy me:", e);
        setError(e.message || "Không lấy được thông tin người dùng");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Lấy bài viết của tôi
  useEffect(() => {
    if (!me?.user_id) return;
    (async () => {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const raw = await postService.listMyPosts();
        const mapped = (Array.isArray(raw) ? raw : []).map(normalizePostForProfile);
        setUserPosts(mapped);
      } catch (e) {
        console.error("Lỗi lấy posts:", e);
        setPostsError(e.message || "Không tải được bài viết");
      } finally {
        setPostsLoading(false);
      }
    })();
  }, [me?.user_id]);

  // Lấy số followers/following của tôi
  useEffect(() => {
    if (!me?.user_id) return;
    (async () => {
      try {
        const f1 = await user_followServices.countFollowers(me.user_id);
        const f2 = await user_followServices.countFollowing(me.user_id);
        setFollowersCount(f1?.data?.count || 0);
        setFollowingCount(f2?.data?.count || 0);
      } catch (e) {
        console.error("Lỗi lấy số follow:", e);
      }
    })();
  }, [me?.user_id]);

  // Cập nhật hồ sơ
  const handleUpdate = async ({ full_name, bio, birth_date, avatar }) => {
    try {
      if (!me?.user_id) throw new Error("Thiếu user_id");
      await userInfoApi.updateUserInfo({
        user_id: me.user_id,
        full_name,
        bio,
        birth_date,
        avatar,
      });

      const fresh = await userInfoApi.showUserInfo(me.user_id);
      const u = fresh?.user ?? fresh?.data?.user ?? fresh?.data ?? fresh;
      setUserData(u);
      setOpenEdit(false);
      return true;
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      throw err; // để EditProfileModal nhận và hiển thị
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

  const avatarUrl = userData?.avatar_url || "https://i.pravatar.cc/150?img=1";
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
        onEdit={() => setOpenEdit(true)}
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
          ) : userPosts.length === 0 ? (
            <div className="text-gray-400 italic">Bạn chưa có bài viết nào</div>
          ) : (
            <PostFeed posts={userPosts} />
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        user={userData}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

export default ProfilePage;
