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
        
        console.log('Initializing call with ID:', callId);
        console.log('Current stream token:', streamToken ? 'Present' : 'Missing');
        console.log('Current API key:', apiKey ? 'Present' : 'Missing');
        
        // Get Stream token if not available
        let tokenData = null;
        if (!streamToken || !apiKey) {
          console.log('Getting new Stream token...');
          tokenData = await getStreamToken();
          if (!tokenData) {
            throw new Error('Failed to get Stream credentials');
          }
          console.log('Stream token obtained successfully');
        } else {
          tokenData = { token: streamToken, apiKey };
        }

        // Check if Stream is configured
        if (isStreamConfigured === false) {
          throw new Error('Video calling service is not configured');
        }

        // Import StreamVideoClient dynamically to avoid SSR issues
        const { StreamVideoClient } = await import('@stream-io/video-react-sdk');
        
        if (!tokenData.token || !tokenData.apiKey) {
          throw new Error('Stream credentials not available');
        }

        console.log('Creating Stream video client...');
        const client = new StreamVideoClient({
          apiKey: tokenData.apiKey,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic || '/avatar.png',
          },
          token: tokenData.token,
        });

        console.log('Creating call instance...');
        const callInstance = client.call('default', callId);
        
        // Join the call
        console.log('Joining call...');
        await callInstance.join({ create: true });
        
        setCall(callInstance);
        console.log('Successfully joined the call!');
        toast.success('Successfully joined the call!');
      } catch (err) {
        console.error('Error initializing call:', err);
        setError(err.message);
        
        // More specific error messages
        if (err.message.includes('credentials')) {
          toast.error('Video calling setup required. Please check configuration.');
        } else if (err.message.includes('network') || err.message.includes('connection')) {
          toast.error('Network error. Please check your internet connection.');
        } else {
          toast.error('Failed to join call: ' + err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeCall();

    return () => {
      if (call) {
        console.log('Leaving call...');
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
            <h3 className="text-xl mb-4 text-blue-400">🎥 Video Calling Status</h3>
            <div className="text-left space-y-3">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">✅ Stream Credentials Detected</h4>
                <p className="text-sm">Your Stream API credentials are configured in the backend</p>
                <p className="text-xs text-gray-400 mt-1">API Key: {process.env.STREAM_API_KEY || 'Not visible'}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Connection Issue</h4>
                <p className="text-sm">There might be a temporary connection issue with Stream services</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">🔧 Troubleshooting</h4>
                <ul className="text-sm space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Verify Stream API credentials are valid</li>
                  <li>• Try refreshing the page</li>
                  <li>• Contact support if issue persists</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Back to Chat
            </button>
          </div>
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