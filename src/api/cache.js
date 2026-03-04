const CACHE_PREFIX = 'fennecs-cache:';
const memoryCache = new Map();
const CACHE_MISS = Symbol('CACHE_MISS');

const canUseLocalStorage = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
};

const toStorageKey = (key) => `${CACHE_PREFIX}${key}`;

const readPersistedEntry = (key) => {
  if (!canUseLocalStorage()) {
    return CACHE_MISS;
  }

  try {
    const rawValue = window.localStorage.getItem(toStorageKey(key));
    if (!rawValue) {
      return CACHE_MISS;
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object') {
      return CACHE_MISS;
    }

    return parsed;
  } catch {
    return CACHE_MISS;
  }
};

const writePersistedEntry = (key, entry) => {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(toStorageKey(key), JSON.stringify(entry));
  } catch {
    // Ignore localStorage quota and serialization failures.
  }
};

const removePersistedEntry = (key) => {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(toStorageKey(key));
  } catch {
    // Ignore localStorage failures.
  }
};

const getLiveEntry = (entry, key) => {
  if (entry === CACHE_MISS) {
    return CACHE_MISS;
  }

  if (!entry || typeof entry.expiresAt !== 'number' || Date.now() >= entry.expiresAt) {
    memoryCache.delete(key);
    removePersistedEntry(key);
    return CACHE_MISS;
  }

  return entry;
};

const readEntry = (key) => {
  const fromMemory = getLiveEntry(memoryCache.get(key) ?? CACHE_MISS, key);
  if (fromMemory !== CACHE_MISS) {
    return fromMemory;
  }

  const fromStorage = getLiveEntry(readPersistedEntry(key), key);
  if (fromStorage !== CACHE_MISS) {
    memoryCache.set(key, fromStorage);
    return fromStorage;
  }

  return CACHE_MISS;
};

export const setCachedValue = (key, value, ttlMs, { persist = true } = {}) => {
  const sanitizedTtl = Math.max(1, Number(ttlMs) || 1);
  const entry = {
    value,
    expiresAt: Date.now() + sanitizedTtl,
  };

  memoryCache.set(key, entry);
  if (persist) {
    writePersistedEntry(key, entry);
  }

  return value;
};

export const clearCachedValue = (key) => {
  memoryCache.delete(key);
  removePersistedEntry(key);
};

export const withCache = async (
  key,
  ttlMs,
  fetcher,
  { persist = true, skip = false } = {}
) => {
  if (!skip) {
    const cachedEntry = readEntry(key);
    if (cachedEntry !== CACHE_MISS) {
      return cachedEntry.value;
    }
  }

  const freshValue = await fetcher();
  return setCachedValue(key, freshValue, ttlMs, { persist });
};

