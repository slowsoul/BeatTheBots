angular.module('myApp.controllers', ['ngResource','firebase']).
controller("LoginController", ["$scope", "$firebase", "$firebaseSimpleLogin",
  function($scope, $firebase, $firebaseSimpleLogin) {
    var ref = new Firebase("https://shenrui1992.firebaseio.com/");
    $scope.auth = $firebaseSimpleLogin(ref);
  }
])
.controller("PlaygroundController", ["$scope", "$http",
  function($scope, $http) {

    $('#navbar').children('.active').removeClass('active');
    $('#playground').addClass('active');

    $scope.supported_langugages = [{
      language: 'js',
      urlName: 'JavaScript'
    }];
    
    $scope.mapShowName = function(lang){
      switch(lang){
        case 'js': return 'JavaScript'; break;
      }
    }

    $scope.language = 'js';
    $scope.jsbots = [];
    $scope.pythonbots = [];
    $scope.bots = [];
    $scope.new_bot = {
      name: 'New Bot',
      language: 'js',
      code: "function play_game(board,side) {\n  return board.replace('_',side);\n}"
    };
    first_bot = {
      name: "First Bot",
      language: 'js',
      code: "function play_game(board,side) {\n  return board.replace('_',side);\n}"
    };
    skip_bot = {
      name: "Skip Bot",
      language: 'js',
      code: "function play_game(board,side) {\n  if(board.indexOf('_______') > -1) {\n    return board.replace('_______','______'+side);\n  } else {\n    return board.replace('_',side);\n  }\n}"
    };
    bad_bot = {
      name: "Bad Bot",
      language: 'js',
      code: "function play_game(board,side) {\n  return '_______,_______,_______,_______,_______,_______,_______';\n}"
    };
        
    $scope.add_bot = function() {
      $scope.bots.push($scope.new_bot);
      $scope.new_bot = {};
    }

    $scope.bots.push(first_bot);
    $scope.bots.push(skip_bot);
    $scope.bots.push(bad_bot);
  
    //Some example code for each language.
    $scope.d = {
      "js": {
        "solution": "function play_game(board,side) {\n  return board.replace('_',side);\n}",
        "tests": "assert_equal('ANYTHING',play_game('_______,_______,_______,_______,_______,_______,_______','X'))"
      },
      "python": {
        "solution": "def play_game(board,side):\n  return board.replace('_',side,1)\n",
        "tests": ">>> play_game('_______,_______,_______,_______,_______,_______,_______','X')\n  'ANYTHING'\n"
      }
    }
  
    $scope.status = "Ready";
    //Load some good code
    $scope.load_example_code = function() {
      $scope.solution = $scope.d[$scope.language]["solution"];
      $scope.tests = $scope.d[$scope.language]["tests"];
    };
      
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
    };
  
    $scope.reset_game();
  
    $scope.play_game = function(playerX, playerO) {
      console.log("Playing bot 1 against bot 2");
  
      data = {
        lang: $scope.language,
        board: $scope.current_board
      };
      //Count X's to see who's turn it is.
      numX = $scope.current_board.split("_").length - 1;
      if (numX % 2 === 1) {
        data.code = playerX.code;
        data.marker = 'X';
      } else {
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
          return false;
        }

        $scope.current_board = res.newBoard;
        if (!res.gameStatus.finished) {
          $scope.play_game(playerX, playerO);
        } else {
          $scope.winner = res.gameStatus.winner;
        }
      });
    };
  
    $scope.verify = function(data) {
      console.log(data);

      data.lang = $scope.language;

      $http.post('/play', data).success(function(res, status, headers, config) {
        if(status!=200)
          return;
        console.log(res);
        $scope.result = res.result;
      });
      
    };
  }
])
.controller("WorkshopController", ["$scope", "$resource",
  function($scope, $resource) {
    $('#navbar').children('.active').removeClass('active');
    $('#workshop').addClass('active');
  }
])
.controller("ArenaController", ["$scope", "$resource",
  function($scope, $resource) {
    $('#navbar').children('.active').removeClass('active');
    $('#arena').addClass('active');
  }
])
.controller("StatsController", ["$scope", "$resource",
  function($scope, $resource) {
    $('#navbar').children('.active').removeClass('active');
    $('#stats').addClass('active');
  }
]);