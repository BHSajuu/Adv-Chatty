import { Phone, PhoneOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallNotification = ({ callData, onAccept, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timeout
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDecline]);

  const handleAccept = () => {
    onAccept();
    navigate(`/call/${callData.callId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
            <img
              src={callData.callerImage || '/avatar.png'}
              alt={callData.callerName}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {callData.callerName}
          </h3>
          <p className="text-gray-600">Incoming video call</p>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500">
            Call will timeout in {timeLeft}s
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <button
            onClick={onDecline}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <PhoneOff size={24} />
          </button>
          <button
            onClick={handleAccept}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <Phone size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;