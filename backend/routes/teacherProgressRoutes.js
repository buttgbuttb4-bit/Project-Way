import express from 'express';
import {
  getAllStudentProgress,
  getActiveProjectsProgress,
  updateStudentProgress
} from '../controllers/teacherProgressController.js';

const router = express.Router();

// Get all student progress data
router.get('/all', getAllStudentProgress);

// Get active projects with their progress
router.get('/active', getActiveProjectsProgress);

// Update student progress
router.put('/update', updateStudentProgress);

export default router;
