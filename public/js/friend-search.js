(function () {
	const search = document.getElementById("user-search");
	const matchList = document.getElementById("match-list");
	const empty = document.getElementById("match-empty");
	if (!search || !matchList) return;

	let users = null;
	let currentUser = null;
	let inflight = null;
	let debounceTimer = null;

	async function loadData() {
		if (users && currentUser) return;
		const [usersRes, meRes] = await Promise.all([
			fetch("/user-search", { credentials: "same-origin" }),
			fetch("/current-user", { credentials: "same-origin" }),
		]);
		users = await usersRes.json();
		currentUser = await meRes.json();
	}

	function renderEmpty(visible) {
		if (!empty) return;
		empty.hidden = !visible;
	}

	function escapeHtml(s) {
		return String(s ?? "").replace(/[&<>"']/g, (c) => ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		})[c]);
	}

	function render(matches) {
		if (!matches.length) {
			matchList.innerHTML = "";
			renderEmpty(true);
			if (empty) {
				empty.querySelector("h3").textContent = "No matches";
				empty.querySelector("p").innerHTML = `No one named "<strong>${escapeHtml(search.value)}</strong>" has signed up yet.`;
			}
			return;
		}
		renderEmpty(false);
		matchList.innerHTML = matches
			.map(
				(match) => `
				<div class="user-row" data-name="${escapeHtml(match.name)}">
					<span class="avatar avatar--md">
						${match.photo ? `<img src="${escapeHtml(match.photo)}" alt="${escapeHtml(match.name)}">` : ""}
					</span>
					<div class="user-row__body">
						<p class="user-row__name">${escapeHtml(match.name)}</p>
						<p class="user-row__sub">@${escapeHtml(match.name)}</p>
					</div>
					<div class="user-row__actions">
						<button type="button" class="btn btn--primary btn--sm" data-action="add-friend" data-name="${escapeHtml(match.name)}">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
							Add
						</button>
					</div>
				</div>
			`
			)
			.join("");
	}

	async function runSearch() {
		const text = search.value.trim();
		if (!text) {
			matchList.innerHTML = "";
			renderEmpty(true);
			if (empty) {
				empty.querySelector("h3").textContent = "Start typing to find people";
				empty.querySelector("p").textContent =
					"Search will only show you people who've signed up for Queued Up.";
			}
			return;
		}

		try {
			if (!inflight) inflight = loadData();
			await inflight;
		} catch (err) {
			console.error(err);
			window.toast?.err("Couldn't load users");
			return;
		}

		const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
		const matches = users.filter((u) => regex.test(u.name)).slice(0, 30);
		render(matches);
	}

	search.addEventListener("input", () => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(runSearch, 120);
	});

	// Initial empty state
	renderEmpty(true);
})();
