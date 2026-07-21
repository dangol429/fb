import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Empty, Spin } from 'antd';
import styled from 'styled-components';
import AppLayout from '../components/AppLayout';
import { doc, collection, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { UserOutlined, LikeFilled } from '@ant-design/icons';
import { useAppSelector } from '../hooks';
import { LikeData, Post } from '../types';
import { brand } from '../theme';

const { Meta } = Card;

interface LikedPostData {
  id: string;
  LikedEmails: string[];
  likedBy: LikeData[];
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

const LikePage: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<LikedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      setLoading(true);
      try {
        const likesSnapshot = await getDocs(query(collection(firestore, 'Likes')));
        const likedPostsData: LikedPostData[] = [];

        for (const docs of likesSnapshot.docs) {
          const likedPost = docs.data() as LikedPostData;
          if (likedPost.LikedEmails.includes(user.email)) {
            const docSnapshot = await getDoc(doc(firestore, 'posts', likedPost.post_id));
            if (docSnapshot.exists()) {
              likedPostsData.push({ ...likedPost, postDetails: docSnapshot.data() as Post });
            }
          }
        }
        setLikedPosts(likedPostsData);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchLikedPosts();
  }, [isAuthenticated, user.email]);

  const handleDislike = async (likeData: LikeData, post_id: string) => {
    try {
      const dislikeQuery = query(collection(firestore, 'Likes'), where('post_id', '==', post_id));
      const querySnapshot = await getDocs(dislikeQuery);

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const index = data.likedBy.findIndex((l: LikeData) => l.email === likeData.email);
        if (index !== -1) {
          data.likedBy.splice(index, 1);
          data.LikedEmails = data.LikedEmails.filter((e: string) => e !== likeData.email);
          await updateDoc(docSnap.ref, { likedBy: data.likedBy, LikedEmails: data.LikedEmails });
          setLikedPosts((prev) => prev.filter((p) => p.post_id !== post_id));
          return;
        }
      }
    } catch (error) {
      console.error('Error removing like:', error);
    }
  };

  return (
    <AppLayout title="My Likes">
      {loading ? (
        <CenterState>
          <Spin size="large" />
        </CenterState>
      ) : likedPosts.length === 0 ? (
        <Empty description="You haven't liked any posts yet." style={{ marginTop: 48 }} />
      ) : (
        likedPosts.map((likedPost) => (
          <StyledCard
            key={likedPost.id}
            actions={[
              <Button
                key="dislike"
                type="text"
                icon={<LikeFilled style={{ color: brand.primary }} />}
                onClick={() => handleDislike(user, likedPost.post_id)}
              >
                Unlike · {likedPost.likedBy.length}
              </Button>,
            ]}
          >
            <Meta
              avatar={<Avatar size={56} icon={<UserOutlined />} src={likedPost.postDetails?.author?.profile_picture} />}
              title={`${likedPost.postDetails?.author?.first_name ?? ''} ${likedPost.postDetails?.author?.last_name ?? ''}`.trim()}
              description={likedPost.postDetails?.content ?? ''}
            />
          </StyledCard>
        ))
      )}
    </AppLayout>
  );
};

export default LikePage;
