import Task from '../models/Task.js';

// Create a new task
export const createTask = async (req, res) => {
  console.log('✅ [Tasks] Create task request received');
  console.log('✅ [Tasks] Request body:', req.body);
  
  try {
    const { name, assignedTo, deadline, projectName, leaderName, groupId } = req.body;

    console.log('✅ [Tasks] Creating new task...');
    const newTask = new Task({
      id: Date.now().toString(),
      name,
      assignedTo,
      deadline: deadline || 'TBD',
      status: 'Pending',
      projectName,
      leaderName,
      groupId
    });

    const savedTask = await newTask.save();
    console.log('✅ [Tasks] Task created successfully:', savedTask.name);

    res.status(201).json({ 
      success: true, 
      message: 'Task created successfully!',
      task: savedTask 
    });
  } catch (error) {
    console.error('❌ [Tasks] Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating task', 
      error: error.message 
    });
  }
};





// Get tasks by groupId
export const getTasksByGroupId = async (req, res) => {
  console.log('✅ [Tasks] Get tasks by groupId request received');
  console.log('✅ [Tasks] Group ID:', req.params.groupId);
  
  try {
    const { groupId } = req.params;
    
    if (!groupId) {
      console.log('⚠️ [Tasks] Missing groupId in request');
      return res.status(400).json({ 
        success: false, 
        message: 'groupId is required' 
      });
    }
    
    const tasks = await Task.find({ groupId }).sort({ createdAt: -1 });
    console.log('✅ [Tasks] Retrieved', tasks.length, 'tasks for groupId:', groupId);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('❌ [Tasks] Error fetching tasks by groupId:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
};

// Toggle task status
export const toggleTaskStatus = async (req, res) => {
  console.log('✅ [Tasks] Toggle task status request received');
  console.log('✅ [Tasks] Task ID:', req.params.id);
  
  try {
    const { id } = req.params;
    const task = await Task.findOne({ id });

    if (!task) {
      console.log('⚠️ [Tasks] Task not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const oldStatus = task.status;
    task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
    const updatedTask = await task.save();
    console.log('✅ [Tasks] Task status updated:', oldStatus, '->', updatedTask.status);

    res.status(200).json({ 
      success: true, 
      message: 'Task status updated successfully',
      task: updatedTask 
    });
  } catch (error) {
    console.error('❌ [Tasks] Error toggling task status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling task status', 
      error: error.message 
    });
  }
};




