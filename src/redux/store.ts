import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer, { AppState } from './reducers/rootReducer';
import thunk from 'redux-thunk';

// Define a custom interface for the window object
interface ExtendedWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
}

// Declare window with the custom interface
declare const window: ExtendedWindow;

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer, 
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
export type { AppState };
