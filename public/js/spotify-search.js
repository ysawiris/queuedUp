(function () {
	const songInput = document.getElementById("song");
	const userTokenEl = document.getElementById("user_token1");
	const friendTokenEl = document.getElementById("friend_token");
	const results = document.getElementById("song-results");
	const empty = document.getElementById("song-empty");
	if (!songInput || !results) return;

	let debounceTimer = null;
	let lastQuery = "";

	function escapeHtml(s) {
		return String(s ?? "").replace(/[&<>"']/g, (c) => ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		})[c]);
	}

	function showEmpty(visible) {
		if (empty) empty.hidden = !visible;
	}

	function render(items) {
		if (!items.length) {
			results.innerHTML = "";
			showEmpty(true);
			if (empty) {
				empty.querySelector("h3").textContent = "No matches";
				empty.querySelector("p").innerHTML = `No songs found for "<strong>${escapeHtml(songInput.value)}</strong>".`;
			}
			return;
		}
		showEmpty(false);
		results.innerHTML = items
			.map((song) => {
				const art = song.album?.images?.[0]?.url || "";
				const artist = song.artists?.map((a) => a.name).join(", ") || "Unknown";
				return `
					<div class="song">
						<div class="song__art">${art ? `<img src="${escapeHtml(art)}" alt="">` : ""}</div>
						<div class="song__body">
							<p class="song__title">${escapeHtml(song.name)}</p>
							<p class="song__artist">${escapeHtml(artist)} · ${escapeHtml(song.album?.name || "")}</p>
						</div>
						<button type="button" class="btn btn--primary btn--sm" data-uri="${escapeHtml(song.uri)}" data-title="${escapeHtml(song.name)}">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
							Queue
						</button>
					</div>
				`;
			})
			.join("");
	}

	async function runSearch() {
		const text = songInput.value.trim();
		if (!text) {
			results.innerHTML = "";
			showEmpty(true);
			if (empty) {
				empty.querySelector("h3").textContent = "What are we adding?";
				empty.querySelector("p").textContent =
					"Type a track or artist name to search Spotify.";
			}
			return;
		}
		if (text === lastQuery) return;
		lastQuery = text;

		const token = userTokenEl?.value;
		if (!token) {
			window.toast?.err("Missing Spotify token — try logging out and back in.");
			return;
		}

		try {
			const res = await fetch(
				`https://api.spotify.com/v1/search?type=track&limit=20&q=${encodeURIComponent(text)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			if (!res.ok) {
				if (res.status === 401) {
					window.toast?.err("Spotify session expired — log out and back in.");
					return;
				}
				throw new Error(`Spotify ${res.status}`);
			}
			const data = await res.json();
			render(data.tracks?.items || []);
		} catch (err) {
			console.error(err);
			window.toast?.err("Couldn't reach Spotify");
		}
	}

	songInput.addEventListener("input", () => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(runSearch, 220);
	});

	songInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			clearTimeout(debounceTimer);
			runSearch();
		}
	});

	// Queue button (delegated)
	results.addEventListener("click", async (e) => {
		const btn = e.target.closest("[data-uri]");
		if (!btn) return;

		const uri = btn.dataset.uri;
		const title = btn.dataset.title;
		const friendToken = friendTokenEl?.value;
		if (!friendToken) {
			window.toast?.err("Your friend hasn't logged in recently. Ask them to refresh.");
			return;
		}

		btn.disabled = true;
		btn.textContent = "Queuing...";

		try {
			const res = await fetch(
				`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${friendToken}` },
				}
			);
			if (res.status === 204) {
				btn.textContent = "Queued ✓";
				btn.classList.remove("btn--primary");
				btn.classList.add("btn--ghost");
				window.toast?.ok(`"${title}" added to their queue`);
			} else if (res.status === 404) {
				btn.disabled = false;
				btn.textContent = "Queue";
				window.toast?.err("They need to be playing music on Spotify first.");
			} else if (res.status === 401) {
				btn.disabled = false;
				btn.textContent = "Queue";
				window.toast?.err("Their Spotify session expired. Ask them to log back in.");
			} else if (res.status === 403) {
				btn.disabled = false;
				btn.textContent = "Queue";
				window.toast?.err("Spotify Premium required for queue actions.");
			} else {
				throw new Error(`Spotify ${res.status}`);
			}
		} catch (err) {
			console.error(err);
			btn.disabled = false;
			btn.textContent = "Queue";
			window.toast?.err("Couldn't queue song");
		}
	});
})();
