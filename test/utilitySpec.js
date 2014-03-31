var utility = require("../utility.js"),
  expect = require("chai").expect;

describe('utility', function() {
 
  describe("#is_move_valid()", function(){

    it("should return true for a good move", function(){
      var board = "_______,__XX___,_______,_______,_______,_______,_______";
      var newBoard = "_______,__XXO__,_______,_______,_______,_______,_______";
      var result = utility.is_move_valid(board, newBoard);
 
      expect(result).to.equal(true);
    });


    it("should return false for bad move #1", function(){
      var board = "X______,_______,_______,_______,_______,_______,_______";
      var newBoard = "_______,_______,_______,_______,_______,_______,_______";
      var result = utility.is_move_valid(board, newBoard);
 
      expect(result).to.equal(false);
    });

    it("should return false for bad move #2", function(){
      var board = "_______,__XX___,_______,_______,_______,_______,_______";
      var newBoard = "_______,_XXO___,_______,_______,_______,_______,_______";
      var result = utility.is_move_valid(board, newBoard);
 
      expect(result).to.equal(false);
    });

    it("should return false for bad move #3", function(){
      var board = "_______,__XX___,_______,_______,_______,_______,_______";
      var newBoard = "_______,__XXO__,_______,_______,_________,_______,_______";
      var result = utility.is_move_valid(board, newBoard);
 
      expect(result).to.equal(false);
    });

  });

  describe("#game_status()", function(){

    it("should return true for finished game #1", function(){
      var board = "_______,__XXXX_,__OOOOO,_______,_______,_______,_______";
      var result = utility.game_status(board);
 
      expect(result).to.deep.equal({finished:true, winner:'O'});
    });

    it("should return true for finished game #2", function(){
      var board = "_X____O,_X____O,_X____O,_X____O,_X_____,_______,_______";
      var result = utility.game_status(board);
 
      expect(result).to.deep.equal({finished:true, winner:'X'});
    });

    it("should return true for finished game #3", function(){
      var board = "X_____O,_X____O,__X___O,___X__O,____X__,_______,_______";
      var result = utility.game_status(board);
 
      expect(result).to.deep.equal({finished:true, winner:'X'});
    });

    it("should return true for finished game #4", function(){
      var board = "____X_O,___X__O,__X___O,_X____O,X______,_______,_______";
      var result = utility.game_status(board);
 
      expect(result).to.deep.equal({finished:true, winner:'X'});
    });

    it("should return false for unfinished game", function(){
      var board = "_______,__XXXX_,___OOOO,_______,_______,_______,_______";
      var result = utility.game_status(board);
 
      expect(result).to.deep.equal({finished:false});
    });

  });

});