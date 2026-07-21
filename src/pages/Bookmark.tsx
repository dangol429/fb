import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Empty, Spin } from 'antd';
import styled from 'styled-components';
import AppLayout from '../components/AppLayout';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { UserOutlined, BookFilled } from '@ant-design/icons';
import { useAppSelector } from '../hooks';
import { BookmarkData, Post } from '../types';
import { brand } from '../theme';

const { Meta } = Card;

interface BookmarkedPostData {
  id: string;
  BookmarkedEmails: string[];
  bookmarkedBy: BookmarkData[];
  post_id: string;
  postDetails?: Post;
}

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  .ant-card-meta-title {
    color: ${brand.text};
    font-size: 16px;
  }
  .ant-card-meta-description {
    color: ${brand.text};
  }
`;

const CenterState = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;

const BookmarkPage: React.FC = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      setLoading(true);
      try {
        const bookmarksQuery = query(
          collection(firestore, 'Bookmarks'),
          where('BookmarkedEmails', 'array-contains', user.email)
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        const bookmarkedPostsData: BookmarkedPostData[] = [];

        for (const bookmarkDoc of bookmarksSnapshot.docs) {
          const bookmarkedPost = bookmarkDoc.data() as BookmarkedPostData;
          const postDocSnapshot = await getDoc(doc(firestore, 'posts', bookmarkedPost.post_id));
          if (postDocSnapshot.exists()) {
            bookmarkedPostsData.push({ ...bookmarkedPost, postDetails: postDocSnapshot.data() as Post });
          }
        }
        setBookmarkedPosts(bookmarkedPostsData);
      } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchBookmarkedPosts();
  }, [isAuthenticated, user.email]);

  const handleUnbookmark = async (bookmarkData: BookmarkData, post_id: string) => {
    try {
      const unbookmarkQuery = query(collection(firestore, 'Bookmarks'), where('post_id', '==', post_id));
      const querySnapshot = await getDocs(unbookmarkQuery);

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const index = data.bookmarkedBy.findIndex((b: BookmarkData) => b.email === bookmarkData.email);
        if (index !== -1) {
          data.bookmarkedBy.splice(index, 1);
          data.BookmarkedEmails = data.BookmarkedEmails.filter((e: string) => e !== bookmarkData.email);
          await updateDoc(docSnap.ref, { bookmarkedBy: data.bookmarkedBy, BookmarkedEmails: data.BookmarkedEmails });
          setBookmarkedPosts((prev) => prev.filter((p) => p.post_id !== post_id));
          return;
        }
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <AppLayout title="My Bookmarks">
      {loading ? (
        <CenterState>
          <Spin size="large" />
        </CenterState>
      ) : bookmarkedPosts.length === 0 ? (
        <Empty description="You haven't bookmarked any posts yet." style={{ marginTop: 48 }} />
      ) : (
        bookmarkedPosts.map((bookmarkedPost) => (
          <StyledCard
            key={bookmarkedPost.id}
            actions={[
              <Button
                key="unbookmark"
                type="text"
                icon={<BookFilled style={{ color: brand.primary }} />}
                onClick={() => handleUnbookmark(user, bookmarkedPost.post_id)}
              >
                Remove · {bookmarkedPost.bookmarkedBy.length}
              </Button>,
            ]}
          >
            <Meta
              avatar={<Avatar size={56} icon={<UserOutlined />} src={bookmarkedPost.postDetails?.author?.profile_picture} />}
              title={`${bookmarkedPost.postDetails?.author?.first_name ?? ''} ${bookmarkedPost.postDetails?.author?.last_name ?? ''}`.trim()}
              description={bookmarkedPost.postDetails?.content ?? ''}
            />
          </StyledCard>
        ))
      )}
    </AppLayout>
  );
};

export default BookmarkPage;
