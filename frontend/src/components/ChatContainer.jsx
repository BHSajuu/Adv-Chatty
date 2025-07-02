import { useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { Check, Pencil, Trash2, X } from "lucide-react";
import CustomAudioPlayer from "./CustomAudioPlayer";



const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    editMessageText,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [hover, setHover] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null); // Track the message being edited
  const [editedText, setEditedText] = useState(""); // Track the updated text




  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }


  const handleEditMessage = async (messageId, text) => {
    try {
      await editMessageText(messageId, text);
      setEditingMessageId(null);
      setEditedText("");
    } catch (error) {
      console.error("Failed to edit message:", error);

    }
  }


  return (
    <div className="flex-1  flex flex-col overflow-auto  md:my-0">

      <ChatHeader />


      <div className=" flex-1 overflow-y-scroll pt-8 pb-20 md:mb-0 px-4  md:p-4 space-y-4  md:relative">
        {messages.map((message) => (
          <div
            onMouseEnter={() => setHover(message._id)}
            onMouseLeave={() => { setHover(false) }}
            key={message._id}
            className={`relative chat hover:cursor-pointer ${message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
            ref={messageEndRef}>

            {/* Delete Icon */}
            {hover === message._id && (
              <div
                className={`absolute ${message.senderId === authUser._id ? "right-0 top-1" : "left-0 "
                  }  flex items-center`}
              >
                <div className="flex gap-2">
                  {message.senderId === authUser._id && <Pencil
                    className="w-5 h-5 text-blue-500 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      setEditingMessageId(message._id); // Enter edit mode
                      setEditedText(message.text); // Set the current text in the input
                    }}
                  />}
                  <Trash2
                    className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => handleDeleteMessage(message._id)}
                  />
                </div>
              </div>
            )}



            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble w-[220px] lg:w-auto flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="lg:w-auto sm:max-w-[200px] rounded-md mb-2"
                />
              )}

              {message.audio && (
                <div className="mt-2 mr-3 w-full max-w-[300px]">
                  <CustomAudioPlayer src={message.audio} />
                </div>
          
              )}
              {editingMessageId === message._id ? (
                // Render input field if the message is being edited
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="input input-bordered rounded-lg px-2 py-1 w-full"
                  />
                  <div className="flex gap-12">
                    <Check onClick={() => handleEditMessage(message._id, editedText)}
                      className="text-blue-500 hover:scale-120 transform-transition ease-in-out" />
                    < X onClick={() => {
                      setEditingMessageId(null);
                      setEditedText("");
                    }}
                      className="text-red-500 hover:scale-120 transform-transition ease-in-out " />
                  </div>
                </div>
              ) : (
                // Render message text if not editing
                <p>{message.text}</p>
              )}

              {/* {message.text && <p>{message.text}</p>} */}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
