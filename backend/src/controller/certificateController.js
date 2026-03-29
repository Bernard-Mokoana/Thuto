import { certificate } from "../model/certification.js";
import { submission } from "../model/submission.js";
import { lessons } from "../model/lessons.js";

export const generateCertificate = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const existingLessons = await lessons.find({ course: courseId });
    if (!existingLessons)
      return res.status(404).json({ message: "Lessons are not found" });
    const lessonIds = existingLessons.map((l) => l._id.toString());

    const existingSubmissions = await submission.find({
      student: userId,
      lesson: { $in: lessonIds },
    });
    if (!existingSubmissions)
      return res.status(404).json({ message: "Submissions not found" });

    const passedLessons = existingSubmissions
      .filter((s) => s.isPassed)
      .map((s) => s.lesson.toString());

    const hasCompletedAll = lessonIds.every((id) => passedLessons.includes(id));
    if (!hasCompletedAll)
      return res.status(400).json({
        message: "course not completed or not all lessons are passed",
      });

    let average = 0;
    if (existingSubmissions.length > 0) {
      const totalGrade = existingSubmissions.reduce(
        (sum, s) => sum + (s.grade || 0),
        0
      );
      average = totalGrade / existingSubmissions.length;
    }

    const existingCertificate = await certificate.findOne({
      course: courseId,
      student: userId,
    });

    const Certificate = await certificate.create({
      student: userId,
      course: courseId,
      grade: average,
    });

    return res
      .status(200)
      .json({ message: "Certificate generated", Certificate });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error generating certificate", error: error.message });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const { userId } = req.params;
    const Certificate = await certificate
      .find({ student: userId })
      .populate("course", "title")
      .sort({ issuedAt: -1 });
    if (!Certificate)
      return res.status(404).json({ message: "Certificate not found" });

    return res
      .status(200)
      .json({ message: "Certificate fetched successfully", Certificate });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch certificate", error: error.message });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const Certificate = await certificate.findByIdAndDelete(req.params.id);
    if (!Certificate)
      return res.status(404).json({ message: "Certificate not found" });

    return res
      .status(200)
      .json({ message: "Certificate deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting the message", error: error.message });
  }
};
