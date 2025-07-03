import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStreamStore } from '../store/useStreamStore';
import { useAuthStore } from '../store/useAuthStore';

const VideoCallUI = () => {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  if (callingState !== 'joined') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {callingState === 'joining' ? 'Joining call...' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white">
          <h2 className="text-lg font-semibold">Video Call</h2>
          <p className="text-sm text-gray-300">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Leave Call
        </button>
      </div>

      {/* Video Layout */}
      <div className="flex-1 relative">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>

      {/* Call Controls */}
      <div className="bg-gray-800 p-4">
        <CallControls onLeave={() => navigate('/')} />
      </div>

      {/* Participants List (optional, can be toggled) */}
      <div className="hidden lg:block absolute right-4 top-20 w-64 bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="text-white font-semibold mb-2">Participants</h3>
        <CallParticipantsList onClose={() => {}} />
      </div>
    </div>
  );
};

const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { streamToken, apiKey, getStreamToken } = useStreamStore();
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    const initializeCall = async () => {
      try {
        setIsLoading(true);
        
        // Get Stream token if not available
        if (!streamToken || !apiKey) {
          await getStreamToken();
        }

        // Import StreamVideoClient dynamically to avoid SSR issues
        const { StreamVideoClient } = await import('@stream-io/video-react-sdk');
        
        if (!streamToken || !apiKey) {
          throw new Error('Stream credentials not available');
        }

        const client = new StreamVideoClient({
          apiKey,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic || '/avatar.png',
          },
          token: streamToken,
        });

        const callInstance = client.call('default', callId);
        
        // Join the call
        await callInstance.join({ create: true });
        
        setCall(callInstance);
      } catch (err) {
        console.error('Error initializing call:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCall();

    return () => {
      if (call) {
        call.leave();
      }
    };
  }, [callId, authUser, navigate, streamToken, apiKey, getStreamToken]);

  if (!authUser) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Setting up video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg text-white">
            <h3 className="text-lg mb-2">To enable video calling:</h3>
            <ol className="text-left space-y-2 text-sm">
              <li>1. Sign up for a Stream account at getstream.io</li>
              <li>2. Get your API key and secret from the dashboard</li>
              <li>3. Add STREAM_API_KEY and STREAM_API_SECRET to your .env file</li>
              <li>4. Restart the application</li>
            </ol>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-white text-lg">Call not found</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <Call call={call}>
      <VideoCallUI />
    </Call>
  );
};

export default VideoCall;