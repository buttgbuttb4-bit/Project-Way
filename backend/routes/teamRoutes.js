import express from 'express';
import {
  saveTeam,
  getTeamByGroupId,
  getGroupByGroupId
} from '../controllers/teamController.js';

const router = express.Router();

// Create or update a team
router.post('/save', saveTeam);

// Get team by groupId
router.get('/group/:groupId', getTeamByGroupId);

// Get group data by groupId
router.get('/group-data/:groupId', getGroupByGroupId);

export default router;
