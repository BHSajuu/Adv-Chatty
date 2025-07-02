import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoCall from '../components/VideoCall';
import { useAuthStore } from '../store/useAuthStore';
import { useStreamStore } from '../store/useStreamStore';

function CallPage() {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { getStreamToken } = useStreamStore();

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    // Ensure we have stream credentials
    getStreamToken();
  }, [authUser, getStreamToken, navigate]);

  if (!authUser) {
    return null;
  }

  return <VideoCall callId={callId} />;
}

export default CallPage;