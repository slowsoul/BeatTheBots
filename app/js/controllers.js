angular.module('myApp.controllers', ['firebase'])
.factory('BotsFactory', function(){
  bots = [];

  simple_js_bot = {
    name: "Simple JS Bot",
    lang: 'js',
    code: "function play_game(board,side) {\n  return board.replace('_',side);\n}"
  };
  skip_python_bot = {
    name: "Skip Python Bot",
    lang: 'python',
    code: "def play_game(board,side):\n  if board.find('_______') > -1:\n    return board.replace('_______', '______'+side, 1)\n  else:\n    return board.replace('_',side,1)"
  };
  bad_js_bot = {
    name: "Bad JS Bot",
    lang: 'js',
    code: "function play_game(board,side) {\n  return '_______,_______,_______,_______,_______,_______,_______';\n}"
  };

  bots.push(simple_js_bot);
  bots.push(skip_python_bot);
  bots.push(bad_js_bot);

  return {
    getBots: function(){
      return bots;
    },
    initBots: function(){
      bots = [];

      bots.push(simple_js_bot);
      bots.push(skip_python_bot);
      bots.push(bad_js_bot);

      return bots;
    }
  };
})
.factory("UserFactory", function(){
  var uid;
  return {
    getuid: function(){
      return uid;
    },
    setuid: function(s){
      uid = s;
    }
  };
})
.factory('UtilityFactory', function(){
  return {
    mapShowName: function(lang){
      switch(lang){
        case 'js': return 'JavaScript'; break;
        case 'python': return 'Python'; break;
      }
    }
  };
})
.controller("LoginController", ["$scope", "$firebase", "$firebaseSimpleLogin",
  function($scope, $firebase, $firebaseSimpleLogin) {
    var ref = new Firebase("https://shenrui1992.firebaseio.com/");
    $scope.auth = $firebaseSimpleLogin(ref);
  }
])
.controller("SimpleAccessController", ["$rootScope", "$scope",
  function($rootScope, $scope) {
    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
      console.log("SimpleAccess");
      $scope.uid = user.uid;
    });

    $rootScope.$on("$firebaseSimpleLogin:logout", function(e, user) {
      $scope.uid = null;
    });
  }
])
.controller("PlaygroundController", ["$rootScope", "$scope", "$http", "BotsFactory", "UserFactory",
  function($rootScope, $scope, $http, BotsFactory, UserFactory) {

    $('#navbar').children('.active').removeClass('active');
    $('#playground').addClass('active');

    $scope.bots = BotsFactory.getBots();
    $scope.uid = UserFactory.getuid();
    
    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
      $scope.uid = user.uid;
      UserFactory.setuid(user.uid);
      $scope.bots = BotsFactory.initBots();

      $http.get('/bot', {params: {uid: $scope.uid}}).success(function(res, status, headers, config) {
        if(status!=200 || res.status == 'fail')
          return;
        var BotArray = res.bots;
        for(var i=0;i<BotArray.length;i++){
          $scope.bots.push({name: BotArray[i].name, lang: BotArray[i].lang, code: BotArray[i].code});
        }
      });
    });

    $rootScope.$on("$firebaseSimpleLogin:logout", function(e, user) {
      $scope.uid = null;
      $scope.bots = BotsFactory.initBots();
    });
      
    $scope.set_bot_1 = function(bot) {
      $scope.reset_game();
      $scope.solution = bot.code;
    };
  
    $scope.set_bot_2 = function(bot) {
      $scope.reset_game();
      $scope.solution = bot.code;
    };
  
    $scope.reset_game = function() {
      $scope.current_board = "_______,_______,_______,_______,_______,_______,_______";
      $scope.game_history = [];
      $scope.winner = "";
      $scope.gameStarted = false;
    };
  
    $scope.reset_game();
  
    $scope.play_game = function(playerX, playerO) {
      console.log("Playing bot 1 against bot 2");
      if(!$scope.gameStarted)
        $scope.gameStarted = true;
      data = {
        board: $scope.current_board
      };
      //Count X's to see who's turn it is.
      numX = $scope.current_board.split("_").length - 1;
      if (numX % 2 === 1) {
        data.lang = playerX.lang;
        data.code = playerX.code;
        data.marker = 'X';
      } else {
        data.lang = playerO.lang;
        data.code = playerO.code;
        data.marker = 'O';
      }

      $http.post('/play', data).success(function(res, status, headers, config) {
        if(status!=200)
          return;
        console.log(res);

        $scope.game_history.push(res.newBoard);
        if (!res.isMoveValid) {
          current_player = (numX % 2 === 1)?'X':'O';
          $scope.winner = "Invalid play by Bot Player " + current_player + " detected in last play!!!";
          $("body").animate({scrollTop: $("#game-history-label").offset().top - 40}, "slow");
          return false;
        }

        $scope.current_board = res.newBoard;
        if (!res.gameStatus.finished) {
          $scope.play_game(playerX, playerO);
        } else {
          //TODO if in arena, invoke rating API here to update rating
          //Q if two bots of same user plays, will the rating be updated?
          $scope.winner = res.gameStatus.winner;
          $("body").animate({scrollTop: $("#game-history-label").offset().top - 40}, "slow");
        }
      });
    };
  }
])
.controller("WorkshopController", ["$rootScope", "$scope", "$http", "BotsFactory", "UserFactory", "UtilityFactory",
  function($rootScope, $scope, $http, BotsFactory, UserFactory, UtilityFactory) {
    $('#navbar').children('.active').removeClass('active');
    $('#workshop').addClass('active');

    $scope.bots = BotsFactory.getBots();
    $scope.uid = UserFactory.getuid();

    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
      $scope.uid = user.uid;
      UserFactory.setuid(user.uid);
      $scope.bots = BotsFactory.initBots();

      $http.get('/bot', {params: {uid: $scope.uid}}).success(function(res, status, headers, config) {
        if(status!=200 || res.status == 'fail')
          return;
        var BotArray = res.bots;
        for(var i=0;i<BotArray.length;i++){
          $scope.bots.push({name: BotArray[i].name, lang: BotArray[i].lang, code: BotArray[i].code});
        }
      });
    });

    $rootScope.$on("$firebaseSimpleLogin:logout", function(e, user) {
      $scope.uid = null;
      $scope.bots = BotsFactory.initBots();
      $scope.addresult = null;
      $scope.result = null;
      $scope.errors = null;
    });

    $scope.supported_langugages = [{
      language: 'js',
      urlName: 'JavaScript'
    },{
      language: 'python',
      urlName: 'Python'
    }];

    $scope.bot_template = {
      'js': "function play_game(board,side) {\n  return '\n}",
      'python': "def play_game(board,side):\n  return '"
    };

    $scope.test_template = {
      "js": {
        "solution": "function play_game(board,side) {\n  return board.replace('_',side);\n}",
        "tests": "assert_equal('ANYTHING',play_game('_______,_______,_______,_______,_______,_______,_______','X'))"
      },
      "python": {
        "solution": "def play_game(board,side):\n  return board.replace('_',side,1)\n",
        "tests": ">>> play_game('_______,_______,_______,_______,_______,_______,_______','X')\n  'ANYTHING'\n"
      }
    };

    $scope.mapShowName = UtilityFactory.mapShowName;

    $scope.new_bot = {
      name: 'New JavaScript Bot',
      lang: 'js',
      code: "function play_game(board,side) {\n  return '\n}"
    };
    $scope.tests = $scope.test_template['js']["tests"];

    $scope.init_new_bot = function(lang) {
      $scope.new_bot.name = "New " + $scope.mapShowName(lang) + " Bot";
      $scope.new_bot.code = $scope.bot_template[lang];
      $scope.new_bot.lang = lang;
      $scope.tests = $scope.test_template[lang]["tests"];
    };

    $scope.set_new_bot = function(existingbot) {
      $scope.new_bot.name = "";
      $scope.new_bot.code = existingbot.code;
      $scope.new_bot.lang = existingbot.lang;
      $scope.tests = $scope.test_template[existingbot.lang]["tests"];
    };

    $scope.add_bot = function() {
      $scope.addresult = null;
      if($scope.new_bot.name == "" || $scope.new_bot.code == "")
        return;
      $scope.test({code: $scope.new_bot.code, lang: $scope.new_bot.lang, test: $scope.tests}, function(){
        console.log("in cb now" + $scope.errors);
        if(!$scope.errors){
          if($scope.uid){
            console.log("here");
            data = {name: $scope.new_bot.name, code: $scope.new_bot.code, lang: $scope.new_bot.lang, uid: $scope.uid};
            $http.put('/bot', data).success(function(res, status, headers, config) {
              if(status!=200)
                return;
              $scope.addresult = res;
              if(res.status == 'fail')
                return;
              $scope.last_bot_name = $scope.new_bot.name;
              $scope.bots.push($scope.new_bot);
              $scope.new_bot = {};
              $scope.init_new_bot('js');
            });
          }
          else{
            console.log("here2");
            $scope.bots.push($scope.new_bot);
            $scope.new_bot = {};
            $scope.init_new_bot('js');
          }
        }
      });
    };

    $scope.test = function(data, cb) {
      cb = cb || null;
      $scope.result = null;
      $scope.errors = null;
      console.log(data);

      data.lang = $scope.new_bot.lang;

      $http.post('/play', data).success(function(res, status, headers, config) {
        if(status!=200)
          return;
        console.log(res);
        if(res.result){
          $scope.result = res.result;
          $scope.errors = null;
        }
        if(res.errors){
          $scope.errors = res.errors;
          $scope.result = null;
        }
        if(cb)
          cb();
      });
      
    };
  }
])
.controller("ArenaController", ["$rootScope", "$scope", "$http", "$location", "UserFactory",
  function($rootScope, $scope, $http, $location, UserFactory) {
    $('#navbar').children('.active').removeClass('active');
    $('#arena').addClass('active');

    $scope.showDetail = false;

    $scope.uid = UserFactory.getuid();

    if($scope.uid){
      $http.get('/bot', {params: {uid: $scope.uid, sortByRating: '1'}}).success(function(res, status, headers, config) {
        if(status!=200 || res.status == 'fail')
          return;
        $scope.bots = res.bots;
      });
    }

    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
      $scope.uid = user.uid;
      UserFactory.setuid(user.uid);

      $http.get('/bot', {params: {uid: $scope.uid, sortByRating: '1'}}).success(function(res, status, headers, config) {
        if(status!=200 || res.status == 'fail')
          return;
        $scope.bots = res.bots;
      }); 
    });

    $rootScope.$on("$firebaseSimpleLogin:logout", function(e, user) {
      $location.path('/playground');
    });

    $scope.load_bot = function(index){
      if(!$scope.showDetail){
        $scope.showDetail = true;
      }
      $scope.selectedbot = $scope.bots[index];
      $('#botlist').children('.active').removeClass('active');
      $("#botlist a:eq(" + index + ")").addClass('active');
      $scope.opbotsLoaded = false;
      $scope.ArenaEnded = false;
      $scope.noOpAvailable = false;
      $scope.reset_game();
    };
    
    $scope.loadOpBots = function(){
      $http.get('/bot', {params: {uid: $scope.uid, pickOp: '1'}}).success(function(res, status, headers, config) {
        $scope.opbots = res.bots;
        console.log(res.bots);
        if(res.bots.length == 0){
          $scope.noOpAvailable = true;
          return;
        }    
        $scope.currentLevel = 1;
        $scope.opbotsLoaded = true;
      });
    };

    $scope.reinitArena = function(){
      $scope.showDetail = false;
    };

    $scope.playLevel = function(){
      $scope.reset_game();
      $scope.play_game($scope.selectedbot, $scope.opbots[$scope.currentLevel-1]);
    };

    $scope.reset_game = function() {
      $scope.current_board = "_______,_______,_______,_______,_______,_______,_______";
      $scope.game_history = [];
      $scope.winner = null;
      $scope.gameStarted = false;
      $scope.gameFinished = false;
    };
  
    $scope.play_game = function(playerX, playerO) {
      console.log("Playing bot 1 against bot 2");
      if(!$scope.gameStarted)
        $scope.gameStarted = true;
      data = {
        board: $scope.current_board
      };
      //Count X's to see who's turn it is.
      numX = $scope.current_board.split("_").length - 1;
      if (numX % 2 === 1) {
        data.lang = playerX.lang;
        data.code = playerX.code;
        data.marker = 'X';
      } else {
        data.lang = playerO.lang;
        data.code = playerO.code;
        data.marker = 'O';
      }

      $http.post('/play', data).success(function(res, status, headers, config) {
        if(status!=200)
          return;
        console.log(res);

        $scope.game_history.push(res.newBoard);
        if (!res.isMoveValid) {
          if(numX % 2 === 1){
            $scope.EndingPrompt = "Invalid play by " + $scope.selectedbot.name + " detected";
            $scope.ArenaEnded = true;
          }
          else{
            $scope.winner = "Invalid play by Opponent Bot detected, this game will not be counted";
            $scope.currentLevel += 1;
            if($scope.currentLevel > $scope.opbots.length){
              //Challenge all passed, show info
              $scope.EndingPrompt = "Congratulations! Your bot is awesome."
              $scope.ArenaEnded = true;
            }
          }
          return false;
        }

        $scope.current_board = res.newBoard;
        if (!res.gameStatus.finished) {
          $scope.play_game(playerX, playerO);
        } else {
          //normally finished game
          $scope.winner = res.gameStatus.winner;
          $scope.readableResult = ($scope.winner == 'X')?"Win":(($scope.winner == 'O')?"Lose":"Tie");
          $http.post('/rating', {mybid: playerX._id, myRating: playerX.rating, opbid: playerO._id, opRating: playerO.rating, iwin: $scope.readableResult}).success(function(res, status, headers, config) {
            $scope.gameFinished = true;
            $scope.oldRating = res.myOldRating;
            $scope.newRating = res.myNewRating;
            $scope.selectedbot.rating = res.myNewRating;
            if($scope.readableResult == "Win"){
              $scope.currentLevel += 1;
              if($scope.currentLevel > $scope.opbots.length){
                //Challenge all passed, show info
                $scope.EndingPrompt = "Congratulations! Your bot is awesome."
                $scope.ArenaEnded = true;
              }
            }
            else{
              //Challenge ended, show info
              $scope.EndingPrompt = "Sorry! Your bot needs to be more awesome to pass the arena"
              $scope.ArenaEnded = true;
            }
          });
        }
      });
    };
  }
])
.controller("StatsController", ["$rootScope", "$scope", "$http", "$location", "UserFactory", "UtilityFactory",
  function($rootScope, $scope, $http, $location, UserFactory, UtilityFactory) {
    $('#navbar').children('.active').removeClass('active');
    $('#stats').addClass('active');

    $scope.showDetail = false;
    $scope.mapShowName = UtilityFactory.mapShowName;

    $scope.uid = UserFactory.getuid();

    if($scope.uid){
      $http.get('/bot', {params: {uid: $scope.uid, sortByRating: '1'}}).success(function(res, status, headers, config) {
        if(status!=200 || res.status == 'fail')
          return;
        $scope.bots = res.bots;
      });
    }

    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
      $scope.uid = user.uid;
      UserFactory.setuid(user.uid);

      $http.get('/bot', {params: {uid: $scope.uid, sortByRating: '1'}}).success(function(res, status, headers, config) {
        if(status!=200 || res.status == 'fail')
          return;
        $scope.bots = res.bots;
      }); 
    });

    $rootScope.$on("$firebaseSimpleLogin:logout", function(e, user) {
      $location.path('/playground');
    });

    $scope.load_bot = function(index){
      $scope.records = null;
      if(!$scope.showDetail){
        $scope.showDetail = true;
      }
      $scope.selectedbot = $scope.bots[index];
      $('#botlist').children('.active').removeClass('active');
      $("#botlist a:eq(" + index + ")").addClass('active');

      $http.get('/record/' + $scope.selectedbot._id).success(function(res, status, headers, config) {
        if(status!=200 || res.status == 'fail')
          return; 
        $scope.records = res.records;
      });
    };
  }
]);