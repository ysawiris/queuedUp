const search = document.getElementById("user-search");
const matchList = document.getElementById("match-list");

const getCurrentUser = async (example) => {
	const response = await fetch("http://localhost:8080/current-user/");
	const user = await response.json();

	return user;
};

const searchUsers = async (searchText) => {
	const currentUser = await getCurrentUser();
	const response = await fetch("http://localhost:8080/user-search/");
	const users = await response.json();

	let matches = users.filter((user) => {
		const regex = new RegExp(`${searchText}`, "gi");
		return user.name.match(regex);
	});

	if (searchText.length === 0) {
		matches = [];
		matchList.innerHTML = "";
	}
	outputHTML(matches, currentUser);
};

const outputHTML = (matches, currentUser) => {
	console.log(currentUser);
	if (matches.length > 0) {
		const html = matches
			.map(
				(match) => `
			<div class="usercard col-lg-3">
				<img class="card-img-top " src="${match.photo}" style="width: 25%; " alt="User Profile">
				<p class="usercard-username">@(${match.name})</p>
				<form action="" method="get" class="add_friend">
					<input type="hidden" name="receiverName" class="receiverName" value="${match.name}">
					<input type="hidden" name="sender-name" class="sender-name" value="${currentUser.username}">
					<button type="submit" onclick="addFriend('${match.username}')"
						class="btn btn-success add accept friend-add"><i class="fa fa-user"></i> Add Friend</button>
				</form>
			</div>
		`
			)
			.join("");
		matchList.innerHTML = html;
	}
};

search.addEventListener("input", () => searchUsers(search.value));
