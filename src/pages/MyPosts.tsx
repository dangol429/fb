import React, { useState, useEffect } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Layout } from "antd";
import styled from "styled-components";
import { useSelector } from "react-redux";
import Sidebar from "../components/sidebar";

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
`;

interface CommentAuthor {
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
}

interface PostComment {
  author: CommentAuthor;
  content: string;
  comment_id: string;
}

interface Author {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}

interface PostRecord {
  id: string;
  content: string;
  author: Author;
  comments?: PostComment[];
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
  user: UserData;
  error: string | null;
  isAuthenticated: boolean; // Add an isAuthenticated flag
}

interface AppState {
  auth: AuthState;
  // other slices of state...
}

const MyPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<PostRecord[]>([]);

  const currentUser = useSelector((state: AppState) => state.auth.user);
  const email = currentUser.email;

  const fetchPosts = async (userEmail: string) => {
    try {
      const postsCollection = collection(firestore, "posts");
      const postQuery = query(postsCollection, where("email", "==", userEmail));

      const postsSnapshot = await getDocs(postQuery);

      const filteredPosts: PostRecord[] = [];

      postsSnapshot.forEach((docSnap) => {
        const postData = { id: docSnap.id, ...docSnap.data() } as PostRecord;
        filteredPosts.push(postData);
      });

      setPosts(filteredPosts);
    } catch (error: unknown) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(email);
  }, [email]);

  const columns = [
    {
      title: "Author",
      key: "author",
      render: (_: unknown, record: PostRecord) =>
        `${record.author?.first_name ?? ""} ${record.author?.last_name ?? ""}`.trim(),
    },
    { title: "Content", dataIndex: "content", key: "content" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: PostRecord) => (
        <Space>
          <Button danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Each expanded row renders its OWN comments, read straight from the record,
  // rather than from a single shared state that leaked across rows.
  const expandableRow = {
    expandedRowRender: (record: PostRecord) => {
      const comments = record.comments ?? [];
      if (comments.length === 0) {
        return <div style={{ color: "#888" }}>No comments yet.</div>;
      }
      return (
        <div>
          {comments.map((comment) => (
            <div key={comment.comment_id} style={{ marginBottom: 4 }}>
              <strong>
                {`${comment.author?.first_name ?? ""} ${comment.author?.last_name ?? ""}`.trim()}
                :{" "}
              </strong>
              {comment.content}
            </div>
          ))}
        </div>
      );
    },
  };

  const handleDelete = (record: PostRecord) => {
    Modal.confirm({
      title: "Delete Post",
      content: "Are you sure you want to delete this post?",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteDoc(doc(firestore, "posts", record.id));
          setPosts((prev) => prev.filter((post) => post.id !== record.id));
          message.success("Post deleted successfully.");
        } catch (error: unknown) {
          console.error("Error deleting post:", error);
          message.error("Failed to delete post. Please try again.");
        }
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
