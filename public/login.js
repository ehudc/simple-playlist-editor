(function() {
    var stateKey = 'spotify_auth_state';
    var spotifyApi = new SpotifyWebApi();

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
     */
    function generateRandomString(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    var userPlaylistsTemplate = $('#user-playlists-template')[0].innerHTML,
        userPlaylistsCompiled = Handlebars.compile(userPlaylistsTemplate),
        userPlaylistsPlaceholder = $('.dropdown-menu')[0];

    /**
     * Queries API for User's playlists and populates dropdown
     * @param {object} the resulting data from user authentication
     */
    function loadPlaylists(obj) {
        spotifyApi.getUserPlaylists(obj.id)
            .then(function(data) {
                userPlaylistsPlaceholder.innerHTML = userPlaylistsCompiled(data.items);
            }, function(err) {
                console.error(err);
            });
    };


    var params = getHashParams();

    var access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    if (access_token && (state == null || state !== storedState)) {
        alert('There was an error during the authentication');
    } else {
        localStorage.removeItem(stateKey);
        if (access_token) {
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                    spotifyApi.setAccessToken(access_token);

                    loadPlaylists(response);

                    $('#login').hide();
                    $('#loggedin').show();
                }
            });
        } else {
            $('#login').show();
            $('#loggedin').hide();
        }

        $('#login-button')[0].addEventListener('click', function() {

            var client_id = '68084b2114774ffd81743c320107631e'; // Your client id
            var redirect_uri = 'http://localhost:8888/'; // Your redirect uri

            var state = generateRandomString(16);

            localStorage.setItem(stateKey, state);
            var scope = [
                "playlist-read",
                "playlist-read-private",
                "playlist-modify-public",
                "playlist-modify-private",
                "user-read-private",
                "user-read-email"
            ];

            var url = 'https://accounts.spotify.com/authorize';
            url += '?response_type=token';
            url += '&client_id=' + encodeURIComponent(client_id);
            url += '&scope=' + encodeURIComponent(scope.join(' '));
            url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
            url += '&state=' + encodeURIComponent(state);
            //url += '&show_dialog=true';

            window.location = url;
        }, false);
    }
})();
