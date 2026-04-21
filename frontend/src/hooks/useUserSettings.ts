import { useEffect, useState } from 'react';

type UserSettings = {
  emailNotifications: boolean;
  shareProfileData: boolean;
};

const defaultSettings: UserSettings = {
  emailNotifications: true,
  shareProfileData: false,
};

const readUserSettings = (userId?: string | null): UserSettings => {
  if (!userId) {
    return defaultSettings;
  }

  const stored = localStorage.getItem(`userSettings:${userId}`);
  if (!stored) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      emailNotifications: !!parsed.emailNotifications,
      shareProfileData: !!parsed.shareProfileData,
    };
  } catch {
    return defaultSettings;
  }
};

export const useUserSettings = (userId?: string | null) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    setSettings(readUserSettings(userId));
  }, [userId]);

  const updateSetting = (key: keyof UserSettings, value: boolean) => {
    if (!userId) {
      return;
    }

    setSettings((current) => {
      const nextSettings = { ...current, [key]: value };
      localStorage.setItem(`userSettings:${userId}`, JSON.stringify(nextSettings));
      return nextSettings;
    });
  };

  return { settings, updateSetting };
};
