import { useNavigate } from 'react-router-dom';

const VideoCall = ({ callId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Video Call</h1>
          <p className="text-gray-300 text-lg mb-2">Call ID: {callId}</p>
          <p className="text-gray-400">Video calling feature is currently being set up.</p>
          <p className="text-gray-400">This requires Stream API configuration.</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg mb-2">To enable video calling:</h3>
            <ol className="text-gray-300 text-left space-y-2">
              <li>1. Sign up for a Stream account</li>
              <li>2. Get your API key and secret</li>
              <li>3. Add them to your environment variables</li>
              <li>4. Restart the application</li>
            </ol>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;