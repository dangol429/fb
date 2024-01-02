import React, { useState, useEffect } from 'react';
import { Layout, Card, Avatar, Button } from 'antd';
import styled from 'styled-components';
import Sidebar from '../components/sidebar';
import { useSelector } from 'react-redux';
import { doc, collection, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { UserOutlined} from '@ant-design/icons';


const { Meta } = Card;
const { Content } = Layout;

// Define types for Post and LikedPostData
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

interface LikeData {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}

interface LikedPostData {
  id: string;
  LikedEmails: string[];
  likedBy: {
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

const LikePage: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<LikedPostData[]>([]);
  const { isAuthenticated, user } = useSelector((state: AppState) => state.auth);
  const CurrentUser = useSelector((state: AppState) => state.auth.user);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const likesQuery = query(collection(firestore, 'Likes'));
        const likesSnapshot = await getDocs(likesQuery);
  
        const likedPostsData: LikedPostData[] = [];
  
        for (const docs of likesSnapshot.docs) {
          const likedPost = docs.data() as LikedPostData;
  
          if (likedPost.LikedEmails.includes(user.email)) {
            const postDocRef = doc(firestore, "posts", likedPost.post_id);
            const docSnapshot = await getDoc(postDocRef);
  
            if (docSnapshot.exists()) {
              const postData = docSnapshot.data() as Post;
              likedPostsData.push({
                ...likedPost,
                postDetails: postData,
              });
            }
          }
        }
  
        setLikedPosts(likedPostsData);
      } catch (error: unknown) {
        console.error('Error fetching liked posts');
      }
    };
  
    if (isAuthenticated) {
      fetchLikedPosts();
    }
  }, [isAuthenticated, user.email]); // Include dependencies if they are expected to change
  

  const handleDislike = async (likeData: LikeData, post_id: string) => {
    console.log('handleDISLIKE STARTED');
    try {
      const LikesCollection = collection(firestore, 'Likes');
  
      // Create a query to find the document to dislike
      const dislikeQuery = query(LikesCollection, where('post_id', '==', post_id));
  
      // Execute the query
      const querySnapshot = await getDocs(dislikeQuery);
  
      if (!querySnapshot.empty) {
        // Iterate through the documents in the result set
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
  
          // Find the index of the likedBy object with the matching email
          const index = data.likedBy.findIndex((likedBy: LikeData) => likedBy.email === likeData.email);
  
          if (index !== -1) {
            // Remove the likedBy object from the array
            data.likedBy.splice(index, 1);
  
            // Remove the user's email from LikedEmails array
            data.LikedEmails = data.LikedEmails.filter((email: string) => email !== likeData.email);
  
            // Update the document in Firestore
            await updateDoc(doc.ref, { likedBy: data.likedBy, LikedEmails: data.LikedEmails });
  
            // Trigger a state change to refresh the UI
            setLikedPosts((prev) => prev.filter((likedPost) => likedPost.post_id !== post_id));            console.log(`Disliked Successfully with post_id ${post_id} and author ${likeData.email} deleted successfully.`);
  
            return; // Exit the loop once the dislike is handled
          }
        }
  
        console.error(`Problem with post_id ${post_id} and author ${likeData.email} not found.`);
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
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>My Liked Posts</h1>
        {likedPosts.map((likedPost) => (
          <StyledCard
            key={likedPost.id}
            actions={[
              <Button
                key="like"
                onClick={() => handleDislike(CurrentUser, likedPost.post_id)}
                icon={<span role="img" aria-label="like">👍</span>}
              >
                {likedPost.likedBy.length} Like
              </Button>,
            ]}
          >
            <Meta
              avatar={<Avatar size={60} icon={<UserOutlined />} src={likedPost.postDetails?.author?.profile_picture} />}
              title={<h1 style={{ fontSize: '20px' , position: 'relative' , left: '10px'}}>{`${likedPost.postDetails?.author?.first_name ?? ''} ${likedPost.postDetails?.author?.last_name ?? ''}`}</h1>}
              description={<p style={{ fontSize: '20px' , position: 'relative'}}>{`${likedPost.postDetails?.content ?? ''}`}</p>}
            />
          </StyledCard>
        ))}
      </ContentContainer>
    </PageContainer>
  );
};

export default LikePage;
