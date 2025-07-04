import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  translateMessage, 
  getSmartSuggestions, 
  getTypingAssist,
  processVoiceCommand 
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/translate", protectRoute, translateMessage);
router.post("/suggestions", protectRoute, getSmartSuggestions);
router.post("/typing-assist", protectRoute, getTypingAssist);
router.post("/voice-command", protectRoute, processVoiceCommand);

export default router;