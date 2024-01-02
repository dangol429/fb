import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Card, Avatar, Button} from 'antd';
import { Comment } from '@ant-design/compatible';
import {
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  BookOutlined,
  BookFilled,
} from '@ant-design/icons';
import { firestore } from '../firebase';
import styled from 'styled-components';
import { useSelector } from 'react-redux'
import 'firebase/firestore';
import { getDocs, getDoc, doc, where, query, collection} from 'firebase/firestore';
import { UserOutlined} from '@ant-design/icons';
import Comments from './comments';


// interface PostComment {
//   commentedBy: { firstName: string; lastName: string; profilePicture: string }; // Add the necessary fields for the commenter
//   comment: string;
// }


const { Meta } = Card;

interface PostProps {
  post: Post;
  onComment: (postId: string, comment: Comment) => void;
  onLike: (userData: UserData, postId: string) => void;
  onDislike: (userData: UserData, postId: string) => void;
  onBookmark: (userData: UserData, postId: string) => void;
  onUnbookmark: (userData: UserData, postId: string) => void;
}

interface Post {
  post_id: string;
  email: string;
  content: string;
  author: Author;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  comments: Comment[]; // or Comment[] if you have a Comment interface
}

interface Author {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
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

interface UserLike {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  profile_picture: string | null;
}

interface UserBookmark {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  profile_picture: string;  // Assuming profile_picture is always a string URL
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

// const CommentsContainer = styled.div`
// margin-top: 20px;
// `;


// const CommentButton = styled(Button)`
//   background-color: #1890ff; /* Primary button color */
//   color: white;
//   border: none;
//   border-radius: 8px;
//   &:hover {
//     background-color: #096dd9; /* Button color on hover */
//   }
// `;
// const StyledComment = styled(Comment)`
//   background-color: #f0f2f5;
//   margin-bottom: 10px;
//   border-radius: 30px;
//   padding-left: 20px;
//   padding-right: 10px;
// `


// const CommentTextArea = styled(Input.TextArea)`
//   margin-bottom: 8px;
//   resize: none !important;
//   background-color: white;
//   padding: 10px;
//   border-radius: 8px;
//   transition: height 0.3s;
//   width: 100%;
//   @media (max-width: 600px) {
//     padding: 8px;
//   }
// `;


const StyledCard = styled(Card)`
  width: 100%;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    padding: 10px;
  }
  @media (max-width: 600px) {
    width: auto;
  }
`;

const ActionButton = styled(Button)`
  margin-top: 10px;
  margin-right: 10px;
  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
  }
  @media (max-width: 600px) {
    margin-top: 5px;
    font-size: 12px;
  }
`;

const MobileSpan = styled.span` 
@media (max-width: 600px) {
 display: none !important;
}
`

const CountWrapper = styled.span`
  margin-right: 10px;
`;

const Bookmarks = styled.div`
display: flex;
align-items: center;
margin-bottom: 10px;

.ant-btn {
  border: none;
  background-color: transparent;
  color: #555;

  &:hover {
    background-color: #f0f0f0;
  }

  &.ant-btn-primary {
    background-color: #1890ff;
    color: #fff;

    &:hover {
      background-color: #1890ff;
    }
  }
}
@media (max-width: 600px) {
  width: 10px;
}
`;

const LikeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  margin-left: 10px;
  font-size: 20px;
  .ant-btn {
    border: none;
    background-color: transparent;
    color: #555;

    &:hover {
      background-color: #f0f0f0;
    }

    &.ant-btn-primary {
      background-color: #1890ff;
      color: #fff;

      &:hover {
        background-color: #1890ff;
      }
    }
  }
  @media (max-width: 600px) {
    width: 8px;
  }
  
`;
const CommentContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  .ant-btn {
    border: none;
    background-color: transparent;
    color: #555;

    &:hover {
      background-color: #f0f0f0;
    }

    &.ant-btn-primary {
      background-color: #1890ff;
      color: #fff;

      &:hover {
        background-color: #1890ff;
      }
    }
  }
  @media (max-width: 600px) {
    width: 10px;
  }
`;
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 40px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
  @media (max-width: 600px) {
    flex-direction: row;
    display: flex;
    justify-content: space-between;
    width: 220px;
  }
`;

const CustomAvatar = styled(Avatar)`
  margin-top: 10px;
  width: 50px;
  height: 50px;
  @media (max-width: 768px) {
    width: 55px;
    height: 55px;
  }
  @media (max-width: 600px) {
    width: 55px;
    height: 55px;
  }
`;

const CustomTitle = styled.div`
  margin-top: 10px;
`;
const CustomDateSpan = styled.span`
  color: gray;
  font-size: 12px;
  margin-left: 4rem;
`;

const Line = styled.hr`
   color: #f1f1f1; 
   font-size: 0.2px;
   width: 100%;
`;

const NumbersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 600px;
  margin:auto;
  height: 40px;
  @media (max-width: 768px) {
    width: 230px
  }
  @media (max-width: 600px) {
    width: 260px;
    display: flex;
    font-size: 12px;
    margin-left: 0px;
  }
`
const CommentNumber = styled.div`
`

const LikeNumber = styled.div`
  margin-left: 20px;
`



const Post: React.FC<PostProps> = ({ post, onComment, onLike, onDislike, onBookmark, onUnbookmark }) => {
  const [isLiked, setLiked] = useState(false);
  const [isBookmarked, setBookmarked] = useState(false);
  const comments: { author: string; content: string }[] = [];
  const [showComments, setShowComments] = useState(false);
  const [likeNumber, setLikeNumber] = useState(0);
  const [bookmarkNumber, setBookmarkNumber] = useState(0);
  const [fetchedComments, setFetchedComments] = useState<Comment[]>([]);

  const CurrentUser = useSelector((state: AppState) => state.auth.user);
  const PostId = post.post_id

  
  const fetchLikeNumber = async (post_id: string) => {
    try {
      const LikesCollection = collection(firestore, 'Likes');
      const likesQuery = query(LikesCollection, where('post_id', '==', post_id));
      const LikesSnapshot = await getDocs(likesQuery);
  
      if (LikesSnapshot.empty) {
        console.log('No likes for this post.');
        setLikeNumber(0);
      } else {
        // Calculate the total number of likes for the specified post
        const totalLikes = LikesSnapshot.docs[0].data().likedBy.length;
        console.log('Total Likes:', totalLikes);
        setLikeNumber(totalLikes);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      // Handle the error as needed
    }
  };

  const fetchLikeState = async (post_id: string) => {
    try {
      const LikesCollection = collection(firestore, 'Likes');
      const likesQuery = query(LikesCollection, where('post_id', '==', post_id));
      const LikesSnapshot = await getDocs(likesQuery);
  
      if (LikesSnapshot.empty) {
        // No likes for the specified post, set isLiked to false
        return false;
      }
  
      // Get the likedBy array from the first document
      const likedByArray = LikesSnapshot.docs[0].data().likedBy;
      // Check if the current user's email exists in the likedBy array
      const Liked = likedByArray.some((likedBy: UserLike) => {
        return likedBy.email === CurrentUser.email;
      });
      console.log('Is liked:', isLiked);
      if(Liked){
        setLiked(true);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      return false; // Assuming an error means the post is not liked
    }
  };

  const fetchBookmarkNumber = async (post_id: string) => {
    try {
      const BookmarksCollection = collection(firestore, 'Bookmarks');
      const bookmarksQuery = query(BookmarksCollection, where('post_id', '==', post_id));
      const BookmarksSnapshot = await getDocs(bookmarksQuery);
  
      if (BookmarksSnapshot.empty) {
        console.log('No bookmarks for this post.');
        setBookmarkNumber(0);
      } else {
        // Calculate the total number of bookmarks for the specified post
        const totalBookmarks = BookmarksSnapshot.docs[0].data().bookmarkedBy.length;
        console.log('Total Bookmarks:', totalBookmarks);
        setBookmarkNumber(totalBookmarks);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      // Handle the error as needed
    }
  };
  
  const fetchBookmarkState = async (post_id: string) => {
    try {
      const BookmarksCollection = collection(firestore, 'Bookmarks');
      const bookmarksQuery = query(BookmarksCollection, where('post_id', '==', post_id));
      const BookmarksSnapshot = await getDocs(bookmarksQuery);
  
      if (BookmarksSnapshot.empty) {
        // No bookmarks for the specified post, set isBookmarked to false
        return false;
      }
  
      // Get the bookmarkedBy array from the first document
      const bookmarkedByArray = BookmarksSnapshot.docs[0].data().bookmarkedBy;
      // Check if the current user's email exists in the bookmarkedBy array
      const Bookmarked = bookmarkedByArray.some((bookmarkedBy: UserBookmark) => {
        return bookmarkedBy.email === CurrentUser.email;
      });
      console.log('Is bookmarked:', Bookmarked);
      if (Bookmarked) {
        setBookmarked(true);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      return false; // Assuming an error means the post is not bookmarked
    }
  };

  

  useEffect(()=> {
    fetchLikeState(PostId)
    fetchLikeNumber(PostId)
  }, [])

  useEffect(()=> {
    fetchBookmarkState(PostId)
    fetchBookmarkNumber(PostId)
  }, [])
  
  const handleLike = () => {
    if(!isLiked){
      onLike(CurrentUser, PostId)
      setLiked((prev) => !prev);
    }else{
      onDislike(CurrentUser, PostId)
      setLiked((prev) => !prev);
    }
    setTimeout((() => fetchLikeNumber(PostId)), 300)
  };

  const handleBookmark = () => {
    if(!isBookmarked){
      onBookmark(CurrentUser, PostId)
      setBookmarked((prev) => !prev)
    }else{
      onUnbookmark(CurrentUser, PostId)
      setBookmarked((prev) => !prev)
    }
    setTimeout((() => fetchBookmarkNumber(PostId)), 300)
  }

  const fetchComments = async (postId : string) => {
    console.log('Fetching comments for postId:', postId);
    
    try {
      // Define the reference to the specific post document
      const postDocRef = doc(firestore, 'posts', postId);
  
      // Fetch the post document
      const docSnapshot = await getDoc(postDocRef);
  
      if (docSnapshot.exists()) {
        // Extract the comments from the post document
        const post = docSnapshot.data();
        const comments = post.comments || [];
  
        setFetchedComments(comments);
        console.log('Comments fetched:', comments);
      } else {
        console.log('No post found with the given postId:', postId);
        setFetchedComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setFetchedComments([]); // Set to empty array in case of error
    }
  };
  

  const handleComment = async (PostId: string, comment: Comment) => {

    // Call the onComment callback to inform Home component about the new comment
    onComment(PostId, comment);
    setTimeout(()=>fetchComments(PostId), 1000);
  };
  
  
  const toggleComments = () => {
    setShowComments(!showComments);
    fetchComments(PostId)
  };

  const handleUpdateComment = (PostId : string) => {
    console.log("being called.")
    fetchComments(PostId)
  };
  

  return (
    <StyledCard>
      <Meta
        avatar={<CustomAvatar  icon={<UserOutlined />} src={post.author.profile_picture} />}
        title={<CustomTitle>{`${post.author.first_name} ${post.author.last_name}`}</CustomTitle>}
        description={
          <>
          <CustomDateSpan>
            {new Date(post.createdAt.toDate()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} at {new Date(post.createdAt.toDate()).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
          </CustomDateSpan>
            <p style={{ color: 'black' }} key={post.createdAt.toDate().toString()}
>
              {post.content}
            </p>
            <div>
              <NumbersContainer>
                <LikeNumber>
                  <CountWrapper> {likeNumber} Likes</CountWrapper>
                </LikeNumber>
                <CommentNumber>
                  <CountWrapper>{post.comments.length + comments.length} Comments</CountWrapper>
                  <CountWrapper>{bookmarkNumber} Bookmarks</CountWrapper>
                </CommentNumber>
              </NumbersContainer>
              <Line />
              <ButtonsContainer>
                <LikeContainer>
                  <ActionButton
                    style = {{ width: '200px'}}
                    icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
                    onClick={handleLike}
                    className={isLiked ? 'ant-btn ant-btn-primary' : 'ant-btn'}
                  >
                    <MobileSpan>{isLiked ? 'Unlike' : 'Like'}</MobileSpan>
                  </ActionButton>
                </LikeContainer>
                <CommentContainer>
                  <ActionButton
                    style = {{ width: '200px'}}
                    icon={<MessageOutlined />}
                    onClick={toggleComments}
                    className={showComments ? 'ant-btn ant-btn-primary' : 'ant-btn'}
                  >
                    <MobileSpan>Comment</MobileSpan>
                  </ActionButton>
                </CommentContainer>
                <Bookmarks>
                  <ActionButton
                    style = {{ width: '200px'}}
                    icon={isBookmarked ? <BookFilled /> : <BookOutlined />}
                    onClick={handleBookmark}
                    className={isBookmarked ? 'ant-btn ant-btn-primary' : 'ant-btn'}
                    ><MobileSpan>Bookmark</MobileSpan></ActionButton>
                </Bookmarks>
                {/* ... (Other elements) */}
              </ButtonsContainer>
                {/* <Changes>
                  {currentUser.email === post.email && (
                    <>
                      <ActionButton icon={<EditOutlined />} onClick={() => onUpdate(post)}>
                      </ActionButton>
                      <ActionButton icon={<DeleteOutlined />} onClick={() => onDelete(post)}>
                      </ActionButton>
                    </>
                  )}
                </Changes> */}
              <Line/>
              {showComments && (
              <Comments
              handleComment={handleComment}
              comments={fetchedComments}
              postId={PostId}
              currentUser={CurrentUser}
              onUpdateComment={handleUpdateComment}
            />            
              )}
            </div>
          </>
        }
      />
    </StyledCard>
  );
};

export default Post;


