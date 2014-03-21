var express = require('express'),
  http = require('http'),
  path = require('path'),
  url = require('url'),
  querystring = require('querystring'),
  http = require('http'),
  btoa = require('btoa'),
  mongo = require('./mongo.js'),
  utility = require('./utility.js');

var ObjectID = require('mongodb').ObjectID;
var defaultTest = new Object();
defaultTest['js'] = function(board, marker){
  return "assert_equal('ANYTHING',play_game('" + board + "','" + marker + "'))";
};
defaultTest['python'] = function(board, marker){
  return ">>> play_game('" + board + "','" + marker + "')\n  'ANYTHING'\n";
}

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

mongo.init(function(error) {
  if (error)
    throw error;

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
});

// Routes

app.get('/', function(req, res) {
  res.redirect('app/index.html');
});

app.get('/resetdb', function(req, res) {
  //reset Bot collection and GameRecord collection
  console.log(mongo.BotCollection);
  console.log(mongo.GameRecordCollection);
  mongo.BotCollection.remove(function(err, result){
    if(err){
      res.json({status: 'fail', description: 'remove failed'});
    }
    else{
      mongo.GameRecordCollection.remove(function(err, result){
        if(err){
          res.json({status: 'fail', description: 'remove failed'});
        }
        else{
          res.json({status: 'success'});
        }
      });
    }   
  });
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
      mongo.BotCollection.find({uid: params['uid']}, {sort:{createTime: -1}}).toArray(function(err, result){
        if(err) {
          res.json({status: 'fail', description: 'internal error'});
        }
        else {
          res.json({status: 'success', bots: result});
        }
      });
    }
  }
});

app.get('/bot/:bid', function(req, res) {
  var bid = req.params.bid;

  //get the game record data of this bot from database
  mongo.BotCollection.findOne({_id: ObjectID(bid)}, {fields: {_id: 0}}, function(err, result){
    if(err){
      res.json({status: 'fail', description: 'internal error'});
    }
    else{
      res.json({status: 'success', bot: result});
    }
  });

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
    marker = req.body['marker'],
    test = req.body['test'],
    jsonrequest = null;

  if(lang && code){
    //play one step according to current setting
    //if in play mode(no test provided), then return new board, is valid or not, if valid, also return the status of that game
    //if in test mode(test provided), then return the test result
    if(test){
      jsonrequest = {solution: code, tests: test};  
    }
    else{
      if(board && marker){
        jsonrequest = {solution: code, tests: defaultTest[lang](board, marker)};
      }
      else {
        res.status(400);
        return;
      }
    }

    var json_data = querystring.stringify({
      jsonrequest : JSON.stringify(jsonrequest)
    });
    console.log(json_data);

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
      // Handle the complete result
      response.on("end", function() {
        verified_results = JSON.parse(verified_results);
        if(!verified_results.results){
          res.json(verified_results);
          return;
        }
        if(board && marker) {
          var newBoard = verified_results.results[0].received;
          var isMoveValid = utility.is_move_valid(board, newBoard);
          var finalResponse = {newBoard: newBoard, isMoveValid: isMoveValid};
          if(isMoveValid) {
            finalResponse.gameStatus = utility.game_status(newBoard);
          }
          res.json(finalResponse);
        }
        else {
          res.json({result: verified_results.results[0]});
        }
      });
    }).on('error', function(e) {
      res.json({status: 'fail', description: 'invoke verification service failed'});
    });

    // Write jsonrequest data to the HTTP request
    request.write(json_data);
    request.end();
  } else {
    res.status(400);
  }
});

app.post('/rating', function(req, res) {
  var mybid = req.body['mybid'],
    opbid = req.body['opbid'],
    iwin = req.body['iwin'],
    myRating = null,
    opRating = null;

  if(mybid && opbid && iwin){
    //bot A will always be current user's bot
    //update rating of both bot A and B, then save the game data to game record collection
    //return the new rating for user's bot
    mongo.BotCollection.findOne({_id: mybid}, {fields: {rating: 1, _id: 0}}, function(err, result){
      myRating = result.rating;
      if(err) {
        res.json({status: 'fail', description: 'internal error'});
        return;
      }
      mongo.BotCollection.findOne({_id: opbid}, {fields: {rating: 1, _id: 0}}, function(err, result){
        opRating = result.rating;
        if(err) {
          res.json({status: 'fail', description: 'internal error'});
          return;
        }
        //calculate rating change
        var myActualScore = (iwin == '1')?1:((iwin == '0')?0.5:0);
        var myExpectedScore = 1 / (1 + Math.pow(10, (opRating - myRating)/400));
        var myRatingChange;
        if(myRating < 2100 || opRating < 2100) {
          myRatingChange = 32 * (myActualScore - myExpectedScore);
        }
        else if (myRating < 2401 || opRating < 2401) {
          myRatingChange = 24 * (myActualScore - myExpectedScore);  
        }
        else {
          myRatingChange = 16 * (myActualScore - myExpectedScore);
        }
        myRatingChange = Math.floor(myRatingChange);

        //update rating for both bots
        mongo.BotCollection.update({_id: mybid}, {$set: {rating: myRating + myRatingChange}}, {w: 1}, function(err, result){
          mongo.BotCollection.update({_id: opbid}, {$set: {rating: opRating - myRatingChange}}, {w: 1}, function(err, result){
            mongo.GameRecordCollection.insert({finishTime: new Date(), bidA: mybid, bidB: opbid, winner: iwin, ratingA: myRating, ratingB: opRating, ratingChangeA: myRatingChange}, {w: 1}, function(err, result){
              res.json({status: 'success', myNewRating: myRating + myRatingChange});  
            });
          });
        });

      });
    });
  } else {
    res.status(400);
  }
});

app.put('/bot', function(req, res) {
  var lang = req.body['lang'],
    code = req.body['code'],
    uid = req.body['uid'],
    name = req.body['name'];

  if(lang && code && uid && name){
    //check if name is duplicated
    //if not, save new bot to bot collection in database with initial rating
    mongo.BotCollection.findOne({name: name, uid: uid}, function(err, result){
      if(err){
        res.json({status: 'fail', description: 'interal error'});
      }
      else{
        if(result){
          res.json({status: 'fail', description: 'duplicate bot name'});
        }
        else{
          mongo.BotCollection.insert({name: name, uid: uid, code: code, lang: lang, gameCount: 0, rating: 1450, createTime: new Date()}, {w:1}, function(err, result){
            if(err){
              res.json({status: 'fail', description: 'insert failed'});
            }
            else{
              res.json({status: 'success', bid: result[0]._id});
            }
          });
        }
      }
    });
  } else {
    res.status(400);
  }
});

/*
app.delete('/bot', function(req, res) {
  var bid = req.body['bid'],
    uid = req.body['uid'];

  if(bid && uid){
    //check if bid is bound to uid
    //if so, delete specified bot from bot collection in database
  } else {
    res.status(400);
  }
});*/