// app.ts
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import LikePage from './pages/LikePage';
import BookmarkPage from './pages/Bookmark';
import MyPostsPage from './pages/MyPosts';
import MyProfilePage from './pages/MyProfile';
import PrivateRoute from './components/Routing/privateRoute'; // Import the PrivateRoute component
import { GlobalStyles } from './components/styles/GlobalStyles';
import UnprivateRoute from './components/Routing/unprivateRoute';

function App() {
  return (
    <>
    <GlobalStyles />
    <Router>
      <Routes>
        <Route element={<UnprivateRoute/>}>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element = {<PrivateRoute/>}>
          <Route element={<Home/>} path ='/dashboard'/>
          <Route element={<LikePage/>} path ='/my-likes'/>
          <Route element={<BookmarkPage/>} path ='/my-bookmarks'/>
          <Route element={<MyPostsPage/>} path ='/my-posts'/>
          <Route element={<MyProfilePage/>} path ='/my-profile'/>
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;
