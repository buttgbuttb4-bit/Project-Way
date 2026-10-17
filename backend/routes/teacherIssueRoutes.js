import express from 'express';
import {
  submitIssue,
  getAllIssues,
  replyToIssue,
  markIssueAsRead
} from '../controllers/teacherIssueController.js';

const router = express.Router();

// Submit a new student issue
router.post('/submit', submitIssue);

// Get all student issues
router.get('/all', getAllIssues);

// Reply to student issue
router.put('/reply/:id', replyToIssue);

// Mark issue as read
router.put('/:id/read', markIssueAsRead);

export default router;
