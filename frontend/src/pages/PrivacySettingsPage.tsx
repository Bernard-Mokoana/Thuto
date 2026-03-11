import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivacySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [shareProfileData, setShareProfileData] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    const stored = localStorage.getItem(`userSettings:${user._id}`);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (typeof parsed.shareProfileData === 'boolean') {
        setShareProfileData(parsed.shareProfileData);
      }
    } catch {
      // Ignore malformed storage entry.
    }
  }, [user?._id]);

  const persist = (nextValue: boolean) => {
    if (!user?._id) return;
    const stored = localStorage.getItem(`userSettings:${user._id}`);
    let nextSettings = { emailNotifications: true, shareProfileData: nextValue };
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        nextSettings = {
          emailNotifications: !!parsed.emailNotifications,
          shareProfileData: nextValue,
        };
      } catch {
        // Ignore malformed storage entry.
      }
    }
    localStorage.setItem(`userSettings:${user._id}`, JSON.stringify(nextSettings));
  };

  const handleToggle = () => {
    const next = !shareProfileData;
    setShareProfileData(next);
    persist(next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
            <p className="text-lg text-gray-600 mt-2">
              Control how your profile data is shared
            </p>
          </div>
          <Link
            to="/profile"
            className="text-sm font-medium text-blue-500 hover:text-blue-600"
          >
            Back to Profile
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Share profile data</p>
            <p className="text-sm text-gray-500 mt-1">
              {shareProfileData
                ? 'Your profile data can be shared with tutors.'
                : 'Your profile data stays private.'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              shareProfileData
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {shareProfileData ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
