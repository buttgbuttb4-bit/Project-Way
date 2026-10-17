// routes/diagramRoutes.js
import express from 'express';
const router = express.Router();
import { 
  saveDiagram, 
  getDiagram, 
  getAllDiagrams, 
  updateDiagram
} from '../controllers/diagramController.js';

// Create a new diagram
router.post('/', saveDiagram);

// Get all diagrams
router.get('/', getAllDiagrams);

// Get a specific diagram by ID
router.get('/:id', getDiagram);

// Update a diagram
router.put('/:id', updateDiagram);

export default router;