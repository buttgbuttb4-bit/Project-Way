import StudentProgress from '../models/StudentProgress.js';
import StudentIdea from '../models/StudentIdea.js';

// Get all student progress data
export const getAllStudentProgress = async (req, res) => {
  console.log('📊 [Teacher Progress] Get all student progress request received');
  console.log('📊 [Teacher Progress] Query params:', req.query);
  
  try {
    const { projectName } = req.query;
    const query = projectName ? { projectName } : {};
    const progressData = await StudentProgress.find(query).sort({ lastUpdated: -1 });
    console.log('✅ [Teacher Progress] Retrieved', progressData.length, 'progress records');
    res.status(200).json({ success: true, progressData });
  } catch (error) {
    console.error('❌ [Teacher Progress] Error fetching progress data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching progress data', 
      error: error.message 
    });
  }
};

// Get active projects (accepted ideas) with their progress
export const getActiveProjectsProgress = async (req, res) => {
  console.log('📊 [Teacher Progress] Get active projects progress request received');
  
  try {
    const acceptedIdeas = await StudentIdea.find({ status: 'Accepted' }).sort({ submittedAt: -1 });
    
    // Get progress data for each accepted project
    const projectsWithProgress = await Promise.all(
      acceptedIdeas.map(async (idea) => {
        const progress = await StudentProgress.findOne({ projectName: idea.title });
        return {
          idea,
          progress: progress || null
        };
      })
    );

    console.log('✅ [Teacher Progress] Retrieved', projectsWithProgress.length, 'active projects');
    res.status(200).json({ success: true, projects: projectsWithProgress });
  } catch (error) {
    console.error('❌ [Teacher Progress] Error fetching active projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching active projects', 
      error: error.message 
    });
  }
};

// Update student progress (for students to update their progress)
export const updateStudentProgress = async (req, res) => {
  console.log('📊 [Teacher Progress] Update student progress request received');
  console.log('📊 [Teacher Progress] Request body:', req.body);
  
  try {
    const { groupId, projectName, leaderName, members, progress, tasks, milestones } = req.body;

    if (!groupId) {
      console.log('⚠️ [Teacher Progress] Missing groupId in request');
      return res.status(400).json({ 
        success: false, 
        message: 'groupId is required' 
      });
    }

    let updatedProgress;
    
    // Check if progress record exists by groupId
    const existingProgress = await StudentProgress.findOne({ groupId });
    
    if (existingProgress) {
      // Update existing record
      updatedProgress = await StudentProgress.findOneAndUpdate(
        { groupId },
        { 
          projectName,
          leaderName,
          members,
          progress,
          tasks,
          milestones,
          lastUpdated: new Date()
        },
        { new: true }
      );
    } else {
      // Create new record
      const newProgress = new StudentProgress({
        groupId,
        projectName,
        leaderName,
        members,
        progress,
        tasks,
        milestones,
        lastUpdated: new Date()
      });
      updatedProgress = await newProgress.save();
    }

    console.log('✅ [Teacher Progress] Progress updated successfully for groupId:', groupId);
    res.status(200).json({ 
      success: true, 
      message: 'Progress updated successfully',
      progress: updatedProgress 
    });
  } catch (error) {
    console.error('❌ [Teacher Progress] Error updating progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating progress', 
      error: error.message 
    });
  }
};


