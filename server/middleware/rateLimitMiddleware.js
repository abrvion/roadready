const buckets = new Map();

export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 30, message = "Too many requests. Please try again later." } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of buckets) if (value.resetAt <= now) buckets.delete(key);
}, 15 * 60 * 1000).unref();
