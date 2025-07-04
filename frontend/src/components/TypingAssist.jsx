import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { useAIStore } from "../store/useAIStore";

const TypingAssist = ({ onAssistClick, currentText }) => {
  const { typingAssist, showTypingAssist, hideTypingAssist } = useAIStore();

  if (!showTypingAssist || typingAssist.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute bottom-full left-0 right-0 mb-2 px-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Complete your message
            </span>
          </div>
          
          <div className="space-y-1">
            {typingAssist.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onAssistClick(suggestion);
                  hideTypingAssist();
                }}
                className="w-full text-left px-3 py-2 text-sm
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         rounded-md transition-colors duration-150
                         text-gray-700 dark:text-gray-300"
              >
                <span className="text-gray-400 dark:text-gray-500">
                  {currentText}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {suggestion}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingAssist;