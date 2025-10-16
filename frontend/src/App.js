import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import GameBoard from './GameBoard';
import Leaderboard from './Leaderboard';

const socket = io('http://localhost:8080');

function App() {
  const [username, setUsername] = useState('');
  const [inGame, setInGame] = useState(false);
  const [opponent, setOpponent] = useState('');
  const [gameId, setGameId] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [waitingMessage, setWaitingMessage] = useState('');

  const handleJoin = () => {
    if (!username) return;
    socket.emit('joinGame', username);
  };

  useEffect(() => {
    socket.on('gameStart', ({ gameId, opponent }) => {
      setGameId(gameId);
      setOpponent(opponent);
      setInGame(true);
      setCountdown(null);
      setWaitingMessage('');
    });

    socket.on('waiting', (msg) => {
      setWaitingMessage(msg);
    });

    socket.on('botCountdown', (time) => {
      setCountdown(time);
    });

    return () => {
      socket.off('gameStart');
      socket.off('waiting');
      socket.off('botCountdown');
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      {!inGame ? (
        <div>
          <h2>Enter Username</h2>
          <input value={username} onChange={e => setUsername(e.target.value)} />
          <button onClick={handleJoin}>Join Game</button>

          {waitingMessage && <p>{waitingMessage}</p>}
          {countdown !== null && <p>Game starts in: {countdown} seconds</p>}
        </div>
      ) : (
        <div>
          <p>Playing vs: {opponent}</p>
          <GameBoard
            socket={socket}
            username={username}
            gameId={gameId}
            opponent={opponent}
            disabled={!inGame} // prevent clicking before game starts
          />
        </div>
      )}
      <Leaderboard />
    </div>
  );
}

export default App;
