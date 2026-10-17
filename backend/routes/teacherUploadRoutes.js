import express from 'express';
import {
  uploadFile,
  getAllUploads,
  deleteUpload
} from '../controllers/teacherUploadController.js';

const router = express.Router();

// Upload a new file (for teacher)
router.post('/upload', uploadFile);

// Get all teacher uploads
router.get('/all', getAllUploads);

// Delete upload (for teacher)
router.delete('/:id', deleteUpload);

export default router;
