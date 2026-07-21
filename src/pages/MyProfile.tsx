import React, { useState, useEffect } from 'react';
import { Form, Input, Upload, Button, List, Avatar, App } from 'antd';
import { UserOutlined, UploadOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import AppLayout from '../components/AppLayout';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useAppSelector } from '../hooks';
import { updateUser } from '../redux/actions/authAction';
import { AppState, Comment, Post } from '../types';
import { brand } from '../theme';

interface Values {
  email: string;
  first_name: string;
  last_name: string;
}

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const ProfileHead = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const MyProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const dispatch = useDispatch<ThunkDispatch<AppState, void, AnyAction>>();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    form.setFieldsValue({
      email: currentUser.email,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
    });
    fetchPosts(currentUser.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, form]);

  const fetchPosts = async (userEmail: string) => {
    try {
      const postQuery = query(collection(firestore, 'posts'), where('email', '==', userEmail));
      const postsSnapshot = await getDocs(postQuery);
      setPosts(postsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Post));
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // --- Name updates ------------------------------------------------------
  const updateUserProfile = async (values: Values) => {
    const usersQuery = query(collection(firestore, 'users'), where('email', '==', currentUser.email));
    const usersSnapshot = await getDocs(usersQuery);
    if (!usersSnapshot.empty) {
      const userRef = doc(firestore, 'users', usersSnapshot.docs[0].id);
      await updateDoc(userRef, { first_name: values.first_name, last_name: values.last_name });
    }
  };

  const updatePostAuthorName = async (values: Values) => {
    const postsQuery = query(
      collection(firestore, 'posts'),
      where('author.email', '==', currentUser.email)
    );
    const postsSnapshot = await getDocs(postsQuery);
    await Promise.all(
      postsSnapshot.docs.map((postDoc) =>
        updateDoc(doc(firestore, 'posts', postDoc.id), {
          'author.first_name': values.first_name,
          'author.last_name': values.last_name,
        })
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue() as Values;
      await updateUserProfile(values);
      await updatePostAuthorName(values);
      dispatch(updateUser({ first_name: values.first_name, last_name: values.last_name }));
      setEditMode(false);
      message.success('Profile updated successfully!');
      fetchPosts(currentUser.email);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Profile picture updates ------------------------------------------
  const updateUserPicture = async (imageUrl: string) => {
    const usersQuery = query(collection(firestore, 'users'), where('email', '==', currentUser.email));
    const usersSnapshot = await getDocs(usersQuery);
    if (!usersSnapshot.empty) {
      await updateDoc(doc(firestore, 'users', usersSnapshot.docs[0].id), { profile_picture: imageUrl });
    }
  };

  const updatePostPicture = async (imageUrl: string) => {
    const postsQuery = query(
      collection(firestore, 'posts'),
      where('author.email', '==', currentUser.email)
    );
    const postsSnapshot = await getDocs(postsQuery);
    await Promise.all(
      postsSnapshot.docs.map((postDoc) =>
        updateDoc(doc(firestore, 'posts', postDoc.id), { 'author.profile_picture': imageUrl })
      )
    );
  };

  const updateCommentsPicture = async (imageUrl: string) => {
    const postsSnapshot = await getDocs(query(collection(firestore, 'posts')));
    await Promise.all(
      postsSnapshot.docs.map((postDoc) => {
        const comments = postDoc.data().comments;
        if (Array.isArray(comments)) {
          let changed = false;
          comments.forEach((comment: Comment) => {
            if (comment.author.email === currentUser.email) {
              comment.author.profile_picture = imageUrl;
              changed = true;
            }
          });
          if (changed) return updateDoc(doc(firestore, 'posts', postDoc.id), { comments });
        }
        return Promise.resolve();
      })
    );
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profileImages/${currentUser.email}/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const url = await getDownloadURL(storageRef);

      await Promise.all([updateUserPicture(url), updatePostPicture(url), updateCommentsPicture(url)]);
      dispatch(updateUser({ profile_picture: url }));

      setSelectedFile(null);
      message.success('Profile picture updated!');
      fetchPosts(currentUser.email);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      message.error('Failed to upload picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG images.');
      return false;
    }
    setSelectedFile(file);
    return false;
  };

  return (
    <AppLayout title="My Profile" maxWidth={720}>
      <Card>
        <ProfileHead>
          <Avatar
            size={140}
            icon={<UserOutlined />}
            src={currentUser.profile_picture}
            style={{ border: `3px solid ${brand.primary}` }}
          />
          <Upload
            listType="picture"
            maxCount={1}
            accept="image/jpeg,image/png"
            beforeUpload={beforeUpload}
            onRemove={() => setSelectedFile(null)}
            fileList={selectedFile ? [{ uid: '-1', name: selectedFile.name, status: 'done' }] : []}
          >
            <Button icon={<UploadOutlined />}>Choose photo</Button>
          </Upload>
          {selectedFile && (
            <Button type="primary" icon={<UploadOutlined />} loading={uploading} onClick={handleUploadPicture}>
              Upload picture
            </Button>
          )}
        </ProfileHead>

        <Form form={form} layout="vertical">
          <Form.Item label="Email">
            <Input value={currentUser.email} disabled />
          </Form.Item>
          <Form.Item
            label="First name"
            name="first_name"
            rules={[{ required: true, message: 'Please enter your first name!' }]}
          >
            <Input prefix={<UserOutlined />} readOnly={!editMode} />
          </Form.Item>
          <Form.Item
            label="Last name"
            name="last_name"
            rules={[{ required: true, message: 'Please enter your last name!' }]}
          >
            <Input prefix={<UserOutlined />} readOnly={!editMode} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            {editMode ? (
              <Button type="primary" icon={<CheckOutlined />} loading={loading} onClick={handleSave}>
                Save changes
              </Button>
            ) : (
              <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                Edit profile
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>My Posts</h2>
        <List
          itemLayout="horizontal"
          dataSource={posts}
          locale={{ emptyText: 'You haven’t posted anything yet.' }}
          renderItem={(post) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} src={currentUser.profile_picture} />}
                title={`${post.author?.first_name ?? ''} ${post.author?.last_name ?? ''}`.trim()}
                description={post.content}
              />
            </List.Item>
          )}
        />
      </Card>
    </AppLayout>
  );
};

export default MyProfilePage;
