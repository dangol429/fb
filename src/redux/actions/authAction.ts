


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
export const UPDATE_USER = 'UPDATE_USER';

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

export interface UpdateUserAction {
  type: typeof UPDATE_USER;
  payload: Partial<UserData>;
}

type AuthActionTypes =
  | CreateUserSuccessAction
  | LoginUserSuccessAction
  | LogoutUserSuccessAction
  | UpdateUserAction;

// Action Creators
const createUserSuccess = (): CreateUserSuccessAction => ({
  type: CREATE_USER_SUCCESS,
});

// Merge partial fields (name / profile picture) into the logged-in user.
export const updateUser = (payload: Partial<UserData>): UpdateUserAction => ({
  type: UPDATE_USER,
  payload,
});

const loginUserSuccess = (user: UserData): LoginUserSuccessAction  => ({
  type: LOGIN_USER_SUCCESS,
  payload: user,
});

const logoutUserSuccess = (): LogoutUserSuccessAction  => ({
  type: LOGOUT_USER_SUCCESS,
});


export const createUser = (firestore: Firestore, values: Values, profilePictureUrl: string | null ) => async (dispatch: ThunkDispatch<AppState, void, AuthActionTypes>) =>{
  try {
    // Check if the email already exists in the 'users' collection
    const emailQuerySnapshot = await getDocs(
      query(collection(firestore, 'users'), where('email', '==', values.email))
    );

    if (!emailQuerySnapshot.empty) {
      message.error('Email already taken. Please choose another email.');
      return { success: false, message: 'Email already taken' };
    }

    await createUserWithEmailAndPassword(auth, values.email, values.password);

    // Add user data to Firestore
    await addDoc(collection(firestore, 'users'), {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      profile_picture: profilePictureUrl,
    });

    message.success('Account created successfully!');
    dispatch(createUserSuccess());
    return { success: true, message: 'Signup successful' };
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    message.error('Could not create your account. Please try again.');
    return { success: false, message: 'Error' };
  }
}

export const loginUser = (email: string, password: string) => async (dispatch: ThunkDispatch<AppState, void, AuthActionTypes>) => {
  try {
    // Retrieve user data from the 'users' collection
    const emailQuerySnapshot = await getDocs(query(collection(firestore, 'users'), where('email', '==', email)));

    if (emailQuerySnapshot.empty) {
      message.error('No account found for this email. Please sign up first.');
      return { success: false, message: 'Email not found.' };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userData = emailQuerySnapshot.docs[0].data();

      const user: UserData = {
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        email: userData?.email || '',
        password: userData?.password || '',
        profile_picture: userData?.profile_picture,
      };

      message.success(`Welcome back, ${user.first_name}!`);
      dispatch(loginUserSuccess(user));
      return { success: true, message: 'Successfully Signed In' };
    } catch {
      message.error('Incorrect password. Please try again.');
      return { success: false, message: 'Incorrect Password' };
    }
  } catch (error: unknown) {
    console.error('Error logging in:', error);
    message.error('Something went wrong. Please try again.');
    return { success: false, message: 'Some error.' };
  }
}

export const logoutUser = () => async (dispatch: ThunkDispatch<AppState, void, AuthActionTypes>) => {
  try {
    await signOut(auth);
    dispatch(logoutUserSuccess());
  } catch (error: unknown) {
    console.error('Error logging out:', error);
    // Still clear local auth state even if the remote sign-out fails.
    dispatch(logoutUserSuccess());
  }
};

