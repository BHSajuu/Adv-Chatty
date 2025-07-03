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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-white text-lg">Please log in to join the call</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <VideoCall callId={callId} />;
}

export default CallPage;