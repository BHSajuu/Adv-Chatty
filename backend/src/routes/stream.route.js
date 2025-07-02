import express from "express";
import { generateStreamToken, createCall } from "../controllers/stream.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", protectRoute, generateStreamToken);
router.post("/create-call", protectRoute, createCall);

export default router;