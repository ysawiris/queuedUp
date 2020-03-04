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
    $('#change_song').on('click', function() {
        let spotifytoken = 'BQCV3CX9ibHFbYsaSsp4-1uKX4vjaTefIhhdXuK4Nb5483W6wMuVFjJ9iWA6reowyta_CBMNKEbsVs_zNqyLuBFkewJupPWpG8fl9ZAckaCDAn7QxtKvEV3ql-lvziB7RI7qno_s6kHsn7QoypDTk__-DbzP7dc4'

        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A0W9E3s2G4szLUwXsE17x5E',
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
    $('#reload').load(location.href + ' #reload');
});