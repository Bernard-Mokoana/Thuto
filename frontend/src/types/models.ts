export type UserRole = "Student" | "Tutor" | "Admin";

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
}

export interface TutorProfile {
  _id?: string;
  firstName: string;
  lastName: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  duration: number;
  thumbnail?: string;
  category?: {
    _id?: string;
    name: string;
  };
  tutor?: TutorProfile;
  isPublished: boolean;
  createdAt?: string;
  enrollmentCount?: number;
  revenue?: number;
  requirements?: string[];
  learningOutcomes?: string[];
  tags?: string[];
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  duration?: number;
  materials?: string[];
}

export interface EnrollmentProgress {
  lesson: string;
  completed: boolean;
  completedAt?: string;
}

export interface Enrollment {
  _id: string;
  course: Pick<
    Course,
    "_id" | "title" | "description" | "thumbnail" | "duration" | "level"
  >;
  progress: EnrollmentProgress[];
  enrolledAt: string;
  certificateUrl?: string;
}
