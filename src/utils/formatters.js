const DATE_LOCALE = 'en-GB';

export const formatDateTime = (isoDate) => {
  if (!isoDate) return 'Date TBD';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Date TBD';

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateOnly = (isoDate) => {
  if (!isoDate) return 'Date TBD';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Date TBD';

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatMatchStatus = (match) => {
  if (!match) return 'Unavailable';
  if (match.status?.isLive) {
    const minute = match.status?.elapsed;
    return minute ? `LIVE ${minute}'` : 'LIVE';
  }

  if (match.status?.short === 'FT') return 'Full Time';
  return match.status?.long || 'Scheduled';
};

export const formatScore = (match) => {
  if (!match) return '-';

  const homeScore = match.score?.home;
  const awayScore = match.score?.away;
  if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
    return 'vs';
  }

  return `${homeScore} - ${awayScore}`;
};

export const isAlgeriaTeam = (teamName) => String(teamName || '').toLowerCase().includes('algeria');

export const getResultCode = (match) => {
  if (!match) return null;
  const homeGoals = match.score?.home;
  const awayGoals = match.score?.away;

  if (homeGoals === null || awayGoals === null || homeGoals === undefined || awayGoals === undefined) {
    return null;
  }

  const algeriaIsHome = isAlgeriaTeam(match.teams?.home?.name);
  const algeriaGoals = algeriaIsHome ? homeGoals : awayGoals;
  const opponentGoals = algeriaIsHome ? awayGoals : homeGoals;

  if (algeriaGoals > opponentGoals) return 'W';
  if (algeriaGoals < opponentGoals) return 'L';
  return 'D';
};

export const formatRelativeNewsDate = (value) => {
  if (!value) return 'Unknown date';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  const minutesAgo = Math.round((Date.now() - date.getTime()) / (1000 * 60));
  if (minutesAgo < 60) return `${Math.max(minutesAgo, 1)}m ago`;

  const hoursAgo = Math.round(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h ago`;

  const daysAgo = Math.round(hoursAgo / 24);
  if (daysAgo < 8) return `${daysAgo}d ago`;

  return formatDateOnly(value);
};

