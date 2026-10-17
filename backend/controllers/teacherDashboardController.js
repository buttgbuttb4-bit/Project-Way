import StudentIdea from '../models/StudentIdea.js';
import Feedback from '../models/Feedback.js';
import { User } from '../models/User.js';
import { upsertNotification } from '../utils/notificationUtils.js';

// Get pending ideas for teacher dashboard
export const getPendingIdeas = async (req, res) => {
  console.log('📝 [Teacher Dashboard] Get pending ideas request received');
  
  try {
    const pendingIdeas = await StudentIdea.find({ status: 'Pending' }).sort({ submittedAt: -1 });
    console.log('✅ [Teacher Dashboard] Retrieved', pendingIdeas.length, 'pending ideas');
    res.status(200).json({ success: true, ideas: pendingIdeas });
  } catch (error) {
    console.error('❌ [Teacher Dashboard] Error fetching pending ideas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending ideas', 
      error: error.message 
    });
  }
};

// Get all ideas with filters (for AllIdeasView)
export const getAllIdeasFiltered = async (req, res) => {
  console.log('📝 [Teacher Dashboard] Get all ideas filtered request received');
  console.log('📝 [Teacher Dashboard] Query params:', req.query);
  
  try {
    const { status, session } = req.query;
    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (session) {
      if (session === 'Morning') {
        query.session = { $regex: /Morning/i };
      } else if (session === 'Evening') {
        query.session = { $regex: /Evening/i };
      }
    }
    
    const ideas = await StudentIdea.find(query).sort({ submittedAt: -1 });
    console.log('✅ [Teacher Dashboard] Retrieved', ideas.length, 'ideas with filters');
    res.status(200).json({ success: true, ideas });
  } catch (error) {
    console.error('❌ [Teacher Dashboard] Error fetching filtered ideas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching filtered ideas', 
      error: error.message 
    });
  }
};

// Accept/Reject idea with feedback
export const reviewIdea = async (req, res) => {
  console.log('📝 [Teacher Dashboard] Review idea request received');
  console.log('📝 [Teacher Dashboard] Idea ID:', req.params.id);
  console.log('📝 [Teacher Dashboard] Review data:', req.body);

  try {
    const { id } = req.params;
    const { status, feedback, teacherName } = req.body;

    // Try to find by MongoDB _id first, then by custom id field
    let updatedIdea = await StudentIdea.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    // If not found by _id, try by custom id field
    if (!updatedIdea) {
      updatedIdea = await StudentIdea.findOneAndUpdate(
        { id: id },
        { status },
        { new: true }
      );
    }

    if (!updatedIdea) {
      console.log('⚠️ [Teacher Dashboard] Idea not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Save feedback if provided
    if (feedback && feedback.trim()) {
      const normalizedProjectName = updatedIdea.projectName || updatedIdea.title;
      console.log('📝 [Teacher Dashboard] Feedback projectName:', normalizedProjectName);
      const newFeedback = new Feedback({
        ideaId: updatedIdea._id.toString(),
        ideaTitle: updatedIdea.title,
        leaderName: updatedIdea.leader.name,
        projectName: normalizedProjectName,
        groupId: updatedIdea.groupId,
        feedback: feedback.trim(),
        status: status,
        teacherName: teacherName || 'Teacher',
        timestamp: new Date()
      });

      await newFeedback.save();
      console.log('✅ [Teacher Dashboard] Feedback saved successfully');
    }

    // Create or refresh the student notification when idea is reviewed
    if (status === 'Accepted' || status === 'Rejected') {
      console.log('📝 [Teacher Dashboard] Creating notification with leaderName:', updatedIdea.leader.name);
      console.log('📝 [Teacher Dashboard] Notification projectName:', updatedIdea.projectName || updatedIdea.title);
      await upsertNotification({
        ideaId: updatedIdea._id,
        recipient: 'student',
        event: 'idea_review',
        title: updatedIdea.title,
        leaderName: updatedIdea.leader.name,
        projectName: updatedIdea.projectName || updatedIdea.title,
        groupId: updatedIdea.groupId,
        type: 'idea_review',
        status,
        submittedAt: new Date(),
        read: false
      });
      console.log('✅ [Teacher Dashboard] Notification created for idea review:', status);
    }

    console.log('✅ [Teacher Dashboard] Idea reviewed successfully:', updatedIdea._id);
    res.status(200).json({
      success: true,
      message: 'Idea reviewed successfully',
      idea: updatedIdea
    });
  } catch (error) {
    console.error('❌ [Teacher Dashboard] Error reviewing idea:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing idea',
      error: error.message
    });
  }
};

// Send feedback to student
export const sendFeedback = async (req, res) => {
  console.log('📝 [Teacher Dashboard] Send feedback request received');
  console.log('📝 [Teacher Dashboard] Request body:', req.body);
  
  try {
    const { ideaId, ideaTitle, leaderName, feedback, teacherName, groupId: bodyGroupId } = req.body;
    const projectName = (req.body.projectName || '').trim();
    console.log('📝 [Teacher Dashboard] Feedback projectName:', projectName);

    if (!projectName) {
      console.warn('⚠️ [Teacher Dashboard] Missing projectName from user input');
    }

    let groupId = bodyGroupId;
    if (!groupId && ideaId) {
      const idea = await StudentIdea.findById(ideaId);
      groupId = idea?.groupId;
    }
    if (!groupId && leaderName) {
      const leader = await User.findOne({ name: leaderName });
      groupId = leader?.groupId;
    }

    const newFeedback = new Feedback({
      ideaId,
      ideaTitle,
      leaderName,
      projectName,
      groupId,
      feedback: feedback.trim(),
      status: 'Feedback Sent',
      teacherName: teacherName || 'Teacher',
      timestamp: new Date()
    });
    
    await newFeedback.save();
    console.log('✅ [Teacher Dashboard] Feedback sent successfully');

    res.status(201).json({ 
      success: true, 
      message: 'Feedback sent successfully!',
      feedback: newFeedback 
    });
  } catch (error) {
    console.error('❌ [Teacher Dashboard] Error sending feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending feedback', 
      error: error.message 
    });
  }
};
