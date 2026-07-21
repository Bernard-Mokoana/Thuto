import type React from "react";

export type UserRole = "Student" | "Tutor" | "Admin";
export type LearningLevel = "beginner" | "intermediate" | "advanced";
export type LessonStepType =
  | "explanation"
  | "multiple_choice"
  | "fill_blank"
  | "code"
  | "matching"
  | "ordering";
export type TaskType = Exclude<LessonStepType, "explanation">;
export type PathEnrollmentStatus = "active" | "completed" | "paused";
export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type DeleteTarget =
  | { type: "user"; id: string }
  | { type: "course"; id: string }
  | null;

export type AuthPageShellProps = {
  title: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export type FormMessageProps = {
  variant: "error" | "success";
  message: string;
};

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profileImage?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string;
  sortOrder?: number;
  pathCount?: number;
  courseCount?: number;
  isActive?: boolean;
}

export type PasswordInputProps = {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export type SubmitButtonProps = {
  loading: boolean;
  label: string;
};

export type StatCardProps = {
  label: string;
  value: React.ReactNode;
};

export interface TutorProfile {
  _id?: string;
  firstName: string;
  lastName: string;
}

export type SettingsPageHeaderProps = {
  title: string;
  description: string;
};

export type ToggleSettingCardProps = {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

export interface LearningPath {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  level: LearningLevel;
  thumbnail?: string;
  estimatedMinutes: number;
  duration?: number;
  totalXp: number;
  price?: number;
  revenue?: number;
  category?: {
    _id?: string;
    name: string;
  };
  createdBy?: TutorProfile;
  tutor?: TutorProfile;
  isPublished: boolean;
  createdAt?: string;
  tags?: string[];
  outcomes?: string[];
  moduleCount?: number;
  lessonCount?: number;
  enrollmentCount?: number;
  progress?: number;
}

export interface LearningModule {
  _id: string;
  path: string;
  title: string;
  description?: string;
  order: number;
  requiredXpToUnlock?: number;
  isPublished?: boolean;
}

export interface LearningLesson {
  _id: string;
  module: string;
  title: string;
  summary?: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  isPublished?: boolean;
}

export interface Task {
  _id: string;
  step: string;
  type: TaskType;
  question: string;
  instructions?: string;
  options?: string[];
  explanation?: string;
  xpReward: number;
  maxAttempts?: number;
  sortOrder?: number;
}

export interface LessonStep {
  _id: string;
  lesson: string;
  type: LessonStepType;
  title?: string;
  prompt?: string;
  content?: string;
  order: number;
  isCheckpoint?: boolean;
  tasks?: Task[];
}

export interface PathEnrollment {
  _id: string;
  path: LearningPath;
  status: PathEnrollmentStatus;
  startedAt: string;
  completedAt?: string;
  currentLesson?: LearningLesson;
  progress?: UserProgress[];
}

export interface UserProgress {
  _id: string;
  path: string;
  module: string;
  lesson: string;
  step?: string;
  status: ProgressStatus;
  completed?: boolean;
  score: number;
  xpEarned: number;
  lastAccessedAt?: string;
  completedAt?: string;
}

export type EnrollmentProgress = UserProgress;

export interface UserGamification {
  _id?: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  hearts: number;
  dailyGoalXp: number;
}

export interface TaskAttemptResponse {
  isCorrect: boolean;
  feedback?: string;
  xpEarned: number;
  heartsRemaining?: number;
  progress?: UserProgress;
}

export interface CertificateRecord {
  _id: string;
  grade: number;
  issueAt?: string;
  createdAt?: string;
  certificateUrl?: string;
  path?: Pick<LearningPath, "_id" | "title">;
  course?: Pick<LearningPath, "_id" | "title">;
}

export interface SubmissonData {
  taskId: string;
  submittedAnswer: unknown;
}

export type Course = LearningPath;
export type Lesson = LearningLesson & {
  content?: string;
  videoUrl?: string;
  duration?: number;
  materials?: string[];
};
export type Enrollment = PathEnrollment & {
  course?: Pick<
    LearningPath,
    "_id" | "title" | "description" | "thumbnail" | "estimatedMinutes" | "level"
  > & { duration?: number };
  enrolledAt?: string;
  certificateUrl?: string;
};

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctionAnswer?: string;
  correctAnswer?: string;
}

export interface CreateAssessment {
  step: string;
  type: TaskType;
  question: string;
  options?: string[];
  correctAnswer: unknown;
  explanation?: string;
  xpReward?: number;
}

export interface Transaction {
  _id: string;
  student: string;
  course: string;
  amount: number;
  method: "eft" | "card" | "cash" | "wallet";
  status: "pending" | "success" | "failed";
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  _id: string;
  amount: number;
  status: "pending" | "success" | "failed";
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}
