import Notification from '../models/Notification.js';
import { User } from '../models/User.js';

// Get all notifications (for teacher)
export const getAllNotifications = async (req, res) => {
  console.log('🔔 [Notifications] Get all notifications request received');
  console.log('🔔 [Notifications] User name:', req.query.userName);

  try {
    const { userName } = req.query;
    const notifications = await Notification.find({ recipient: 'teacher' }).sort({ submittedAt: -1 });

    // Add a computed 'read' field based on whether the current teacher has read it
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification.toObject(),
      read: userName ? notification.readBy.includes(userName) : false
    }));

    console.log('✅ [Notifications] Retrieved', notifications.length, 'notifications total');
    res.status(200).json({ success: true, notifications: notificationsWithReadStatus });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get notifications by group ID (for student group members)
export const getNotificationsByGroup = async (req, res) => {
  console.log('🔔 [Notifications] Get notifications by group request received');
  console.log('🔔 [Notifications] Group ID:', req.params.groupId);
  console.log('🔔 [Notifications] User name:', req.query.userName);

  try {
    const { groupId } = req.params;
    const { userName } = req.query;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required',
        notifications: []
      });
    }

    const query = { recipient: 'student', groupId };
    console.log('🔔 [Notifications] MongoDB query:', JSON.stringify(query));
    const notifications = await Notification.find(query).sort({ submittedAt: -1 });
    
    // Add a computed 'read' field based on whether the current user has read it
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification.toObject(),
      read: userName ? notification.readBy.includes(userName) : false
    }));
    
    console.log('✅ [Notifications] Retrieved', notifications.length, 'notifications for group:', groupId);
    res.status(200).json({ success: true, notifications: notificationsWithReadStatus });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching notifications by group:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications by group',
      error: error.message
    });
  }
};







// Mark notification as read
export const markAsRead = async (req, res) => {
  console.log('🔔 [Notifications] Mark notification as read request received');
  console.log('🔔 [Notifications] Notification ID:', req.params.id);
  console.log('🔔 [Notifications] User name:', req.body.userName);
  
  try {
    const { id } = req.params;
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({
        success: false,
        message: 'userName is required'
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      console.log('⚠️ [Notifications] Notification not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    // Add user to readBy array if not already present
    if (!notification.readBy.includes(userName)) {
      notification.readBy.push(userName);
      await notification.save();
    }

    console.log('✅ [Notifications] Notification marked as read for user:', userName);
    res.status(200).json({ 
      success: true, 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('❌ [Notifications] Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking notification as read', 
      error: error.message 
    });
  }
};








