import React, { useState } from 'react';
import { Button, Input, Avatar, App } from 'antd';
import { Comment as AntComment } from '@ant-design/compatible';
import styled from 'styled-components';
import { UserOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAppSelector } from '../hooks';
import { Comment, UserData } from '../types';
import { brand } from '../theme';

const CommentsContainer = styled.div`
  margin-top: 12px;
`;

const StyledComment = styled(AntComment)`
  background-color: ${brand.bg};
  margin-bottom: 10px;
  border-radius: 16px;
  padding: 2px 16px;
`;

const Composer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

interface CommentsProps {
  handleComment: (postId: string, comment: Comment) => void;
  onUpdateComment: (postId: string) => void;
  comments: Comment[];
  postId: string;
  currentUser: UserData;
}

const Comments: React.FC<CommentsProps> = ({ handleComment, onUpdateComment, comments, postId, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState('');
  const { message } = App.useApp();
  const loggedInUser = useAppSelector((state) => state.auth.user);

  const postComment = () => {
    if (newComment.trim() === '') {
      message.warning('Write a comment first.');
      return;
    }
    handleComment(postId, { author: currentUser, content: newComment, comment_id: uuidv4() });
    setNewComment('');
    message.success('Comment posted.');
  };

  const handleEdit = async (post_id: string, commentId: string, newContent: string) => {
    if (newContent.trim() === '') {
      message.warning('Comment cannot be empty.');
      return;
    }
    try {
      const postDocRef = doc(firestore, 'posts', post_id);
      const docSnapshot = await getDoc(postDocRef);
      if (docSnapshot.exists()) {
        const updatedComments = docSnapshot.data().comments.map((c: Comment) =>
          c.comment_id === commentId ? { ...c, content: newContent } : c
        );
        await updateDoc(postDocRef, { comments: updatedComments });
        message.success('Comment updated.');
        onUpdateComment(post_id);
        setEditingCommentId(null);
        setEditedComment('');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      message.error('Failed to update comment.');
    }
  };

  const handleDelete = async (post_id: string, commentId: string) => {
    try {
      const postDocRef = doc(firestore, 'posts', post_id);
      const docSnapshot = await getDoc(postDocRef);
      if (docSnapshot.exists()) {
        const updatedComments = docSnapshot.data().comments.filter(
          (c: Comment) => c.comment_id !== commentId
        );
        await updateDoc(postDocRef, { comments: updatedComments });
        message.success('Comment deleted.');
        onUpdateComment(post_id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error('Failed to delete comment.');
    }
  };

  return (
    <CommentsContainer>
      {comments.map((comment) => {
        const isAuthor = comment.author.email === loggedInUser.email;
        const isEditing = comment.comment_id === editingCommentId;

        const actions = isAuthor
          ? isEditing
            ? [
                <Button key="save" type="link" size="small" onClick={() => handleEdit(postId, comment.comment_id, editedComment)}>
                  Save
                </Button>,
                <Button key="cancel" type="link" size="small" onClick={() => { setEditingCommentId(null); setEditedComment(''); }}>
                  Cancel
                </Button>,
              ]
            : [
                <Button key="edit" type="link" size="small" onClick={() => { setEditedComment(comment.content); setEditingCommentId(comment.comment_id); }}>
                  Edit
                </Button>,
                <Button key="delete" type="link" size="small" danger onClick={() => handleDelete(postId, comment.comment_id)}>
                  Delete
                </Button>,
              ]
          : [];

        return (
          <StyledComment
            key={comment.comment_id}
            avatar={<Avatar icon={<UserOutlined />} src={comment.author.profile_picture} />}
            author={`${comment.author.first_name} ${comment.author.last_name}`}
            content={
              isEditing ? (
                <Input.TextArea
                  value={editedComment}
                  autoSize
                  onChange={(e) => setEditedComment(e.target.value)}
                />
              ) : (
                comment.content
              )
            }
            actions={actions}
          />
        );
      })}

      <Composer>
        <Input.TextArea
          value={newComment}
          autoSize={{ minRows: 1, maxRows: 4 }}
          placeholder="Write a comment..."
          onChange={(e) => setNewComment(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              postComment();
            }
          }}
        />
        <Button type="primary" onClick={postComment} style={{ alignSelf: 'flex-end' }}>
          Comment
        </Button>
      </Composer>
    </CommentsContainer>
  );
};

export default Comments;
