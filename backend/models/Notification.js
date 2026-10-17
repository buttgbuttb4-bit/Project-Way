import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  ideaId: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  event: {
    type: String,
    enum: ['idea_submission', 'idea_review'],
    required: true
  },
  title: {
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
  readBy: {
    type: [String],
    default: []
  },
  submittedAt: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['idea_submission', 'idea_review', 'feedback', 'task_assignment'],
    default: 'idea_submission'
  },
  status: {
    type: String,
    enum: ['Accepted', 'Rejected', 'Pending'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

notificationSchema.index({ ideaId: 1, recipient: 1, event: 1 });
notificationSchema.index({ projectName: 1, recipient: 1, event: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
