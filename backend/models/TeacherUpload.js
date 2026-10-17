import mongoose from "mongoose";

const teacherUploadSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  announcement: {
    type: String,
    default: 'No announcement'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  teacherName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const TeacherUpload = mongoose.model('TeacherUpload', teacherUploadSchema);

export default TeacherUpload;
