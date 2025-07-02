import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStreamStore } from '../store/useStreamStore';

const VideoCallProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const { authUser } = useAuthStore();
  const { streamToken, apiKey, userId, getStreamToken } = useStreamStore();

  useEffect(() => {
    if (!authUser) {
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
      setVideoClient(null);
      return;
    }

    const initializeVideoClient = async () => {
      try {
        // Get stream token if not available
        let token = streamToken;
        let key = apiKey;
        let streamUserId = userId;

        if (!token || !key || !streamUserId) {
          const streamData = await getStreamToken();
          if (!streamData) return;
          
          token = streamData.token;
          key = streamData.apiKey;
          streamUserId = streamData.userId;
        }

        if (!token || !key || !streamUserId) return;

        // Check if client already exists and disconnect it
        if (videoClient) {
          await videoClient.disconnectUser();
          setVideoClient(null);
        }

        // Use getOrCreateInstance to avoid duplicate client warnings
        const client = StreamVideoClient.getOrCreateInstance({
          apiKey: key,
          user: {
            id: streamUserId,
            name: authUser.fullName,
            image: authUser.profilePic || '/avatar.png',
          },
          token,
        });

        setVideoClient(client);
      } catch (error) {
        console.error('Failed to initialize video client:', error);
      }
    };

    initializeVideoClient();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
    };
  }, [authUser, streamToken, apiKey, userId, getStreamToken]);

  // Always render children, video client is optional
  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default VideoCallProvider;