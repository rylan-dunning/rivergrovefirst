// This file has been disabled to allow static export.
// If you need API functionality, please update next.config.mjs to remove "output: 'export'"

export default function disabledHandler(req, res) {
  res.status(404).json({ error: "API routes are disabled in static export mode" });
}
