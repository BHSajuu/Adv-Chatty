import { Languages, Globe, Zap } from "lucide-react";
import { useAIStore } from "../store/useAIStore";

const SUPPORTED_LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi",
  "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Punjabi",
  "Urdu", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish"
];

const AILanguageSettings = () => {
  const { userLanguage, autoTranslate, setUserLanguage, setAutoTranslate } = useAIStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Languages className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Language Settings</h3>
          <p className="text-sm text-base-content/70">Configure translation and language preferences</p>
        </div>
      </div>

      {/* Auto Translation Toggle */}
      <div className="bg-base-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-medium">Auto Translation</h4>
              <p className="text-sm text-base-content/70">
                Automatically translate messages to your preferred language
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
          />
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-base-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-secondary" />
          <div>
            <h4 className="font-medium">Your Language</h4>
            <p className="text-sm text-base-content/70">
              Messages will be translated to this language
            </p>
          </div>
        </div>
        
        <select
          className="select select-bordered w-full"
          value={userLanguage}
          onChange={(e) => setUserLanguage(e.target.value)}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* AI Features Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          AI Features Enabled
        </h4>
        <ul className="text-sm text-base-content/70 space-y-1">
          <li>• Real-time message translation</li>
          <li>• Smart reply suggestions</li>
          <li>• Typing assistance</li>
          <li>• Voice assistant integration</li>
        </ul>
      </div>
    </div>
  );
};

export default AILanguageSettings;