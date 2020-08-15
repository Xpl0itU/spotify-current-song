var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var fs = require('fs');
const { json } = require('express');


var client_id = '53d3aa0f077c493b80a332c3bdafbbe0'; // Your client id
var client_secret = 'c972561cf4ae4eeca85fb95f064c6ab3'; // Your secret
var redirect_uri = 'http://localhost:8889/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/client'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-modify-playback-state user-read-currently-playing user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

            var jsondata = {
                url: 'http://localhost:8888/trackdata.json',
                json: true
            };
    
            request.get(jsondata, function(body, response, error) {
                console.log(error)
                var context_uri = error.context_uri
                var position_ms = error.position_ms
                var refreshnum = error.refreshnum
                console.log(context_uri, position_ms, refreshnum)
                
                var options = {
                    url: 'https://api.spotify.com/v1/me/player/play',
                    headers: { 
                      'Authorization': 'Bearer ' + access_token },
                    body: JSON.stringify({
                      'context_uri': context_uri,
                      'position_ms': position_ms, })
                  };
                  request.put(options, function(error, response, body) {
                    console.log(body, error);
          
                  })
                  // use the access token to access the Spotify Web API
          
                  
          

            });


        };




        // we can also pass the token to the browser to make requests from there
        


    });
  }
});

console.log('Listening on 8889');
app.listen(8889);