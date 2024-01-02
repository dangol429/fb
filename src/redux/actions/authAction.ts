


// authActions.ts
import { getDocs, query, where, collection, addDoc, Firestore } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, firestore } from '../../firebase';  // Assuming firestore is imported from firebase
import { ThunkDispatch } from 'redux-thunk';
import { AppState } from '../reducers/rootReducer'; 
import {message } from 'antd';

 
// Action Types
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';
export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
export const LOGOUT_USER_SUCCESS = 'LOGOUT_USER_SUCCESS';
export const LOGIN_USER_FAILURE = 'LOGIN_USER_FAILURE';

// User data type
interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_picture: string;
}

interface Values {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface CreateUserSuccessAction {
  type: typeof CREATE_USER_SUCCESS;
}

export interface LoginUserSuccessAction {
  type: typeof LOGIN_USER_SUCCESS;
  payload: UserData;
}

export interface LogoutUserSuccessAction {
  type: typeof LOGOUT_USER_SUCCESS;
}

type AuthActionTypes = CreateUserSuccessAction | LoginUserSuccessAction | LogoutUserSuccessAction;

// Action Creators
const createUserSuccess = (): CreateUserSuccessAction => ({
  type: CREATE_USER_SUCCESS,
});

const loginUserSuccess = (user: UserData): LoginUserSuccessAction  => ({
  type: LOGIN_USER_SUCCESS,
  payload: user,
});

const logoutUserSuccess = (): LogoutUserSuccessAction  => ({
  type: LOGOUT_USER_SUCCESS,
});


export const createUser = (firestore: Firestore, values: Values, profilePictureUrl: string | null ) => async (dispatch: ThunkDispatch<AppState, void, AuthActionTypes>) =>{
  console.log(values)
  try {
    // Check if the email already exists in the 'users' collection
    const emailQuerySnapshot = await getDocs(
      query(collection(firestore, 'users'), where('email', '==', values.email))
    );

    if (!emailQuerySnapshot.empty) {
      message.error('Email already taken. Please choose another email.');
      return { success: false, message: 'Email already taken' };
    }
    else{
      await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
  
      // Access the user data from userCredential.user if needed
  
      // Add user data to Firestore
      await addDoc(collection(firestore, 'users'), {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        profile_picture: profilePictureUrl,
      });
      message.success("Successfully Signed Up!")
      dispatch(createUserSuccess());
      return { success: true, message: 'Signup successful' };
    }
  } catch (error: unknown) {
    console.log('error');
    return { success: false, message: 'Error' };
  }
}

export const loginUser = (email: string, password: string) => async (dispatch: ThunkDispatch<AppState, void, AuthActionTypes>) => {
  console.log(email + " " + password)
  try { 

    // Retrieve user data from the 'users' collection
    const emailQuerySnapshot = await getDocs(query(collection(firestore, 'users'), where('email', '==', email)));

    if (emailQuerySnapshot.size > 0) {
      try{
        await signInWithEmailAndPassword(auth, email, password);
        const userDoc = emailQuerySnapshot.docs[0];
        const userData = userDoc.data();

        const user: UserData = {
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        email: userData?.email || '',
        password: userData?.password || '',
        profile_picture: userData?.profile_picture,
        };

        // If successful, you can perform additional actions or redirect the user
        message.success('Login Successful. Welcome ' + user.first_name)
        console.log('Login successful!');
        await dispatch(loginUserSuccess(user));
        return { success: true, message: 'Successfully Signed In' };

      } 
      catch(error){
        message.error('Incorrect Password. Please try again.')
        return { success: false, message: 'Incorrect Password' };
      }
    }
    else { 
      console.log("no email query snapshot")
      message.error('No email found. Please SignUp first')
      return { success: false, message: 'Email not found.' };
    }
  } catch (error: unknown) {
    console.log("problem while loggin in ");
    return { success: false, message: 'Some error.' };
  }
}

export const logoutUser = () => async (dispatch: ThunkDispatch<AppState, void, AuthActionTypes>) => {
  try {
    // Sign out the user
    try{
      await signOut(auth);
      console.log("done signing out")
    }
    catch(error: unknown){
      console.log("some error is happening, change unknown to any")
    }
    console.log("It is really happening")
    // Additional actions after logout if needed
    console.log('Logout successful!');
    try{
      dispatch(logoutUserSuccess());
      console.log("dispatch is happening")
    }
    catch(error:unknown){
      console.log('dispatch is happening')
    }
  } catch (error: unknown) {
    console.log('error while logging out.');
  }
};

