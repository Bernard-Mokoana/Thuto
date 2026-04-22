import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { certificateAPI } from "../services/api";
import { useAuth } from "../contexts/useAuth";
import type { CertificateRecord } from "../types/models";

const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user?._id) {
        setCertificates([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await certificateAPI.getCertificates(user._id);
        setCertificates(response.data?.Certificate || []);
      } catch (error) {
        const message = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Failed to load certificates."
          : "Failed to load certificates.";
        setError(message);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
          <p className="text-lg text-gray-600 mt-2">
            Review the certificates you have earned across your courses.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((certificate) => {
              const issuedAt = certificate.issueAt || certificate.createdAt;

              return (
                <div
                  key={certificate._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
                >
                  <p className="text-sm text-blue-600 font-medium">Certificate</p>
                  <h2 className="text-xl font-semibold text-gray-900 mt-2">
                    {certificate.course?.title || "Course certificate"}
                  </h2>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>Grade: {Number(certificate.grade || 0).toFixed(1)}%</p>
                    <p>
                      Issued:{" "}
                      {issuedAt ? new Date(issuedAt).toLocaleDateString() : "Not available"}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Link
                      to={certificate.course?._id ? `/courses/${certificate.course._id}` : "/courses"}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View course
                    </Link>

                    {certificate.certificateUrl ? (
                      <a
                        href={certificate.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Download file not attached yet
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No certificates yet</h2>
            <p className="text-gray-600 mt-2">
              Complete your courses and pass all required lessons to earn certificates.
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
            >
              Browse courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
