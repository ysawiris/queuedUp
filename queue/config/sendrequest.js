var socket = io();
var sender = $('#currentuser').val();
var receiverName;

function addFriend(name) {

    $.ajax({
        url: '/search',
        type: 'POST',
        data: {
            receiverName: name
        },
        success: function() {

        }
    })
}


$(document).ready(function() {
    $('.friend-add').on('click', function(e) {
        e.preventDefault();
    });
    $('#accept_friend').on('click', function() {
        var senderId = $('#senderId').val();
        var senderName = $('#senderName').val();

        $.ajax({
            url: '/search/',
            type: 'POST',
            data: {
                senderId: senderId,
                senderName: senderName
            },
            success: function() {
                $(this).parent().eq(1).remove();
            }
        });
        $('#reload').load(location.href + ' #reload');
    });
    $('#cancel_friend').on('click', function() {
        var user_Id = $('#user_Id').val();
        // console.log(user_Id);	
        $.ajax({
            url: '/search',
            type: 'POST',
            data: {
                user_Id: user_Id
            },
            success: function() {
                $(this).parent().eq(1).remove();
            }
        });
        $('#reload').load(location.href + ' #reload');
    });
    $('#song_search').on('click', function() {
        let spotifytoken = $('#user_token1').val()
        let song = $('#song').val()

        $.ajax({
            url: `https://api.spotify.com/v1/search?q=${song}&type=track`,
            type: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + spotifytoken
            },
            success: function(data) {
                console.log('*******************')
                console.log(data.tracks.items[0]);
                let htmlstr = ''
                data.tracks.items.forEach(song => {
                    htmlstr += `
                    <div class="row">
                        <img class="header-image" src='${song.album.images[2].url}' alt="logo">
                        <h5>${song.name}</h>
                        <h6>by:${song.artists[0].name}</h6>
                        <button 
                            data-uri="${song.uri}"
                            type="submit" 
                            class="btn btn-success change_song">Accept</button>
                    </div>`
                });

                el.innerHTML = htmlstr
            }
        });
        $('#reload').load(location.href + ' #reload');
    });
    $('body').on('click', '.change_song', function(e) {
        let spotifytoken = $('#friend_token').val()
        let song = $(this).data('uri')

        console.log(spotifytoken)

        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/queue?uri=' + song,
            type: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + spotifytoken
            },
            success: function(data) {
                console.log(data);
            }
        });
        $('#reload').load(location.href + ' #reload');
    });
});