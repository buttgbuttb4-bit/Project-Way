import express from 'express';
import {
  submitIdea,
  getAllIdeas,
  getIdeaStatsByGroup,
  getFirstIdeaByGroup,
  getIdeasByGroupId
} from '../controllers/studentIdeaController.js';

const router = express.Router();

// Submit a new student idea
router.post('/submit', submitIdea);

// Get all student ideas
router.get('/all', getAllIdeas);

// Get idea statistics by group ID
router.get('/stats/group/:groupId', getIdeaStatsByGroup);

// Get first idea by group ID
router.get('/first/:groupId', getFirstIdeaByGroup);

// Get ideas by group ID
router.get('/group/:groupId', getIdeasByGroupId);

export default router;
