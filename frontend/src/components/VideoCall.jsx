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
import toast from 'react-hot-toast';

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
  const { streamToken, apiKey, getStreamToken, isStreamConfigured } = useStreamStore();
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
        setError(null);
        
        // Get Stream token if not available
        if (!streamToken || !apiKey) {
          const tokenData = await getStreamToken();
          if (!tokenData) {
            throw new Error('Failed to get Stream credentials');
          }
        }

        // Check if Stream is configured
        if (isStreamConfigured === false) {
          throw new Error('Video calling service is not configured');
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
        toast.success('Successfully joined the call!');
      } catch (err) {
        console.error('Error initializing call:', err);
        setError(err.message);
        toast.error('Failed to join call: ' + err.message);
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
  }, [callId, authUser, navigate, streamToken, apiKey, getStreamToken, isStreamConfigured]);

  if (!authUser) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Setting up video call...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || isStreamConfigured === false) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-2xl mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            <h3 className="font-bold text-lg">Video Call Unavailable</h3>
            <p className="mt-2">{error || 'Video calling service is not configured'}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg text-white">
            <h3 className="text-xl mb-4 text-blue-400">🎥 Setup Video Calling</h3>
            <div className="text-left space-y-3">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Step 1: Get Stream Account</h4>
                <p className="text-sm">Visit <a href="https://getstream.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">getstream.io</a> and create a free account</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Step 2: Create App</h4>
                <p className="text-sm">Create a new app in the Stream dashboard</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Step 3: Get Credentials</h4>
                <p className="text-sm">Copy your API Key and Secret from the dashboard</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Step 4: Update Environment</h4>
                <p className="text-sm">Add STREAM_API_KEY and STREAM_API_SECRET to your backend/.env file</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Step 5: Restart</h4>
                <p className="text-sm">Restart the backend server to apply changes</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg mb-4">
            <h3 className="font-bold">Call Not Found</h3>
            <p>The video call you're trying to join doesn't exist or has ended.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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