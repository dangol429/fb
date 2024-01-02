// reducers/rootReducer.ts

import { combineReducers } from 'redux';
import authReducer from './authReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

export type AppState = ReturnType<typeof rootReducer>;
export default rootReducer;
