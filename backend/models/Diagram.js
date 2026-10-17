// models/Diagram.js
import mongoose from "mongoose";

const DiagramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Diagram",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    shapes: {
      type: Array,
      default: [],
    },
    canvasData: {
      type: Object,
      default: {},
    },
    createdBy: {
      type: String,
      default: "anonymous",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    // Keep original fields for compatibility
    userId: {
      type: String,
      required: false,
    },
    projectId: {
      type: String,
      required: false,
    },
    diagramData: {
      type: Object, // { nodes: [...], edges: [...] }
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for diagram's URL
DiagramSchema.virtual("url").get(function () {
  return `/diagrams/${this._id}`;
});

// Index for better search performance
DiagramSchema.index({ title: "text", description: "text" });
DiagramSchema.index({ createdBy: 1 });
DiagramSchema.index({ userId: 1 });
DiagramSchema.index({ createdAt: -1 });
DiagramSchema.index({ tags: 1 });

// Pre-save middleware
DiagramSchema.pre("save", function (next) {
  if (this.isModified("shapes") && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Static method to find public diagrams
DiagramSchema.statics.findPublic = function () {
  return this.find({ isPublic: true }).sort({ createdAt: -1 });
};

// Static method to search diagrams
DiagramSchema.statics.searchDiagrams = function (query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $in: [new RegExp(query, "i")] } },
    ],
  }).sort({ createdAt: -1 });
};

// Instance method to check if user can edit
DiagramSchema.methods.canEdit = function (userId) {
  return this.createdBy === userId || this.isPublic;
};

const Diagram = mongoose.model("Diagram", DiagramSchema);

export default Diagram;