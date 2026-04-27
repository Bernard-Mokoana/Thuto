import React from 'react';
import SettingsPageHeader from '../components/settings/SettingsPageHeader';
import ToggleSettingCard from '../components/settings/ToggleSettingCard';
import { useAuth } from '../contexts/useAuth';
import { useUserSettings } from '../hooks/useUserSettings';

const EmailNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSetting } = useUserSettings(user?._id);

  const handleToggle = () => {
    const next = !settings.emailNotifications;
    updateSetting('emailNotifications', next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsPageHeader
          title="Email Notifications"
          description="Manage how we contact you about account updates"
        />

        <ToggleSettingCard
          label="Email alerts"
          description={
            settings.emailNotifications
              ? 'You will receive course and account updates.'
              : 'Email notifications are currently disabled.'
          }
          enabled={settings.emailNotifications}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
};

export default EmailNotificationsPage;
