(function() {
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
    function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

    function getData() {
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              userProfilePlaceholder.innerHTML = userProfileTemplate(response);
              var duration_ms = response.item.duration_ms;
              var progress_ms = response.progress_ms;
              var uri = response.item.uri
              var med = progress_ms / duration_ms;
              var percentage = Math.round(med * 100);

              document.getElementById('percentage').append(percentage + '%')

              var refreshwhen = (duration_ms - progress_ms) + 1000

              setTimeout(function() {
                document.location.reload()
          }, refreshwhen);

              $('#login').hide();
              $('#loggedin').show();
            }
            
        });}

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');



    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {
        getData()
      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }


    }
  })();