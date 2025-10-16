const games = {};     
let waitingPlayer = null;

function createGame(player1, player2) {
  const gameId = `game_${Date.now()}`;
  games[gameId] = {
    player1,
    player2,
    board: Array(6).fill(null).map(() => Array(7).fill(null)), // 6x7 grid
    turn: player1,
    winner: null
  };
  return gameId;
}

function joinGame(player) {
  if (waitingPlayer === null) {
    waitingPlayer = player;
    return null; 
  } else {
    const gameId = createGame(waitingPlayer, player);
    const opponent = waitingPlayer;
    waitingPlayer = null;
    return { gameId, opponent };
  }
}

function makeMove(gameId, player, column) {
  const game = games[gameId];
  if (!game || game.winner || game.turn !== player) return false;

  for (let row = 5; row >= 0; row--) {
    if (!game.board[row][column]) {
      game.board[row][column] = player;
      game.turn = player === game.player1 ? game.player2 : game.player1;
      return true;
    }
  }
  return false; 
}

function getGame(gameId) {
  return games[gameId];
}

module.exports = { joinGame, createGame, makeMove, getGame };
