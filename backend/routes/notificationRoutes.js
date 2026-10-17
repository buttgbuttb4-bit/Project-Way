import express from 'express';
import {
  getAllNotifications,
  getNotificationsByGroup,
  markAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications (for teacher)
router.get('/all', getAllNotifications);

// Get notifications by group ID (for student group members)
router.get('/group/:groupId', getNotificationsByGroup);

// Mark notification as read
router.put('/read/:id', markAsRead);

export default router;
