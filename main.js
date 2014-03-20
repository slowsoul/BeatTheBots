var express = require('express'),
  http = require('http'),
  path = require('path'),
  url = require('url'),
  querystring = require('querystring'),
  http = require('http'),
  btoa = require('btoa');

var MongoClient = require('mongodb').MongoClient,
    MONGO_PASSWORD = process.env.MONGO_PASSWORD, 
    connection_string = 'mongodb://gomoku-admin:' + MONGO_PASSWORD + '@ds033047.mongolab.com:33047/gomoku-crowd-bots',
    BotCollection = 'Bot';
    GameRecordCollection = 'GameRecord';

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.enable("jsonp callback");
  app.use(express.static(__dirname + '/app'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
    res.redirect('app/index.html');
});

app.get('/bot', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  if(!params['uid']) {
    res.status(400);
  }
  else {
    if(params['pickOp'] && params['pickOp'] == '1'){
      //pick at most 10 bots as opponents
      //ordered by rating, ascending
    }
    else
    {
      //return all the bots created by user
      //ordered by create date, descending
    }
  }
});

app.get('/bot/:bid', function(req, res) {
  var bid = req.params.bid;

  //get the game record data of this bot from database
});

app.get('/verify', function(req, res) {
  var _get = url.parse(req.url, true).query;
  // jsonrequest param
  var jsonrequest = (_get['jsonrequest']) ? _get['jsonrequest'] : undefined;

  // Language param, either 'py' or 'js'
  var lang = (_get['lang']) ? (_get['lang'] === 'py') ? 'python' : 'js' : 'python';
  res.jsonp({
    lang: '',
    jsonrequest: ''
  });
});

// Code verification API using GET method
app.post('/verify', function(req, res) {

	// jsonrequest param
	var jsonrequest = (req.body['jsonrequest']) ? req.body['jsonrequest'] : undefined;

	// Language param, either 'py' or 'js'
	var lang = (req.body['lang']) ? (req.body['lang'] === 'py') ? 'python' : 'js' : 'python';

	if (lang && jsonrequest) {
        var json_data = querystring.stringify({
          jsonrequest : JSON.stringify(jsonrequest)
        });
        var options = {
          host : 'ec2-54-251-204-6.ap-southeast-1.compute.amazonaws.com',
          path : '/' + lang,
          method : 'POST',
          headers : {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length' : json_data.length
          }
        };
        var verified_results = '';

        // Call the HTTP request
      var request = http.request(options, function(response) {
        // Handle data received
        response.on('data', function(chunk) {
          verified_results += chunk.toString();
        });
        // Send the json response
        response.on("end", function() {
          res.jsonp(JSON.parse(verified_results));
        });
      }).on('error', function(e) {
        console.log("Got error: " + e.message);
      });

      // Write jsonrequest data to the HTTP request
      request.write(querystring.stringify({
        jsonrequest : JSON.stringify(jsonrequest)
      }));
      request.end();
	} else {
        res.jsonp({
            error: 'Please check parameters!'
        });
	}
});

app.post('/play', function(req, res) {
  var lang = req.body['lang'],
    code = req.body['code'],
    board = req.body['board'],
    marker = requ.body['marker'];

  if(lang && code && board && marker){
    //play one step according to current setting
    //return is valid or not, if valid, also return the new board and the status of that game
  } else {
    res.status(400);
  }
});

app.post('/rating', function(req, res) {
  var bidA = req.body['bidA'],
    bidB = req.body['bidB'],
    winner = requ.body['winner'];

  if(bidA && bidB && winner){
    //bot A will always be current user's bot
    //update rating of both bot A and B, then save the game data to game record collection
    //return the new rating for bot A
  } else {
    res.status(400);
  }
});

app.put('/bot', function(req, res) {
  var lang = req.body['lang'],
    code = req.body['code'],
    uid = req.body['uid'];

  if(lang && code && uid){
    //save new bot to bot collection in database
  } else {
    res.status(400);
  }
});

app.delete('/bot', function(req, res) {
  var bid = req.body['bid'],
    uid = req.body['uid'];

  if(bid && uid){
    //check if bid is bound to uid
    //if so, delete specified bot from bot collection in database
  } else {
    res.status(400);
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});