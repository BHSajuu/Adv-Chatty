import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStreamStore } from '../store/useStreamStore';

const VideoCallProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const { authUser } = useAuthStore();
  const { streamToken, apiKey, userId, getStreamToken } = useStreamStore();

  useEffect(() => {
    if (!authUser) return;

    const initializeVideoClient = async () => {
      try {
        // Get stream token if not available
        let token = streamToken;
        let key = apiKey;
        let streamUserId = userId;

        if (!token || !key || !streamUserId) {
          const streamData = await getStreamToken();
          token = streamData.token;
          key = streamData.apiKey;
          streamUserId = streamData.userId;
        }

        if (!token || !key || !streamUserId) return;

        const client = new StreamVideoClient({
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
        videoClient.disconnectUser();
        setVideoClient(null);
      }
    };
  }, [authUser, streamToken, apiKey, userId, getStreamToken]);

  if (!videoClient) return children;

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default VideoCallProvider;