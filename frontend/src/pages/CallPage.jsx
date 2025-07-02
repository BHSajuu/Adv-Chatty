import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoCall from '../components/VideoCall';
import { useAuthStore } from '../store/useAuthStore';

function CallPage() {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }
  }, [authUser, navigate]);

  if (!authUser) {
    return null;
  }

  return <VideoCall callId={callId} />;
}

export default CallPage;