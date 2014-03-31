describe('PlaygroundController', function() {
  var $scope, ctrl;
  
  beforeEach(function (){
    module('myApp.controllers');
    
    inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();

      ctrl = $controller('PlaygroundController', {
        $scope: $scope
      });
    });
  });
 
  describe("#reset_game()", function(){

    it("should reset variables related to game", function(){
      $scope.reset_game();
 
      expect($scope.current_board).to.equal("_______,_______,_______,_______,_______,_______,_______");
      expect($scope.game_history).to.be.empty;
      expect($scope.winner).to.equal("");
      expect($scope.gameStarted).to.equal(false);
    });

  });

});
