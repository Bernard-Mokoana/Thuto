import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EmailNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    const stored = localStorage.getItem(`userSettings:${user._id}`);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (typeof parsed.emailNotifications === 'boolean') {
        setEmailNotifications(parsed.emailNotifications);
      }
    } catch {
      // Ignore malformed storage entry.
    }
  }, [user?._id]);

  const persist = (nextValue: boolean) => {
    if (!user?._id) return;
    const stored = localStorage.getItem(`userSettings:${user._id}`);
    let nextSettings = { emailNotifications: nextValue, shareProfileData: false };
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        nextSettings = {
          emailNotifications: nextValue,
          shareProfileData: !!parsed.shareProfileData,
        };
      } catch {
        // Ignore malformed storage entry.
      }
    }
    localStorage.setItem(`userSettings:${user._id}`, JSON.stringify(nextSettings));
  };

  const handleToggle = () => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    persist(next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Notifications</h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage how we contact you about account updates
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
            <p className="text-sm font-medium text-gray-800">Email alerts</p>
            <p className="text-sm text-gray-500 mt-1">
              {emailNotifications
                ? 'You will receive course and account updates.'
                : 'Email notifications are currently disabled.'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              emailNotifications
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {emailNotifications ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailNotificationsPage;
