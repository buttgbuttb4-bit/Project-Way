import express from 'express';
import {
  createTask,
  getTasksByGroupId,
  toggleTaskStatus
} from '../controllers/taskController.js';

const router = express.Router();

// Create a new task
router.post('/create', createTask);

// Get tasks by groupId
router.get('/group/:groupId', getTasksByGroupId);

// Toggle task status
router.put('/toggle/:id', toggleTaskStatus);

export default router;
