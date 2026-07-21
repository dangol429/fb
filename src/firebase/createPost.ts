// src/firebase/createPost.ts
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Post } from '../types';

const createPost = async (postData: Post) => {
  try {
    const postsCollection = collection(firestore, 'posts');
    await addDoc(postsCollection, { ...postData });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating post:', error.message);
    }
  }
};

export default createPost;
