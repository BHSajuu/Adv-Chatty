import { StreamChat } from 'stream-chat';

// Initialize Stream Chat client
let streamClient = null;

const initializeStreamClient = () => {
  if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
    console.error('Stream API credentials not found in environment variables');
    return null;
  }
  
  // Check for demo credentials
  if (process.env.STREAM_API_KEY === 'demo_api_key_replace_with_real' || 
      process.env.STREAM_API_SECRET === 'demo_secret_replace_with_real') {
    console.error('Demo Stream credentials detected, please replace with real credentials');
    return null;
  }
  
  if (!streamClient) {
    try {
      streamClient = StreamChat.getInstance(
        process.env.STREAM_API_KEY,
        process.env.STREAM_API_SECRET
      );
      console.log('Stream client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Stream client:', error);
      return null;
    }
  }
  return streamClient;
};

export const generateStreamToken = async (req, res) => {
  try {
    console.log('Generating Stream token for user:', req.user._id);
    console.log('Stream API Key:', process.env.STREAM_API_KEY ? 'Present' : 'Missing');
    console.log('Stream API Secret:', process.env.STREAM_API_SECRET ? 'Present' : 'Missing');

    // Check if Stream API credentials are configured
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error('Stream API credentials missing from environment');
      return res.status(503).json({ 
        message: 'Video calling service is not configured. Please add your Stream API credentials to the .env file.',
        error: 'STREAM_NOT_CONFIGURED',
        instructions: {
          step1: 'Go to https://getstream.io and create a free account',
          step2: 'Create a new app in the Stream dashboard',
          step3: 'Copy your API Key and Secret',
          step4: 'Add STREAM_API_KEY and STREAM_API_SECRET to your .env file',
          step5: 'Restart the backend server'
        }
      });
    }

    const client = initializeStreamClient();
    
    if (!client) {
      console.error('Failed to initialize Stream client');
      return res.status(503).json({ 
        message: 'Video calling service is temporarily unavailable.',
        error: 'STREAM_CLIENT_ERROR'
      });
    }

    const userId = req.user._id.toString();
    const userName = req.user.fullName;
    const userEmail = req.user.email;
    const profilePic = req.user.profilePic;

    try {
      console.log('Creating token for user:', userId);
      
      // Generate Stream token
      const token = client.createToken(userId);
      console.log('Token generated successfully');

      // Update or create user in Stream
      await client.upsertUser({
        id: userId,
        name: userName,
        email: userEmail,
        image: profilePic || '/avatar.png',
      });
      console.log('User upserted in Stream successfully');

      res.status(200).json({ 
        token,
        apiKey: process.env.STREAM_API_KEY,
        userId,
        userName,
        userEmail
      });
    } catch (streamError) {
      console.error('Stream API error:', streamError);
      
      // Check if it's an authentication error
      if (streamError.message && streamError.message.includes('authentication')) {
        return res.status(503).json({ 
          message: 'Invalid Stream API credentials. Please check your STREAM_API_KEY and STREAM_API_SECRET.',
          error: 'STREAM_AUTH_ERROR'
        });
      }
      
      res.status(503).json({ 
        message: 'Failed to generate video call token: ' + streamError.message,
        error: 'STREAM_TOKEN_ERROR'
      });
    }
  } catch (error) {
    console.error('Error in generateStreamToken:', error);
    res.status(500).json({ 
      message: 'Internal Server Error: ' + error.message,
      error: 'INTERNAL_ERROR'
    });
  }
};

export const createCall = async (req, res) => {
  try {
    console.log('Creating call for user:', req.user._id);
    
    // Check if Stream API credentials are configured
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error('Stream API credentials missing for call creation');
      return res.status(503).json({ 
        message: 'Video calling service is not configured.',
        error: 'STREAM_NOT_CONFIGURED'
      });
    }

    const client = initializeStreamClient();
    
    if (!client) {
      console.error('Stream client not available for call creation');
      return res.status(503).json({ 
        message: 'Video calling service is temporarily unavailable.',
        error: 'STREAM_CLIENT_ERROR'
      });
    }

    const { callId, members = [] } = req.body;
    const userId = req.user._id.toString();

    if (!callId) {
      return res.status(400).json({
        message: 'Call ID is required',
        error: 'MISSING_CALL_ID'
      });
    }

    try {
      console.log('Creating call with ID:', callId);
      
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

      console.log('Call created successfully:', callId);
      
      res.status(200).json({ 
        success: true,
        callId,
        callData,
        message: 'Call created successfully'
      });
    } catch (streamError) {
      console.error('Stream call creation error:', streamError);
      res.status(503).json({ 
        message: 'Failed to create video call: ' + streamError.message,
        error: 'STREAM_CALL_ERROR'
      });
    }
  } catch (error) {
    console.error('Error in createCall:', error);
    res.status(500).json({ 
      message: 'Internal Server Error: ' + error.message,
      error: 'INTERNAL_ERROR'
    });
  }
};

export const getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id.toString();

    console.log('Getting call details for:', callId);

    if (!callId) {
      return res.status(400).json({
        message: 'Call ID is required',
        error: 'MISSING_CALL_ID'
      });
    }

    // Check if Stream API credentials are configured
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      return res.status(503).json({ 
        message: 'Video calling service is not configured.',
        error: 'STREAM_NOT_CONFIGURED'
      });
    }

    res.status(200).json({
      callId,
      userId,
      apiKey: process.env.STREAM_API_KEY,
      message: 'Call details retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting call details:', error);
    res.status(500).json({ 
      message: 'Internal Server Error: ' + error.message,
      error: 'INTERNAL_ERROR'
    });
  }
};