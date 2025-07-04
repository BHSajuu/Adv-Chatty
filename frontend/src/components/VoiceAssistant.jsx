import { motion } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAIStore } from "../store/useAIStore";
import toast from "react-hot-toast";

const VoiceAssistant = ({ onVoiceReply, conversationHistory, lastMessage }) => {
  const { 
    isListening, 
    isProcessingVoice, 
    setListening, 
    processVoiceCommand 
  } = useAIStore();
  
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          handleVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setListening(false);
        setTranscript("");
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        toast.error("Voice recognition failed");
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setListening(true);
      recognitionRef.current.start();
      toast.success("Listening... Say your command");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleVoiceCommand = async (command) => {
    const result = await processVoiceCommand(command, conversationHistory, lastMessage);
    
    if (result) {
      if (result.action === 'speak') {
        speak(result.text);
      } else if (result.action === 'send') {
        onVoiceReply(result.text);
        speak("Message sent");
      }
    }
  };

  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      synthRef.current.speak(utterance);
    }
  };

  const readLastMessage = () => {
    if (lastMessage) {
      const messageText = `Message from ${lastMessage.isSent ? 'you' : 'your friend'}: ${lastMessage.text}`;
      speak(messageText);
    } else {
      speak("No messages to read");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Voice Assistant Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessingVoice}
        className={`btn btn-circle btn-sm relative ${
          isListening 
            ? 'btn-error animate-pulse' 
            : isProcessingVoice 
            ? 'btn-warning' 
            : 'btn-primary'
        }`}
        title={isListening ? "Stop listening" : "Start voice assistant"}
      >
        {isProcessingVoice ? (
          <div className="loading loading-spinner loading-xs"></div>
        ) : isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        
        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 rounded-full bg-red-500 opacity-30"
          />
        )}
      </motion.button>

      {/* Read Message Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={readLastMessage}
        className="btn btn-circle btn-sm btn-secondary"
        title="Read last message"
      >
        <Volume2 className="w-4 h-4" />
      </motion.button>

      {/* Voice Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-full left-0 mb-2 bg-black text-white px-3 py-2 rounded-lg text-sm max-w-xs"
        >
          {transcript}
        </motion.div>
      )}
    </div>
  );
};

export default VoiceAssistant;