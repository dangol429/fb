import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Input, Button, message, Avatar } from 'antd';
import Sidebar from '../components/sidebar';
import Posts from '../components/posts';
import createPost from '../firebase/createPost'
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import {  doc, getDoc, updateDoc, addDoc, getDocs, arrayUnion, where, query, collection, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase'; // Assuming your firestore instance is exported as `firestore`
import { v4 as uuidv4 } from 'uuid';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostSkeleton from '../components/skeleton/postsSkeleton';
import './home.css'

// Firebase imports
import { 
  orderBy, 
  startAfter, 
  limit, 
  DocumentSnapshot 
} from 'firebase/firestore';
import { UserOutlined } from '@ant-design/icons';



const { Content } = Layout;

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

interface BookmarkData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  profile_picture: string | null;
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

interface LikeData {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}

const StyledInput = styled(Input)`
  /* Your input styles here */

  &::placeholder {
    font-size: 18px;
    font-weight: thin;
    color: #a8a8a8;
  }

  @media (max-width: 600px) {
    &::placeholder {
      font-size: 12px;
    }
  }
`;

const PostInputContainer = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  width: 700px;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 600px) {
    width: auto;
  }
`;

const Container = styled.div`
  @media (max-width: 600px) {
    height: 98vh;
  }
  height: 98vh;
`;

const Profile = styled.div`
  text-align: center;
`;

const CustomAvatar = styled(Avatar)`
  border: 2px solid #1890ff;
  cursor: pointer; /* Change cursor to pointer on hover */
  transition: transform 0.3s ease, border-color 0.3s ease; /* Smooth transition for transform and border color */

  &:hover {
    transform: scale(1.05); /* Slightly increase size on hover */
    border-color: #40a9ff; /* Change border color on hover */
  }
`;

const HOME = () => {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([]); // Assuming 'any' as the type for your posts. You might want to replace it with the actual type.
  // const [dummyState, setDummyState] = useState(false);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<Post> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Assuming samplePosts is defined somewhere in your code
  // const samplePosts = ...

  const CurrentUser = useSelector((state: AppState) => state.auth.user);
  console.log('this should happen once')
  const email = CurrentUser.email;
  const first_name = CurrentUser.first_name;
  const last_name = CurrentUser.last_name;
  const profile_picture = CurrentUser.profile_picture;


  useEffect(() => {
    fetchPosts()
  }, []); // Run the effect whenever newPost changes

  const fetchPosts = async () => {
    console.log('fetchPosts called');
    try {
      const postsCollection = collection(firestore, 'posts');
      let queryConstraint;

      if (lastVisible) {
        console.log('visible')
        // Fetch the next set of posts
        queryConstraint = query(postsCollection, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10));
      } else {
        // Fetch the first set of posts
        queryConstraint = query(postsCollection, orderBy('createdAt', 'desc'), limit(10));

      }
  
      const postsSnapshot = await getDocs(queryConstraint);
      
      // If no documents are returned, we've reached the end
      if (postsSnapshot.empty) {
        setHasMore(false);
        console.log('has more is empty')
      }
  
      const fetchedPosts = postsSnapshot.docs.map(doc => ({ ...doc.data(), post_id: doc.id })) as Post[];
      console.log(fetchedPosts)
      // Append new posts to the existing posts
      setPosts(prevPosts => [...prevPosts, ...fetchedPosts]);
      // Update lastVisible to the last fetched document
      const lastPostSnapshot = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      const lastVisiblePost = lastPostSnapshot as unknown as DocumentSnapshot<Post>;
      console.log(lastVisiblePost)

      setLastVisible(lastVisiblePost);
      // Update hasMore depending on the number of fetched documents
      setHasMore(postsSnapshot.docs.length === 10);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // setHasMore(false);
    }
  };
  
  // useEffect(() => {
  //   setTimeout(() => window.scrollTo(0, 0), 40); // Adjust delay as needed
  // }, []);
  
  

  
  // const fetchLikes = async () => {
  //   try {
  //     const LikesCollection = collection(firestore, 'Likes');
  //     const LikesSnapshot = await getDocs(LikesCollection);
  //     const LikedPosts = LikesSnapshot.docs.map((doc : any) => doc.data());
  //     setLikes(LikedPosts);
  //     console.log(LikedPosts)
  //   } catch (error: any) {
  //     console.error('Error fetching Likes:', error.message);
  //   }
  // };
  

  const handlePost = () => {
    if (newPost.trim() !== '') {
      const newPostObject = {
        post_id: uuidv4(),
        email: email,
        content: newPost,
        author: {
          first_name: first_name,
          last_name: last_name,
          email: email,
          profile_picture: profile_picture,
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: null,
        comments: [],
      };
  
      createPost(newPostObject);
      setNewPost('');
      setTimeout(()=>window.location.reload(), 1000);
      message.success('Post Created Succesfully!')
    }
  };

  const handleComment = async (post_id: string, comment: Comment) => {
    try {
        const postDocRef = doc(firestore, "posts", post_id);
        const docSnapshot = await getDoc(postDocRef);
        console.log("Post Id for comment: ", post_id);

        // Check if the document exists
        if (docSnapshot.exists()) {
            console.log('Commenting on post');

            // Now you can update the comments array in that document
            await updateDoc(postDocRef, {
                comments: arrayUnion(comment),
                updatedAt: Timestamp.fromDate(new Date()),
            });
        } else {
            console.error('Error: ', `Document with post_id ${post_id} does not exist.`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error: ', error.message);
        }
    }
};


 const handleLike = async ( LikeData : LikeData, post_id: string)=> {
      try {
       const LikesCollection = collection(firestore, 'Likes');
       console.log("Post Id for like: ",post_id)
    
      // Add the post data to the collection
      const likesQuery = query(LikesCollection, where('post_id', '==', post_id));
      const likesSnapshot = await getDocs(likesQuery);
      console.log(LikeData)

      if (!likesSnapshot.empty) {
      // If the post_id is present, update the existing document
      const likeDocRef = likesSnapshot.docs[0].ref;
      await updateDoc(likeDocRef, {
        likedBy: arrayUnion(LikeData),
        LikedEmails: arrayUnion(LikeData.email)
      });
      } else {
        // If the post_id is not present, add a new document
        await addDoc(LikesCollection, {
          post_id,
          likedBy: [LikeData],
          LikedEmails: [LikeData.email]
        });
    // setDummyState((prev) => !prev);
    console.log('Liked successfully!');
  }
 } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error Liking:', error.message);
    } else {
      console.error('Error Liking:', error);
    }
  }
}

const handleDislike = async (LikeData : LikeData , post_id : string ) => {
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
        const index = data.likedBy.findIndex((likedBy: LikeData) => likedBy.email === LikeData.email);
        
        if (index !== -1) {
          // Remove the likedBy object from the array
          data.likedBy.splice(index, 1);

          data.LikedEmails = data.LikedEmails.filter((email: string) => email !== LikeData.email);
          await updateDoc(doc.ref, { LikedEmails: data.LikedEmails });
          
          // Update the document in Firestore
          await updateDoc(doc.ref, { likedBy: data.likedBy });
          
          // Trigger a state change to refresh the UI
          // setDummyState((prev) => !prev);
          
          console.log(`Unliked Successfully with post_id ${post_id} and author ${LikeData.email} deleted successfully.`);
          
          return; // Exit the loop once the dislike is handled
        }
      }
      
      console.error(`Problem with post_id ${post_id} and author ${LikeData.email} not found.`);
    } else {
      console.error(`Problem with post_id ${post_id} not found.`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

const handleBookmark = async (bookmarkData : BookmarkData, post_id: string) => {
  try {
    const BookmarksCollection = collection(firestore, 'Bookmarks');

    // Add the post data to the collection
    const bookmarksQuery = query(BookmarksCollection, where('post_id', '==', post_id));
    const bookmarksSnapshot = await getDocs(bookmarksQuery);

    if (!bookmarksSnapshot.empty) {
      // If the post_id is present, update the existing document
      const bookmarkDocRef = bookmarksSnapshot.docs[0].ref;
      await updateDoc(bookmarkDocRef, {
        bookmarkedBy: arrayUnion(bookmarkData),
        BookmarkedEmails: arrayUnion(bookmarkData.email),
      });
    } else {
      // If the post_id is not present, add a new document
      await addDoc(BookmarksCollection, {
        post_id,
        bookmarkedBy: [bookmarkData],
        BookmarkedEmails: [bookmarkData.email],
      });
    }
    // setDummyState((prev) => !prev);
    console.log('Bookmarked successfully!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

const handleUnbookmark = async (bookmarkData: BookmarkData, post_id: string) => {
  try {
    const BookmarksCollection = collection(firestore, 'Bookmarks');

    // Create a query to find the document to unbookmark
    const unbookmarkQuery = query(BookmarksCollection, where('post_id', '==', post_id));

    // Execute the query
    const querySnapshot = await getDocs(unbookmarkQuery);

    if (!querySnapshot.empty) {
      // Iterate through the documents in the result set
      for (const doc of querySnapshot.docs) {
        const data = doc.data();

        // Find the index of the BookmarkedEmails in the array
        const index = data.bookmarkedBy.findIndex((bookmarkedBy: BookmarkData) => bookmarkedBy.email=== bookmarkData.email)

        if (index !== -1) {
          // Remove the email from the BookmarkedEmails array
          data.bookmarkedBy.splice(index, 1);

          data.BookmarkedEmails = data.BookmarkedEmails.filter((email: string) => email !== bookmarkData.email);
          // Update the document in Firestore
          await updateDoc(doc.ref, { BookmarkedEmails: data.BookmarkedEmails });

          await updateDoc(doc.ref, { bookmarkedBy: data.bookmarkedBy });
          // Trigger a state change to refresh the UI
          // setDummyState((prev) => !prev);

          console.log(`Unbookmarked Successfully with post_id ${post_id} and author ${bookmarkData.email} removed successfully.`);

          return; // Exit the loop once the unbookmark is handled
        }
      }

      console.error(`Problem with post_id ${post_id} and author ${bookmarkData.email} not found.`);
    } else {
      console.error(`Problem with post_id ${post_id} not found.`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

const loadMorePosts = () => {
  setTimeout(() => {
    fetchPosts();
  }, 2000);
};

const useRedirectToProfile = () => {
  const navigate = useNavigate();

  return () => {
    navigate('/my-profile');
  };
};

const redirectToProfile = useRedirectToProfile();


  return (
    <Container>
    <Layout style={{ minHeight: '90vh' }}>
      <Sidebar />
      <Layout>
      <Profile>
          <CustomAvatar onClick={redirectToProfile} size={90} src={CurrentUser.profile_picture}  icon={<UserOutlined/>}/>
          </Profile>
        <PostInputContainer>
          <StyledInput style={{ height: '70px', marginBottom: '10px' }} placeholder={`What's Happening? ${CurrentUser.first_name}`} value={newPost} onChange={(e) => setNewPost(e.target.value)} />
          <Button style={{ float : 'right' , width : '70px', margin : 'auto' , marginTop : '15px' }} type= "primary" onClick={handlePost}>
            Post
          </Button>
        </PostInputContainer>
        <Content style={{ padding: '24px' }}>
        <InfiniteScroll
          dataLength={posts.length}
          next={loadMorePosts}
          hasMore={hasMore}
          loader=
          {
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          }
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>~THE END~</b>
            </p>
          }
        >
          {posts.map((post: Post) => (
            <Posts
              key={post.post_id}
              post={post}
              onComment = {handleComment}
              onLike = {handleLike}
              onDislike = {handleDislike}
              onBookmark = {handleBookmark}
              onUnbookmark = {handleUnbookmark}
            />
          ))}
      </InfiniteScroll>
        </Content>
        
      </Layout>
    </Layout>
    </Container>
  );
};

export default HOME;
