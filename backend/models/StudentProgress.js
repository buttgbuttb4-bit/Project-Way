import mongoose from "mongoose";

const studentProgressSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    index: true
  },
  projectName: {
    type: String,
    required: true
  },
  leaderName: {
    type: String,
    required: true
  },
  members: [{
    type: String
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tasks: [{
    title: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    dueDate: {
      type: Date
    }
  }],
  milestones: {
    current: {
      type: String,
      default: 'Planning'
    },
    next: {
      type: String,
      default: 'Development'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);

export default StudentProgress;
