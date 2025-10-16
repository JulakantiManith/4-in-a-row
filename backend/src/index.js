require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { joinGame, makeMove, getGame, createGame } = require('./gameManager');
const { findBestMove } = require('./botLogic');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Global waiting player and bot timer
let waitingPlayer = null;
let botTimer = null;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  let username = null;

 socket.on('joinGame', (name) => {
  username = name;

  if (!waitingPlayer) {
    // 🕹 First player waiting
    waitingPlayer = { username, socket };
    socket.emit('waiting', 'Waiting for opponent...');

    // 🕒 Start countdown for Bot game
    let countdown = 10;
    socket.emit('botCountdown', countdown);

    botTimer = setInterval(() => {
      // 🧩 Check if player is no longer waiting
      if (!waitingPlayer || waitingPlayer.username !== username) {
        clearInterval(botTimer);
        botTimer = null;
        return; // stop countdown if opponent joined
      }

      countdown--;
      socket.emit('botCountdown', countdown);

      if (countdown <= 0) {
        clearInterval(botTimer);
        botTimer = null;

        // 🧠 Start Bot game if still waiting
        if (waitingPlayer && waitingPlayer.username === username) {
          const botGameId = createGame(username, 'Bot');
          socket.join(botGameId);
          socket.emit('gameStart', { gameId: botGameId, opponent: 'Bot' });
          io.to(botGameId).emit('gameMessage', 'Game started vs Bot!');
          waitingPlayer = null;
        }
      }
    }, 1000);

  } else {
    // 🧍 Second player joins
    const firstPlayer = waitingPlayer;

    // 🛑 Cancel bot timer
    if (botTimer) {
      clearInterval(botTimer);
      botTimer = null;
    }

    const gameId = createGame(firstPlayer.username, username);

    // 🎮 Join both players in the same room
    firstPlayer.socket.join(gameId);
    socket.join(gameId);

    // ✅ Notify both with correct opponent info
    firstPlayer.socket.emit('gameStart', { gameId, opponent: username });
    socket.emit('gameStart', { gameId, opponent: firstPlayer.username });

    // 📢 Notify everyone in the room
    io.to(gameId).emit('gameMessage', `${firstPlayer.username} vs ${username} started!`);

    // 🔄 Reset waiting player
    waitingPlayer = null;
  }
});

  socket.on('playerMove', ({ gameId, column }) => {
    const success = makeMove(gameId, username, column);
    if (!success) return;

    const game = getGame(gameId);
    io.to(gameId).emit('updateBoard', game);

    if (game.winner) {
      io.to(gameId).emit('gameOver', game.winner);
      return;
    }

    // 🤖 Handle bot move
    if (game.player2 === 'Bot' && game.turn === 'Bot' && !game.winner) {
      const botCol = findBestMove(game.board, 'Bot', username);
      if (botCol !== null) {
        makeMove(gameId, 'Bot', botCol);
        const updatedGame = getGame(gameId);
        io.to(gameId).emit('updateBoard', updatedGame);
        if (updatedGame.winner) {
          io.to(gameId).emit('gameOver', updatedGame.winner);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (waitingPlayer && waitingPlayer.socket.id === socket.id) {
      waitingPlayer = null;
      if (botTimer) clearInterval(botTimer);
      botTimer = null;
    }
  });
});

app.get('/leaderboard', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT username, wins FROM users ORDER BY wins DESC LIMIT 10'
    );
    res.json(Array.isArray(result.rows) ? result.rows : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
