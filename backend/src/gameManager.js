const db = require('./db');
const { checkWin } = require('./botLogic');

const games = {};       // Active games
let waitingPlayer = null;

// Create a new game
function createGame(player1, player2) {
  const gameId = `game_${Date.now()}`;
  games[gameId] = {
    player1,
    player2,
    board: Array(6).fill(null).map(() => Array(7).fill(null)),
    turn: player1,
    winner: null
  };
  return gameId;
}

// Player joins for PvP
function joinGame(player) {
  if (!waitingPlayer) {
    waitingPlayer = player;
    return null; // waiting for opponent
  } else {
    const gameId = createGame(waitingPlayer, player);
    const opponent = waitingPlayer;
    waitingPlayer = null;
    return { gameId, opponent };
  }
}

// Save completed game to database
async function saveGame(game) {
  try {
    await db.query(
      'INSERT INTO games(player1, player2, winner) VALUES($1, $2, $3)',
      [game.player1, game.player2, game.winner]
    );

    if (game.winner && game.winner !== 'Draw' && game.winner !== 'Bot') {
      await db.query(
        `INSERT INTO users(username, wins) 
         VALUES($1, 1) 
         ON CONFLICT (username) 
         DO UPDATE SET wins = users.wins + 1`,
        [game.winner]
      );
    }
  } catch (err) {
    console.error('Error saving game:', err);
  }
}

// Make a move
function makeMove(gameId, player, column) {
  const game = games[gameId];
  if (!game || game.winner || game.turn !== player) return false;

  for (let row = 5; row >= 0; row--) {
    if (!game.board[row][column]) {
      game.board[row][column] = player;

      if (checkWin(game.board, player)) {
        game.winner = player;
        saveGame(game);
      } else if (game.board.flat().every(cell => cell)) {
        game.winner = 'Draw';
        saveGame(game);
      }

      game.turn = player === game.player1 ? game.player2 : game.player1;
      return true;
    }
  }

  return false; // column full
}

// Get game state
function getGame(gameId) {
  return games[gameId];
}

// Bot matchmaking with countdown
function startBotGameIfWaiting(player, socket, io) {
  let countdown = 10;

  const interval = setInterval(() => {
    socket.emit('botCountdown', countdown);
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      if (waitingPlayer === player) {
        const botName = 'Bot';
        const gameId = createGame(player, botName);
        socket.join(gameId);
        socket.emit('gameStart', { gameId, opponent: botName });
        io.to(gameId).emit('gameMessage', 'Game started vs Bot!');
        waitingPlayer = null;
      }
    }
  }, 1000);

  return interval; // so index.js can cancel if second player joins
}

module.exports = { joinGame, createGame, makeMove, getGame, startBotGameIfWaiting, games, waitingPlayer };
