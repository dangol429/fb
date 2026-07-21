# Socially — A Social Feed App

A full-stack social media web app (a Facebook-style feed) built with **React, TypeScript, Redux, and Firebase**. Users can sign up, share posts with photos, and like, save, and comment on content — all backed by real-time Firebase Authentication and Cloud Firestore.

> **Live demo:** [algo-bulls2-n9oi.vercel.app](https://algo-bulls2-n9oi.vercel.app/)

---

## ✨ Features

- **Authentication** — Email/password sign up and login via Firebase Auth, with session persistence.
- **Post feed** — Create text + image posts; browse an infinite-scroll feed ordered by newest.
- **Engagement** — Like, save (bookmark), and comment on posts, with live counts.
- **Comments** — Add, edit, and delete your own comments inline.
- **Dedicated views** — Separate pages for *My Likes*, *My Bookmarks*, *My Posts*, and a *Profile* page.
- **Profile management** — Update your name and profile photo; changes propagate across all your posts and comments.
- **Responsive UI** — A persistent sidebar on desktop that collapses into a drawer on mobile.
- **Polished UX** — Themed Ant Design components, loading skeletons, empty states, and consistent toasts.

---

## 🛠 Tech Stack

| Area | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| State management | Redux + Redux Thunk (persisted to `localStorage`) |
| Backend | Firebase Authentication + Cloud Firestore + Firebase Storage |
| UI | Ant Design 5 (themed via `ConfigProvider`) + styled-components |
| Routing | React Router 6 (with guarded private/public routes) |
| Tooling | Create React App, ESLint, Jest, Cypress |

---

## 🏗 Architecture

```
src/
├── components/
│   ├── AppLayout.tsx        # Responsive shell: top bar + sider/drawer + user menu
│   ├── posts.tsx            # Post card: likes, bookmarks, comments toggle
│   ├── comments.tsx         # Comment list + composer (edit/delete)
│   ├── Routing/             # PrivateRoute / UnprivateRoute guards
│   └── skeleton/            # Loading skeletons
├── pages/                   # Home feed, Login, Signup, Likes, Bookmarks, MyPosts, MyProfile
├── redux/
│   ├── actions/authAction.ts
│   ├── reducers/            # authReducer, rootReducer
│   └── store.ts
├── firebase.ts              # Firebase initialization
├── theme.ts                 # Centralized design tokens
├── types.ts                 # Shared domain & state types
└── hooks.ts                 # Typed Redux hooks
```

Key design decisions:

- **Centralized types** (`types.ts`) and **typed hooks** (`hooks.ts`) remove the interface duplication that had spread across every file.
- **A single design system** — brand tokens live in `theme.ts` and are applied globally through Ant Design's `ConfigProvider`.
- **Route guards** — `PrivateRoute` and `UnprivateRoute` keep authenticated and public areas cleanly separated.
- **Redux-driven profile updates** — an `updateUser` action keeps the UI in sync without full-page reloads.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- A Firebase project (Authentication, Firestore, and Storage enabled)

### Setup

```bash
# 1. Clone
git clone <your-repo-url>
cd <repo>

# 2. Install dependencies
npm install

# 3. Add your Firebase config (see below)

# 4. Run
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Firebase configuration

Firebase settings live in `src/firebase.ts`. For production, move these into environment variables (`.env`):

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

Make sure your Firestore security rules restrict reads/writes to authenticated users.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Run the dev server |
| `npm run build` | Production build |
| `npm test` | Run the test suite |
| `npx eslint src --ext .ts,.tsx` | Lint the source |

---

## 🧭 Roadmap

- Migrate Firebase config to environment variables and tighten Firestore rules
- Real-time listeners (`onSnapshot`) so likes/comments update without refetches
- Full CRUD for posts (edit content, not just delete)
- Unit and e2e test coverage across core flows

---

## 📄 License

This project is for portfolio and educational purposes.
