import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import VideoCall from '../components/VideoCall';
import { useAuthStore } from '../store/useAuthStore';
import { useStreamStore } from '../store/useStreamStore';
import { useChatStore } from '../store/useChatStore';
import toast from 'react-hot-toast';

function CallPage() {
  const { id: receiverId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { createCall, getStreamToken } = useStreamStore();
  const { selectedUser } = useChatStore();
  const [callId, setCallId] = useState(null);
  const [isCreatingCall, setIsCreatingCall] = useState(false);

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    const initializeCall = async () => {
      try {
        setIsCreatingCall(true);
        
        // Generate unique call ID
        const newCallId = uuidv4();
        setCallId(newCallId);

        // Get stream token first
        await getStreamToken();

        // Create the call with both participants
        await createCall(newCallId, [authUser._id, receiverId]);
        
        toast.success('Call created successfully!');
      } catch (error) {
        console.error('Failed to initialize call:', error);
        toast.error('Failed to create call');
        navigate('/');
      } finally {
        setIsCreatingCall(false);
      }
    };

    initializeCall();
  }, [authUser, receiverId, createCall, getStreamToken, navigate]);

  if (isCreatingCall || !callId) {
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