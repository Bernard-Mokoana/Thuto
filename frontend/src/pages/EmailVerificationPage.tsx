import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        if (response.status === 200) {
          setStatus("success");
          setMessage("Your email has been verified successfully! You can now log in.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "An error occurred during verification."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 max-w-md w-full bg-white rounded-lg shadow-md text-center">
        {status === "verifying" && (
          <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        <h1
          className={`text-2xl font-bold mb-4 ${
            status === "success" ? "text-green-500" : ""
          } ${status === "error" ? "text-red-500" : ""}`}
        >
          {status === "verifying" && "Verifying Email"}
          {status === "success" && "Verification Successful"}
          {status === "error" && "Verification Failed"}
        </h1>
        <p className="text-gray-700">{message}</p>
        {status === "success" && (
          <Link
            to="/login"
            className="mt-6 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
