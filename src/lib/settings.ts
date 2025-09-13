import { Preferences } from '@capacitor/preferences';

export interface AppSettings {
  savingsTarget: number;
  isDarkMode: boolean;
  language: 'id' | 'en';
}

const DEFAULTS: AppSettings = {
  savingsTarget: 5000000,
  isDarkMode: false,
  language: 'id',
};

// Keys for storage
const SAVINGS_TARGET_KEY = 'settings_savingsTarget';
const IS_DARK_MODE_KEY = 'settings_isDarkMode';
const LANGUAGE_KEY = 'settings_language';

/**
 * Saves all app settings to persistent storage.
 * @param settings - The settings object to save.
 */
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await Preferences.set({ key: SAVINGS_TARGET_KEY, value: String(settings.savingsTarget) });
  await Preferences.set({ key: IS_DARK_MODE_KEY, value: JSON.stringify(settings.isDarkMode) });
  await Preferences.set({ key: LANGUAGE_KEY, value: settings.language });
  console.log('Settings saved:', settings);
};

/**
 * Loads all app settings from persistent storage.
 * @returns The loaded settings object, or defaults if not found.
 */
export const loadSettings = async (): Promise<AppSettings> => {
  const { value: savingsTargetValue } = await Preferences.get({ key: SAVINGS_TARGET_KEY });
  const { value: isDarkModeValue } = await Preferences.get({ key: IS_DARK_MODE_KEY });
  const { value: languageValue } = await Preferences.get({ key: LANGUAGE_KEY });

  const settings: AppSettings = {
    savingsTarget: savingsTargetValue ? Number(savingsTargetValue) : DEFAULTS.savingsTarget,
    isDarkMode: isDarkModeValue ? JSON.parse(isDarkModeValue) : DEFAULTS.isDarkMode,
    language: (languageValue as AppSettings['language']) || DEFAULTS.language,
  };

  console.log('Settings loaded:', settings);
  return settings;
};

/**
 * Applies the dark mode setting to the document body.
 * @param isDark - Whether dark mode should be enabled.
 */
export const applyDarkMode = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
};
