import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  ideaId: {
    type: String,
    required: true
  },
  ideaTitle: {
    type: String,
    required: true
  },
  leaderName: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    trim: true,
    default: ''
  },
  groupId: {
    type: String
  },
  feedback: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Rejected', 'Feedback Sent'],
    default: 'Feedback Sent'
  },
  teacherName: {
    type: String,
    required: true
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

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
