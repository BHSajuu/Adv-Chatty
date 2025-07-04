import { useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { Check, Pencil, Trash2, X } from "lucide-react";
import CustomAudioPlayer from "./CustomAudioPlayer";
import Linkify from "react-linkify";
import ConfirmationModal from "./ConfirmationModal";

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
  const { autoTranslate, userLanguage, translateMessage } = useAIStore();
  const messageEndRef = useRef(null);

  const [hover, setHover] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState("");
  const [translatedMessages, setTranslatedMessages] = useState({});

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

  // Auto-translate messages when settings change or new messages arrive
  useEffect(() => {
    const translateMessages = async () => {
      if (!autoTranslate || !messages.length) return;

      const newTranslations = {};
      
      for (const message of messages) {
        if (message.text && !translatedMessages[message._id]) {
          try {
            const translated = await translateMessage(
              message.text, 
              userLanguage, 
              "auto-detect"
            );
            newTranslations[message._id] = translated;
          } catch (error) {
            console.error("Translation failed for message:", message._id);
          }
        }
      }

      if (Object.keys(newTranslations).length > 0) {
        setTranslatedMessages(prev => ({ ...prev, ...newTranslations }));
      }
    };

    translateMessages();
  }, [messages, autoTranslate, userLanguage, translateMessage]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleEditMessage = async (messageId, text) => {
    try {
      await editMessageText(messageId, text);
      setEditingMessageId(null);
      setEditedText("");
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const openJoinModal = (link) => {
    setCurrentLink(link);
    setModalOpen(true);
  };

  const handleJoin = () => {
    window.open(currentLink, "_blank");
    setModalOpen(false);
  };

  const getDisplayText = (message) => {
    if (autoTranslate && translatedMessages[message._id]) {
      return translatedMessages[message._id];
    }
    return message.text;
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto md:my-0">
      <ChatHeader />
      
      {/* AI Translation Indicator */}
      {autoTranslate && (
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Auto-translating to {userLanguage}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-scroll pt-8 pb-20 md:mb-0 px-4 md:p-4 space-y-4 md:relative">
        {messages.map((message) => (
          <div
            key={message._id}
            onMouseEnter={() => setHover(message._id)}
            onMouseLeave={() => setHover(false)}
            className={`relative chat hover:cursor-pointer ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            {/* Hovered icons */}
            {hover === message._id && (
              <div
                className={`absolute ${
                  message.senderId === authUser._id
                    ? "right-0 top-1"
                    : "left-0"
                } flex items-center`}
              >
                <div className="flex gap-2">
                  {message.senderId === authUser._id && (
                    <Pencil
                      className="w-5 h-5 text-blue-500 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => {
                        setEditingMessageId(message._id);
                        setEditedText(message.text);
                      }}
                    />
                  )}
                  <Trash2
                    className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => handleDeleteMessage(message._id)}
                  />
                </div>
              </div>
            )}

            {/* Avatar + Timestamp */}
            <div className="chat-image avatar">
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
              {autoTranslate && translatedMessages[message._id] && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  Translated
                </span>
              )}
            </div>

            {/* Content Bubble */}
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

              {/* Edit Input or Parsed Text */}
              {editingMessageId === message._id ? (
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="input input-bordered rounded-lg px-2 py-1 w-full"
                  />
                  <div className="flex gap-12">
                    <Check
                      onClick={() =>
                        handleEditMessage(message._id, editedText)
                      }
                      className="text-blue-500 hover:scale-120 transform-transition ease-in-out"
                    />
                    <X
                      onClick={() => {
                        setEditingMessageId(null);
                        setEditedText("");
                      }}
                      className="text-red-500 hover:scale-120 transform-transition ease-in-out"
                    />
                  </div>
                </div>
              ) : (
                <Linkify
                  componentDecorator={(href, text, key) => {
                    const isCallLink = href.includes("/call/");
                    return isCallLink ? (
                      <button
                        key={key}
                        className="text-blue-500 hover:cursor-pointer btn-link p-0 m-0 bg-transparent"
                        onClick={(e) => {
                          e.preventDefault();
                          openJoinModal(href);
                        }}
                      >
                        click to join
                      </button>
                    ) : (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:cursor-pointer"
                      >
                        {text}
                      </a>
                    );
                  }}
                >
                  <p>{getDisplayText(message)}</p>
                </Linkify>
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      <ConfirmationModal
        isOpen={modalOpen}
        link={currentLink}
        onClose={() => setModalOpen(false)}
        onJoin={handleJoin}
      />
    </div>
  );
};

export default ChatContainer;