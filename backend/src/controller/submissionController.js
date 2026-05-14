import { submission } from "../model/submission.js";

export const createSubmission = async (req, res) => {
  try {
    const Submission = new submission(req.body);
    await Submission.save();
    return res.status(201).json(Submission);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getSubmissionByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const Submission = await submission
      .find({ lesson: lessonId })
      .populate("user", "firstName lastName email")
      .sort("-submittedAt");

    return res
      .status(200)
      .json({ message: "Submissions fetched successfully", Submission });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching submissions", error: error.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const Submission = await submission
      .find(req.params.id)
      .populate("user", "firstName lastName email");
    if (!Submission)
      return res.status(404).json({ message: "Submission not found" });
    return res
      .status(200)
      .json({ message: "Submission fetched successfully", Submission });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch the submission",
      error: error.message,
    });
  }
};

export const updateSubmissionGrade = async (req, res) => {
  try {
    const { grade } = req.body;
    const Submission = await submission.findByIdAndUpdate(
      req.params.id,
      { grade },
      { new: true }
    );
    if (!Submission)
      return res.status(404).json({ message: "Submission not found " });
    return res
      .status(200)
      .json({ message: "Submission grade updated successfully", Submission });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const Submission = submission.findByIdAndDelete(req.params.id);
    if (!Submission)
      return res.status(404).json({ message: "Submission not found" });

    return res.status(200).json({ message: "Submission deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete submission", error: error.message });
  }
};
