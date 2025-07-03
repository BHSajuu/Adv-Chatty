import { StreamChat } from 'stream-chat';
import jwt from 'jsonwebtoken';

// Initialize Stream Chat client
let streamClient = null;

const initializeStreamClient = () => {
  if (!streamClient && process.env.STREAM_API_KEY && process.env.STREAM_API_SECRET) {
    streamClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET
    );
  }
  return streamClient;
};

export const generateStreamToken = async (req, res) => {
  try {
    const client = initializeStreamClient();
    
    if (!client) {
      return res.status(500).json({ 
        message: 'Stream API not configured. Please add STREAM_API_KEY and STREAM_API_SECRET to environment variables.' 
      });
    }

    const userId = req.user._id.toString();
    const userName = req.user.fullName;
    const userEmail = req.user.email;
    const profilePic = req.user.profilePic;

    // Generate Stream token
    const token = client.createToken(userId);

    // Update or create user in Stream
    await client.upsertUser({
      id: userId,
      name: userName,
      email: userEmail,
      image: profilePic || '/avatar.png',
    });

    res.status(200).json({ 
      token,
      apiKey: process.env.STREAM_API_KEY,
      userId,
      userName,
      userEmail
    });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createCall = async (req, res) => {
  try {
    const client = initializeStreamClient();
    
    if (!client) {
      return res.status(500).json({ 
        message: 'Stream API not configured' 
      });
    }

    const { callId, members = [] } = req.body;
    const userId = req.user._id.toString();

    // Create call data
    const callData = {
      id: callId,
      type: 'default',
      created_by_id: userId,
      members: [
        { user_id: userId, role: 'admin' },
        ...members.map(memberId => ({ user_id: memberId, role: 'user' }))
      ],
      settings_override: {
        audio: { mic_default_on: true },
        video: { camera_default_on: true },
        screenshare: { enabled: true }
      }
    };

    res.status(200).json({ 
      success: true,
      callId,
      callData,
      message: 'Call created successfully'
    });
  } catch (error) {
    console.error('Error creating call:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id.toString();

    res.status(200).json({
      callId,
      userId,
      apiKey: process.env.STREAM_API_KEY,
      message: 'Call details retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting call details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};