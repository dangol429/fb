import React, { useState, useEffect } from 'react';
import { Layout, Card, Avatar, Button } from 'antd';
import styled from 'styled-components';
import Sidebar from '../components/sidebar';
import { useSelector } from 'react-redux';
import {doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { UserOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Content } = Layout;

// Define types for Post and BookmarkedPostData
interface Post {
  post_id: string;
  email: string;
  content: string;
  author: {
    first_name: string;
    last_name: string;
    email: string;
    profile_picture: string;
  };
  comments: string[];
}

interface BookmarkedPostData {
  id: string;
  BookmarkedEmails: string[];
  bookmarkedBy: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    profile_picture: string;
  }[];
  post_id: string;
  postDetails?: Post;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_picture: string;
}

// Auth state type
interface AuthState {
  user: UserData ;
  error: string | null;
  isAuthenticated: boolean; // Add an isAuthenticated flag
}

interface AppState {
  auth: AuthState;
  // other slices of state...
}

interface BookmarkData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  profile_picture: string | null;
}

// Define styled components
const PageContainer = styled(Layout)`
  display: flex;
  min-height: 100vh;
`;

const ContentContainer = styled(Content)`
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  width: 100%;
`;

const StyledCard = styled(Card)`
margin-bottom: 20px;
border-radius: 12px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
transition: transform 0.3s;

&:hover {
  transform: translateY(-5px);
}

.ant-card-actions {
  border-top: none;
  text-align: center;

  .ant-btn {
    background-color: #ff8c00;
    border-color: #ff8c00;
    color: #fff;
  }
}

.ant-card-meta-avatar {
  width: 80px;
  height: 80px;
  margin-right: 16px;
}

.ant-card-meta-title,
.ant-card-meta-description {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ant-card-meta-title {
  color: #000;
  margin-bottom: 5px;
}

.ant-card-meta-description {
  color: #000;
  padding: 10px 0;
}
`;

// const BookmarkButton = styled(Button)`
// `;

const BookmarkPage: React.FC = () => {
  // State to store bookmarked posts
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPostData[]>([]);
  const CurrentUser = useSelector((state: AppState) => state.auth.user);

  // Redux state to check authentication
  const { isAuthenticated, user } = useSelector((state: AppState) => state.auth);

  // Effect to fetch bookmarked posts when the component mounts
  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const bookmarksQuery = query(collection(firestore, 'Bookmarks'), where('BookmarkedEmails', 'array-contains', user.email));
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
  
        const bookmarkedPostsData: BookmarkedPostData[] = [];
  
        for (const bookmarkDoc of bookmarksSnapshot.docs) {
          const bookmarkedPost = bookmarkDoc.data() as BookmarkedPostData;
  
          const postDocRef = doc(firestore, "posts", bookmarkedPost.post_id);
          const postDocSnapshot = await getDoc(postDocRef);
  
          if (postDocSnapshot.exists()) {
            const postData = postDocSnapshot.data() as Post;
            bookmarkedPostsData.push({
              ...bookmarkedPost,
              postDetails: postData,
            });
          }
        }
  
        setBookmarkedPosts(bookmarkedPostsData);
      } catch (error: unknown) {
        console.error('Error fetching bookmarked posts:');
      }
    };
  
    if (isAuthenticated) {
      fetchBookmarkedPosts();
    }
  }, [isAuthenticated, user.email]); // Dependency array to re-run the effect when these values change
  

  const handleUnbookmarked = async (bookmarkData: BookmarkData, post_id: string) => {
    console.log('handle unbookmark STARTED');
    console.log(CurrentUser.email)
    try {
      const BookmarksCollection = collection(firestore, 'Bookmarks');
  
      // Create a query to find the document to dislike
      const unbookmarkQuery = query(BookmarksCollection, where('post_id', '==', post_id));
  
      // Execute the query
      const querySnapshot = await getDocs(unbookmarkQuery);
  
      if (!querySnapshot.empty) {
        // Iterate through the documents in the result set
        console.log("moving in")
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
  
          // Find the index of the likedBy object with the matching email
          const index = data.bookmarkedBy.findIndex((bookmarkedBy: BookmarkData) => bookmarkedBy.email === bookmarkData.email);
  
          if (index !== -1) {
            // Remove the likedBy object from the array
            data.bookmarkedBy.splice(index, 1);
  
            // Remove the user's email from LikedEmails array
            data.BookmarkedEmails = data.BookmarkedEmails.filter((email: string) => email !== bookmarkData.email);
  
            // Update the document in Firestore
            await updateDoc(doc.ref, { bookmarkedBy: data.bookmarkedBy, BookmarkedEmails: data.BookmarkedEmails });
  
            // Trigger a state change to refresh the UI
            setBookmarkedPosts((prev) => prev.filter((bookmarkedPost) => bookmarkedPost.post_id !== post_id));
            console.log(`Disliked Successfully with post_id ${post_id} and author ${bookmarkData.email} deleted successfully.`);
  
            return; // Exit the loop once the dislike is handled
          }
        }
  
        console.error(`Problem with post_id ${post_id} and author ${bookmarkData.email} not found.`);
      } else {
        console.error(`Problem with post_id ${post_id} not found.`);
      }
    } catch (error) {
      console.error('Error deleting like from Firestore', error);
    }
  };

  return (
    <PageContainer>
    <Sidebar />
    <ContentContainer>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>My Bookmarked Posts</h1>
      {bookmarkedPosts.map((bookmarkedPost) => (
        <StyledCard
          key={bookmarkedPost.id}
          actions={[
            <Button
              key="bookmark"
              onClick={() => handleUnbookmarked(user, bookmarkedPost.post_id)}
              icon={<span role="img" aria-label="bookmark">📌</span>}
            >
              {bookmarkedPost.bookmarkedBy.length} Bookmarks
            </Button>,
          ]}
        >
          <Meta
            avatar={<Avatar size={60} icon={<UserOutlined />} src={bookmarkedPost.postDetails?.author?.profile_picture} />}
            title={<h1 style={{ fontSize: '20px', position: 'relative', left: '10px' }}>{`${bookmarkedPost.postDetails?.author?.first_name ?? ''} ${bookmarkedPost.postDetails?.author?.last_name ?? ''}`}</h1>}
            description={<p style={{ fontSize: '20px', position: 'relative' }}>{`${bookmarkedPost.postDetails?.content ?? ''}`}</p>}
          />
        </StyledCard>
      ))}
    </ContentContainer>
  </PageContainer>
);
};

export default BookmarkPage;
