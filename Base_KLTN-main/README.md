# Dating App - Online Dating Website with AI Friend Recommendation and Fake Account Detection

A full-stack online dating application built with the MERN stack (MongoDB, Express, React, Node.js) featuring real-time chat, video calls, and AI-powered recommendations.

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Real-time Chat**: Socket.IO
- **Video Calls**: WebRTC with Socket.IO signaling

## Features

- User registration and authentication with JWT
- Profile management with avatar upload
- AI-powered friend recommendations based on preferences
- Like/Pass matching system
- Mutual match detection
- Real-time messaging with Socket.IO
- Video calls using WebRTC
- Fake account detection scoring

## Project Structure

```
Base_KLTN/
├── backend/
│   └── src/
│       ├── config/          # Configuration files
│       ├── controllers/     # Route controllers (MVC pattern)
│       ├── middleware/      # Custom middleware (auth, error handling)
│       ├── models/          # MongoDB models (User, Match, Message)
│       ├── routes/          # API routes
│       ├── socket/          # Socket.IO configuration
│       └── index.js         # Server entry point
│
├── frontend/
│   └── src/
│       ├── components/     # Reusable React components
│       ├── context/        # React Context (Auth, Socket)
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       ├── services/       # API service functions
│       ├── store/          # Zustand state management
│       └── App.jsx         # Main App component
│
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd Base_KLTN
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB: mongodb://localhost:27017/dating-app
# For MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/dating-app
MONGODB_URI=mongodb://localhost:27017/dating-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

Start the backend server:

```bash
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

Open a new terminal and run:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional - defaults work for local development):

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5173
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/logout` | Logout user |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get users (protected) |
| GET | `/api/users/:id` | Get user by ID (protected) |
| GET | `/api/users/recommendations` | Get recommended users (protected) |
| GET | `/api/users/matches` | Get user's matches (protected) |
| PUT | `/api/users/profile` | Update profile (protected, with avatar upload) |

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/match/like` | Like a user (protected) |
| POST | `/api/match/pass` | Pass a user (protected) |
| GET | `/api/match/likes` | Get liked users (protected) |
| GET | `/api/match/mutual` | Get mutual matches (protected) |
| DELETE | `/api/match/:matchId` | Unmatch (protected) |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get all conversations (protected) |
| GET | `/api/messages/:matchId` | Get messages for a match (protected) |
| POST | `/api/messages/:matchId` | Send a message (protected) |
| PUT | `/api/messages/:matchId/read` | Mark messages as read (protected) |

## Socket.IO Events

### Client to Server

- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `message_read` - Mark messages as read
- `call_user` - Start a video call
- `accept_call` - Accept a video call
- `reject_call` - Reject a video call
- `end_call` - End a video call

### Server to Client

- `receive_message` - Receive a message
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `messages_read` - Messages have been read
- `incoming_call` - Incoming video call
- `call_accepted` - Call was accepted
- `call_rejected` - Call was rejected
- `call_ended` - Call ended

## Running the Application

1. Make sure MongoDB is running
2. Start the backend: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173 in your browser

## Development

### Backend Development

```bash
cd backend
npm run dev
```

Uses nodemon for auto-reload on file changes.

### Frontend Development

```bash
cd frontend
npm run dev
```

Uses Vite's hot module replacement.

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## Key Features Explained

### AI Friend Recommendation

The recommendation system uses a scoring algorithm that considers:
- User preferences (age, gender)
- Fake account score (lower is better)
- Account creation date

Users with lower fake scores appear first in recommendations.

### Fake Account Detection

Each user has a `fakeScore` field that can be used for fake account detection:
- Lower score = more trustworthy
- This can be integrated with ML models for real fake detection
- Currently uses a basic scoring system (can be enhanced)

### Real-time Chat

- Uses Socket.IO for real-time messaging
- Messages are stored in MongoDB
- Supports typing indicators
- Read receipts

### Video Calls

- WebRTC for peer-to-peer video
- Socket.IO as signaling server
- Uses STUN servers for NAT traversal
- Supports audio and video

## License

ISC

## Authors

- Your Name
