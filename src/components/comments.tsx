import React, { useState } from 'react';
import { Button,message, Input, Avatar} from 'antd';
import {Comment} from '@ant-design/compatible';
import styled from 'styled-components';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from '../firebase'; // Adjust the import path according to your project structure
import { doc, getDoc, updateDoc } from 'firebase/firestore';


interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    profile_picture: string;
  }

  interface CommentAuthor {
    email: string ;
    first_name: string ;
    last_name: string ;
    password: string ;
    profile_picture: string ;
  }
  
  interface Comment {
    author: CommentAuthor;
    content: string;
    comment_id: string;
  }

const CommentsContainer = styled.div`
margin-top: 20px;
`;

const CommentButton = styled(Button)`
  background-color: #1890ff; /* Primary button color */
  color: white;
  border: none;
  border-radius: 8px;
  &:hover {
    background-color: #096dd9; /* Button color on hover */
  }
`;

const CommentTextArea = styled(Input.TextArea)`
  margin-bottom: 8px;
  resize: none !important;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  transition: height 0.3s;
  width: 100%;
  @media (max-width: 600px) {
    padding: 8px;
  }
`;

const StyledComment = styled(Comment)`
  background-color: #f0f2f5;
  margin-bottom: 10px;
  border-radius: 30px;
  padding-left: 20px;
  padding-right: 10px;
`

interface CommentsProps {
    handleComment: (postId: string, comment: Comment) => void;
    onUpdateComment: (postId : string) => void;
    comments: Comment[];
    postId: string;
    currentUser: UserData;
  }

  interface AppState {
    auth: AuthState;
    // other slices of state...
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
  
  

const Comments: React.FC<CommentsProps> = ({ handleComment,onUpdateComment, comments, postId, currentUser}) => {
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');
    const CurrentUser = useSelector((state: AppState) => state.auth.user);
    // const email = CurrentUser.email
    const post_id = postId
    const postComment = () => {
    handleComment(postId, { author: currentUser, content: newComment, comment_id: uuidv4() });
    setNewComment(''); // Clear the comment input field
    message.success('Commented Succesfully')
    }

  //   const checkAuthor = async (post_id : string) => {
  //     try {
  //       const postDocRef = doc(firestore, "posts", post_id);
  //       const docSnapshot = await getDoc(postDocRef);
    
  //       if (docSnapshot.exists())  {
  //         const postData = docSnapshot.data();
  //         if (postData.author.email === email){
            
  //         }
  //       }
  //   }
  // }



  const handleEdit = async (post_id: string, commentId: string, newContent : string, ) => {
    setEditingCommentId(commentId);
    try {
      const postDocRef = doc(firestore, "posts", post_id);
      const docSnapshot = await getDoc(postDocRef);
  
      if (docSnapshot.exists())  {
        const postData = docSnapshot.data();
          const updatedComments = postData.comments.map((comment: Comment) => 
          comment.comment_id === commentId ? { ...comment, content: newContent } : comment
        );
  
        await updateDoc(postDocRef, {
          comments: updatedComments
        });
  
        console.log("Comment updated successfully.");
        message.success("Comment Edited Successfully.")
        onUpdateComment(post_id)
        setEditingCommentId(null);
        setEditedComment('');
      } else {
        console.error(`Document with post_id ${postId} does not exist.`);
      }
    } catch (error: unknown) {
      console.error('Error updating comment: ');
    }
  };
  


  const handleDelete = async (post_id : string, commentId: string) => {
    console.log("Delete Started")
    try {
      const postDocRef = doc(firestore, "posts", post_id);
      const docSnapshot = await getDoc(postDocRef);
  
      if (docSnapshot.exists()) {
        const postData = docSnapshot.data();
        const updatedComments = postData.comments.filter((comment: Comment) => 
          comment.comment_id !== commentId
        );
  
        await updateDoc(postDocRef, {
          comments: updatedComments
        });
  
        console.log("Comment deleted successfully.");
        message.success("Comment Deleted Successfully.")
        onUpdateComment(post_id); // Update the parent component
      } else {
        console.error(`Document with post_id ${post_id} does not exist.`);
      }
    } catch (error: unknown) {
      console.error('Error deleting comment: ', error);
    }
  };
  


  return (
    <CommentsContainer>
       {comments.map((comment) => {
                const isCurrentUser = comment.author.email === CurrentUser.email;
                
                const actions = isCurrentUser ? (comment.comment_id === editingCommentId ?
                    [
                        <Button key="save" type="link" onClick={() => handleEdit(post_id, comment.comment_id, editedComment)}>Save</Button>,
                        <Button key="cancel" type="link" onClick={() => { setEditingCommentId(null); setEditedComment(''); }}>Cancel</Button>
                    ] : 
                    [
                        <Button key="edit" type="link" onClick={() => { setEditedComment(comment.content); setEditingCommentId(comment.comment_id); }}>Edit</Button>,
                        <Button key="delete" type="link" onClick={() => handleDelete(postId, comment.comment_id)}>Delete</Button>
                    ]
                ) : []; 
        return (
          <StyledComment 
            key={comment.author.email}
            avatar={<Avatar icon={<UserOutlined />} src={comment.author.profile_picture} />}
            author={comment.author.first_name + " " + comment.author.last_name}
            content={comment.comment_id === editingCommentId ? (
              <Input.TextArea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
              />
            ) : (
              comment.content
            )}
            actions={actions}
          />
        );
      })}
      
      <CommentTextArea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <CommentButton onClick={postComment}>
        Comment
      </CommentButton>
    </CommentsContainer>
  );
}

export default Comments;
