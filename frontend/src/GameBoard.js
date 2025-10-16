import React, { useState, useEffect } from 'react';

const ROWS = 6;
const COLS = 7;

function GameBoard({ socket, username, gameId, opponent }) {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [turn, setTurn] = useState(username);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on('updateBoard', (game) => {
      setBoard(game.board);
      setTurn(game.turn);
      if (game.winner) setWinner(game.winner);
    });

    socket.on('gameOver', (winner) => {
      alert(winner === 'Draw' ? 'Game Draw!' : `${winner} won!`);
      
      setWinner(winner);
    });
  }, [socket]);

  const handleColumnClick = (col) => {
    if (winner || turn !== username) return;
    socket.emit('playerMove', { gameId, column: col });
  };

  return (
    <div>
      <h3>Playing vs: {opponent}</h3>
      <h4>{winner ? `Winner: ${winner}` : turn === username ? 'Your turn' : `${opponent}'s turn`}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 50px)` }}>
        {board.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleColumnClick(c)}
              style={{
                width: 50,
                height: 50,
                border: '1px solid black',
                backgroundColor: cell ? (cell === username ? 'red' : 'yellow') : 'white'
              }}
            ></div>
          ))
        )}
      </div>
    </div>
  );
}

export default GameBoard;
