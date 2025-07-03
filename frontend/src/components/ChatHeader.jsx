import { MessageCircleX, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useStreamStore } from "../store/useStreamStore";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChat, sendMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const { onlineUsers } = useAuthStore();
  const { createCall, streamToken, getStreamToken, isStreamConfigured } = useStreamStore();
  const [open, setOpen] = useState(false);
  const [isCreatingCall, setIsCreatingCall] = useState(false);

  const handleClearChat = async () => {
    try {
      await clearChat(selectedUser._id, authUser._id);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
    finally {
      setOpen(false);
    }
  }

  const handleVideoCall = async () => {
    try {
      setIsCreatingCall(true);
      
      // Check if Stream is configured first
      if (isStreamConfigured === false) {
        toast.error("Video calling is not configured. Please contact administrator.");
        return;
      }
      
      // Ensure we have stream token
      if (!streamToken) {
        const tokenData = await getStreamToken();
        if (!tokenData) {
          // Error already shown by getStreamToken
          return;
        }
      }

      // Generate unique call ID
      const callId = uuidv4();
      const callLink = `${window.location.origin}/call/${callId}`;
      
      // Create call on backend
      await createCall(callId, [selectedUser._id]);
      
      // Send video call link as a message
      await sendMessage({
        text: `📹 Video Call Invitation: ${selectedUser.fullName}, click to join: ${callLink}`,
        image: null,
        audio: null,
      });

      // Open call in new tab
      window.open(`/call/${callId}`, '_blank');
      
      toast.success("Video call created! Link sent to chat.");
    } catch (error) {
      console.error("Error creating video call:", error);
      // Error message already shown by createCall
    } finally {
      setIsCreatingCall(false);
    }
  };

  // Check if video calling should be disabled
  const isVideoCallDisabled = isStreamConfigured === false || isCreatingCall;

  return (
    <div className=" p-2.5  border-b border-base-300 fixed w-full top-2 z-40 backdrop-blur-3xl md:w-auto md:relative md:top-0 md:z-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-8 lg:gap-18 items-center">
          <button 
            onClick={handleVideoCall}
            disabled={isVideoCallDisabled}
            className={`tooltip tooltip-left hover:cursor-pointer ${
              isVideoCallDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            data-tip={
              isStreamConfigured === false 
                ? "Video calling not configured" 
                : isCreatingCall 
                ? "Creating call..." 
                : "Start video call"
            }
            type="button"
          >
            <Video className={isCreatingCall ? 'animate-pulse' : ''} />
          </button>
          <button className="tooltip tooltip-left hover:cursor-pointer" data-tip="Clear chat" type="button">
            <MessageCircleX onClick={() => setOpen(true)} />
          </button>
          {open && (
            <div className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm z-5">
              <div className="bg-base-200 rounded-2xl shadow-3xl p-6 space-y-4 max-w-sm text-center animate-fade-in">
                <h4 className="text-lg font-semibold">Clear chat?</h4>
                <p className="text-sm text-base-content/70">
                  Are you sure you want to clear the chat?
                </p>
                <p className="text-sm text-base-content/70">
                  This action cannot be undone. Data will be deleted permanently.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    className="btn btn-active btn-primary px-6"
                    onClick={handleClearChat}
                  >
                    Yes
                  </button>
                  <button
                    className="btn btn-secondary px-6"
                    onClick={() => setOpen(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setSelectedUser(null)}>
            <X className="hover:cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;