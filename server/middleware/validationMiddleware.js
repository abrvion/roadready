export const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body?.[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`
    });
  }

  next();
};
