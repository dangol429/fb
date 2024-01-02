# Algo Bulls

NOTE: This was the first time I worked with so many new technologies. I did internships on MERN stack and had worked with laravel,php but this project was new to me and all the other technologies were overwhelming but I tried to complete as much as I can. I will also improve the website.

## Overview

This is a web application which works as a repilca of facebook. Still there are alot of things that can be improved. I still might need 2-3 days to work on it .  

the deployed site: [Algo Bulls](https://algo-bulls2-n9oi.vercel.app/)

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/your-repository.git`
2. Navigate to the project directory: `cd your-repository`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

## Features

- Create id and post your thoughts
- Work your way around likes and bookmarks
- Comment on your fav posts
- User authentication with Firebase Authentication.
- Creation of posts with content, author, and comments.
- Like and bookmark functionality with separate collections for MyLikes and MyBookmarks.
- State management using Redux, storing currentUser details for easy access.
- Pages for MyPosts, MyBookmarks, MyLikes, MyProfile, and Posts.
- Integration of ANT Design and Styled Components for UI enhancements.

## How It Works

Algo Bulls 2.0 is a social platform where users can sign up, log in, create posts, and interact with other users' content. The application relies on Firebase for user authentication and Firestore for data storage.

1. **User Authentication**: Users sign up, and their information is stored in the Firestore collection. Logging in is only possible if the user's email is present in the collection.

2. **Post Creation**: Users can create posts with various details such as content, author, and comments.

3. **Likes and Bookmarks**: The application includes functionalities for liking and bookmarking posts. This information is stored in separate collections (MyLikes and MyBookmarks).

4. **State Management with Redux**: The state management is handled by Redux, with the currentUser details stored in the state for easy access throughout the application.

5. **Pages and Components**: Different pages are designed for MyPosts, MyBookmarks, MyLikes, MyProfile, and Posts. Each page corresponds to a specific component.

6. **Technologies Used**: The application employs Reactjs, TypeScript (Ts and Tsx), Firebase, Redux, ANT Design, Styled Components, and Toastify for a seamless user experience.

## Technologies Used

- Reactjs
- TypeScript (Ts and Tsx)
- Firebase (Authentication and Firestore)
- Redux
- ANT Design
- Styled Components
- Toastify

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
