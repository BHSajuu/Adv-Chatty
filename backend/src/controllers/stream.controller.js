import { StreamChat } from 'stream-chat';
import jwt from 'jsonwebtoken';

const serverClient = StreamChat.getInstance(
  process.env.STEAM_API_KEY,
  process.env.STEAM_API_SECRET
);

export const generateStreamToken = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Generate Stream token for the user
    const token = serverClient.createToken(userId.toString());
    
    res.status(200).json({ 
      token,
      apiKey: process.env.STEAM_API_KEY,
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
    const { userId } = req.user;

    // Create a call on Stream
    const call = serverClient.video.call('default', callId);
    
    await call.getOrCreate({
      data: {
        created_by_id: userId.toString(),
        members: members.map(memberId => ({ user_id: memberId.toString() })),
      },
    });

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