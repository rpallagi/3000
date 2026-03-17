/**
 * User settings via localStorage
 */

const SETTINGS_KEY = 'playeng_settings';

const defaults = {
  soundMode: 'noisy', // 'noisy' | 'silent'
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

export function setSoundMode(mode) {
  const settings = getSettings();
  settings.soundMode = mode;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isSilentMode() {
  return getSettings().soundMode === 'silent';
}
