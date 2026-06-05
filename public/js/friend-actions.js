(function () {
	function postForm(data) {
		const body = new URLSearchParams(data).toString();
		return fetch("/search", {
			method: "POST",
			credentials: "same-origin",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
		});
	}

	document.addEventListener("click", async (e) => {
		const btn = e.target.closest("[data-action]");
		if (!btn) return;

		const action = btn.dataset.action;

		if (action === "add-friend") {
			const name = btn.dataset.name;
			btn.disabled = true;
			btn.textContent = "Sending...";
			try {
				const res = await postForm({ receiverName: name });
				if (!res.ok) throw new Error("Request failed");
				btn.textContent = "Sent ✓";
				btn.classList.remove("btn--primary");
				btn.classList.add("btn--ghost");
				window.toast?.ok(`Friend request sent to ${name}`);
			} catch (err) {
				btn.disabled = false;
				btn.textContent = "Add";
				window.toast?.err("Couldn't send request");
			}
		}

		if (action === "accept-friend") {
			const senderId = btn.dataset.senderId;
			const senderName = btn.dataset.senderName;
			btn.disabled = true;
			try {
				const res = await postForm({ senderId, senderName });
				if (!res.ok) throw new Error("Request failed");
				window.toast?.ok(`You and ${senderName} are now friends`);
				const row = btn.closest("[data-request-id]");
				if (row) row.remove();
			} catch (err) {
				btn.disabled = false;
				window.toast?.err("Couldn't accept");
			}
		}

		if (action === "cancel-request") {
			const userId = btn.dataset.userId;
			btn.disabled = true;
			try {
				const res = await postForm({ user_Id: userId });
				if (!res.ok) throw new Error("Request failed");
				window.toast?.info("Request dismissed");
				const row = btn.closest("[data-request-id]");
				if (row) row.remove();
			} catch (err) {
				btn.disabled = false;
				window.toast?.err("Couldn't dismiss");
			}
		}
	});
})();
