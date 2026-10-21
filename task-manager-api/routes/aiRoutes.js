// ─── AI Routes (Practical 13) ────────────────────────────────────────────────
// POST /api/ai/generate-description
//
// React -> Express -> OpenAI -> React. The OpenAI API key never leaves the
// backend: the browser only receives the final { success, description } JSON.

import express from 'express';
import { validateGenerateDescription } from '../middleware/validationMiddleware.js';
import {
  AI_FALLBACK_MESSAGE,
  generateTaskDescription
} from '../services/aiService.js';

const router = express.Router();

// ─── POST /api/ai/generate-description ───────────────────────────────────────
// Body: { "title": "Complete React project" }
// 200: { "success": true, "description": "..." }
// 400: validation failure (missing / non-string / too-long title)
// 503: AI service unavailable -> friendly fallback, application keeps running
router.post('/generate-description', validateGenerateDescription, async (req, res) => {
  try {
    const title = req.body.title;
    const result = await generateTaskDescription(title);

    if (!result.success) {
      return res.status(503).json({
        success: false,
        description: '',
        message: result.message || AI_FALLBACK_MESSAGE
      });
    }

    // Only the clean description is returned - no raw AI API payload
    return res.status(200).json({
      success: true,
      description: result.description
    });
  } catch (err) {
    // Absolute last line of defence: AI issues must never crash the server
    console.error(`[AI] Unexpected route error: ${err?.name || 'Error'}`);
    return res.status(503).json({
      success: false,
      description: '',
      message: AI_FALLBACK_MESSAGE
    });
  }
});

export default router;
