// src/components/createPost.ts
import {collection, addDoc} from 'firebase/firestore';
import {firestore} from '../firebase'
import { Timestamp } from 'firebase/firestore';


interface Author {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}


interface Post {
  post_id: string;
  email: string;
  content: string;
  author: Author;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  comments: string[]; // or Comment[] if you have a Comment interface
}

const createPost = async (postData: Post) => {
  try {
    const postsCollection = collection(firestore, 'posts'); // Replace 'posts' with your actual collection name

    // Add the post data to the collection
    await addDoc(postsCollection, {
      ...postData
    });

    console.log('Post created successfully!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

export default createPost;
