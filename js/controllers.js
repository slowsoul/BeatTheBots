angular.module('myApp.controllers', ['ngResource','firebase']).
controller("LoginController", ["$scope", "$firebase", "$firebaseSimpleLogin",
  function($scope, $firebase, $firebaseSimpleLogin) {
    var ref = new Firebase("https://shenrui1992.firebaseio.com/");
    $scope.auth = $firebaseSimpleLogin(ref);
  }
])
.controller("FirstController", ["$scope", "$resource",
  function($scope, $resource) {
    $scope.supported_langugages = [{
      language: 'python',
      urlName: 'python'
    }, {
      language: 'js',
      urlName: 'js'
    }];

    $scope.language = 'js';
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
  
    // For the loadbalancer version with fewer options. 
    $scope.VerifierModel = $resource('/verify', {}, {
      'get': {
        method: 'GET',
        isArray: false,
        params: {
          lang: $scope.language
        }
      }
    });
      
    $scope.set_bot_1 = function(bot) {
      $scope.bot1 = bot;
      $scope.solution = bot.code;
    };
  
    $scope.set_bot_2 = function(bot) {
      $scope.bot2 = bot;
      $scope.solution = bot.code;
    };
          
    $scope.is_move_valid = function(board, newBroad) {
      if (checkValidMove(board, newBroad)) {
        console.log("returning true. board " + board.indexOf('_') + " move " + newBroad.indexOf('_'));
        return true;
      } else {
        console.log("returning false");
        return false;
      }
    };
          
    function checkValidMove(board, newBoard) {
      if(!/^(?:[_XO]{7},){6}[_XO]{7}$/.test(newBoard)){
        return false;
      }
      else {
        var totalDiff = 0;
        for(var i=0;i<55;i++) {
          if(newBoard[i] != board[i]){
            if((board[i] == '_') && (newBoard[i] != '_')){
              totalDiff++;
            }
            else {
              return false;
            }
          }
        }
    
        if(totalDiff == 1){
          return true;
        }
        else {
          return false;
        }
      }
    }
  
    $scope.game_status = function(board) {
      for (var i = 0; i < 7; i++) {
        //Vertical
        for(var j = 0; j < 3; j++) { 
          if (board[8*j+i] != '_' && board[8*j+i] == board[8*(j+1)+i] && board[8*(j+1)+i] == board[8*(j+2)+i] && board[8*(j+2)+i] == board[8*(j+3)+i] && board[8*(j+3)+i] == board[8*(j+4)+i]) {
            return {
              finished: true,
              winner: board[8*j+i]
            };
          }  
        }
        //Horizontal
        for(var j = 0; j < 3; j++) {
          if (board[8*i+j] != '_' && board[8*i+j] == board[8*i+j+1] && board[8*i+j+1] == board[8*i+j+2] && board[8*i+j+2] == board[8*i+j+3] && board[8*i+j+3] == board[8*i+j+4]) {
            return {
              finished: true,
              winner: board[8*i+j]
            };
          }  
        }
      }
            
      //Diagonal
      for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 3; j++) {
          if (board[8*j+i] != '_' && board[8*j+i] == board[8*(j+1)+i+1] && board[8*(j+1)+i+1] == board[8*(j+2)+i+2] && board[8*(j+2)+i+2] == board[8*(j+3)+i+3] && board[8*(j+3)+i+3] == board[8*(j+4)+i+4]) {
            return {
              finished: true,
              winner: board[8*j+i]
            };
          }     
        }
              
        for(var j = 4; j < 7; j++) {
          if (board[8*j+i] != '_' && board[8*j+i] == board[8*(j-1)+i+1] && board[8*(j-1)+i+1] == board[8*(j-2)+i+2] && board[8*(j-2)+i+2] == board[8*(j-3)+i+3] && board[8*(j-3)+i+3] == board[8*(j-4)+i+4]) {
            return {
              finished: true,
              winner: board[8*j+i]
            };
          } 
        }
      }
            
      //Full board
      if (board.indexOf('_') === -1) {
        return {
          finished: true,
          winner: 'Tie'
        };
      } else {
        return {
          finished: false
        }
      }
    };
  
    $scope.reset_game = function() {
      $scope.current_board = "_______,_______,_______,_______,_______,_______,_______";
      $scope.game_history = [];
    };
  
    $scope.reset_game();
  
    $scope.play_game = function(playerX, playerO) {
      console.log("Playing bot 1 against bot 2");
  
      //Count X's to see who's turn it is.
      numX = $scope.current_board.split("_").length - 1;
      if (numX % 2 === 1) {
        tests = "assert_equal('ANYTHING',play_game('" + $scope.current_board + "','X'))";
        data = {
          solution: playerX.code,
          tests: tests
        };
      } else {
        tests = "assert_equal('ANYTHING',play_game('" + $scope.current_board + "','O'))";
        data = {
          solution: playerO.code,
          tests: tests
        };
      }
            
      jsonrequest = data;
  
      response = $scope.VerifierModel.get({
        'lang': $scope.language,
        'jsonrequest': jsonrequest
      });
      response.lang = $scope.language;
      response.jsonrequest = jsonrequest;
      response.$save(function(r) {
        $scope.result = r;
        console.log(r);
        new_board = r.results[0].received;
        console.log("the new board " + new_board);
        $scope.game_history.push(new_board);
      
        //Check of board is valid       
        if (!$scope.is_move_valid($scope.current_board, new_board)) {
          current_player = (numX % 2 === 1)?'X':'O';
          $scope.winner = "Invalid play by Bot " + current_player + " detected in last play!!!";
          return false;
        }
                
        $scope.current_board = new_board;
                
        //Check if the game is over and who won. 
        game_check = $scope.game_status($scope.current_board);
        //Keep calling play_game until game is finished.
        if (!game_check.finished) {
          $scope.play_game(playerX, playerO);
        } else {
          $scope.winner = game_check.winner;
        }
      });
    };
  
    $scope.verify = function(data) {
      jsonrequest = data;
  
      $scope.status = "Verifying";
      result = $scope.VerifierModel.get({
        'lang': $scope.language,
        'jsonrequest': jsonrequest
      });
      result.lang = $scope.language;
      result.jsonrequest = jsonrequest
      result.$save();
      $scope.result = result;
      return result;
    };
  }
]);