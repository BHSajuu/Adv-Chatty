import { StreamVideo } from '@stream-io/video-react-sdk';
import { useAuthStore } from '../store/useAuthStore';

const VideoCallProvider = ({ children }) => {
  const { authUser } = useAuthStore();

  // For now, render children without Stream Video client
  // This prevents the 500 errors while keeping the app functional
  // Video calling can be implemented later with proper Stream API setup
  
  return (
    <StreamVideo client={null}>
      {children}
    </StreamVideo>
  );
};

export default VideoCallProvider;