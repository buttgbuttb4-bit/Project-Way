import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  leaderName: {
    type: String,
    required: true
  },
  members: [{
    name: {
      type: String,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
