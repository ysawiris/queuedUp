# Queued Up

Add songs to your friends' Spotify queue in real time.

A Node.js + Express + Socket.IO + MongoDB app with Spotify OAuth and a
modern dark UI.

## Quick start

```bash
cp .env.example .env
# fill in SESSION_SECRET, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

npm install
npm run dev
```

Open <http://localhost:8080>.

You'll need:
- Node.js 18+
- A running MongoDB (`mongod` locally, or use docker-compose below)
- A Spotify developer app — <https://developer.spotify.com/dashboard>
  - Add `http://localhost:8080/callback` to **Redirect URIs**

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The app boots on `:8080`, MongoDB on `:27018` (host) / `:27017` (network).

## Tech

- **Backend:** Express 5, express-handlebars 8, Mongoose 9, Passport (custom Spotify OAuth2 strategy), Socket.IO 4
- **Frontend:** Vanilla JS, modern CSS (custom properties, glass morphism, gradient mesh), zero jQuery, zero Bootstrap
- **Security:** Helmet headers, secure session cookies, Mongo-backed session store, `trust proxy` for TLS-terminating hosts, `dotenv` for secrets
- **Deploy:** Render (`render.yaml` blueprint), Heroku (`Procfile`), CapRover (`captain-definition`), or Docker

## Project layout

```
app.js                 — Express + Passport + Socket.IO setup
controllers/           — route handlers
models/                — Mongoose schemas
data/queue-db.js       — MongoDB connection
lib/passport-spotify/  — custom Spotify OAuth2 strategy
public/                — static assets (css, js, images)
views/                 — Handlebars templates
socket/                — Socket.IO event handlers
```

## Notes

- Spotify queue mutations require **Premium** on the receiving account.
- Receivers must be actively playing on a Spotify device for the queue add to land.
- Access tokens expire ~1 hour after login — friends should re-auth periodically.

## Author

Youssef Sawiris — [@ysawiris](https://github.com/ysawiris)
