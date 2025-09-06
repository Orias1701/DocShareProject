import React from 'react';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import NavBar from '../components/layouts/NavBar';

export default function MainLayout() {
  return (
    <div className="layout-container">
      {/* Header */}
      <div className="layout-header">
        <Header />
      </div>

      {/* Body */}
      <div className="layout-body">
        <NavBar />
        <main>
          <h1>N Bài viết mới nhất của mỗi category</h1>
          <p>Mỗi hàng là 1 category</p>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
