import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
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
  leaderPassword: {
    type: String,
    required: true
  },
  members: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
