import StudentIdea from '../models/StudentIdea.js';
import Group from '../models/Group.js';
import { User } from '../models/User.js';
import { upsertNotification } from '../utils/notificationUtils.js';

// Get ideas by groupId
export const getIdeasByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;
    const ideas = await StudentIdea.find({ groupId }).sort({ createdAt: -1 });
    res.json({ success: true, ideas });
  } catch (error) {
    console.error('Error fetching ideas by groupId:', error);
    res.status(500).json({ success: false, message: 'Error fetching ideas by groupId', error: error.message });
  }
};

// Submit a new student idea
export const submitIdea = async (req, res) => {
  console.log('📝 [Student Ideas] Submit idea request received');
  console.log('📝 [Student Ideas] Request body:', req.body);
  
  try {
    const { title, session, leaderName, description, members, projectName } = req.body;
    const groupName = (projectName || title || '').trim();
    console.log('📝 [Student Ideas] Normalized projectName:', groupName);

    console.log('📝 [Student Ideas] Checking for duplicate ideas...');
    console.log('📝 [Student Ideas] Submitted title:', title);
    console.log('📝 [Student Ideas] Submitted description:', description);
    
    // Get leader's groupId first for duplicate check
    const leaderUser = await User.findOne({ name: leaderName });
    const currentGroupId = leaderUser?.groupId;
    console.log('📝 [Student Ideas] Current groupId:', currentGroupId);
    
    // Check for duplicate submissions using exact string comparison
    const existingIdea = await StudentIdea.findOne({
      title: title,
      fullDescription: description
    });

    console.log('📝 [Student Ideas] Existing idea found:', existingIdea ? 'YES' : 'NO');
    if (existingIdea) {
      console.log('⚠️ [Student Ideas] Duplicate idea found:');
      console.log('  - Title:', existingIdea.title);
      console.log('  - Description:', existingIdea.fullDescription);
      console.log('  - GroupId:', existingIdea.groupId);
      
      if (existingIdea.groupId === currentGroupId) {
        console.log('⚠️ [Student Ideas] Same group resubmitting identical idea');
        return res.status(400).json({ 
          success: false, 
          message: 'Already submitted' 
        });
      } else {
        console.log('⚠️ [Student Ideas] Different group submitting same idea');
        return res.status(400).json({ 
          success: false, 
          message: 'Already submitted by other group' 
        });
      }
    }

    // Reuse existing groupId for the leader's group, or create a new one
    let groupId = currentGroupId;

    // Check if any member already belongs to a different group
    for (const member of members) {
      const memberUser = await User.findOne({ name: member });
      const memberGroupId = memberUser?.groupId;
      
      if (memberGroupId && memberGroupId !== currentGroupId) {
        // Member belongs to a different group than the leader
        console.log('⚠️ [Student Ideas] Member belongs to different group:', member, 'memberGroupId:', memberGroupId, 'currentGroupId:', currentGroupId);
        return res.status(400).json({
          success: false,
          message: 'You cannot submit ideas for another group.'
        });
      }
    }

    if (groupId) {
      console.log('📝 [Student Ideas] Reusing existing groupId:', groupId);
    } else {
      groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('📝 [Student Ideas] Creating new group with groupId:', groupId);
    }

    console.log('📝 [Student Ideas] Creating new idea...');
    const newIdea = new StudentIdea({
      title,
      projectName: groupName,
      session,
      leader: { name: leaderName },
      shortDescription: description.substring(0, 100) + '...',
      fullDescription: description,
      team: members.map(name => ({ name })),
      groupId,
      status: 'Pending'
    });

    const savedIdea = await newIdea.save();
    console.log('✅ [Student Ideas] Idea saved successfully:', savedIdea._id);
    console.log('📝 [Student Ideas] Saved idea projectName:', savedIdea.projectName);

    // Create or update group record
    await Group.findOneAndUpdate(
      { groupId },
      {
        groupId,
        projectName: groupName,
        leaderName,
        members: members.map(name => ({ name }))
      },
      { upsert: true, new: true }
    );
    console.log('✅ [Student Ideas] Group record saved:', groupId);

    // Update leader's groupId
    await User.findOneAndUpdate({ name: leaderName }, { groupId });
    console.log('✅ [Student Ideas] Leader groupId updated:', leaderName);

    // Update members' groupId
    for (const member of members) {
      await User.findOneAndUpdate({ name: member }, { groupId });
      console.log('✅ [Student Ideas] Member groupId updated:', member);
    }

    // Create or refresh the teacher notification for this idea
    console.log('📝 [Student Ideas] Creating notification for teacher...');
    await upsertNotification({
      ideaId: savedIdea._id,
      recipient: 'teacher',
      event: 'idea_submission',
      title: savedIdea.title,
      leaderName: savedIdea.leader.name,
      projectName: savedIdea.projectName,
      groupId,
      type: 'idea_submission',
      status: 'Pending',
      submittedAt: savedIdea.submittedAt,
      read: false
    });
    console.log('✅ [Student Ideas] Notification created successfully for teacher');

    res.status(201).json({ 
      success: true, 
      message: 'Project idea submitted successfully!',
      idea: savedIdea,
      groupId
    });
  } catch (error) {
    console.error('❌ [Student Ideas] Error submitting idea:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting idea', 
      error: error.message 
    });
  }
};

// Get all student ideas
export const getAllIdeas = async (req, res) => {
  console.log('📝 [Student Ideas] Get all ideas request received');
  console.log('📝 [Student Ideas] Query params:', req.query);
  
  try {
    const { projectName } = req.query;
    const query = projectName ? { $or: [{ projectName }, { title: projectName }] } : {};
    console.log('📝 [Student Ideas] MongoDB query:', JSON.stringify(query));
    const ideas = await StudentIdea.find(query).sort({ submittedAt: -1 });
    console.log('✅ [Student Ideas] Retrieved', ideas.length, 'ideas');
    res.status(200).json({ success: true, ideas });
  } catch (error) {
    console.error('❌ [Student Ideas] Error fetching ideas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching ideas', 
      error: error.message 
    });
  }
};







// Get idea statistics by group ID
export const getIdeaStatsByGroup = async (req, res) => {
  console.log('📝 [Student Ideas] Get idea statistics by group request received');
  console.log('📝 [Student Ideas] Group ID:', req.params.groupId);

  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required'
      });
    }

    const query = { groupId };
    const submitted = await StudentIdea.countDocuments(query);
    const approved = await StudentIdea.countDocuments({ ...query, status: 'Accepted' });

    console.log('📊 [Student Ideas] Group statistics - Submitted:', submitted, 'Approved:', approved);
    res.status(200).json({
      success: true,
      stats: { submitted, approved },
      groupId
    });
  } catch (error) {
    console.error('❌ [Student Ideas] Error fetching idea stats by group:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching idea stats by group',
      error: error.message
    });
  }
};

// Get first idea by group ID (for validation)
export const getFirstIdeaByGroup = async (req, res) => {
  console.log('📝 [Student Ideas] Get first idea by group request received');
  console.log('📝 [Student Ideas] Group ID:', req.params.groupId);

  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required'
      });
    }

    const firstIdea = await StudentIdea.findOne({ groupId }).sort({ submittedAt: 1 });

    if (!firstIdea) {
      console.log('⚠️ [Student Ideas] No ideas found for group:', groupId);
      return res.status(404).json({
        success: false,
        message: 'No ideas found for this group'
      });
    }

    console.log('✅ [Student Ideas] First idea retrieved for group:', groupId);
    res.status(200).json({
      success: true,
      idea: {
        leaderName: firstIdea.leader.name,
        members: firstIdea.team.map(t => t.name)
      }
    });
  } catch (error) {
    console.error('❌ [Student Ideas] Error fetching first idea by group:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching first idea by group',
      error: error.message
    });
  }
};
