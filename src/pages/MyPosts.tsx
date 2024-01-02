import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal } from 'antd';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Layout } from 'antd';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Sidebar from '../components/sidebar';


const PageContainer = styled(Layout)`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5; // Light grey background
`;

const StyledTable = styled(Table)`
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); // Soft shadow for depth
  position: absolute;
  width: 70%;
  left: 25%;
  top: 13%;
  @media (max-width: 600px) {
    position: absolute;
    text-align: center;
    justify-content: center;
    margin: auto;
    width: 100%;
    left: 0;
    right: 0;
  }
`;

const Heading = styled.h1`
  position: absolute;
  left: auto;
  right: 67%;
  @media (max-width: 600px) {
    position: absolute;
    text-align: center;
    left: 0;
    right: 0;
  }
`


// Replace 'YourRecordType' with the actual type/interface of your post record
interface YourRecordType {
  id: string;
  title: string;
  content: string;
  // Add other properties as needed
  comments?: {
    id: string;
    content: string;
  }[];
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

const MyPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<YourRecordType[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const currentUser = useSelector((state: AppState) => state.auth.user);
  const email = currentUser.email;

  const fetchPosts = async (userEmail: string) => {
    try {
      const postsCollection = collection(firestore, 'posts');
      const postQuery = query(postsCollection, where('email', '==', userEmail));

      const postsSnapshot = await getDocs(postQuery);

      const filteredPosts: YourRecordType[] = [];

      postsSnapshot.forEach((doc) => {
        const postData: YourRecordType = { id: doc.id, ...doc.data() } as YourRecordType;
        filteredPosts.push(postData);
      });

      setPosts(filteredPosts);
    } catch (error: unknown) {
      console.error('Error fetching posts:');
    }
  };

  const fetchComments = (postId: string) => {
    try {
      // Find the post with the given postId
      const post = posts.find((post) => post.id === postId);

      if (post && post.comments && post.comments.length > 0) {
        // Map through comments and extract content
        const commentsForPost = post.comments.map((comment) => comment.content || '');
        setComments(commentsForPost);
      } else {
        setComments([]);
      }
    } catch (error: unknown) {
      console.error('Error fetching comments:');
    }
  };

  useEffect(() => {
    fetchPosts(email);
  }, [email]);

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Content', dataIndex: 'content', key: 'content' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button onClick={() => handleEdit()}>Edit</Button>
          <Button onClick={() => handleDelete()}>Delete</Button>
        </Space>
      ),
    },
  ];

  const expandableRow = {
    expandedRowRender: () => (
      <div>
        {comments.map((comment, index) => (
          <div key={index}>{comment}</div>
        ))}
      </div>
    ),
    onExpand: (expanded: boolean, record: YourRecordType) => {
      if (expanded) {
        fetchComments(record.id);
        setExpandedRowKeys([...expandedRowKeys, record.id]);
      } else {
        setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.id));
      }
    },
  };

  const handleEdit = () => {
    Modal.info({
      title: 'Edit Post',
      content: <div>Edit form goes here</div>,
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Post',
      content: 'Are you sure you want to delete this post?',
      onOk: () => {
        // Implement delete logic here
        // You might want to update the 'posts' state after deletion
      },
    });
  };

  return (
  <>
  <PageContainer>
    <Heading> My Posts </Heading>
        <Sidebar />
        <StyledTable
          dataSource={posts}
          columns={columns}
          expandable={expandableRow}
          rowKey="id"
        />
      </PageContainer>
  </>
  );
};

export default MyPostsPage;
