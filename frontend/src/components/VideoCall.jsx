import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamStore } from '../store/useStreamStore';
import { useAuthStore } from '../store/useAuthStore';

const VideoCallUI = () => {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  const handleLeaveCall = () => {
    navigate('/');
  };

  if (callingState !== 'joined') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">
            {callingState === 'joining' ? 'Joining call...' : 'Connecting...'}
          </p>
          <button 
            onClick={handleLeaveCall}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 relative">
        <SpeakerLayout participantsBarPosition="bottom" />
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {participantCount} participant{participantCount !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="p-4 bg-gray-800">
        <CallControls onLeave={handleLeaveCall} />
      </div>
      
      <div className="h-24 bg-gray-700">
        <CallParticipantsList onClose={() => {}} />
      </div>
    </div>
  );
};

const VideoCall = ({ callId }) => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { streamToken, apiKey, userId, getStreamToken } = useStreamStore();

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    // Ensure we have stream credentials
    if (!streamToken || !apiKey || !userId) {
      getStreamToken();
    }
  }, [authUser, streamToken, apiKey, userId, getStreamToken, navigate]);

  if (!streamToken || !apiKey || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading video call...</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Call id={callId}>
      <VideoCallUI />
    </Call>
  );
};

export default VideoCall;