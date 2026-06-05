const { getUser, setTokens } = require("../data/redis");

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const REFRESH_BUFFER_MS = 60 * 1000;

async function refreshAccessToken(refreshToken) {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const res = await fetch(TOKEN_URL, {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
	});

	if (!res.ok) {
		throw new Error(`Spotify token refresh failed: ${res.status}`);
	}
	return res.json();
}

// Returns the stored user with a non-expired access token, refreshing
// against Spotify when the cached token is within the expiry buffer.
async function loadFreshUser(spotifyId) {
	const user = await getUser(spotifyId);
	if (!user) return null;

	const expired =
		!user.tokenExpiresAt ||
		Date.now() > user.tokenExpiresAt - REFRESH_BUFFER_MS;

	if (!expired || !user.refreshToken) return user;

	try {
		const data = await refreshAccessToken(user.refreshToken);
		return await setTokens(spotifyId, {
			spotifyToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresIn: data.expires_in,
		});
	} catch (err) {
		console.error("Token refresh failed for", spotifyId, err.message);
		return user;
	}
}

module.exports = { refreshAccessToken, loadFreshUser };
