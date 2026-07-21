import { certificate } from "../model/certification.ts";
import { learningModule } from "../model/learningModule.ts";
import { learningLesson } from "../model/learningLesson.ts";
import { userProgress } from "../model/userProgress.ts";

export const generateCertificate = async (req, res) => {
  const { userId, courseId, pathId } = req.params;
  const resolvedPathId = pathId || courseId;

  try {
    const modules = await learningModule.find({ path: resolvedPathId }).select("_id");
    const lessons = await learningLesson
      .find({ module: { $in: modules.map((module) => module._id) }, isPublished: true })
      .select("_id");

    if (lessons.length === 0) {
      return res.status(404).json({ message: "Lessons are not found" });
    }

    const progress = await userProgress.find({
      student: userId,
      lesson: { $in: lessons.map((lesson) => lesson._id) },
      status: "completed",
    });

    const hasCompletedAll = progress.length >= lessons.length;
    if (!hasCompletedAll) {
      return res.status(400).json({
        message: "Path not completed yet",
      });
    }

    const average =
      progress.reduce((sum, item) => sum + (item.score || 0), 0) / progress.length;

    const existingCertificate = await certificate.findOne({
      path: resolvedPathId,
      student: userId,
    });

    if (existingCertificate) {
      return res.status(200).json({
        message: "Certificate already exists",
        Certificate: existingCertificate,
      });
    }

    const Certificate = await certificate.create({
      student: userId,
      path: resolvedPathId,
      grade: average,
    });

    return res.status(200).json({ message: "Certificate generated", Certificate });
  } catch (error) {
    return res.status(500).json({
      message: "Error generating certificate",
      error: error.message,
    });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const { userId } = req.params;
    const Certificate = await certificate
      .find({ student: userId })
      .populate("path", "title")
      .sort({ issuedAt: -1 });

    return res.status(200).json({
      message: "Certificate fetched successfully",
      Certificate,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch certificate",
      error: error.message,
    });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const Certificate = await certificate.findByIdAndDelete(req.params.id);
    if (!Certificate) return res.status(404).json({ message: "Certificate not found" });

    return res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting certificate",
      error: error.message,
    });
  }
};
