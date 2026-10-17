import Feedback from '../models/Feedback.js';
import StudentIdea from '../models/StudentIdea.js';
import { User } from '../models/User.js';





// Get all feedback (for teacher)
export const getAllFeedback = async (req, res) => {
  console.log('💬 [Feedback] Get all feedback request received');
  console.log('💬 [Feedback] Query params:', req.query);

  try {
    const { groupId, userName } = req.query;
    
    // Only return feedback if groupId is provided
    if (!groupId) {
      return res.status(200).json({ success: true, feedbacks: [] });
    }
    
    const query = { groupId };
    console.log('💬 [Feedback] MongoDB query:', JSON.stringify(query));
    const feedbacks = await Feedback.find(query).sort({ timestamp: -1 });
    
    // Add per-user read status and current idea status to each feedback
    const feedbacksWithReadStatus = await Promise.all(feedbacks.map(async (feedback) => {
      const feedbackObj = feedback.toObject();
      
      // Fetch the current idea status
      try {
        const idea = await StudentIdea.findById(feedback.ideaId);
        feedbackObj.ideaCurrentStatus = idea?.status || feedback.status;
      } catch (error) {
        console.warn('⚠️ [Feedback] Could not fetch idea status for ideaId:', feedback.ideaId, error.message);
        feedbackObj.ideaCurrentStatus = feedback.status;
      }
      
      feedbackObj.isRead = userName ? feedback.readBy.includes(userName) : false;
      return feedbackObj;
    }));
    
    console.log('✅ [Feedback] Retrieved', feedbacks.length, 'feedbacks total');
    res.status(200).json({ success: true, feedbacks: feedbacksWithReadStatus });
  } catch (error) {
    console.error('❌ [Feedback] Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
};







// Mark feedback as read
export const markFeedbackAsRead = async (req, res) => {
  console.log('💬 [Feedback] Mark feedback as read request received');
  console.log('💬 [Feedback] Feedback ID:', req.params.id);
  console.log('💬 [Feedback] User:', req.body.userName);
  
  try {
    const { id } = req.params;
    const { userName } = req.body;
    
    if (!userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'userName is required' 
      });
    }
    
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        $addToSet: { readBy: userName },
        read: true 
      },
      { new: true }
    );

    if (!feedback) {
      console.log('⚠️ [Feedback] Feedback not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    console.log('✅ [Feedback] Feedback marked as read for user:', userName);
    res.status(200).json({ 
      success: true, 
      message: 'Feedback marked as read',
      feedback 
    });
  } catch (error) {
    console.error('❌ [Feedback] Error marking feedback as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking feedback as read', 
      error: error.message 
    });
  }
};
