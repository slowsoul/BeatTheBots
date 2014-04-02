module.exports.is_move_valid = function(board, newBoard) {
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
};

module.exports.game_status = function(board) {
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