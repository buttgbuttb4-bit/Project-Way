import Team from '../models/Team.js';
import Group from '../models/Group.js';

// Create or update a team
export const saveTeam = async (req, res) => {
  console.log('👥 [Teams] Save team request received');
  console.log('👥 [Teams] Request body:', req.body);
  
  try {
    const { groupId, projectName, leaderName, leaderPassword, members } = req.body;

    if (!groupId) {
      console.log('⚠️ [Teams] Missing groupId in request');
      return res.status(400).json({ 
        success: false, 
        message: 'groupId is required' 
      });
    }

    console.log('👥 [Teams] Checking if team exists for groupId:', groupId);
    // Check if team already exists for this groupId
    const existingTeam = await Team.findOne({ groupId });
    
    if (existingTeam) {
      console.log('👥 [Teams] Updating existing team...');
      // Update existing team
      existingTeam.projectName = projectName;
      existingTeam.leaderName = leaderName;
      existingTeam.leaderPassword = leaderPassword;
      existingTeam.members = members;
      const updatedTeam = await existingTeam.save();
      console.log('✅ [Teams] Team updated successfully for groupId:', groupId);

      res.status(200).json({ 
        success: true, 
        message: 'Team updated successfully!',
        team: updatedTeam 
      });
    } else {
      console.log('👥 [Teams] Creating new team...');
      // Create new team
      const newTeam = new Team({
        groupId,
        projectName,
        leaderName,
        leaderPassword,
        members
      });

      const savedTeam = await newTeam.save();
      console.log('✅ [Teams] Team created successfully for groupId:', groupId);

      res.status(201).json({ 
        success: true, 
        message: 'Team created successfully!',
        team: savedTeam 
      });
    }
  } catch (error) {
    console.error('❌ [Teams] Error saving team:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving team', 
      error: error.message 
    });
  }
};



// Get team by groupId
export const getTeamByGroupId = async (req, res) => {
  console.log('👥 [Teams] Get team by groupId request received');
  console.log('👥 [Teams] Group ID:', req.params.groupId);
  
  try {
    const { groupId } = req.params;
    const team = await Team.findOne({ groupId });

    if (!team) {
      console.log('⚠️ [Teams] Team not found for groupId:', groupId);
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }

    console.log('✅ [Teams] Team retrieved successfully for groupId:', groupId);
    res.status(200).json({ success: true, team });
  } catch (error) {
    console.error('❌ [Teams] Error fetching team by groupId:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team', 
      error: error.message 
    });
  }
};







// Get group data by groupId
export const getGroupByGroupId = async (req, res) => {
  console.log('👥 [Groups] Get group by groupId request received');
  console.log('👥 [Groups] Group ID:', req.params.groupId);
  
  try {
    const { groupId } = req.params;
    const group = await Group.findOne({ groupId });

    if (!group) {
      console.log('⚠️ [Groups] Group not found for groupId:', groupId);
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    console.log('✅ [Groups] Group retrieved successfully for groupId:', groupId);
    res.status(200).json({ 
      success: true, 
      group: {
        groupId: group.groupId,
        projectName: group.projectName,
        leaderName: group.leaderName,
        members: group.members.map(m => m.name)
      }
    });
  } catch (error) {
    console.error('❌ [Groups] Error fetching group by groupId:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching group', 
      error: error.message 
    });
  }
};
