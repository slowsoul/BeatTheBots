var expect = require("chai").expect;

describe('FirstController', function() {
  var $scope, ctrl;
  
  beforeEach(function (){
    module('myApp.controllers');
    
    inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();

      ctrl = $controller('FirstController', {
        $scope: $scope
      });
    });
  });
 
  describe("#checkValidMove()", function(){
    it("should return true for a good move", function(){
      var board = "_______,__XX___,_______,_______,_______,_______,_______";
      var newBroad = "_______,__XXO__,_______,_______,_______,_______,_______";
      var result = $scope.checkValidMove(board, newBroad);
 
      expect(result).to.equal(true);
    });
  });
});