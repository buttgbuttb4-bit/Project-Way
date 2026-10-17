import mongoose from "mongoose";

const studentIdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  session: {
    type: String,
    required: true
  },
  leader: {
    name: {
      type: String,
      required: true
    }
  },
  shortDescription: {
    type: String,
    required: true
  },
  fullDescription: {
    type: String,
    required: true
  },
  team: [{
    name: {
      type: String,
      required: true
    }
  }],
  groupId: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
studentIdeaSchema.index({ projectName: 1, title: 1, fullDescription: 1 });

const StudentIdea = mongoose.model('StudentIdea', studentIdeaSchema);

export default StudentIdea;
