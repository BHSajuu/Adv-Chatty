import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import CallNotification from './CallNotification';

const IncomingCallHandler = () => {
  const { socket } = useAuthStore();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (callData) => {
      setIncomingCall(callData);
    };

    const handleCallCancelled = () => {
      setIncomingCall(null);
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-cancelled', handleCallCancelled);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-cancelled', handleCallCancelled);
    };
  }, [socket]);

  const handleAcceptCall = () => {
    if (socket && incomingCall) {
      socket.emit('accept-call', { callId: incomingCall.callId });
      setIncomingCall(null);
    }
  };

  const handleDeclineCall = () => {
    if (socket && incomingCall) {
      socket.emit('decline-call', { callId: incomingCall.callId });
      setIncomingCall(null);
    }
  };

  if (!incomingCall) return null;

  return (
    <CallNotification
      callData={incomingCall}
      onAccept={handleAcceptCall}
      onDecline={handleDeclineCall}
    />
  );
};

export default IncomingCallHandler;