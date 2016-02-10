(function() {
    var spotifyApi = new SpotifyWebApi();
    var user_id = null;
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
    var params = getHashParams();
    spotifyApi.setAccessToken(params.access_token);

    if (params.access_token) {
        spotifyApi.getMe()
            .then(function (data) {
                user_id = data.id;
            });
    }

    /**************************/
    /**************************/
    /**** HELPER FUNCTIONS ****/

    /**
     * Gets the user's playlists
     * and fills the userPlaylistsPlaceholder dropdown with the results
     * */
    function getPlaylists() {
        spotifyApi.getUserPlaylists(user_id)
            .then(function(data) {
                userPlaylistsPlaceholder.innerHTML = userPlaylistsCompiled(data.items);
            }, function(err) {
                console.error(err);
            });
    }

    /**
     * Displays a playlists' tracks
     * and fills the singlePlaylistPlaceholder view with the results
     * @param {string} the user id
     * @param {string} the playlist id
     * */
    function displayPlaylistTracks(user, playlist, start_over) {
        spotifyApi.getPlaylistTracks(user, playlist)
            .then(function(data) {
                singlePlaylistPlaceholder.innerHTML = singlePlaylistCompiled(data.items);
                playlistButtonPlaceholder.innerHTML = playlistButtonCompiled({id: playlist});
            }, function(err) {
                singlePlaylistPlaceholder.innerHTML = "<b>An error occurred, see console for details.</b>";
                playlistButtonPlaceholder.innerHTML = "";
                console.error(err);
            });
        if (start_over) {
            $('#results').hide();
            $('#search_results').empty();
        } else {
            $('#results').show();
        }
    }

    /**
     * Grabs a the currently designed playlists' tracks
     * and returns an array for use in a PUT
     * @param Array (DOM Elements)
     * @return Array
     * */
    function getPreviewPlaylistTracks(tracks) {
        var playlist = [];

        _.each(tracks, function(song) {
            playlist = playlist.concat($(song).data('uri'));
        });
        return playlist;
    }


    /**** HANDLEBARS TEMPLATES ****/

    var userPlaylistsTemplate = $('#user-playlists-template')[0].innerHTML,
        userPlaylistsCompiled = Handlebars.compile(userPlaylistsTemplate),
        userPlaylistsPlaceholder = $('.dropdown-menu')[0];

    var searchResultsTemplate = $('#search-results-template')[0].innerHTML,
        searchResultsCompiled = Handlebars.compile(searchResultsTemplate),
        searchResultsPlaceholder = $('#search_results')[0];

    var singlePlaylistTemplate = $('#single-playlist-template')[0].innerHTML,
        singlePlaylistCompiled = Handlebars.compile(singlePlaylistTemplate),
        singlePlaylistPlaceholder = $('#playlist_tracks')[0];

    var playlistButtonTemplate = $('#playlist-options-template')[0].innerHTML,
        playlistButtonCompiled = Handlebars.compile(playlistButtonTemplate),
        playlistButtonPlaceholder = $('#playlist_options')[0];


    /**** USER ACTIONS (JQUERY) ****/

    // Create a Playlist, add to dropdown
    $('.btn-create').on('click', function(e){
        var name = $('#playlist_name').val();
        spotifyApi.createPlaylist(user_id, {name: name})
            .then(function(data) {
                alert("A blank playlist, " + name + " has been added to the list!");
                getPlaylists();
            }, function(err) {
                alert("An error occurred, see the console for details");
                console.error(err);
            });
    });

    // Search for a track
    $('#track_search').keyup(function () {
        var query = $('#track_search').val();
        spotifyApi.searchTracks(query)
            .then(function(data) {
                searchResultsPlaceholder.innerHTML = searchResultsCompiled(data.tracks.items);
            }, function(err) {
                searchResultsPlaceholder.innerHTML = "No results were found, see console for details.";
                console.error(err);
            });
    });

    // Select playlist from dropdown and display its name
    $('.playlist_results').on('click', '.playlist_item', function(e) {
        e.preventDefault();
        $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));

        var plist_id = $(this).data('id');
        displayPlaylistTracks(user_id, plist_id, false)
    });

    // Add track to current playlist view
    $('#search_results').on('click', '.glyphicon-plus', function(e) {
        e.preventDefault();

        $(this).parent().clone().appendTo('#playlist_tracks')
            .find('.glyphicon').removeClass('glyphicon-add').addClass('glyphicon-remove');
    });

    // Remove track from current playlist view
    $('#playlist_tracks').on('click', '.glyphicon-remove', function(e) {
        e.preventDefault();
        $(this).parent().remove();
    });

    // Clear (Empty) a playlist
    $('#playlist_options').on('click', '.btn-clear', function() {
        var plist_id = $(this).data('plist');
        spotifyApi.replaceTracksInPlaylist(user_id, plist_id, [])
            .then(function(data) {
                displayPlaylistTracks(user_id, plist_id, true);
                alert("Successfully Cleared! Starting Over...");
            }, function(err) {
                alert("An error occurred");
                console.error(err);
            });
    });

    // Update a playlist
    $('#playlist_options').on('click', '.btn-update', function() {
        var plist_id = $(this).data('plist');

        var updated_tracks = getPreviewPlaylistTracks($('#playlist_tracks li'));

        spotifyApi.replaceTracksInPlaylist(user_id, plist_id, updated_tracks)
            .then(function(data) {
                displayPlaylistTracks(user_id, plist_id, true);
                alert("Successfully Updated! Starting Over...");
            }, function(err) {
                alert("An error occurred");
                console.error(err);
            });
    });



    /*
     // If not using Handlebars, this function would replace "searchResultsCompiled"
     displayFoundTracks = function(list) {
     $('#search_results').empty();
     var li = [];

     _.each(list, function(song) {
     li.push('<li class="search_result" data-uri="' + song.uri  + '">' +
     song.artists[0].name + ' - ' + song.name +
     ' <span class="glyphicon glyphicon-plus"></span></li>');
     });
     $('#search_results').append(li.join(''));
     };
     */
})();





