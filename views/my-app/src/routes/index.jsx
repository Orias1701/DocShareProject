import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

// Layout & Components
import NavBar from "../components/layouts/NavBar";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import Modal from "../components/common/Modal"; // THAY ĐỔI: Import component Modal
import NewAlbumForm from "../components/common/NewAlbumForm"; // THAY ĐỔI: Import form tạo Album
import AuthLayout from "../layouts/AuthLayout";

// Pages
import ExplorePage from "../pages/explore/ExplorePage";
import FollowingPage from "../pages/following/FollowingPage";
import HistoryPage from "../pages/history/HistoryPage";
import MyPostsPage from "../pages/myposts/MyPostsPage";
import BookmarksPage from "../pages/bookmarks/BookmarksPage";
import MyAlbumPage from "../pages/myalbum/MyAlbumPage";
import NewPostPage from "../pages/new-post/NewPostPage";
import LeaderboardPage from "../pages/leaderboard/LeaderboardPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import HashtagsPage from "../pages/hashtags/HashtagsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import RegisterPage from "../pages/auth/RegisterPage"
import LoginPage from "../pages/auth/LoginPage";
// Global icons/css
import "../assets/font-awesome-6.6.0-pro-full-main/css/all.css";

const Placeholder = ({ name }) => (
  <div style={{ fontSize: "20px", padding: "1rem" }}>{name} Page</div>
);

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNewAlbumModalOpen, setNewAlbumModalOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar--collapsed", isCollapsed);
    return () => {
      document.body.classList.remove("sidebar--collapsed");
    };
  }, [isCollapsed]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes sử dụng layout chung */}
        <Route
  path="/"
  element={
    <>
      {/* Gán class cho body */}
      {document.body.classList.add("main-page")}
      <Header />
      <div className="app-shell">
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
            <Route path="/my-albums" element={<MyAlbumPage />} />
            <Route path="/new-post" element={<NewPostPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/hashtags" element={<HashtagsPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  }
/>


        {/* Route register sử dụng AuthLayout */}
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
      </Routes>

      {/* Modal tạo album */}
      <Modal isOpen={isNewAlbumModalOpen} onClose={() => setNewAlbumModalOpen(false)}>
        <NewAlbumForm onClose={() => setNewAlbumModalOpen(false)} />
      </Modal>
    </BrowserRouter>
  );
}

export default App;