// api/views.js — Vercel serverless function for page view counts
// Env vars used: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

export default async function handler(req, res) {
  // CORS — allow requests from the same site
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: "stats not configured" });
  }

  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
  };

  // GET /api/views?total=1  → sum of all page views
  // GET /api/views?slug=x   → count for one page
  // POST /api/views?slug=x  → increment count for one page, return new count
  if (req.method === "GET") {
    if (req.query.total) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/page_views?select=count`, { headers });
      const rows = await r.json();
      const total = (rows || []).reduce((s, row) => s + (row.count || 0), 0);
      return res.json({ total });
    }

    const slug = req.query.slug;
    if (!slug) return res.status(400).json({ error: "slug required" });

    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}&select=count`,
      { headers }
    );
    const rows = await r.json();
    return res.json({ count: rows?.[0]?.count ?? 0 });
  }

  if (req.method === "POST") {
    const slug = req.query.slug;
    if (!slug) return res.status(400).json({ error: "slug required" });

    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_view`, {
      method: "POST",
      headers,
      body: JSON.stringify({ page_slug: slug }),
    });
    const count = await r.json();
    return res.json({ count: typeof count === "number" ? count : 0 });
  }

  res.status(405).end();
}
