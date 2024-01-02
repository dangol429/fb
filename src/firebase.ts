// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqg8rXUatnSmnY6wiQ35G5Lbig-WGuKs4",
  authDomain: "facebook-db-1bb3e.firebaseapp.com",
  projectId: "facebook-db-1bb3e",
  storageBucket: "facebook-db-1bb3e.appspot.com",
  messagingSenderId: "316457030264",
  appId: "1:316457030264:web:eb020daa396e28cb26938d",
  measurementId: "G-RD717BNK93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export {auth, firestore, storage}