const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const asPositiveInteger = (value, fallback = null) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const API_CONFIG = {
  apiFootballKey: asTrimmedString(import.meta.env.VITE_API_FOOTBALL_KEY),
  apiFootballTeamId: asPositiveInteger(import.meta.env.VITE_API_FOOTBALL_TEAM_ID),
  newsApiKey: asTrimmedString(import.meta.env.VITE_NEWS_API_KEY),
  newsLanguage: asTrimmedString(import.meta.env.VITE_NEWS_API_LANGUAGE) || 'en',
  sportsDbTeamId: asTrimmedString(import.meta.env.VITE_SPORTSDB_TEAM_ID) || '133783',
  cacheDisabled: import.meta.env.VITE_DISABLE_API_CACHE === 'true',
};

