import { withCache } from './cache';
import { API_CONFIG } from './config';
import { guardianClient, newsClient } from './httpClients';
import { schedule } from './rateLimiter';

const NEWS_CACHE_MS = 5 * 60 * 1000;
const DEFAULT_LIMIT = 6;
const NEWS_QUERY = '"Algeria national football team" OR "Les Fennecs" OR "Algeria football"';

const normalizeNewsItem = (item) => ({
  id: item.id,
  title: item.title,
  summary: item.summary,
  source: item.source,
  image: item.image,
  publishedAt: item.publishedAt,
  url: item.url,
});

const normalizeNewsApiArticles = (articles = []) =>
  articles
    .filter((article) => article?.url && article?.title)
    .map((article) =>
      normalizeNewsItem({
        id: `${article.source?.name || 'newsapi'}-${article.url}`,
        title: article.title,
        summary: article.description || '',
        source: article.source?.name || 'NewsAPI',
        image: article.urlToImage || null,
        publishedAt: article.publishedAt || null,
        url: article.url,
      })
    );

const normalizeGuardianArticles = (results = []) =>
  results
    .filter((article) => article?.webUrl && article?.webTitle)
    .map((article) =>
      normalizeNewsItem({
        id: `guardian-${article.id || article.webUrl}`,
        title: article.webTitle,
        summary: article.fields?.trailText || '',
        source: 'The Guardian',
        image: article.fields?.thumbnail || null,
        publishedAt: article.webPublicationDate || null,
        url: article.webUrl,
      })
    );

const dedupeByUrl = (articles) =>
  Array.from(
    articles.reduce((map, article) => {
      if (!map.has(article.url)) {
        map.set(article.url, article);
      }
      return map;
    }, new Map()).values()
  );

const fetchFromNewsApi = async (limit) => {
  if (!API_CONFIG.newsApiKey) {
    return [];
  }

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await schedule(
    'newsapi',
    () =>
      newsClient.get('/everything', {
        params: {
          apiKey: API_CONFIG.newsApiKey,
          q: NEWS_QUERY,
          language: API_CONFIG.newsLanguage,
          sortBy: 'publishedAt',
          pageSize: limit,
          from: fourteenDaysAgo,
        },
      }),
    500
  );

  return normalizeNewsApiArticles(data?.articles || []).slice(0, limit);
};

const fetchFromGuardian = async (limit) => {
  const queries = ['"Algeria national team" OR "Les Fennecs"', 'Algeria football team'];
  const collected = [];

  for (const query of queries) {
    const { data } = await schedule(
      'guardian',
      () =>
        guardianClient.get('/search', {
          params: {
            q: query,
            section: 'football',
            'order-by': 'newest',
            'page-size': Math.max(limit, 8),
            'show-fields': 'trailText,thumbnail',
            'api-key': 'test',
          },
        }),
      500
    );

    const normalized = normalizeGuardianArticles(data?.response?.results || []);
    collected.push(...normalized);

    if (dedupeByUrl(collected).length >= limit) {
      break;
    }
  }

  return dedupeByUrl(collected).slice(0, limit);
};

export const getLatestNews = async (limit = DEFAULT_LIMIT) =>
  withCache(
    `news:latest:${limit}`,
    NEWS_CACHE_MS,
    async () => {
      try {
        const primary = await fetchFromNewsApi(limit);
        if (primary.length > 0) {
          return primary;
        }
      } catch (error) {
        console.warn('NewsAPI request failed, switching to fallback source.', error);
      }

      try {
        return await fetchFromGuardian(limit);
      } catch (error) {
        console.warn('Guardian fallback request failed.', error);
        return [];
      }
    },
    { persist: false, skip: API_CONFIG.cacheDisabled }
  );
