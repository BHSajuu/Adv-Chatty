import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoCall from '../components/VideoCall';
import { useAuthStore } from '../store/useAuthStore';
import { useStreamStore } from '../store/useStreamStore';
import { useChatStore } from '../store/useChatStore';
import toast from 'react-hot-toast';

function CallPage() {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { createCall, getStreamToken } = useStreamStore();
  const { selectedUser } = useChatStore();
  const [isCreatingCall, setIsCreatingCall] = useState(false);

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    const initializeCall = async () => {
      try {
        setIsCreatingCall(true);
        
        // Get stream token first
        await getStreamToken();

        // Create the call - if selectedUser exists, add them as member
        const members = selectedUser 
          ? [authUser._id, selectedUser._id] 
          : [authUser._id];
        
        await createCall(callId, members);
        
        toast.success('Joined call successfully!');
      } catch (error) {
        console.error('Failed to initialize call:', error);
        toast.error('Failed to join call');
        // Don't navigate away on error, let user try again
      } finally {
        setIsCreatingCall(false);
      }
    };

    initializeCall();
  }, [authUser, callId, createCall, getStreamToken, selectedUser]);

  if (isCreatingCall) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Setting up video call...</p>
          {selectedUser && (
            <p className="text-gray-300 mt-2">
              Calling {selectedUser.fullName}...
            </p>
          )}
        </div>
      </div>
    );
  }

  return <VideoCall callId={callId} />;
}

export default CallPage;