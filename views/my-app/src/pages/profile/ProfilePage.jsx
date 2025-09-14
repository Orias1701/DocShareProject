import React from 'react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import BioCard from '../../components/profile/BioCard';
import PostFeed from '../../components/profile/PostFeed';
import {userInfoApi} from '../../services/user_infoServices';
import {authApi} from '../../services/usersServices';
import { useEffect } from 'react';
// --- Dữ liệu mẫu ---
// Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu này từ API dựa vào ID của người dùng
// const userData = {
//   avatar: 'https://i.pravatar.cc/150?img=1',
//   realName: 'Real name',
//   userName: 'User name',
//   followerCount: 'Follower number',
//   biography: 'User biography\nHeight based on the length of biography that user want it be',
//   birthday: 'Birthday',
//   followingCount: 'Following number',
//   totalPosts: 'Total post number',
// };

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

/**
 * Component Trang Profile
 * @description Hiển thị thông tin chi tiết và các bài viết của một người dùng.
 */
function ProfilePage() {
  const [userData, setUserData] = React.useState(null);
  // const [userPosts , setUserPosts] = React.useState([]);
  useEffect(() => {
    async function loadData() {
      try {
        // Lấy user đang đăng nhập
        const me = await authApi.me();
        console.log("User hiện tại:", me);

        // Sau đó lấy thêm chi tiết user info theo id (nếu cần)
        if (me?.user?.user_id) {
          const info = await userInfoApi.detail(me.user.user_id);
          console.log("Chi tiết user info:", info);
          setUserData(info.data.user); // backend đang trả { user, isFollowing }
        }
      } catch (err) {
        console.error("Lỗi load dữ liệu profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);
  return (
    <div className="text-white p-4 max-w-6xl mx-auto">
      {/* Phần Header của trang Profile */}
      <ProfileHeader 
          avatar={userData?.avatar_url || "https://i.pravatar.cc/40?img=1"}
          realName={userData?.full_name || "Anonymous"}
          userName={userData?.username || "no-username"}
          followerCount={123}   // 👈 gắn cứng để test
        />


      {/* Grid layout chính chia làm 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* === CỘT TRÁI (Thông tin Bio) === */}
        <div className="lg:col-span-1">
          <BioCard user={userData?.bio || "Chưa có bio"} />
        </div>

        {/* === CỘT PHẢI (Dòng thời gian các bài viết) === */}
        <div className="lg:col-span-2">
          <PostFeed posts={userPosts } />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;