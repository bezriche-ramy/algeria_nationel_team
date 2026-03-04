import { withCache } from './cache';
import { API_CONFIG } from './config';
import { apiFootballClient, sportsDbClient } from './httpClients';
import { getFallbackSquadPhoto, getPlayerPortrait } from './imagesApi';
import { schedule } from './rateLimiter';

const SHORT_CACHE_MS = 60 * 1000;
const SQUAD_CACHE_MS = 3 * 60 * 60 * 1000;
const DAY_CACHE_MS = 24 * 60 * 60 * 1000;

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE']);
const POSITION_PRIORITY = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const parseScore = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePosition = (value) => {
  const text = String(value || '').toLowerCase();
  if (text.includes('goal')) return 'Goalkeeper';
  if (text.includes('def')) return 'Defender';
  if (text.includes('mid')) return 'Midfielder';
  if (text.includes('for') || text.includes('att') || text.includes('strik') || text.includes('wing')) {
    return 'Forward';
  }
  return 'Midfielder';
};

const positionWeight = (position) => {
  const index = POSITION_PRIORITY.indexOf(position);
  return index === -1 ? POSITION_PRIORITY.length : index;
};

const bySquadOrder = (left, right) => {
  const priorityDiff = positionWeight(left.position) - positionWeight(right.position);
  if (priorityDiff !== 0) return priorityDiff;
  return String(left.name).localeCompare(String(right.name));
};

const isLiveStatus = (statusShort) => LIVE_STATUSES.has(String(statusShort || '').toUpperCase());

const withSource = (value, source) => ({ ...value, source });

const mapApiFootballFixture = (fixtureData) => {
  const fixture = fixtureData?.fixture || {};
  const statusShort = fixture.status?.short || '';

  return {
    id: String(fixture.id || `${fixtureData?.teams?.home?.name || 'home'}-${fixtureData?.teams?.away?.name || 'away'}`),
    date: fixture.date || null,
    competition: fixtureData?.league?.name || 'International',
    round: fixtureData?.league?.round || null,
    venue: fixture.venue?.name || null,
    status: {
      short: statusShort,
      long: fixture.status?.long || (isLiveStatus(statusShort) ? 'Live' : 'Scheduled'),
      elapsed: fixture.status?.elapsed ?? null,
      isLive: isLiveStatus(statusShort),
    },
    teams: {
      home: {
        name: fixtureData?.teams?.home?.name || 'Home',
        logo: fixtureData?.teams?.home?.logo || null,
      },
      away: {
        name: fixtureData?.teams?.away?.name || 'Away',
        logo: fixtureData?.teams?.away?.logo || null,
      },
    },
    score: {
      home: typeof fixtureData?.goals?.home === 'number' ? fixtureData.goals.home : parseScore(fixtureData?.goals?.home),
      away: typeof fixtureData?.goals?.away === 'number' ? fixtureData.goals.away : parseScore(fixtureData?.goals?.away),
    },
    events: [],
  };
};

const mapApiFootballEvent = (event) => ({
  id: `${event?.type || 'event'}-${event?.time?.elapsed || 0}-${event?.player?.id || Math.random()}`,
  minute: event?.time?.elapsed ?? null,
  type: event?.type || 'Event',
  detail: event?.detail || '',
  player: event?.player?.name || '',
  assist: event?.assist?.name || '',
  team: event?.team?.name || '',
});

const mapSportsDbFixture = (event) => {
  const homeScore = parseScore(event?.intHomeScore);
  const awayScore = parseScore(event?.intAwayScore);
  const hasFinalScore = homeScore !== null && awayScore !== null;

  const timeText = String(event?.strTime || event?.strTimeLocal || '00:00:00').slice(0, 8);
  const isoDate = event?.dateEvent ? `${event.dateEvent}T${timeText || '00:00:00'}Z` : null;

  return {
    id: String(event?.idEvent || `${event?.strHomeTeam || 'home'}-${event?.strAwayTeam || 'away'}`),
    date: isoDate,
    competition: event?.strLeague || 'International',
    round: event?.strRound || null,
    venue: event?.strVenue || null,
    status: {
      short: hasFinalScore ? 'FT' : 'NS',
      long: hasFinalScore ? 'Full Time' : 'Scheduled',
      elapsed: null,
      isLive: false,
    },
    teams: {
      home: {
        name: event?.strHomeTeam || 'Home',
        logo: event?.strHomeTeamBadge || null,
      },
      away: {
        name: event?.strAwayTeam || 'Away',
        logo: event?.strAwayTeamBadge || null,
      },
    },
    score: {
      home: homeScore,
      away: awayScore,
    },
    events: [],
  };
};

const mapApiFootballPlayer = (player) => ({
  id: String(player?.id || player?.name || Math.random()),
  name: player?.name || 'Unknown Player',
  position: normalizePosition(player?.position),
  number: parseScore(player?.number),
  age: parseScore(player?.age),
  club: player?.club?.name || null,
  nationality: player?.nationality || 'Algeria',
  photo: player?.photo || null,
});

const mapSportsDbPlayer = (player) => ({
  id: String(player?.idPlayer || player?.strPlayer || Math.random()),
  name: player?.strPlayer || 'Unknown Player',
  position: normalizePosition(player?.strPosition),
  number: parseScore(player?.strNumber),
  age: parseScore(player?.dateBorn ? new Date().getFullYear() - new Date(player.dateBorn).getFullYear() : null),
  club: player?.strTeam || null,
  nationality: player?.strNationality || 'Algeria',
  photo: player?.strCutout || player?.strThumb || player?.strRender || null,
});

const apiFootballEnabled = () => Boolean(API_CONFIG.apiFootballKey);

const apiFootballGet = async (endpoint, params = {}) => {
  const { data } = await schedule(
    'api-football',
    () =>
      apiFootballClient.get(endpoint, {
        params,
      }),
    350
  );

  return data?.response || [];
};

const resolveApiFootballTeamId = async () => {
  if (API_CONFIG.apiFootballTeamId) {
    return API_CONFIG.apiFootballTeamId;
  }

  return withCache(
    'api-football:team-id:algeria',
    DAY_CACHE_MS,
    async () => {
      const teams = await apiFootballGet('/teams', { search: 'Algeria' });
      const nationalTeam =
        teams.find(
          (candidate) =>
            candidate?.team?.name?.toLowerCase() === 'algeria' &&
            candidate?.team?.national === true
        ) ||
        teams.find(
          (candidate) =>
            candidate?.team?.national === true &&
            candidate?.team?.country?.toLowerCase() === 'algeria'
        ) ||
        teams[0];

      if (!nationalTeam?.team?.id) {
        throw new Error('Unable to resolve Algeria team id from API-Football.');
      }

      return Number(nationalTeam.team.id);
    },
    { persist: true, skip: API_CONFIG.cacheDisabled }
  );
};

const fetchApiFootballEvents = async (fixtureId) => {
  if (!fixtureId) return [];

  const events = await apiFootballGet('/fixtures/events', { fixture: fixtureId });
  return events
    .map(mapApiFootballEvent)
    .sort((left, right) => (right.minute ?? 0) - (left.minute ?? 0))
    .slice(0, 6);
};

const fetchApiFootballMatchCenter = async () => {
  const teamId = await resolveApiFootballTeamId();

  const [liveFixturesRaw, upcomingRaw, recentRaw] = await Promise.all([
    apiFootballGet('/fixtures', { team: teamId, live: 'all' }),
    apiFootballGet('/fixtures', { team: teamId, next: 5 }),
    apiFootballGet('/fixtures', { team: teamId, last: 6 }),
  ]);

  const liveFixtures = liveFixturesRaw.map(mapApiFootballFixture);
  const upcoming = upcomingRaw.map(mapApiFootballFixture);
  const recent = recentRaw.map(mapApiFootballFixture);

  let focusMatch = liveFixtures[0] || recent[0] || upcoming[0] || null;
  if (focusMatch?.id) {
    try {
      const events = await fetchApiFootballEvents(focusMatch.id);
      focusMatch = { ...focusMatch, events };
    } catch {
      // Ignore live event failures and keep the core match payload.
    }
  }

  return withSource(
    {
      focusMatch,
      upcoming,
      recent,
    },
    'api-football'
  );
};

const sportsDbGet = async (endpoint, params = {}) => {
  const { data } = await schedule(
    'sportsdb',
    () =>
      sportsDbClient.get(endpoint, {
        params,
      }),
    260
  );

  return data || {};
};

const fetchSportsDbMatchCenter = async () => {
  const teamId = API_CONFIG.sportsDbTeamId;
  const [nextData, lastData] = await Promise.all([
    sportsDbGet('/eventsnext.php', { id: teamId }),
    sportsDbGet('/eventslast.php', { id: teamId }),
  ]);

  const upcoming = (nextData?.events || []).slice(0, 5).map(mapSportsDbFixture);
  const recent = (lastData?.results || []).slice(0, 6).map(mapSportsDbFixture);
  const focusMatch = recent[0] || upcoming[0] || null;

  return withSource(
    {
      focusMatch,
      upcoming,
      recent,
    },
    'sportsdb'
  );
};

const hydrateMissingPhotos = async (players) => {
  if (!Array.isArray(players) || players.length === 0) {
    return [];
  }

  const fallbackPhoto = await getFallbackSquadPhoto();
  const missing = players.filter((player) => !player.photo).slice(0, 12);

  const resolved = await Promise.all(
    missing.map(async (player) => {
      const portrait = await getPlayerPortrait(player.name);
      return [player.id, portrait || fallbackPhoto || null];
    })
  );

  const portraitMap = new Map(resolved);

  return players
    .map((player) => ({
      ...player,
      photo: player.photo || portraitMap.get(player.id) || fallbackPhoto || null,
    }))
    .filter((player) => Boolean(player.photo))
    .sort(bySquadOrder);
};

const fetchApiFootballSquad = async () => {
  const teamId = await resolveApiFootballTeamId();
  const response = await apiFootballGet('/players/squads', { team: teamId });
  const players = response.flatMap((entry) => entry?.players || []).map(mapApiFootballPlayer);

  return players;
};

const fetchSportsDbSquad = async () => {
  const teamId = API_CONFIG.sportsDbTeamId;
  const data = await sportsDbGet('/lookup_all_players.php', { id: teamId });
  return (data?.player || []).map(mapSportsDbPlayer);
};

export const getMatchCenterData = async () =>
  withCache(
    'match-center:algeria',
    SHORT_CACHE_MS,
    async () => {
      if (apiFootballEnabled()) {
        try {
          return await fetchApiFootballMatchCenter();
        } catch (error) {
          console.warn('API-Football unavailable, falling back to SportsDB.', error);
        }
      }

      return fetchSportsDbMatchCenter();
    },
    { persist: false, skip: API_CONFIG.cacheDisabled }
  );

export const getSquadData = async (limit = 24) =>
  withCache(
    `squad:algeria:${limit}`,
    SQUAD_CACHE_MS,
    async () => {
      let squad = [];

      if (apiFootballEnabled()) {
        try {
          squad = await fetchApiFootballSquad();
        } catch (error) {
          console.warn('API-Football squad endpoint failed, switching to SportsDB.', error);
        }
      }

      if (squad.length === 0) {
        squad = await fetchSportsDbSquad();
      }

      const deduplicated = Array.from(
        squad.reduce((map, player) => {
          if (!map.has(player.name)) {
            map.set(player.name, player);
          }
          return map;
        }, new Map()).values()
      );

      const hydrated = await hydrateMissingPhotos(deduplicated);
      return hydrated.slice(0, limit);
    },
    { persist: true, skip: API_CONFIG.cacheDisabled }
  );

export const getDataSourceLabel = (source) => {
  if (source === 'api-football') {
    return 'API-Football';
  }
  if (source === 'sportsdb') {
    return 'TheSportsDB';
  }
  return 'Unavailable';
};

export const isAlgeriaTeam = (teamName) => String(teamName || '').toLowerCase().includes('algeria');
