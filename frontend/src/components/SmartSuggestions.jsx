import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAIStore } from "../store/useAIStore";

const SmartSuggestions = ({ onSuggestionClick }) => {
  const { smartSuggestions, showSuggestions, hideSuggestions } = useAIStore();

  if (!showSuggestions || smartSuggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="mb-3 px-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            Smart Suggestions
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {smartSuggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                onSuggestionClick(suggestion);
                hideSuggestions();
              }}
              className="px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 
                       dark:from-purple-900/30 dark:to-blue-900/30 
                       text-purple-700 dark:text-purple-300 
                       rounded-full text-sm font-medium
                       hover:from-purple-200 hover:to-blue-200
                       dark:hover:from-purple-800/40 dark:hover:to-blue-800/40
                       transition-all duration-200 transform hover:scale-105
                       border border-purple-200 dark:border-purple-700"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartSuggestions;