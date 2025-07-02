import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  useCallStateHooks,
  useStreamVideoClient,
} from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoCallUI = ({ call }) => {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  const handleLeaveCall = async () => {
    try {
      await call?.leave();
    } catch (error) {
      console.error('Error leaving call:', error);
    }
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
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client || !callId) return;

    const initializeCall = async () => {
      try {
        setIsLoading(true);
        
        // Create or get the call
        const videoCall = client.call('default', callId);
        
        // Join the call
        await videoCall.join({ create: true });
        
        setCall(videoCall);
      } catch (error) {
        console.error('Failed to initialize call:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCall();

    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [client, callId, navigate]);

  if (isLoading || !call) {
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
    <Call call={call}>
      <VideoCallUI call={call} />
    </Call>
  );
};

export default VideoCall;