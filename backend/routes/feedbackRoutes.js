import express from 'express';
import {
  getAllFeedback,
  markFeedbackAsRead
} from '../controllers/feedbackController.js';

const router = express.Router();

// Get all feedback
router.get('/all', getAllFeedback);

// Mark feedback as read
router.put('/:id/read', markFeedbackAsRead);

export default router;
