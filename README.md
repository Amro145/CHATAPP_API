# Video Call Application - Backend API

A comprehensive Node.js backend server for a video call and social networking application. Built with Express.js, MongoDB, and Stream Chat, this backend provides robust authentication, user management, friend system, and real-time chat/video call capabilities.

## 🎯 Purpose

This backend server powers a full-featured video calling and social networking application. It handles user authentication, profile management, friend connections, and integrates with Stream Chat for real-time messaging and video calling functionality. The system is designed to be scalable, secure, and easy to integrate with modern frontend applications.

## ✨ Features

### Authentication & User Management
- **User Registration**: Sign up with email, password, and name
- **Email Verification**: Secure email verification with time-sensitive tokens
- **Login/Logout**: JWT-based authentication with secure HTTP-only cookies
- **Password Reset**: Forgot password and reset password functionality
- **User Onboarding**: Complete user profiles with bio, location, gender, and profile pictures
- **Profile Management**: Update user information and manage account settings
- **Admin Support**: Admin role management for elevated permissions

### Friend System
- **Friend Requests**: Send and receive friend requests with custom messages
- **Accept/Decline**: Accept or decline incoming friend requests
- **Friend Management**: View friends list and manage connections
- **Friend Suggestions**: Get personalized friend suggestions based on mutual connections
- **Outgoing Requests**: Track sent friend requests
- **Request History**: View all friend request activity

### Stream Chat Integration
- **Real-time Chat**: Powered by Stream Chat API for instant messaging
- **Video Calling**: Built-in video call support through Stream
- **User Synchronization**: Automatic user upsert to Stream Chat on registration
- **Token Generation**: Secure Stream token generation for authenticated users

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for passwords
- **Protected Routes**: Middleware-based route protection
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Secure Cookies**: HTTP-only cookies for token storage

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: Elegant MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing and encryption
- **Stream Chat**: Real-time chat and video calling SDK
- **Cloudinary**: Cloud-based image and video storage
- **Multer**: File upload middleware
- **Joi**: Schema validation for request data
- **Morgan**: HTTP request logger
- **Cookie Parser**: Parse Cookie header and populate req.cookies
- **dotenv**: Environment variable management

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** instance (local or MongoDB Atlas)
- **Stream Chat** account with API key and secret
- **Cloudinary** account for image storage (optional)
- **Mailtrap** account for email testing (optional)

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ANYONE/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL=<your-mongodb-connection-string>
   
   # Server
   PORT=3000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   
   # Authentication
   JWT_SECRET=<your-jwt-secret>
   API_KEY=<your-api-key>
   
   # Stream Chat
   STREAM_API_KEY=<your-stream-api-key>
   STREAM_SECRET=<your-stream-secret>
   
   # Email (Optional)
   MAILTRAP_TOKEN=<your-mailtrap-token>
   
   # Cloudinary (Optional)
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
   CLOUDINARY_API_KEY=<your-cloudinary-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-secret>
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. The server will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication Routes (`/`)

| Method | Endpoint                     | Auth Required | Description                          |
|--------|------------------------------|---------------|--------------------------------------|
| POST   | `/signup`                    | No            | Register a new user                  |
| POST   | `/verify-email`              | No            | Verify email with verification token |
| POST   | `/signin`                    | No            | Login user and get auth token        |
| POST   | `/logout`                    | No            | Logout user and clear cookie         |
| POST   | `/forgot-password`           | No            | Request password reset email         |
| POST   | `/reset-password/:resetCode` | No            | Reset password with reset token      |
| GET    | `/check-auth`                | Yes           | Verify current authentication status |
| POST   | `/onboarding`                | Yes           | Complete user onboarding/profile     |
| GET    | `/getall`                    | No            | Get all users (admin)                |
| DELETE | `/delete/:userId`            | No            | Delete user by ID (admin)            |

### User Routes (`/user`)

| Method | Endpoint                          | Auth Required | Description                        |
|--------|-----------------------------------|---------------|------------------------------------|
| GET    | `/friends/:id`                    | Yes           | Get friends list for a user        |
| GET    | `/suggested`                      | Yes           | Get suggested friends              |
| GET    | `/profile/:id`                    | Yes           | Get user profile by ID             |
| POST   | `/send-friend-request/:id`        | Yes           | Send friend request to user        |
| GET    | `/get-friends-request`            | Yes           | Get incoming friend requests       |
| POST   | `/accept-friend-request/:id`      | Yes           | Accept a friend request            |
| GET    | `/get-outgoing-friend-requests`   | Yes           | Get sent friend requests           |
| GET    | `/get-all-friend-requests`        | Yes           | Get all friend request activity    |

### Chat Routes (`/chat`)

| Method | Endpoint  | Auth Required | Description                   |
|--------|-----------|---------------|-------------------------------|
| GET    | `/token`  | Yes           | Get Stream Chat auth token    |

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── user.controller.js      # User and friend management
│   │   └── chat.controller.js      # Stream Chat integration
│   ├── models/
│   │   ├── auth.model.js           # User schema and model
│   │   └── friendRequest.model.js  # Friend request schema
│   └── routes/
│       ├── auth.route.js           # Authentication routes
│       ├── user.route.js           # User routes
│       └── chat.route.js           # Chat routes
├── lib/
│   ├── connectToDb.js              # MongoDB connection
│   ├── generateTokenAndSetCookie.js # JWT token generation
│   └── stream.js                   # Stream Chat utilities
├── middleware/
│   └── verifyToken.js              # JWT verification middleware
├── mailtrap/                        # Email templates (optional)
├── .env                             # Environment variables
├── .gitignore                       # Git ignore rules
├── app.js                           # Main application entry
├── package.json                     # Dependencies and scripts
├── tests.http                       # API testing file
└── README.md                        # This file
```

## 🔧 Usage Examples

### Sign Up
```bash
POST /signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Complete Onboarding
```bash
POST /onboarding
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "bio": "Software developer",
  "location": "New York",
  "gender": "male",
  "profilePic": "https://example.com/pic.jpg"
}
```

### Send Friend Request
```bash
POST /user/send-friend-request/64a1b2c3d4e5f6789
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "message": "Hey! Let's connect!"
}
```

### Get Stream Chat Token
```bash
GET /chat/token
Authorization: Bearer <jwt-token>
```

## 🔐 Authentication Flow

1. User signs up with email, password, and name
2. Verification email is sent (optional, can be bypassed)
3. User verifies email or is auto-verified
4. User logs in with credentials
5. Server generates JWT token and sets HTTP-only cookie
6. User completes onboarding with additional profile info
7. Stream Chat user is created/updated
8. Protected routes verify JWT token from cookie

## 🤝 Friend System Flow

1. User searches for friends or views suggestions
2. User sends friend request with optional message
3. Receiver gets notification of friend request
4. Receiver accepts or declines request
5. On acceptance, both users are added to each other's friends list
6. Friends can now chat and call through Stream Chat

## 🎥 Stream Chat Integration

The backend automatically integrates with Stream Chat when users:
- **Sign up**: User is created in Stream Chat
- **Complete onboarding**: User profile is updated in Stream Chat
- **Login**: User receives Stream Chat token for authentication

This enables the frontend to connect to Stream Chat for:
- Real-time messaging
- Video and audio calls
- Group chats
- Message history
- Online/offline status

## 🧪 Testing

Use the included `tests.http` file with REST Client or similar tools to test all API endpoints.

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Developed by Amro Altayeb**

---

For frontend integration, ensure your client application can:
- Handle JWT tokens in cookies
- Connect to Stream Chat using provided tokens
- Make authenticated requests with credentials: 'include'
- Handle CORS from allowed origin (http://localhost:5173)
