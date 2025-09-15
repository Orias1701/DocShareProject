// src/pages/profile/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import ProfileHeader from "../../components/profile/ProfileHeader";
import BioCard from "../../components/profile/BioCard";
import PostFeed from "../../components/profile/PostFeed";
import { authApi } from "../../services/usersServices";
import { userInfoApi } from "../../services/user_infoServices";
import EditProfileModal from "../../components/profile/EditProfileModal";

function ProfilePage() {
  const [userData, setUserData] = useState(null);   // dữ liệu user để hiển thị
  const [loading, setLoading] = useState(true);     // trạng thái loading
  const [error, setError] = useState(null);    
  const [me, setMe] = useState(null); 
  const [openEdit, setOpenEdit] = useState(false);   

  // demo feed (khi có API bài viết thì thay vào)
  const userPosts = [
    {
        id: 1,
        author: { realName: 'Real name', avatar: 'https://i.pravatar.cc/40?img=1' },
        postDate: 'Post date',
        mangles: [
            { title: 'Post name', description: 'Post description', image: 'https://via.placeholder.com/150/FFFFFF/000000?text=Mangle1' },
            { title: 'Post name', description: 'Post description', image: 'https://via.placeholder.com/150/FFFFFF/000000?text=Mangle2' },
        ],
        reactionCount: 'Reaction number',
        commentCount: 'Comment number',
    },
    {
        id: 2,
        author: { realName: 'Real name', avatar: 'https://i.pravatar.cc/40?img=1' },
        postDate: 'Post date',
        mangles: [
            { title: 'Post name', description: 'Post description', image: 'https://via.placeholder.com/150/FFFFFF/000000?text=Mangle1' },
        ],
        reactionCount: 'Reaction number',
        commentCount: 'Comment number',
    }
];

useEffect(() => {
  (async () => {
    try {
      // 1) Lấy user hiện tại qua api_me
      const meRes = await authApi.me();             // { status, user }
      const id = meRes?.user?.user_id;
      if (!id) throw new Error("Không tìm thấy user_id từ api_me");
      setMe(meRes.user);

      // 2) Lấy chi tiết từ show_user_info; nếu lỗi thì fallback dùng api_me
      try {
        const infoRes = await userInfoApi.showUserInfo(id);
        const fromInfo = infoRes?.user ?? infoRes?.data?.user ?? infoRes ?? null;
        setUserData(fromInfo || meRes.user);
      } catch {
        setUserData(meRes.user);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  })();
}, []);

// submit cập nhật
const handleUpdate = async ({ full_name, bio, birth_date, avatar }) => {
  if (!me?.user_id) throw new Error("Thiếu user_id");

  await userInfoApi.updateUserInfo({
    user_id: me.user_id,
    full_name,
    bio,
    birth_date,
    avatar, // File | undefined
  });

  // reload dữ liệu mới để cập nhật UI
  const fresh = await userInfoApi.showUserInfo(me.user_id);
  const u = fresh?.user ?? fresh?.data?.user ?? fresh;
  setUserData(u);

  // đóng modal (nếu muốn)
  setOpenEdit(false);
};


if (loading) return <div className="text-white p-4">Đang tải...</div>;
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
const fullName  = userData?.full_name || "Anonymous";
const userName  = userData?.username || "no-username";
const bioText   = userData?.bio || "Chưa có bio";
const birthday  = userData?.birth_date || "N/A";

return (
  <div className="text-white p-4 max-w-6xl mx-auto">
    <ProfileHeader
      avatar={avatarUrl}
      realName={fullName}
      userName={userName}
      followerCount={123}     // demo
      birthday={birthday}  
      onEdit={() => setOpenEdit(true)}  
    />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      <div className="lg:col-span-1">
        <BioCard user={userData} />
      </div>

      <div className="lg:col-span-2">
        <PostFeed posts={userPosts} />
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
