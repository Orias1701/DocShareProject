import React from 'react';
import CategorySection from '../../components/common/CategorySection';
// THAY ĐỔI: Import 2 component mới
import CategoryCard from '../../components/common/CategoryCard';
import HashtagButton from '../../components/common/HashtagButton';

// --- Dữ liệu mẫu (giữ nguyên) ---
const postsData = [
  {
    title: 'Continue reading',
    posts: Array(4).fill({
      authorName: 'Name', authorAvatar: 'https://i.pravatar.cc/32?img=3', title: 'Post title\nMaximum of Post title is 3 lines.', hashtags: ['#hashtag-1', '#hashtag-2', '#hashtag-3'], uploadTime: 'Post upload time', sourceName: 'google/mangle', sourceIcon: 'https://www.google.com/favicon.ico', stats: { likes: 1, comments: 1, shares: 0, saves: 0 }
    })
  },
  {
    title: 'Albums you have viewed',
    posts: Array(4).fill({
      authorName: 'Name', authorAvatar: 'https://i.pravatar.cc/32?img=4', title: 'Album title\nMaximum of Post title is 3 lines.', hashtags: ['#hashtag-1', '#hashtag-2', '#hashtag-3'], uploadTime: 'Post upload time', sourceName: 'google/mangle', sourceIcon: 'https://www.google.com/favicon.ico', stats: { likes: 1, comments: 1, shares: 0, saves: 0 }
    })
  }
];

// --- THAY ĐỔI: Thêm dữ liệu mẫu cho 2 section mới ---
const viewedCategoriesData = [
    { icon: "fa-solid fa-house", title: "Category title", subtitle: "Maximum is 2 lines.", description: "Short category description... Lorem Ipsum is simply dummy text of the printing and typesetting industry's standard dummy text." },
    { icon: "fa-solid fa-house", title: "Category title", subtitle: "Maximum is 2 lines.", description: "Short category description... Lorem Ipsum is simply dummy text of the printing and typesetting industry's standard dummy text." },
    { icon: "fa-solid fa-house", title: "Category title", subtitle: "Maximum is 2 lines.", description: "Short category description... Lorem Ipsum is simply dummy text of the printing and typesetting industry's standard dummy text." },
    { icon: "fa-solid fa-house", title: "Category title", subtitle: "Maximum is 2 lines.", description: "Short category description... Lorem Ipsum is simply dummy text of the printing and typesetting industry's standard dummy text." }
];

const viewedHashtagsData = ["hashtagishere", "hashtagishere", "hashtagishere", "hashtagishere"];


function HistoryPage() {
  return (
    <div className="w-full">
      {/* Phần header và các section bài post giữ nguyên */}
      <div className="flex justify-end items-center mb-8 gap-6">
        {/* ... */}
      </div>

      <div className="space-y-12">
        {postsData.map((category, index) => (
          <CategorySection key={index} title={category.title} posts={category.posts} />
        ))}
        
        {/* === THAY ĐỔI: Thêm Section cho Categories === */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-white">Categories you have viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {viewedCategoriesData.map((cat, index) => (
              <CategoryCard 
                key={index} 
                icon={cat.icon} 
                title={cat.title} 
                subtitle={cat.subtitle}
                description={cat.description}
              />
            ))}
          </div>
        </section>

        {/* === THAY ĐỔI: Thêm Section cho Hashtags === */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-white">Hashtags you have viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {viewedHashtagsData.map((tag, index) => (
              <HashtagButton key={index} tag={tag} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default HistoryPage;