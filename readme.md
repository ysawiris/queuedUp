# Queued Up

Add songs to your friends' Spotify queue.

A serverless Node.js + Express app with Spotify OAuth, Upstash Redis,
and a modern dark UI — deployed on Vercel.

## Quick start

```bash
cp .env.example .env
# fill in SESSION_PASSWORD, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
# UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

npm install
npm run dev
```

Open <http://localhost:8080>.

You'll need:
- Node.js 18+
- An Upstash Redis database — <https://console.upstash.com> (free tier)
- A Spotify developer app — <https://developer.spotify.com/dashboard>
  - Add `http://localhost:8080/callback` to **Redirect URIs**

## Deploy (Vercel)

Import the repo at <https://vercel.com/new>. Vercel reads `vercel.json`
and serves the Express app as a single serverless function. Set the env
vars from `.env.example` in the project settings, and add
`https://<your-app>.vercel.app/callback` to the Spotify Redirect URIs.

No always-on server, no database to babysit — scales to zero.

## Tech

- **Backend:** Express 5, express-handlebars 8, Passport (custom Spotify OAuth2 strategy)
- **Data:** Upstash Redis (HTTP/REST client — serverless-safe, no connection pool)
- **Sessions:** `iron-session` stateless encrypted cookie (no server-side store)
- **Frontend:** Vanilla JS, modern CSS (custom properties, glass morphism, gradient mesh), zero jQuery, zero Bootstrap
- **Security:** Helmet headers, encrypted session cookie, `dotenv` for secrets
- **Deploy:** Vercel serverless (`vercel.json`)

## Project layout

```
api/index.js           — Vercel serverless entrypoint (exports the Express app)
app.js                 — Express + Passport (OAuth-only) + iron-session setup
controllers/           — route handlers
data/redis.js          — Upstash Redis data layer (users, friends, posts)
lib/spotify.js         — Spotify token refresh + fresh-user loader
lib/passport-spotify/  — custom Spotify OAuth2 strategy
public/                — static assets (css, js, images)
views/                 — Handlebars templates
```

## Notes

- Spotify queue mutations require **Premium** on the receiving account.
- Receivers must be actively playing on a Spotify device for the queue add to land.
- Access tokens are refreshed automatically via the stored refresh token.

## Author

Youssef Sawiris — [@ysawiris](https://github.com/ysawiris)
