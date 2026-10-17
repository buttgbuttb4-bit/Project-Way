import mongoose from "mongoose";

const studentIssueSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Guidance', 'Resource', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  groupId: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Replied', 'Resolved'],
    default: 'Pending'
  },
  teacherReply: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const StudentIssue = mongoose.model('StudentIssue', studentIssueSchema);

export default StudentIssue;
