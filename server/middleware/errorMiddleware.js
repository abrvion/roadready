export const notFound = (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }

  return res.status(404).sendFile("404.html", { root: new URL("../../public", import.meta.url).pathname });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON request body" });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body is too large" });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};
