const { Redis } = require("@upstash/redis");

// Upstash REST client — HTTP-based, no connection pool, serverless-safe.
// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
const redis = Redis.fromEnv();

const userKey = (spotifyId) => `user:${spotifyId}`;
const usernameKey = (username) => `username:${String(username).toLowerCase()}`;
const postsKey = (spotifyId) => `posts:${spotifyId}`;
const USERS_SET = "users";

function emptyGraph() {
	return { request: [], sentRequest: [], friendsList: [], totalRequest: 0 };
}

async function getUser(spotifyId) {
	if (!spotifyId) return null;
	return (await redis.get(userKey(spotifyId))) || null;
}

async function getUserByUsername(username) {
	if (!username) return null;
	const id = await redis.get(usernameKey(username));
	return id ? getUser(id) : null;
}

async function listUsers() {
	const ids = await redis.smembers(USERS_SET);
	if (!ids || ids.length === 0) return [];
	const keys = ids.map(userKey);
	const users = await redis.mget(...keys);
	return users.filter(Boolean);
}

async function saveUser(user) {
	await redis.set(userKey(user.spotifyId), user);
	await redis.sadd(USERS_SET, user.spotifyId);
	if (user.username) {
		await redis.set(usernameKey(user.username), user.spotifyId);
	}
	return user;
}

// Create on first login, or refresh the stored tokens on return.
// The social graph is preserved across logins.
async function upsertUserOnLogin({
	spotifyId,
	username,
	photo,
	spotifyToken,
	refreshToken,
	expiresIn,
}) {
	const existing = await getUser(spotifyId);
	const tokenExpiresAt = Date.now() + (Number(expiresIn) || 3600) * 1000;

	const next = {
		...(existing || { spotifyId, ...emptyGraph() }),
		spotifyId,
		username: username || (existing && existing.username) || spotifyId,
		photo: photo || (existing && existing.photo) || "",
		spotifyToken,
		// Spotify only returns a refresh token on the first authorization;
		// keep the prior one if this exchange didn't include a new one.
		refreshToken: refreshToken || (existing && existing.refreshToken) || "",
		tokenExpiresAt,
	};

	return saveUser(next);
}

async function setTokens(spotifyId, { spotifyToken, refreshToken, expiresIn }) {
	const user = await getUser(spotifyId);
	if (!user) return null;
	const next = {
		...user,
		spotifyToken,
		refreshToken: refreshToken || user.refreshToken || "",
		tokenExpiresAt: Date.now() + (Number(expiresIn) || 3600) * 1000,
	};
	return saveUser(next);
}

function hasEntry(list, predicate) {
	return Array.isArray(list) && list.some(predicate);
}

// me sends a friend request to the user with the given display name.
async function sendFriendRequest(meId, receiverUsername) {
	const me = await getUser(meId);
	const receiver = await getUserByUsername(receiverUsername);
	if (!me || !receiver || receiver.spotifyId === me.spotifyId) return;

	const alreadyRequested = hasEntry(
		receiver.request,
		(r) => r.userId === me.spotifyId
	);
	const alreadyFriends = hasEntry(
		receiver.friendsList,
		(f) => f.friendId === me.spotifyId
	);

	if (!alreadyRequested && !alreadyFriends) {
		await saveUser({
			...receiver,
			request: [
				...(receiver.request || []),
				{ userId: me.spotifyId, username: me.username },
			],
			totalRequest: (receiver.totalRequest || 0) + 1,
		});
	}

	if (!hasEntry(me.sentRequest, (s) => s.username === receiver.username)) {
		await saveUser({
			...me,
			sentRequest: [
				...(me.sentRequest || []),
				{ username: receiver.username },
			],
		});
	}
}

// me accepts a pending request from sender.
async function acceptFriendRequest(meId, senderId, senderName) {
	const me = await getUser(meId);
	const sender = await getUser(senderId);
	if (!me || !sender) return;

	if (!hasEntry(me.friendsList, (f) => f.friendId === sender.spotifyId)) {
		await saveUser({
			...me,
			friendsList: [
				...(me.friendsList || []),
				{ friendId: sender.spotifyId, friendName: senderName },
			],
			request: (me.request || []).filter(
				(r) => r.userId !== sender.spotifyId
			),
			totalRequest: Math.max(0, (me.totalRequest || 0) - 1),
		});
	}

	if (!hasEntry(sender.friendsList, (f) => f.friendId === me.spotifyId)) {
		await saveUser({
			...sender,
			friendsList: [
				...(sender.friendsList || []),
				{ friendId: me.spotifyId, friendName: me.username },
			],
			sentRequest: (sender.sentRequest || []).filter(
				(s) => s.username !== me.username
			),
		});
	}
}

// me dismisses an incoming request from otherId (no friendship formed).
async function dismissRequest(meId, otherId) {
	const me = await getUser(meId);
	const other = await getUser(otherId);
	if (!me) return;

	await saveUser({
		...me,
		request: (me.request || []).filter((r) => r.userId !== otherId),
		totalRequest: Math.max(0, (me.totalRequest || 0) - 1),
	});

	if (other) {
		await saveUser({
			...other,
			sentRequest: (other.sentRequest || []).filter(
				(s) => s.username !== me.username
			),
		});
	}
}

async function createPost(spotifyId, { title, summary }) {
	const post = {
		title,
		summary,
		user: spotifyId,
		createdAt: new Date().toISOString(),
	};
	await redis.lpush(postsKey(spotifyId), post);
	return post;
}

async function listPosts(spotifyId) {
	const posts = await redis.lrange(postsKey(spotifyId), 0, -1);
	return posts || [];
}

module.exports = {
	redis,
	getUser,
	getUserByUsername,
	listUsers,
	saveUser,
	upsertUserOnLogin,
	setTokens,
	sendFriendRequest,
	acceptFriendRequest,
	dismissRequest,
	createPost,
	listPosts,
};
