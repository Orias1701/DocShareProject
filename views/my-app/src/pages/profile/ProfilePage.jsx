import React from 'react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import BioCard from '../../components/profile/BioCard';
import PostFeed from '../../components/profile/PostFeed';

// --- Dữ liệu mẫu ---
// Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu này từ API dựa vào ID của người dùng
const userData = {
  avatar: 'https://i.pravatar.cc/150?img=1',
  realName: 'Real name',
  userName: 'User name',
  followerCount: 'Follower number',
  biography: 'User biography\nHeight based on the length of biography that user want it be',
  birthday: 'Birthday',
  followingCount: 'Following number',
  totalPosts: 'Total post number',
};

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
  return (
    <div className="text-white p-4 max-w-6xl mx-auto">
      {/* Phần Header của trang Profile */}
      <ProfileHeader 
        avatar={userData.avatar}
        realName={userData.realName}
        userName={userData.userName}
        followerCount={userData.followerCount}
      />

      {/* Grid layout chính chia làm 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* === CỘT TRÁI (Thông tin Bio) === */}
        <div className="lg:col-span-1">
          <BioCard user={userData} />
        </div>

        {/* === CỘT PHẢI (Dòng thời gian các bài viết) === */}
        <div className="lg:col-span-2">
          <PostFeed posts={userPosts} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;