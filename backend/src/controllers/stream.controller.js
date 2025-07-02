import { StreamChat } from 'stream-chat';

// Use the correct environment variable names
const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const generateStreamToken = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Generate Stream token for the user
    const token = serverClient.createToken(userId.toString());
    
    res.status(200).json({ 
      token,
      apiKey: process.env.STREAM_API_KEY,
      userId: userId.toString()
    });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createCall = async (req, res) => {
  try {
    const { callId, members } = req.body;
    const userId = req.user._id;

    // For video calls, we'll just return success
    // The actual call creation will be handled by the frontend Stream SDK
    res.status(200).json({ 
      success: true,
      callId,
      message: 'Call created successfully'
    });
  } catch (error) {
    console.error('Error creating call:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};