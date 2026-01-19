// Simple in-memory API cache with TTL
const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const getCached = async (key, loader, ttl = DEFAULT_TTL) => {
  try {
    const entry = cache.get(key);
    if (entry && entry.expireAt > Date.now()) {
      return entry.value;
    }

    // call loader to fetch fresh value
    const value = await loader();
    cache.set(key, { value, expireAt: Date.now() + ttl });
    return value;
  } catch (e) {
    // on loader error, don't poison cache
    throw e;
  }
};

export const setCached = (key, value, ttl = DEFAULT_TTL) => {
  cache.set(key, { value, expireAt: Date.now() + ttl });
};

export const clearCache = () => cache.clear();

export const delCache = (key) => cache.delete(key);

export default { getCached, setCached, clearCache, delCache };
