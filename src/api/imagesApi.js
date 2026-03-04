import { withCache } from './cache';
import { API_CONFIG } from './config';
import { commonsClient } from './httpClients';
import { schedule } from './rateLimiter';

const WIKIMEDIA_CACHE_MS = 12 * 60 * 60 * 1000;
const PLAYER_PHOTO_CACHE_MS = 7 * 24 * 60 * 60 * 1000;
const VISUALS_CACHE_MS = 6 * 60 * 60 * 1000;

const TITLE_BLOCKLIST = /(kit|logo|badge|crest|icon|lineup|formation|map|flag|vector|diagram|poster|png)$/i;

const HERO_QUERIES = [
  'Algeria national football team match filetype:bitmap',
  'Algeria NT training 2013 AFCON filetype:bitmap',
  'World Cup Qualification Africa Guinea v Algeria filetype:bitmap',
];

const HISTORY_ITEMS = [
  {
    year: '1982',
    title: 'World Cup Statement',
    description: 'Algeria stunned global football and set a new standard for African teams.',
    query: 'Algeria football world cup historical photo filetype:bitmap',
  },
  {
    year: '1990',
    title: 'AFCON at Home',
    description: 'The first continental title united an entire nation around Les Fennecs.',
    query: 'Algeria national football team AFCON celebration filetype:bitmap',
  },
  {
    year: '2014',
    title: 'Round of 16 in Brazil',
    description: 'A disciplined, fearless side pushed eventual champions Germany to extra time.',
    query: 'Algeria 2014 world cup football filetype:bitmap',
  },
  {
    year: '2019',
    title: 'Second African Crown',
    description: 'Another AFCON triumph reinforced Algeria as a continental powerhouse.',
    query: 'Algeria national team 2019 football celebration filetype:bitmap',
  },
];

const cleanMetadataValue = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const createCommonsUrl = (title) =>
  `https://commons.wikimedia.org/wiki/${encodeURIComponent(String(title || '').replace(/ /g, '_'))}`;

const normalizeCommonsPage = (page) => {
  const imageInfo = page?.imageinfo?.[0];
  if (!imageInfo) {
    return null;
  }

  const fileTitle = String(page.title || '').replace(/^File:/i, '');
  if (!fileTitle || TITLE_BLOCKLIST.test(fileTitle)) {
    return null;
  }

  const url = imageInfo.thumburl || imageInfo.url;
  if (!url) {
    return null;
  }

  return {
    id: String(page.pageid || fileTitle),
    title: fileTitle.replace(/_/g, ' '),
    url,
    sourceUrl: createCommonsUrl(page.title),
    description: cleanMetadataValue(imageInfo.extmetadata?.ImageDescription?.value),
    author: cleanMetadataValue(imageInfo.extmetadata?.Artist?.value),
    license: cleanMetadataValue(imageInfo.extmetadata?.LicenseShortName?.value),
    width: imageInfo.thumbwidth || imageInfo.width || null,
    height: imageInfo.thumbheight || imageInfo.height || null,
  };
};

export const searchCommonsPhotos = async (query, { limit = 8, width = 1600 } = {}) =>
  withCache(
    `wikimedia:${query}:${limit}:${width}`,
    WIKIMEDIA_CACHE_MS,
    async () => {
      const gsrLimit = Math.min(Math.max(limit * 4, 8), 40);
      const { data } = await schedule(
        'wikimedia',
        () =>
          commonsClient.get('', {
            params: {
              action: 'query',
              format: 'json',
              origin: '*',
              generator: 'search',
              gsrsearch: query,
              gsrnamespace: 6,
              gsrlimit: gsrLimit,
              prop: 'imageinfo',
              iiprop: 'url|size|extmetadata',
              iiurlwidth: width,
            },
          }),
        320
      );

      const pages = Object.values(data?.query?.pages || {});
      return pages.map(normalizeCommonsPage).filter(Boolean).slice(0, limit);
    },
    { persist: true, skip: API_CONFIG.cacheDisabled }
  );

const pickLandscapeImage = (images) =>
  images.find((image) => image.width && image.height && image.width >= image.height) || images[0] || null;

const pickPortraitImage = (images) =>
  images.find((image) => image.width && image.height && image.height >= image.width) || images[0] || null;

const ensureDescription = (description, fallback) => description || fallback;

export const getHeroImage = async () =>
  withCache(
    'visuals:hero',
    VISUALS_CACHE_MS,
    async () => {
      for (const query of HERO_QUERIES) {
        const images = await searchCommonsPhotos(query, { limit: 8, width: 1800 });
        const selected = pickLandscapeImage(images);
        if (selected) {
          return {
            ...selected,
            description: ensureDescription(selected.description, 'Algeria national team on match day.'),
          };
        }
      }

      return null;
    },
    { persist: true, skip: API_CONFIG.cacheDisabled }
  );

export const getHistoryGallery = async () =>
  withCache(
    'visuals:history',
    VISUALS_CACHE_MS,
    async () => {
      const fallbackPool = await searchCommonsPhotos('Algeria national football team historical photo filetype:bitmap', {
        limit: 8,
        width: 1600,
      });

      const entries = await Promise.all(
        HISTORY_ITEMS.map(async (item, index) => {
          const images = await searchCommonsPhotos(item.query, { limit: 6, width: 1600 });
          const selected = pickLandscapeImage(images) || fallbackPool[index % Math.max(fallbackPool.length, 1)] || null;

          if (!selected) {
            return null;
          }

          return {
            id: `history-${item.year}`,
            year: item.year,
            title: item.title,
            description: item.description,
            image: selected.url,
            sourceUrl: selected.sourceUrl,
            credit: selected.author || 'Wikimedia Commons',
          };
        })
      );

      return entries.filter(Boolean);
    },
    { persist: true, skip: API_CONFIG.cacheDisabled }
  );

export const getPlayerPortrait = async (playerName) => {
  if (!playerName) {
    return null;
  }

  return withCache(
    `wikimedia:player:${playerName.toLowerCase()}`,
    PLAYER_PHOTO_CACHE_MS,
    async () => {
      const queries = [
        `${playerName} Algeria footballer portrait filetype:bitmap`,
        `${playerName} Algeria national team filetype:bitmap`,
      ];

      for (const query of queries) {
        const images = await searchCommonsPhotos(query, { limit: 5, width: 900 });
        const selected = pickPortraitImage(images);
        if (selected?.url) {
          return selected.url;
        }
      }

      return null;
    },
    { persist: true, skip: API_CONFIG.cacheDisabled }
  );
};

export const getFallbackSquadPhoto = async () => {
  const images = await searchCommonsPhotos('Algeria NT training 2013 AFCON filetype:bitmap', {
    limit: 5,
    width: 900,
  });

  return pickPortraitImage(images)?.url || pickLandscapeImage(images)?.url || null;
};

export const getVisualAssets = async () => {
  const [heroImage, historyGallery] = await Promise.all([getHeroImage(), getHistoryGallery()]);
  return { heroImage, historyGallery };
};

