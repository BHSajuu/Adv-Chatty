import { Image, Send, X, Mic, StopCircle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";
import { useReactMediaRecorder } from "react-media-recorder";
import CustomAudioPlayer from "./CustomAudioPlayer";
import SmartSuggestions from "./SmartSuggestions";
import TypingAssist from "./TypingAssist";
import VoiceAssistant from "./VoiceAssistant";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { sendMessage, messages } = useChatStore();
  const { 
    getSmartSuggestions, 
    getTypingAssist, 
    autoTranslate, 
    userLanguage,
    translateMessage 
  } = useAIStore();

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ audio: true });

  // Start/stop timer when recording status changes
  useEffect(() => {
    if (status === "recording") {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  // When recording stops, set audio preview
  useEffect(() => {
    if (mediaBlobUrl) {
      setAudioPreview(mediaBlobUrl);
    }
  }, [mediaBlobUrl]);

  // Get smart suggestions when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const conversationHistory = messages.slice(-10).map(msg => ({
        text: msg.text,
        isSent: msg.senderId === messages[0]?.senderId
      }));
      getSmartSuggestions(conversationHistory);
    }
  }, [messages, getSmartSuggestions]);

  // Typing assist with debounce
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length >= 2) {
      typingTimeoutRef.current = setTimeout(() => {
        const conversationHistory = messages.slice(-5).map(msg => ({
          text: msg.text,
          isSent: msg.senderId === messages[0]?.senderId
        }));
        getTypingAssist(text, conversationHistory);
      }, 500);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, messages, getTypingAssist]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelAudio = () => {
    setAudioPreview(null);
    setSeconds(0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioPreview) return;

    try {
      let messageText = text.trim();
      
      // Auto-translate if enabled and text is not in user's language
      if (autoTranslate && messageText && userLanguage !== "English") {
        try {
          messageText = await translateMessage(messageText, userLanguage);
        } catch (error) {
          console.error("Translation failed, sending original text");
        }
      }

      let audioData = null;
      if (audioPreview) {
        const blob = await fetch(audioPreview).then((r) => r.blob());
        audioData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      await sendMessage({
        text: messageText,
        image: imagePreview,
        audio: audioData,
      });

      // Clear inputs
      setText("");
      setImagePreview(null);
      setAudioPreview(null);
      setSeconds(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setText(suggestion);
  };

  const handleTypingAssistClick = (completion) => {
    setText(completion);
  };

  const handleVoiceReply = (replyText) => {
    setText(replyText);
  };

  // Format seconds to MM:SS
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const lastMessage = messages[messages.length - 1];
  const conversationHistory = messages.slice(-10).map(msg => ({
    text: msg.text,
    isSent: msg.senderId === messages[0]?.senderId
  }));

  return (
    <div className="py-1 px-3 md:p-4 w-full md:relative fixed bottom-0">
      {/* Smart Suggestions */}
      <SmartSuggestions onSuggestionClick={handleSuggestionClick} />

      <div className="flex flex-row items-center gap-28">
        {/* Audio controls or preview */}
        {audioPreview ? (
          <div className="lg:ml-28 w-sd lg:w-md flex items-center gap-2 mb-3 rounded-lg p-2">
            <CustomAudioPlayer src={audioPreview} controls className="flex-1" />
            <button
              onClick={cancelAudio}
              type="button"
              className="btn btn-sm btn-circle btn-outline text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="relative flex items-center gap-2 mb-3">
            {/* Timer badge */}
            {status === "recording" && (
              <div className="absolute -top-10 left-12 transform -translate-x-1/2 bg-black text-white text-xs font-mono px-2 py-1 rounded-full shadow">
                {fmt(seconds)}
              </div>
            )}

            {/* Mic button */}
            <button
              onClick={() => {
                setSeconds(0);
                startRecording();
              }}
              disabled={status === "recording"}
              className="btn btn-sm btn-circle btn-primary tooltip tooltip-right"
              type="button"
              data-tip="start recording"
            >
              <Mic
                size={20}
                className={status === "recording" ? "animate-pulse" : ""}
              />
            </button>

            {/* Stop button */}
            <button
              onClick={stopRecording}
              disabled={status !== "recording"}
              className={`btn btn-sm btn-circle btn-secondary tooltip tooltip-right ${status !== "recording" ? "hidden" : ""}`}
              data-tip="stop recording"
              type="button"
            >
              <StopCircle size={20} />
            </button>

            {/* Voice Assistant */}
            <VoiceAssistant 
              onVoiceReply={handleVoiceReply}
              conversationHistory={conversationHistory}
              lastMessage={lastMessage}
            />
          </div>
        )}
         
        {/* Image preview */}
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message input form */}
      <div className="relative">
        <TypingAssist 
          onAssistClick={handleTypingAssistClick}
          currentText={text}
        />
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              type="button"
              className={`flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"
                }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-sm btn-circle"
            disabled={!text.trim() && !imagePreview && !audioPreview}
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;