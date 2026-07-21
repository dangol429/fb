import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import LikePage from './pages/LikePage';
import BookmarkPage from './pages/Bookmark';
import MyPostsPage from './pages/MyPosts';
import MyProfilePage from './pages/MyProfile';
import PrivateRoute from './components/Routing/privateRoute';
import UnprivateRoute from './components/Routing/unprivateRoute';
import { GlobalStyles } from './components/styles/GlobalStyles';
import { theme } from './theme';

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntdApp>
        <GlobalStyles />
        <Router>
          <Routes>
            <Route element={<UnprivateRoute />}>
              <Route path="/" element={<Signup />} />
              <Route path="/login" element={<Login />} />
            </Route>
            <Route element={<PrivateRoute />}>
              <Route element={<Home />} path="/dashboard" />
              <Route element={<LikePage />} path="/my-likes" />
              <Route element={<BookmarkPage />} path="/my-bookmarks" />
              <Route element={<MyPostsPage />} path="/my-posts" />
              <Route element={<MyProfilePage />} path="/my-profile" />
            </Route>
            {/* Fallback: send unknown paths home (route guards redirect as needed). */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
