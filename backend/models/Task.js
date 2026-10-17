import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String,
    required: true
  },
  deadline: {
    type: String,
    default: 'TBD'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  projectName: {
    type: String,
    required: true
  },
  leaderName: {
    type: String,
    required: true
  },
  groupId: {
    type: String
  }
}, {
  timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
