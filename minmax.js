const gameBoard = (function () {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];

    for (let j = 0; j < columns; j++) {
      board[i].push(gameNode());
    }
  }

  const getBoard = () => board;

  const getBoardValues = () => {
    const boardValues = gameBoard
      .getBoard()
      .map((row) => row.map((node) => node.getMark()));

    return boardValues;
  };

  const emptyCells = (boardState) => {
    const cells = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (boardState[x][y] === 0) cells.push([x, y]);
      }
    }

    return cells;
  };

  const checkCell = (x, y) =>
    emptyCells(getBoardValues()).some((cell) =>
      cell.every((item, i) => item === [x, y][i]),
    );

  const makeMark = (x, y, playerMark) => {
    if (checkCell(x, y) && playerMark) {
      board[x][y].setMark(playerMark);

      return true;
    } else {
      return false;
    }
  };

  return {
    getBoard,
    getBoardValues,
    makeMark,
  };
})();

function gameNode() {
  let mark = 0;

  const getMark = () => mark;
  const setMark = (playerMark) => (mark = playerMark);

  return {
    getMark,
    setMark,
  };
}

function gamePlayer(initName, initMark) {
  let name = initName;
  let playerMark = initMark;

  const getName = () => name;
  const getMark = () => playerMark;

  return {
    getName,
    getMark,
  };
}

const gameController = (function () {
  const gameOver = (boardState, playerMark) => {
    const winboardState = [
      [boardState[0][0], boardState[0][1], boardState[0][2]],
      [boardState[1][0], boardState[1][1], boardState[1][2]],
      [boardState[2][0], boardState[2][1], boardState[2][2]],
      [boardState[0][0], boardState[1][0], boardState[2][0]],
      [boardState[0][1], boardState[1][1], boardState[2][1]],
      [boardState[0][2], boardState[1][2], boardState[2][2]],
      [boardState[0][0], boardState[1][1], boardState[2][2]],
      [boardState[2][0], boardState[1][1], boardState[0][2]],
    ];

    return winboardState.some(
      (line) => line.filter((item) => item === playerMark).length === 3,
    );
  };

  const gameOverAll = (boardState, firstPlayerMark, secondPlayerMark) =>
    gameOver(boardState, firstPlayerMark) ||
    gameOver(boardState, secondPlayerMark);

  const evaluateScore = (boardState, playerMark) => {
    let score = 0;

    switch (true) {
      case gameOver(boardState, playerMark):
        score = -playerMark;
        break;
      default:
        score = 0;
    }

    return score;
  };

  return {
    gameOverAll,
    evaluateScore,
  };
})();
