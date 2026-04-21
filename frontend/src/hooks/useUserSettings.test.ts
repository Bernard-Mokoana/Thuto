import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserSettings } from './useUserSettings';

const USER_ID = 'user-123';
const STORAGE_KEY = `userSettings:${USER_ID}`;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('useUserSettings', () => {
  describe('initial settings', () => {
    it('returns default settings when userId is undefined', () => {
      const { result } = renderHook(() => useUserSettings(undefined));
      expect(result.current.settings).toEqual({
        emailNotifications: true,
        shareProfileData: false,
      });
    });

    it('returns default settings when userId is null', () => {
      const { result } = renderHook(() => useUserSettings(null));
      expect(result.current.settings).toEqual({
        emailNotifications: true,
        shareProfileData: false,
      });
    });

    it('returns default settings when no stored data exists for userId', () => {
      const { result } = renderHook(() => useUserSettings(USER_ID));
      expect(result.current.settings).toEqual({
        emailNotifications: true,
        shareProfileData: false,
      });
    });

    it('loads stored settings from localStorage when userId is provided', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ emailNotifications: false, shareProfileData: true })
      );
      const { result } = renderHook(() => useUserSettings(USER_ID));
      expect(result.current.settings).toEqual({
        emailNotifications: false,
        shareProfileData: true,
      });
    });

    it('returns default settings when stored JSON is malformed', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json');
      const { result } = renderHook(() => useUserSettings(USER_ID));
      expect(result.current.settings).toEqual({
        emailNotifications: true,
        shareProfileData: false,
      });
    });

    it('coerces non-boolean stored values to booleans', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ emailNotifications: 0, shareProfileData: 1 })
      );
      const { result } = renderHook(() => useUserSettings(USER_ID));
      expect(result.current.settings.emailNotifications).toBe(false);
      expect(result.current.settings.shareProfileData).toBe(true);
    });
  });

  describe('updateSetting', () => {
    it('updates emailNotifications and persists to localStorage', () => {
      const { result } = renderHook(() => useUserSettings(USER_ID));

      act(() => {
        result.current.updateSetting('emailNotifications', false);
      });

      expect(result.current.settings.emailNotifications).toBe(false);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(stored.emailNotifications).toBe(false);
    });

    it('updates shareProfileData and persists to localStorage', () => {
      const { result } = renderHook(() => useUserSettings(USER_ID));

      act(() => {
        result.current.updateSetting('shareProfileData', true);
      });

      expect(result.current.settings.shareProfileData).toBe(true);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(stored.shareProfileData).toBe(true);
    });

    it('does not update state when userId is undefined', () => {
      const { result } = renderHook(() => useUserSettings(undefined));

      act(() => {
        result.current.updateSetting('emailNotifications', false);
      });

      expect(result.current.settings.emailNotifications).toBe(true);
    });

    it('does not update state when userId is null', () => {
      const { result } = renderHook(() => useUserSettings(null));

      act(() => {
        result.current.updateSetting('shareProfileData', true);
      });

      expect(result.current.settings.shareProfileData).toBe(false);
    });

    it('does not write to localStorage when userId is absent', () => {
      const { result } = renderHook(() => useUserSettings(null));

      act(() => {
        result.current.updateSetting('emailNotifications', false);
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('preserves unchanged keys when updating one setting', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ emailNotifications: false, shareProfileData: true })
      );
      const { result } = renderHook(() => useUserSettings(USER_ID));

      act(() => {
        result.current.updateSetting('emailNotifications', true);
      });

      expect(result.current.settings.emailNotifications).toBe(true);
      expect(result.current.settings.shareProfileData).toBe(true);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(stored.shareProfileData).toBe(true);
    });
  });

  describe('userId change', () => {
    it('reloads settings when userId changes', () => {
      const OTHER_ID = 'user-456';
      localStorage.setItem(
        `userSettings:${OTHER_ID}`,
        JSON.stringify({ emailNotifications: false, shareProfileData: true })
      );

      const { result, rerender } = renderHook(
        ({ uid }: { uid: string | null }) => useUserSettings(uid),
        { initialProps: { uid: USER_ID } }
      );

      expect(result.current.settings.emailNotifications).toBe(true);

      rerender({ uid: OTHER_ID });

      expect(result.current.settings.emailNotifications).toBe(false);
      expect(result.current.settings.shareProfileData).toBe(true);
    });
  });
});