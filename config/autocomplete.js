const search = document.getElementById("user-search");

const searchUsers = async (searchText) => {
	const response = await fetch("http://localhost:8080/user-search/");
	const users = await response.json();

	let matches = users.filter((user) => {
		const regex = new RegExp(`${searchText}`, "gi");
		return user.ejs.match(regex);
	});

	if (searchText.length === 0) {
		matches = [];
	}
	console.log(matches);
};

search.addEventListener("input", () => searchUsers(search.value));
