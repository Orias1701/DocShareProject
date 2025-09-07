import React from 'react';
import CategoryInfoCard from '../../components/category/CategoryInfoCard';

// --- Dữ liệu mẫu ---
// Trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ API.
const viewedCategories = Array(4).fill({
  icon: 'fa-solid fa-house',
  title: 'Category title',
  subtitle: 'Maximum is 2 lines.',
  description: "Short category description... Lorem Ipsum is simply dummy text of the printing and typesetting industry's standard dummy text."
});

const allCategories = Array(12).fill({
  icon: 'fa-solid fa-house',
  title: 'Category title',
  subtitle: 'Maximum is 2 lines.',
  description: "Short category description... Lorem Ipsum is simply dummy text of the printing and typesetting industry's standard dummy text."
});


/**
 * Component Trang Categories
 * @description Hiển thị các khu vực category, ví dụ như "đã xem" và "tất cả".
 */
function CategoriesPage() {
  return (
    <div className="text-white p-4">
      {/* Container cho tất cả các khu vực category */}
      <div className="space-y-12">
        
        {/* Khu vực: Các category bạn đã xem */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Categories you have viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Lặp qua dữ liệu và render mỗi mục thành một card */}
            {viewedCategories.map((cat, index) => (
              <CategoryInfoCard 
                key={`viewed-${index}`} 
                icon={cat.icon} 
                title={cat.title} 
                subtitle={cat.subtitle}
                description={cat.description}
              />
            ))}
          </div>
        </section>
        
        {/* Khu vực: Tất cả category */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allCategories.map((cat, index) => (
              <CategoryInfoCard 
                key={`all-${index}`} 
                icon={cat.icon} 
                title={cat.title} 
                subtitle={cat.subtitle}
                description={cat.description}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default CategoriesPage;