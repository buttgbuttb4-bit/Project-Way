import StudentIssue from '../models/StudentIssue.js';
import { User } from '../models/User.js';

// Submit a new student issue
export const submitIssue = async (req, res) => {
  console.log('📋 [Teacher Issues] Submit issue request received');
  console.log('📋 [Teacher Issues] Request body:', req.body);
  
  try {
    const { category, description, studentName, projectName } = req.body;
    const user = studentName ? await User.findOne({ name: studentName.trim() }) : null;
    const groupId = user?.groupId;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'You must submit an idea before reporting an issue.'
      });
    }

    const newIssue = new StudentIssue({
      id: Date.now().toString(),
      category,
      description,
      studentName,
      projectName,
      groupId,
      status: 'Pending'
    });

    const savedIssue = await newIssue.save();
    console.log('✅ [Teacher Issues] Issue submitted successfully:', savedIssue.id);

    res.status(201).json({ 
      success: true, 
      message: 'Issue submitted successfully!',
      issue: savedIssue 
    });
  } catch (error) {
    console.error('❌ [Teacher Issues] Error submitting issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting issue', 
      error: error.message 
    });
  }
};

// Get all student issues
export const getAllIssues = async (req, res) => {
  console.log('📋 [Teacher Issues] Get all issues request received');
  console.log('📋 [Teacher Issues] Query params:', req.query);

  try {
    const { projectName, studentName, groupId, userName } = req.query;
    const query = {};
    
    if (groupId) {
      // Student or teacher filtering by groupId
      query.groupId = groupId.trim();
    } else if (studentName) {
      // Teacher filtering by studentName
      query.studentName = studentName.trim();
    } else if (projectName) {
      // Teacher filtering by projectName
      query.projectName = projectName.trim();
    }
    // If no parameters, teacher viewing all issues (query = {})
    
    const issues = await StudentIssue.find(query).sort({ timestamp: -1 });
    
    // Add per-user read status to each issue
    const issuesWithReadStatus = issues.map(issue => ({
      ...issue.toObject(),
      isRead: userName ? issue.readBy.includes(userName) : false
    }));
    
    console.log('✅ [Teacher Issues] Retrieved', issues.length, 'issues');
    res.status(200).json({ success: true, issues: issuesWithReadStatus });
  } catch (error) {
    console.error('❌ [Teacher Issues] Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
};

// Reply to student issue
export const replyToIssue = async (req, res) => {
  console.log('📋 [Teacher Issues] Reply to issue request received');
  console.log('📋 [Teacher Issues] Issue ID:', req.params.id);
  console.log('📋 [Teacher Issues] Reply:', req.body.reply);
  
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const updatedIssue = await StudentIssue.findOneAndUpdate(
      { id },
      { 
        teacherReply: reply,
        status: 'Replied'
      },
      { new: true }
    );

    if (!updatedIssue) {
      console.log('⚠️ [Teacher Issues] Issue not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    console.log('✅ [Teacher Issues] Reply sent successfully:', id);
    res.status(200).json({ 
      success: true, 
      message: 'Reply sent successfully',
      issue: updatedIssue 
    });
  } catch (error) {
    console.error('❌ [Teacher Issues] Error replying to issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error replying to issue', 
      error: error.message 
    });
  }
};

// Mark issue as read
export const markIssueAsRead = async (req, res) => {
  console.log('📋 [Teacher Issues] Mark issue as read request received');
  console.log('📋 [Teacher Issues] Issue ID:', req.params.id);
  console.log('📋 [Teacher Issues] User:', req.body.userName);
  
  try {
    const { id } = req.params;
    const { userName } = req.body;
    
    if (!userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'userName is required' 
      });
    }
    
    const issue = await StudentIssue.findByIdAndUpdate(
      id,
      { 
        $addToSet: { readBy: userName },
        read: true 
      },
      { new: true }
    );

    if (!issue) {
      console.log('⚠️ [Teacher Issues] Issue not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    console.log('✅ [Teacher Issues] Issue marked as read for user:', userName);
    res.status(200).json({ 
      success: true, 
      message: 'Issue marked as read',
      issue 
    });
  } catch (error) {
    console.error('❌ [Teacher Issues] Error marking issue as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking issue as read', 
      error: error.message 
    });
  }
};
