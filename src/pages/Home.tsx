import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Avatar, Upload, Empty, App } from 'antd';
import AppLayout from '../components/AppLayout';
import Posts from '../components/posts';
import createPost from '../firebase/createPost';
import styled from 'styled-components';
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  getDocs,
  arrayUnion,
  where,
  query,
  collection,
  Timestamp,
  orderBy,
  startAfter,
  limit,
  DocumentSnapshot,
} from 'firebase/firestore';
import { firestore, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostSkeleton from '../components/skeleton/postsSkeleton';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useAppSelector } from '../hooks';
import { Post, Comment, LikeData, BookmarkData } from '../types';
import { brand } from '../theme';

const Composer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 24px;
`;

const ComposerTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ComposerActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${brand.border};
`;

const ClickableAvatar = styled(Avatar)`
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const HOME = () => {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<Post> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const navigate = useNavigate();
  const { message } = App.useApp();

  const currentUser = useAppSelector((state) => state.auth.user);
  const { email, first_name, last_name, profile_picture } = currentUser;

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(firestore, 'posts');
      const queryConstraint = lastVisible
        ? query(postsCollection, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10))
        : query(postsCollection, orderBy('createdAt', 'desc'), limit(10));

      const postsSnapshot = await getDocs(queryConstraint);

      if (postsSnapshot.empty) {
        setHasMore(false);
        return;
      }

      const fetchedPosts = postsSnapshot.docs.map((d) => ({ ...d.data(), post_id: d.id })) as Post[];
      setPosts((prev) => [...prev, ...fetchedPosts]);

      const lastPostSnapshot = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setLastVisible(lastPostSnapshot as unknown as DocumentSnapshot<Post>);
      setHasMore(postsSnapshot.docs.length === 10);
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('Could not load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File): Promise<string | false> => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG images.');
      return false;
    }
    try {
      const storageRef = ref(storage, `postImages/${email}/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload image. Please try again.');
      return false;
    }
  };

  const handlePost = async () => {
    if (newPost.trim() === '' && !selectedFile) {
      message.warning('Write something or add a photo before posting.');
      return;
    }

    setPosting(true);
    try {
      const uploadedPhoto = selectedFile ? await handleUpload(selectedFile) : undefined;
      const newPostObject: Post = {
        post_id: uuidv4(),
        email,
        content: newPost,
        author: { first_name, last_name, email, profile_picture },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: null,
        comments: [],
        photo: typeof uploadedPhoto === 'string' ? uploadedPhoto : undefined,
      };

      await createPost(newPostObject);
      setPosts((prev) => [newPostObject, ...prev]);
      setNewPost('');
      setSelectedFile(null);
      message.success('Post created successfully!');
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (post_id: string, comment: Comment) => {
    try {
      const postDocRef = doc(firestore, 'posts', post_id);
      const docSnapshot = await getDoc(postDocRef);
      if (docSnapshot.exists()) {
        await updateDoc(postDocRef, {
          comments: arrayUnion(comment),
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async (likeData: LikeData, post_id: string) => {
    try {
      const likesCollection = collection(firestore, 'Likes');
      const likesQuery = query(likesCollection, where('post_id', '==', post_id));
      const likesSnapshot = await getDocs(likesQuery);

      if (!likesSnapshot.empty) {
        const likeDocRef = likesSnapshot.docs[0].ref;
        await updateDoc(likeDocRef, {
          likedBy: arrayUnion(likeData),
          LikedEmails: arrayUnion(likeData.email),
        });
      } else {
        await addDoc(likesCollection, {
          post_id,
          likedBy: [likeData],
          LikedEmails: [likeData.email],
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async (likeData: LikeData, post_id: string) => {
    try {
      const likesCollection = collection(firestore, 'Likes');
      const dislikeQuery = query(likesCollection, where('post_id', '==', post_id));
      const querySnapshot = await getDocs(dislikeQuery);

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const index = data.likedBy.findIndex((likedBy: LikeData) => likedBy.email === likeData.email);
        if (index !== -1) {
          data.likedBy.splice(index, 1);
          data.LikedEmails = data.LikedEmails.filter((e: string) => e !== likeData.email);
          await updateDoc(docSnap.ref, { likedBy: data.likedBy, LikedEmails: data.LikedEmails });
          return;
        }
      }
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  const handleBookmark = async (bookmarkData: BookmarkData, post_id: string) => {
    try {
      const bookmarksCollection = collection(firestore, 'Bookmarks');
      const bookmarksQuery = query(bookmarksCollection, where('post_id', '==', post_id));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);

      if (!bookmarksSnapshot.empty) {
        const bookmarkDocRef = bookmarksSnapshot.docs[0].ref;
        await updateDoc(bookmarkDocRef, {
          bookmarkedBy: arrayUnion(bookmarkData),
          BookmarkedEmails: arrayUnion(bookmarkData.email),
        });
      } else {
        await addDoc(bookmarksCollection, {
          post_id,
          bookmarkedBy: [bookmarkData],
          BookmarkedEmails: [bookmarkData.email],
        });
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleUnbookmark = async (bookmarkData: BookmarkData, post_id: string) => {
    try {
      const bookmarksCollection = collection(firestore, 'Bookmarks');
      const unbookmarkQuery = query(bookmarksCollection, where('post_id', '==', post_id));
      const querySnapshot = await getDocs(unbookmarkQuery);

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const index = data.bookmarkedBy.findIndex(
          (b: BookmarkData) => b.email === bookmarkData.email
        );
        if (index !== -1) {
          data.bookmarkedBy.splice(index, 1);
          data.BookmarkedEmails = data.BookmarkedEmails.filter((e: string) => e !== bookmarkData.email);
          await updateDoc(docSnap.ref, {
            bookmarkedBy: data.bookmarkedBy,
            BookmarkedEmails: data.BookmarkedEmails,
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    message.success('Photo added. Click "Post" to share it.');
    return false;
  };

  return (
    <AppLayout title="Home">
      <Composer>
        <ComposerTop>
          <ClickableAvatar
            onClick={() => navigate('/my-profile')}
            size={44}
            src={profile_picture}
            icon={<UserOutlined />}
          />
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 5 }}
            placeholder={`What's on your mind, ${first_name}?`}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            style={{ borderRadius: 20, background: brand.bg, resize: 'none' }}
          />
        </ComposerTop>
        <ComposerActions>
          <Upload
            name="postPhoto"
            listType="picture"
            maxCount={1}
            accept="image/jpeg,image/png"
            beforeUpload={handleFileSelection}
            onRemove={() => setSelectedFile(null)}
            fileList={
              selectedFile
                ? [{ uid: '-1', name: selectedFile.name, status: 'done' }]
                : []
            }
          >
            <Button icon={<UploadOutlined />}>Add photo</Button>
          </Upload>
          <Button type="primary" onClick={handlePost} loading={posting}>
            Post
          </Button>
        </ComposerActions>
      </Composer>

      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <Empty description="No posts yet. Be the first to share something!" style={{ marginTop: 48 }} />
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchPosts}
          hasMore={hasMore}
          loader={
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          }
          endMessage={
            <p style={{ textAlign: 'center', color: brand.textSecondary, margin: '24px 0' }}>
              You&apos;re all caught up 🎉
            </p>
          }
        >
          {posts.map((post) => (
            <Posts
              key={post.post_id}
              post={post}
              onComment={handleComment}
              onLike={handleLike}
              onDislike={handleDislike}
              onBookmark={handleBookmark}
              onUnbookmark={handleUnbookmark}
            />
          ))}
        </InfiniteScroll>
      )}
    </AppLayout>
  );
};

export default HOME;
