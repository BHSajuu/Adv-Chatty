import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStreamStore } from '../store/useStreamStore';

const VideoCallProvider = ({ children }) => {
  const { authUser } = useAuthStore();
  const { streamToken, apiKey, userId, getStreamToken } = useStreamStore();
  const [videoClient, setVideoClient] = useState(null);

  useEffect(() => {
    if (authUser && !streamToken) {
      getStreamToken();
    }
  }, [authUser, streamToken, getStreamToken]);

  useEffect(() => {
    if (streamToken && apiKey && userId && authUser) {
      const client = new StreamVideoClient({
        apiKey,
        user: {
          id: userId,
          name: authUser.fullName,
          image: authUser.profilePic || '/avatar.png',
        },
        token: streamToken,
      });

      setVideoClient(client);

      return () => {
        client.disconnectUser();
        setVideoClient(null);
      };
    }
  }, [streamToken, apiKey, userId, authUser]);

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default VideoCallProvider;