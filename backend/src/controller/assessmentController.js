import { assessment } from "../model/assessment.js";

export const createAssessment = async (req, res) => {
  try {
    const { lesson, questions, type } = req.body;

    if (!lesson || !questions || !type || !Array.isArray(questions))
      return res
        .status(400)
        .json({ message: "Lesson Id and questions are required" });

    const newAssessment = await assessment.create({
      lesson,
      questions,
      type: type || "quiz",
    });

    return res.status(201).json({
      message: "Assessment created successfully",
      assessment: newAssessment,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create assessment", error: error.message });
  }
};

export const getAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const foundAssessment = await assessment.findById(id).populate("lesson");

    if (!foundAssessment)
      return res.status(404).json({ message: "Assessment not found" });

    return res.status(200).json({
      message: "Assessment retrieved successfully",
      assessment: foundAssessment,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch assessment", error: error.message });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions, type } = req.body;

    if (questions && !Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions must be an array" });
    }

    const updatedAssessment = await assessment
      .findByIdAndUpdate(
        id,
        { questions, type },
        {
          new: true,
          isValidators: true,
        }
      )
      .lean();

    if (!updatedAssessment)
      return res.status(404).json({ message: "Assessment not found" });

    return res.status(200).json({
      message: "Assessment updated successfully",
      assessment: updatedAssessment,
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    return res
      .status(500)
      .json({ message: "Failed to update assessment", error: error.message });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteAssessment = await assessment.findByIdAndDelete(id);

    if (!deleteAssessment)
      return res.status(404).json({ message: "Assessment not found" });

    return res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting the assessment" });
  }
};

export const getAssessmentByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const assessments = await assessment
      .find({ lesson: lessonId })
      .populate("lesson");

    return res.status(200).json({
      message: "Assessment retrieved successfully",
      assessments,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch assessment", error: error.message });
  }
};
