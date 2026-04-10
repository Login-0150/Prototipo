import { Router } from "express";

const router = Router();

const CLIENT_ID = process.env["SPOTIFY_CLIENT_ID"] || "";
const CLIENT_SECRET = process.env["SPOTIFY_CLIENT_SECRET"] || "";

function getRedirectUri(req: any) {
  const host = process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : `${req.protocol}://${req.get("host")}`;
  return `${host}/api/auth/spotify/callback`;
}

router.get("/login", (req, res): void => {
  if (!CLIENT_ID) {
    res.status(503).json({ error: "SPOTIFY_CLIENT_ID not configured" });
    return;
  }
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "playlist-read-private",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: getRedirectUri(req),
    show_dialog: "true",
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

router.get("/callback", async (req, res): Promise<void> => {
  const code = req.query["code"] as string;
  const error = req.query["error"] as string;

  if (error || !code) {
    res.send(`<script>
      window.opener?.postMessage({ type: 'spotify-auth-error', error: '${error || "no_code"}' }, '*');
      window.close();
    </script>`);
    return;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.send(`<script>
      window.opener?.postMessage({ type: 'spotify-auth-error', error: 'server_not_configured' }, '*');
      window.close();
    </script>`);
    return;
  }

  try {
    const redirectUri = getRedirectUri(req);
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json() as any;

    if (!tokenRes.ok || tokenData.error) {
      res.send(`<script>
        window.opener?.postMessage({ type: 'spotify-auth-error', error: '${tokenData.error || "token_error"}' }, '*');
        window.close();
      </script>`);
      return;
    }

    // Fetch user profile
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json() as any;

    const payload = JSON.stringify({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      displayName: profile.display_name || profile.id,
      email: profile.email,
      imageUrl: profile.images?.[0]?.url || null,
      isPremium: profile.product === "premium",
    });

    res.send(`<script>
      window.opener?.postMessage({ type: 'spotify-auth-success', data: ${payload} }, '*');
      window.close();
    </script>`);
  } catch (err) {
    res.send(`<script>
      window.opener?.postMessage({ type: 'spotify-auth-error', error: 'server_error' }, '*');
      window.close();
    </script>`);
  }
});

router.post("/refresh", async (req, res): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken || !CLIENT_ID || !CLIENT_SECRET) {
    res.status(400).json({ error: "Missing params" });
    return;
  }
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = await tokenRes.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

export default router;
