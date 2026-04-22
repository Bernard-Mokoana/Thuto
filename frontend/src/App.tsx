import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursePublishPage from "./pages/CoursePublishPage";
import DashboardPage from "./pages/DashboardPage";
import LessonPage from "./pages/LessonPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import EmailNotificationsPage from "./pages/EmailNotificationsPage";
import PrivacySettingsPage from "./pages/PrivacySettingsPage";
import CertificatesPage from "./pages/CertificatesPage";
import ProgressPage from "./pages/ProgressPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CreateCoursePage from "./pages/CreateCoursePage";
import EditCoursePage from "./pages/EditCoursePage";
import CreateCategoryPage from "./pages/CreateCategoryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <Router
        basename={import.meta.env.BASE_URL}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <div className="min-h-screen bg-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route
                path="/lessons/:id"
                element={
                  <ProtectedRoute allowedRoles={["Student"]}>
                    <LessonPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/new"
                element={
                  <ProtectedRoute allowedRoles={["Tutor"]}>
                    <CreateCoursePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id/publish"
                element={
                  <ProtectedRoute allowedRoles={["Tutor", "Admin"]}>
                    <CoursePublishPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["Tutor", "Admin"]}>
                    <EditCoursePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/new"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <CreateCategoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificates"
                element={
                  <ProtectedRoute allowedRoles={["Student"]}>
                    <CertificatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute allowedRoles={["Student"]}>
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Student"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Tutor"]}>
                    <TutorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/notifications"
                element={
                  <ProtectedRoute>
                    <EmailNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/privacy"
                element={
                  <ProtectedRoute>
                    <PrivacySettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
