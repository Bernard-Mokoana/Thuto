import React from 'react';
import SettingsPageHeader from '../components/settings/SettingsPageHeader';
import ToggleSettingCard from '../components/settings/ToggleSettingCard';
import { useAuth } from '../contexts/useAuth';
import { useUserSettings } from '../hooks/useUserSettings';

const PrivacySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSetting } = useUserSettings(user?._id);

  const handleToggle = () => {
    const next = !settings.shareProfileData;
    updateSetting('shareProfileData', next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsPageHeader
          title="Privacy Settings"
          description="Control how your profile data is shared"
        />

        <ToggleSettingCard
          label="Share profile data"
          description={
            settings.shareProfileData
              ? 'Your profile data can be shared with tutors.'
              : 'Your profile data stays private.'
          }
          enabled={settings.shareProfileData}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
