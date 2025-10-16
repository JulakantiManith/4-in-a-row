function findBestMove(board, botPlayer, humanPlayer) {
  // 1. Check if bot can win
  for (let col = 0; col < 7; col++) {
    const row = getNextEmptyRow(board, col);
    if (row === -1) continue;

    board[row][col] = botPlayer;
    if (checkWin(board, botPlayer)) {
      board[row][col] = null;
      return col; // winning move
    }
    board[row][col] = null;
  }

  // 2. Block human from winning
  for (let col = 0; col < 7; col++) {
    const row = getNextEmptyRow(board, col);
    if (row === -1) continue;

    board[row][col] = humanPlayer;
    if (checkWin(board, humanPlayer)) {
      board[row][col] = null;
      return col; // block human
    }
    board[row][col] = null;
  }

  // 3. Otherwise pick first available column (can improve later)
  for (let col = 0; col < 7; col++) {
    if (board[0][col] === null) return col;
  }

  return null; // no move possible
}

// Helper: find next empty row in column
function getNextEmptyRow(board, col) {
  for (let row = 5; row >= 0; row--) {
    if (!board[row][col]) return row;
  }
  return -1;
}

// Helper: check if a player has 4 in a row
function checkWin(board, player) {
  // Horizontal, vertical, diagonal
  const ROWS = 6, COLS = 7;

  // horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && board[r][c+1] === player &&
          board[r][c+2] === player && board[r][c+3] === player)
        return true;
    }
  }

  // vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (board[r][c] === player && board[r+1][c] === player &&
          board[r+2][c] === player && board[r+3][c] === player)
        return true;
    }
  }

  // diagonal /
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && board[r-1][c+1] === player &&
          board[r-2][c+2] === player && board[r-3][c+3] === player)
        return true;
    }
  }

  // diagonal \
  for (let r = 3; r < ROWS; r++) {
    for (let c = 3; c < COLS; c++) {
      if (board[r][c] === player && board[r-1][c-1] === player &&
          board[r-2][c-2] === player && board[r-3][c-3] === player)
        return true;
    }
  }

  return false;
}

module.exports = { findBestMove, checkWin, getNextEmptyRow };
