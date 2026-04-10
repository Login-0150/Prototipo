import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/search/youtube", async (req, res): Promise<void> => {
  const apiKey = process.env["YOUTUBE_API_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "YOUTUBE_API_KEY not configured", items: [] });
    return;
  }
  const q = req.query.q as string;
  if (!q) { res.status(400).json({ error: "Missing query", items: [] }); return; }
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${encodeURIComponent(q)}&type=video&part=snippet&maxResults=20&videoCategoryId=10`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "YouTube search failed", items: [] });
  }
});

// Dedicated endpoint to find a YouTube video for a specific track (title + artist)
router.get("/search/youtube-for-track", async (req, res): Promise<void> => {
  const apiKey = process.env["YOUTUBE_API_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "YOUTUBE_API_KEY not configured", items: [] });
    return;
  }
  const { title, artist } = req.query as Record<string, string>;
  if (!title) { res.status(400).json({ error: "Missing title", items: [] }); return; }
  const q = `${title} ${artist || ""} official audio`;
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${encodeURIComponent(q)}&type=video&part=snippet&maxResults=5`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "YouTube search failed", items: [] });
  }
});

router.get("/search/radio", async (req, res): Promise<void> => {
  try {
    const { name, country, genre, limit = "80" } = req.query as Record<string, string>;
    const params = new URLSearchParams({
      limit,
      hidebroken: "true",
      order: "clickcount",
      reverse: "true",
    });
    if (name) params.set("name", name);
    if (country) params.set("countrycode", country);
    if (genre) params.set("tag", genre);
    const url = `https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "SoundSync/1.0", "Accept": "application/json" },
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Radio search failed" });
  }
});

export default router;
