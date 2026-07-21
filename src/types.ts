// Centralized domain & state types shared across the app.
// Previously these interfaces were duplicated (often inconsistently) in almost
// every component and page.
import { Timestamp } from 'firebase/firestore';

export interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_picture: string;
}

export interface Author {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}

export interface CommentAuthor {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  profile_picture: string;
}

export interface Comment {
  author: CommentAuthor;
  content: string;
  comment_id: string;
}

export interface Post {
  post_id: string;
  email: string;
  content: string;
  photo?: string;
  author: Author;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  comments: Comment[];
}

export interface LikeData {
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
}

export interface BookmarkData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  profile_picture: string | null;
}

// --- Redux state ---------------------------------------------------------
// Within the authenticated area of the app the user is always present (routes
// are guarded), so we model `user` as non-null to avoid null checks everywhere.
export interface AuthState {
  user: UserData;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
}
