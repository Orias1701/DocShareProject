// src/pages/profile/ProfilePageOther.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ProfileHeader from "../../components/profile/ProfileHeader";
import BioCard from "../../components/profile/BioCard";
import PostFeed from "../../components/profile/PostFeed";
import { userInfoApi } from "../../services/user_infoServices";
import postService from "../../services/postService";
import { user_followServices } from "../../services/user_followServices";
import useAuth from "../../hook/useAuth";

/* ===== Notice theo đúng index.css (banner) ===== */
function Notice({ type = "info", message = "", onClose }) {
  if (!message) return null;

  const typeClass =
    type === "error"
      ? "banner banner--error"
      : type === "success"
      ? "banner banner--success"
      : "banner banner--info";

  return (
    <div className={`${typeClass} mb-4`}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-sm opacity-80 hover:opacity-100 underline"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

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
  const auth = useAuth();

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

  // notice
  const [notice, setNotice] = useState({ type: "info", message: "" });
  const showInfo = (msg) => setNotice({ type: "info", message: msg });
  const showError = (msg) => setNotice({ type: "error", message: msg });
  const showSuccess = (msg) => setNotice({ type: "success", message: msg });
  const clearNotice = () => setNotice({ type: "info", message: "" });

  const myUserId = useMemo(() => auth?.user?.user_id ?? null, [auth?.user?.user_id]);
  const isSelfProfile = useMemo(
    () => myUserId && String(myUserId) === String(userId),
    [myUserId, userId]
  );

  // Lấy thông tin user
  useEffect(() => {
    clearNotice();
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        const infoRes = await userInfoApi.showUserInfo(userId);
        const u = infoRes?.user ?? infoRes?.data?.user ?? infoRes?.data ?? infoRes;
        setUserData(u);
      } catch (e) {
        setError(e.message || "Không tải được thông tin người dùng.");
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
        setPostsError(e.message || "Không tải được bài viết.");
      } finally {
        setPostsLoading(false);
      }
    })();
  }, [userId]);

  // Check follow
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await user_followServices.userFollowing();
        const followingIds = res?.data?.map((f) => String(f?.user_id));
        setIsFollowing(followingIds?.includes(String(userId)));
      } catch (e) {
        console.error("Check follow failed:", e);
        showInfo("Không xác định được trạng thái theo dõi hiện tại.");
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

  // Toggle follow
  const toggleFollow = async () => {
    clearNotice();

    if (!auth?.isAuthenticated) {
      showError("Không thực hiện: Bạn cần đăng nhập để theo dõi người dùng.");
      return;
    }
    if (isSelfProfile) {
      showError("Không thực hiện: Bạn không thể theo dõi chính mình.");
      return;
    }

    try {
      setFollowLoading(true);
      const res = await user_followServices.toggle(userId);

      if (res?.status === "success") {
        setIsFollowing((prev) => !prev);
        window.dispatchEvent(new Event("follow-updated"));
        showSuccess(isFollowing ? "Đã bỏ theo dõi." : "Đã theo dõi người dùng.");
      } else {
        const msg =
          res?.message ||
          (isFollowing
            ? "Không thực hiện được bỏ theo dõi. Vui lòng thử lại."
            : "Không thực hiện được theo dõi. Vui lòng thử lại.");
        showError(`Không thực hiện: ${msg}`);
      }
    } catch (e) {
      const msg =
        e?.message ||
        (isFollowing
          ? "Không gọi được API bỏ theo dõi (kiểm tra mạng/CORS/đăng nhập)."
          : "Không gọi được API theo dõi (kiểm tra mạng/CORS/đăng nhập).");
      showError(`Không thực hiện: ${msg}`);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-[var(--color-text-muted)]">
        Đang tải hồ sơ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-6xl mx-auto text-[var(--color-text)]">
        <Notice type="error" message={`Không tải được hồ sơ: ${error}`} onClose={clearNotice} />
      </div>
    );
  }

  const avatarUrl = userData?.avatar_url || "https://i.pravatar.cc/150?img=2";
  const fullName = userData?.full_name || "Anonymous";
  const userName = userData?.username || "no-username";
  const birthday = userData?.birth_date || "N/A";

  return (
    <div className="p-4 max-w-6xl mx-auto text-[var(--color-text)]">
      {/* Banner thông báo chung */}
      <Notice type={notice.type} message={notice.message} onClose={clearNotice} />

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
            className={`btn ${
              isFollowing ? "btn-outline" : "btn-primary"
            } ${followLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            title={
              !auth?.isAuthenticated
                ? "Bạn cần đăng nhập để theo dõi."
                : isSelfProfile
                ? "Bạn không thể theo dõi chính mình."
                : isFollowing
                ? "Bỏ theo dõi"
                : "Theo dõi"
            }
          >
            {followLoading ? "Đang xử lý..." : isFollowing ? "Unfollow" : "Follow"}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-1">
          {/* Dùng panel theo system */}
          <div className="panel">
            <BioCard user={userData} />
          </div>
        </div>

        <div className="lg:col-span-2">
          {postsLoading ? (
            <div className="text-[var(--color-text-muted)]">Đang tải bài viết…</div>
          ) : postsError ? (
            <>
              <Notice
                type="error"
                message={`Không tải được bài viết: ${postsError}`}
                onClose={clearNotice}
              />
              <div className="panel panel-muted text-sm">
                Vui lòng thử tải lại trang hoặc kiểm tra kết nối mạng.
              </div>
            </>
          ) : (
            <PostFeed posts={userPosts} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePageOther;
