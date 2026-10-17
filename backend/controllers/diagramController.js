// controllers/diagramController.js
import Diagram from "../models/Diagram.js";

// POST: create or update diagram
export const saveDiagram = async (req, res) => {
  try {
    console.log("Saving diagram with data:", req.body);

    const {
      userId,
      diagramData,
      title,
      description,
      shapes,
      id,
      diagramId,
    } = req.body;

    const existingId = id || diagramId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId (login user id) is required",
      });
    }

    let diagram = null;
    if (existingId) {
      diagram = await Diagram.findById(existingId);
      const isOwner =
        !diagram ||
        !diagram.userId ||
        diagram.userId === userId;
      if (diagram && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own diagrams",
        });
      }
    }

    if (diagram) {
      if (diagramData) diagram.diagramData = diagramData;
      if (shapes) diagram.shapes = shapes;
      if (description) diagram.description = description;
      if (title) diagram.title = title;
      diagram.userId = userId;
      diagram.createdBy = userId;
      diagram.updatedAt = new Date();
      await diagram.save();
      console.log("Diagram updated:", diagram._id);
    } else {
      diagram = await Diagram.create({
        userId,
        diagramData,
        title: title || "Untitled Diagram",
        description: description || "",
        shapes: shapes || [],
        createdBy: userId,
      });
      console.log("Diagram created:", diagram._id);
    }

    res.status(200).json({
      success: true,
      message: "Diagram saved successfully",
      data: diagram,
    });
  } catch (err) {
    console.error("Error saving diagram:", err);
    res.status(500).json({
      success: false,
      message: "Server error saving diagram",
      error: err.message,
    });
  }
};

// GET: get one diagram
export const getDiagram = async (req, res) => {
  try {
    console.log(" Fetching diagram with params:", req.params);

    const { userId, id } = req.params;

    let diagram;
    if (id) {
      diagram = await Diagram.findById(id);
    } else if (userId) {
      diagram = await Diagram.findOne({ userId }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({
        success: false,
        message: "Either diagram id or userId (login user id) is required",
      });
    }

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: "Diagram not found",
      });
    }

    console.log(" Diagram found:", diagram._id);
    res.status(200).json({
      success: true,
      message: "Diagram retrieved successfully",
      data: diagram,
    });
  } catch (err) {
    console.error(" Error fetching diagram:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching diagram",
      error: err.message,
    });
  }
};

// GET: get all diagrams for a specific user
export const getAllDiagrams = async (req, res) => {
  try {
    console.log(" Fetching all diagrams...");

    const { userId } = req.query;

    let diagrams;
    if (userId) {
      // Only return diagrams for the specific user
      diagrams = await Diagram.find({ userId }).sort({ createdAt: -1 });
    } else {
      // If no userId provided, return all (legacy behavior)
      diagrams = await Diagram.find().sort({ createdAt: -1 });
    }

    console.log(` Found ${diagrams.length} diagrams`);

    res.status(200).json({
      success: true,
      message: "Diagrams retrieved successfully",
      data: diagrams,
    });
  } catch (err) {
    console.error(" Error fetching diagrams:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching diagrams",
      error: err.message,
    });
  }
};

// PUT: update diagram
export const updateDiagram = async (req, res) => {
  try {
    console.log("Updating diagram with ID:", req.params.id);

    const { id } = req.params;
    const { projectId, diagramId, id: bodyId, ...updates } = req.body;

    const existing = await Diagram.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Diagram not found",
      });
    }
    const isOwner =
      !existing.userId ||
      existing.userId === updates.userId;
    if (updates.userId && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own diagrams",
      });
    }

    const diagram = await Diagram.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: "Diagram not found",
      });
    }

    console.log("Diagram updated:", diagram._id);
    res.status(200).json({
      success: true,
      message: "Diagram updated successfully",
      data: diagram,
    });
  } catch (err) {
    console.error("Error updating diagram:", err);
    res.status(500).json({
      success: false,
      message: "Server error updating diagram",
      error: err.message,
    });
  }
};

