import { create } from 'zustand';
import { getMatchCenterData } from '../api/footballApi';
import { getVisualAssets } from '../api/imagesApi';
import { getLatestNews } from '../api/newsApi';
import { ALGERIA_SQUAD_DATA, ALGERIA_SQUAD_FLAT } from '../data/algeriaSquad';

const MIN_REFRESH_GAP_MS = 45 * 1000;

const removeErrorKey = (errors, key) => {
  const nextErrors = { ...errors };
  delete nextErrors[key];
  return nextErrors;
};

const useFootballStore = create((set, get) => ({
  matchCenter: {
    source: 'unavailable',
    focusMatch: null,
    upcoming: [],
    recent: [],
  },
  coach: ALGERIA_SQUAD_DATA.coach,
  squadUpdatedAt: ALGERIA_SQUAD_DATA.updatedAt,
  squad: ALGERIA_SQUAD_FLAT,
  news: [],
  heroImage: null,
  historyGallery: [],
  loading: {
    dashboard: false,
    matches: false,
    news: false,
    squad: false,
    visuals: false,
  },
  errors: {},
  lastUpdatedAt: null,
  inflight: null,

  fetchDashboard: async (force = false) => {
    const { inflight, lastUpdatedAt } = get();
    if (inflight) return inflight;

    if (!force && lastUpdatedAt && Date.now() - lastUpdatedAt < MIN_REFRESH_GAP_MS) {
      return null;
    }

    const task = (async () => {
      set((state) => ({
        loading: {
          ...state.loading,
          dashboard: true,
          matches: true,
          news: true,
          visuals: true,
        },
      }));

      const [matchesResult, newsResult, visualsResult] = await Promise.allSettled([
        getMatchCenterData(),
        getLatestNews(6),
        getVisualAssets(),
      ]);

      set((state) => {
        let nextErrors = { ...state.errors };
        const nextState = {
          loading: {
            ...state.loading,
            dashboard: false,
            matches: false,
            news: false,
            visuals: false,
          },
          lastUpdatedAt: Date.now(),
        };

        if (matchesResult.status === 'fulfilled') {
          nextState.matchCenter = matchesResult.value;
          nextErrors = removeErrorKey(nextErrors, 'matches');
        } else {
          nextErrors.matches = 'Could not load live match data.';
        }

        if (newsResult.status === 'fulfilled') {
          nextState.news = newsResult.value;
          nextErrors = removeErrorKey(nextErrors, 'news');
        } else {
          nextErrors.news = 'Could not load news feed.';
        }

        if (visualsResult.status === 'fulfilled') {
          nextState.heroImage = visualsResult.value.heroImage;
          nextState.historyGallery = visualsResult.value.historyGallery;
          nextErrors = removeErrorKey(nextErrors, 'visuals');
        } else {
          nextErrors.visuals = 'Could not load licensed photo assets.';
        }

        nextState.errors = nextErrors;
        return nextState;
      });
    })();

    set({ inflight: task });

    try {
      await task;
      return task;
    } finally {
      set({ inflight: null });
    }
  },

  refreshMatches: async () => {
    set((state) => ({
      loading: {
        ...state.loading,
        matches: true,
      },
    }));

    try {
      const matchCenter = await getMatchCenterData();
      set((state) => ({
        matchCenter,
        loading: {
          ...state.loading,
          matches: false,
        },
        errors: removeErrorKey(state.errors, 'matches'),
        lastUpdatedAt: Date.now(),
      }));
    } catch {
      set((state) => ({
        loading: {
          ...state.loading,
          matches: false,
        },
        errors: {
          ...state.errors,
          matches: 'Could not refresh match center.',
        },
      }));
    }
  },
}));

export default useFootballStore;
