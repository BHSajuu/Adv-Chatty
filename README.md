# Chatty

Chatty is a MERN (MongoDB, Express, React, Node.js) based real-time chat application with video calling capabilities. It allows users to communicate seamlessly with features like user authentication, real-time messaging, voice messages, and video calls.

## Features

- User authentication (Sign up, Login, Logout)
- Real-time messaging using WebSockets
- Voice message recording and playback
- Video calling using Stream SDK
- Message editing and deletion
- Chat clearing functionality
- Responsive design for all devices
- User profile management
- Theme customization with up to 32 different color options available in settings
- Password reset functionality

## Tech Stack

- **Frontend**: React, JavaScript, Tailwind CSS, DaisyUI, Zustand, react-media-recorder, Stream Video SDK
- **Backend**: Node.js, Express.js, Stream Chat SDK
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Video Calling**: Stream Video SDK
- **File Storage**: Cloudinary

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for file uploads)
- Stream account (for video calling)
- Gmail account (for password reset emails)

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGODB_URL=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for password reset)
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password

# Client URL
CLIENT_URL=http://localhost:5173

# Stream Video API (for video calling)
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Port
PORT=5001
```

### Stream Setup

1. Go to [getstream.io](https://getstream.io) and create an account
2. Create a new app in the Stream dashboard
3. Get your API Key and Secret from the dashboard
4. Add them to your `.env` file as `STREAM_API_KEY` and `STREAM_API_SECRET`

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Set up your environment variables in `backend/.env`
5. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
6. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Video Calling Features

- **One-on-one video calls**: Start video calls with any user
- **Call notifications**: Receive incoming call notifications
- **Call controls**: Mute/unmute, camera on/off, screen sharing
- **Responsive UI**: Works on desktop and mobile devices
- **Call links**: Share call links via chat messages

## Usage

1. Register a new account or login with existing credentials
2. Browse online users in the sidebar
3. Click on a user to start chatting
4. Send text messages, images, or voice recordings
5. Click the video call button to start a video call
6. Edit or delete your messages using the hover controls
7. Clear entire chat history if needed
8. Customize your theme in the settings page

## Future Improvements

Here are some features planned for future implementation:

- Group video calls with multiple participants
- Screen sharing during calls
- Call recording functionality
- Integration with AI for smart suggestions and language translation
- Payment gateway for premium features
- Message reactions and emoji support
- File sharing capabilities
- Push notifications for mobile apps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.