import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Empty, App } from 'antd';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import AppLayout from '../components/AppLayout';
import { useAppSelector } from '../hooks';
import { Author, Comment } from '../types';
import { brand } from '../theme';

interface PostRecord {
  id: string;
  content: string;
  author: Author;
  comments?: Comment[];
}

const MyPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { modal, message } = App.useApp();

  const currentUser = useAppSelector((state) => state.auth.user);
  const email = currentUser.email;

  const fetchPosts = async (userEmail: string) => {
    setLoading(true);
    try {
      const postQuery = query(collection(firestore, 'posts'), where('email', '==', userEmail));
      const postsSnapshot = await getDocs(postQuery);
      const filteredPosts: PostRecord[] = postsSnapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as PostRecord
      );
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleDelete = (record: PostRecord) => {
    modal.confirm({
      title: 'Delete post',
      content: 'Are you sure you want to delete this post? This cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteDoc(doc(firestore, 'posts', record.id));
          setPosts((prev) => prev.filter((post) => post.id !== record.id));
          message.success('Post deleted successfully.');
        } catch (error) {
          console.error('Error deleting post:', error);
          message.error('Failed to delete post. Please try again.');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Author',
      key: 'author',
      width: 180,
      render: (_: unknown, record: PostRecord) =>
        `${record.author?.first_name ?? ''} ${record.author?.last_name ?? ''}`.trim(),
    },
    { title: 'Content', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: 'Comments',
      key: 'commentCount',
      width: 110,
      render: (_: unknown, record: PostRecord) => record.comments?.length ?? 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: PostRecord) => (
        <Space>
          <Button danger size="small" onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const expandableRow = {
    expandedRowRender: (record: PostRecord) => {
      const comments = record.comments ?? [];
      if (comments.length === 0) {
        return <div style={{ color: brand.textSecondary }}>No comments yet.</div>;
      }
      return (
        <div>
          {comments.map((comment) => (
            <div key={comment.comment_id} style={{ marginBottom: 6 }}>
              <strong>{`${comment.author?.first_name ?? ''} ${comment.author?.last_name ?? ''}`.trim()}: </strong>
              {comment.content}
            </div>
          ))}
        </div>
      );
    },
  };

  return (
    <AppLayout title="My Posts" maxWidth={960}>
      <Table
        dataSource={posts}
        columns={columns}
        expandable={expandableRow}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        locale={{ emptyText: <Empty description="You haven't created any posts yet." /> }}
        scroll={{ x: 640 }}
        style={{ background: '#fff', borderRadius: 12, padding: 8 }}
      />
    </AppLayout>
  );
};

export default MyPostsPage;
