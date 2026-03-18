const SETTINGS_KEY = "playeng_settings";

interface Settings {
  soundMode: "normal" | "silent";
}

const defaults: Settings = {
  soundMode: "normal",
};

export const getSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
};

export const setSoundMode = (mode: "normal" | "silent"): void => {
  const settings = getSettings();
  settings.soundMode = mode;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const isSilent = (): boolean => {
  return getSettings().soundMode === "silent";
};
