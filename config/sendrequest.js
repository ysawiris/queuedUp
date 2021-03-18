var socket = io();
var sender = $("#currentuser").val();
var receiverName;

function initScroll() {
	var Scrollbar = window.Scrollbar;
	Scrollbar.use(window.OverscrollPlugin);

	var customScroll = Scrollbar.init(document.querySelector(".js-scroll-list"), {
		plugins: {
			overscroll: true,
		},
	});

	var listItem = $(".js-scroll-list-item");

	listItem.eq(0).addClass("item-focus");
	listItem.eq(1).addClass("item-next");

	customScroll.addListener(function (status) {
		var $content = $(".js-scroll-content");

		var viewportScrollDistance = 0;

		viewportScrollDistance = status.offset.y;
		var viewportHeight = $content.height();
		var listHeight = 0;
		var $listItems = $content.find(".js-scroll-list-item");
		for (var i = 0; i < $listItems.length; i++) {
			listHeight += $($listItems[i]).height();
		}

		var top = status.offset.y;
		// console.log(top);
		var visibleCenterVertical = 0;
		visibleCenterVertical = top;

		var parentTop = 1;
		var $lis = $(".js-scroll-list-item");
		var $focusLi;
		for (var i = 0; i < $lis.length; i++) {
			var $li = $($lis[i]);
			var liTop = $li.position().top;
			var liRelTop = liTop - parentTop;

			var distance = 0;
			var distance = Math.abs(top - liRelTop);
			var maxDistance = $(".js-scroll-content").height() / 2;
			var distancePercent = distance / (maxDistance / 100);

			if (liRelTop + $li.parent().scrollTop() > top) {
				if (!$li.hasClass("item-focus")) {
					$li.prev().addClass("item-hide");
					$lis.removeClass("item-focus");
					$lis.removeClass("item-next");
				}
				$li.removeClass("item-hide");
				$li.addClass("item-focus");
				$li.next().addClass("item-next");
				break;
			}
		}
	});
}

function addFriend(name) {
	$.ajax({
		url: "/search",
		type: "POST",
		data: {
			receiverName: name,
		},
		success: function () {
			alert("Yay, your adding a friend!");
		},
	});
}

$(document).ready(function () {
	$("#accept_friend").on("click", function () {
		var senderId = $("#senderId").val();
		var senderName = $("#senderName").val();

		$.ajax({
			url: "/search/",
			type: "POST",
			data: {
				senderId: senderId,
				senderName: senderName,
			},
			success: function () {
				$(this).parent().eq(1).remove();
				alert("YAY, you just added a friend");
			},
		});
		$("#reload").load(location.href + "#reload");
	});
	$("#cancel_friend").on("click", function () {
		var user_Id = $("#user_Id").val();
		// console.log(user_Id);
		$.ajax({
			url: "/search",
			type: "POST",
			data: {
				user_Id: user_Id,
			},
			success: function () {
				$(this).parent().eq(1).remove();
			},
		});
		$("#reload").load(location.href + "#reload");
	});
	$("#friend_search").change(function () {});
	$("#song_search").on("click", function () {
		let spotifytoken = $("#user_token1").val();
		let song = $("#song").val();

		$.ajax({
			url: `https://api.spotify.com/v1/search?q=${song}&type=track`,
			type: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: "Bearer " + spotifytoken,
			},
			success: function (data) {
				console.log("*******************");
				console.log(data.tracks.items[0]);
				let htmlstr = '<div class="scroll-content">';
				data.tracks.items.forEach((song) => {
					htmlstr += `<div class="row">
                            <img class="header-image" src='${song.album.images[0].url}' alt="logo" style="max-width: 150px; max-height: 150px;">
                            <div>
                                <h5>${song.name}</h>
                                <h6>by:${song.artists[0].name}</h6>
                                <button data-uri="${song.uri}" type="submit" class="btn btn-success change_song">Accept</button>
                            </div>
                        </div>`;
				});
				el.innerHTML = htmlstr + "</div>";
			},
		});
		$("#reload").load(location.href + "#reload");
	});
	$("body").on("click", ".change_song", function (e) {
		let spotifytoken = $("#friend_token").val();
		let song = $(this).data("uri");

		console.log(spotifytoken);

		$.ajax({
			url: "https://api.spotify.com/v1/me/player/queue?uri=" + song,
			type: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: "Bearer " + spotifytoken,
			},
			success: function (data) {
				console.log(data);
				alert("You successfully added a song!");
			},
		});
		$("#reload").load(location.href + "#reload");
	});
});
