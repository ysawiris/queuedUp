(function () {
	const toggle = document.getElementById("nav-toggle");
	const links = document.getElementById("nav-links");
	if (!toggle || !links) return;

	toggle.addEventListener("click", () => {
		const open = links.classList.toggle("is-open");
		toggle.setAttribute("aria-expanded", open ? "true" : "false");
	});

	// Close on link tap (mobile)
	links.addEventListener("click", (e) => {
		if (e.target.matches(".nav__link")) {
			links.classList.remove("is-open");
			toggle.setAttribute("aria-expanded", "false");
		}
	});

	// Mark active link
	const path = window.location.pathname;
	links.querySelectorAll(".nav__link").forEach((a) => {
		const href = a.getAttribute("href");
		if (href && href !== "/" && path.startsWith(href)) {
			a.classList.add("is-active");
		}
	});
})();
