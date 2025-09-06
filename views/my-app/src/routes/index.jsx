import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

// Layout & Components
import NavBar from "../components/layouts/NavBar";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import Modal from "../components/common/Modal"; // THAY ĐỔI: Import component Modal
import NewAlbumForm from "../components/common/NewAlbumForm"; // THAY ĐỔI: Import form tạo Album

// Pages
import ExplorePage from "../pages/explore/ExplorePage";
import FollowingPage from "../pages/following/FollowingPage";
import HistoryPage from "../pages/history/HistoryPage";
import MyPostsPage from "../pages/myposts/MyPostsPage";
import BookmarksPage from "../pages/bookmarks/BookmarksPage";
import MyAlbumPage from "../pages/myalbum/MyAlbumPage";
import NewPostPage from "../pages/new-post/NewPostPage";

// Global icons/css
import "../assets/font-awesome-6.6.0-pro-full-main/css/all.css";

const Placeholder = ({ name }) => (
  <div style={{ fontSize: "20px", padding: "1rem" }}>{name} Page</div>
);

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // THAY ĐỔI: Thêm state để quản lý modal "New Album"
  const [isNewAlbumModalOpen, setNewAlbumModalOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar--collapsed", isCollapsed);
    return () => {
      document.body.classList.remove("sidebar--collapsed");
    };
  }, [isCollapsed]);

  return (
    <BrowserRouter>
      <Header />

      <div className="app-shell">
        {/* THAY ĐỔI: Truyền hàm để mở modal xuống NavBar */}
        <NavBar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          onNewAlbumClick={() => setNewAlbumModalOpen(true)}
        />

        <main>
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/my-albums" element={<MyAlbumPage/>} />
            <Route path="/new-post" element={<NewPostPage />} />
            <Route path="/profile" element={<Placeholder name="Profile" />} />
            
            {/* THAY ĐỔI: Xóa route "/new-album" vì đã dùng modal */}
            {/* <Route path="/new-album" element={<Placeholder name="New Album" />} /> */}
            
            <Route path="/leaderboard" element={<Placeholder name="Leaderboard" />} />
            <Route path="/categories" element={<Placeholder name="Categories" />} />
            <Route path="/hashtags" element={<Placeholder name="Hashtags" />} />
          </Routes>
        </main>
      </div>

      <Footer />
      
      {/* THAY ĐỔI: Render Modal ở đây. Nó sẽ chỉ hiện khi isNewAlbumModalOpen là true */}
      <Modal isOpen={isNewAlbumModalOpen} onClose={() => setNewAlbumModalOpen(false)}>
        <NewAlbumForm onClose={() => setNewAlbumModalOpen(false)} />
      </Modal>

    </BrowserRouter>
  );
}

export default App;