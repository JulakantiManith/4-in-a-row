require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { joinGame, makeMove, getGame } = require('./gameManager'); 

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('4 in a Row Backend Running with Socket.IO');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  let currentGameId = null;
  let username = null;

  socket.on('joinGame', (name) => {
    username = name;
    const result = joinGame(username);

    if (!result) {
      socket.emit('waiting', 'Waiting for opponent...');
    } else {
      const { gameId, opponent } = result;
      currentGameId = gameId;

      socket.join(gameId);
      socket.emit('gameStart', { gameId, opponent });
      io.to(gameId).emit('gameMessage', 'Game started!');

      console.log(`Game ${gameId} started between ${username} and ${opponent}`);
    }
  });

  socket.on('playerMove', ({ gameId, column }) => {
    const success = makeMove(gameId, username, column);
    if (!success) return;

    const game = getGame(gameId);
    io.to(gameId).emit('updateBoard', game);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
