import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Divider } from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  BookOutlined,
  BookFilled,
  UserOutlined,
} from '@ant-design/icons';
import { firestore } from '../firebase';
import styled from 'styled-components';
import { getDocs, getDoc, doc, where, query, collection } from 'firebase/firestore';
import { useAppSelector } from '../hooks';
import { Post, Comment, LikeData, BookmarkData, UserData } from '../types';
import { brand } from '../theme';
import Comments from './comments';

interface PostProps {
  post: Post;
  onComment: (postId: string, comment: Comment) => void;
  onLike: (likeData: LikeData, postId: string) => void;
  onDislike: (likeData: LikeData, postId: string) => void;
  onBookmark: (bookmarkData: BookmarkData, postId: string) => void;
  onUnbookmark: (bookmarkData: BookmarkData, postId: string) => void;
}

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${brand.text};
`;

const DateText = styled.div`
  font-size: 12px;
  color: ${brand.textSecondary};
`;

const ContentText = styled.p`
  color: ${brand.text};
  font-size: 15px;
  line-height: 1.5;
  margin: 14px 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 4px;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${brand.textSecondary};
  font-size: 13px;
  padding: 4px 2px;
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 8px;

  .ant-btn {
    flex: 1;
    color: ${brand.textSecondary};
    font-weight: 600;
  }

  .ant-btn.active {
    color: ${brand.primary};
  }
`;

const PostCard: React.FC<PostProps> = ({ post, onComment, onLike, onDislike, onBookmark, onUnbookmark }) => {
  const [isLiked, setLiked] = useState(false);
  const [isBookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likeNumber, setLikeNumber] = useState(0);
  const [bookmarkNumber, setBookmarkNumber] = useState(0);
  const [fetchedComments, setFetchedComments] = useState<Comment[]>([]);

  const currentUser = useAppSelector((state) => state.auth.user);
  const postId = post.post_id;

  const fetchLikeNumber = async (post_id: string) => {
    try {
      const likesQuery = query(collection(firestore, 'Likes'), where('post_id', '==', post_id));
      const snapshot = await getDocs(likesQuery);
      setLikeNumber(snapshot.empty ? 0 : snapshot.docs[0].data().likedBy.length);
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const fetchLikeState = async (post_id: string) => {
    try {
      const likesQuery = query(collection(firestore, 'Likes'), where('post_id', '==', post_id));
      const snapshot = await getDocs(likesQuery);
      if (snapshot.empty) return;
      const likedByArray = snapshot.docs[0].data().likedBy;
      const liked = likedByArray.some((u: UserData) => u.email === currentUser.email);
      if (liked) setLiked(true);
    } catch (error) {
      console.error('Error fetching like state:', error);
    }
  };

  const fetchBookmarkNumber = async (post_id: string) => {
    try {
      const bookmarksQuery = query(collection(firestore, 'Bookmarks'), where('post_id', '==', post_id));
      const snapshot = await getDocs(bookmarksQuery);
      setBookmarkNumber(snapshot.empty ? 0 : snapshot.docs[0].data().bookmarkedBy.length);
    } catch (error) {
      console.error('Error fetching bookmark count:', error);
    }
  };

  const fetchBookmarkState = async (post_id: string) => {
    try {
      const bookmarksQuery = query(collection(firestore, 'Bookmarks'), where('post_id', '==', post_id));
      const snapshot = await getDocs(bookmarksQuery);
      if (snapshot.empty) return;
      const bookmarkedByArray = snapshot.docs[0].data().bookmarkedBy;
      const bookmarked = bookmarkedByArray.some((u: UserData) => u.email === currentUser.email);
      if (bookmarked) setBookmarked(true);
    } catch (error) {
      console.error('Error fetching bookmark state:', error);
    }
  };

  useEffect(() => {
    fetchLikeState(postId);
    fetchLikeNumber(postId);
    fetchBookmarkState(postId);
    fetchBookmarkNumber(postId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLike = () => {
    if (!isLiked) {
      onLike(currentUser, postId);
      setLikeNumber((n) => n + 1);
    } else {
      onDislike(currentUser, postId);
      setLikeNumber((n) => Math.max(0, n - 1));
    }
    setLiked((prev) => !prev);
  };

  const handleBookmark = () => {
    if (!isBookmarked) {
      onBookmark(currentUser, postId);
      setBookmarkNumber((n) => n + 1);
    } else {
      onUnbookmark(currentUser, postId);
      setBookmarkNumber((n) => Math.max(0, n - 1));
    }
    setBookmarked((prev) => !prev);
  };

  const fetchComments = async (post_id: string) => {
    try {
      const postDocRef = doc(firestore, 'posts', post_id);
      const docSnapshot = await getDoc(postDocRef);
      setFetchedComments(docSnapshot.exists() ? docSnapshot.data().comments || [] : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setFetchedComments([]);
    }
  };

  const handleComment = async (post_id: string, comment: Comment) => {
    onComment(post_id, comment);
    // Optimistically show the new comment, then reconcile with Firestore.
    setFetchedComments((prev) => [...prev, comment]);
    setTimeout(() => fetchComments(post_id), 1000);
  };

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next) fetchComments(postId);
  };

  const handleUpdateComment = (post_id: string) => fetchComments(post_id);

  const totalComments = (post.comments?.length ?? 0);
  const createdAt = post.createdAt.toDate();

  return (
    <StyledCard>
      <HeaderRow>
        <Avatar size={44} icon={<UserOutlined />} src={post.author.profile_picture} />
        <div>
          <AuthorName>{`${post.author.first_name} ${post.author.last_name}`}</AuthorName>
          <DateText>
            {createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
            {createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
          </DateText>
        </div>
      </HeaderRow>

      {post.content && <ContentText>{post.content}</ContentText>}
      {post.photo && <PostImage src={post.photo} alt="post" />}

      <StatsRow>
        <span>{likeNumber} {likeNumber === 1 ? 'Like' : 'Likes'}</span>
        <span>
          {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'} · {bookmarkNumber}{' '}
          {bookmarkNumber === 1 ? 'Bookmark' : 'Bookmarks'}
        </span>
      </StatsRow>

      <Divider style={{ margin: '8px 0' }} />

      <ActionsRow>
        <Button
          type="text"
          className={isLiked ? 'active' : ''}
          icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
          onClick={handleLike}
        >
          {isLiked ? 'Liked' : 'Like'}
        </Button>
        <Button
          type="text"
          className={showComments ? 'active' : ''}
          icon={<MessageOutlined />}
          onClick={toggleComments}
        >
          Comment
        </Button>
        <Button
          type="text"
          className={isBookmarked ? 'active' : ''}
          icon={isBookmarked ? <BookFilled /> : <BookOutlined />}
          onClick={handleBookmark}
        >
          {isBookmarked ? 'Saved' : 'Save'}
        </Button>
      </ActionsRow>

      {showComments && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <Comments
            handleComment={handleComment}
            comments={fetchedComments}
            postId={postId}
            currentUser={currentUser}
            onUpdateComment={handleUpdateComment}
          />
        </>
      )}
    </StyledCard>
  );
};

export default PostCard;
