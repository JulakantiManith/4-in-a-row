import React, { useEffect, useState } from 'react';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeaders(data);
        } else {
          setLeaders([]); // fallback if backend returns error object
        }
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard:', err);
        setLeaders([]);
      });
  }, []);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Leaderboard</h3>
      <ol>
        {leaders.map(player => (
          <li key={player.username}>{player.username}: {player.wins}</li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;
