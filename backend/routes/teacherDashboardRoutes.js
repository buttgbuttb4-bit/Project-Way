import express from 'express';
import {
  getPendingIdeas,
  getAllIdeasFiltered,
  reviewIdea,
  sendFeedback
} from '../controllers/teacherDashboardController.js';

const router = express.Router();

// Get pending ideas for dashboard
router.get('/pending', getPendingIdeas);

// Get all ideas with filters
router.get('/all', getAllIdeasFiltered);

// Review (accept/reject) an idea
router.put('/review/:id', reviewIdea);

// Send feedback to student
router.post('/feedback', sendFeedback);

export default router;
