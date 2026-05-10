(function () {
	const host = document.getElementById("toast-host");
	if (!host) return;

	const ICONS = {
		ok: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
		err: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
		info: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
	};

	function show(message, kind = "ok", duration = 2800) {
		const el = document.createElement("div");
		el.className = `toast toast--${kind}`;
		el.innerHTML = `${ICONS[kind] || ICONS.info}<span>${message}</span>`;
		host.appendChild(el);

		const timer = setTimeout(() => dismiss(el), duration);
		el.addEventListener(
			"click",
			() => {
				clearTimeout(timer);
				dismiss(el);
			},
			{ once: true }
		);
	}

	function dismiss(el) {
		el.classList.add("is-leaving");
		el.addEventListener("animationend", () => el.remove(), { once: true });
	}

	window.toast = { show, ok: (m) => show(m, "ok"), err: (m) => show(m, "err"), info: (m) => show(m, "info") };
})();
