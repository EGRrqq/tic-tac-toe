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

  const printBoardValues = () => {
    const boardValues = gameBoard
      .getBoard()
      .map((row) => row.map((node) => node.getMark()));

    return boardValues;
  };

  return {
    getBoard,
    printBoardValues,
  };
})();

function gameNode() {
  let mark = 0;

  const getMark = () => mark;

  return {
    getMark,
  };
}

function gamePlayer(initName, initMark) {
  let name = initName;
  let mark = initMark;

  const getName = () => name;
  const getMark = () => mark;

  return {
    getName,
    getMark,
  };
}

const gameController = (function () {
  const players = [gamePlayer("juh", 1), gamePlayer("bluh", -1)];

  const gameOver = (state, playerMark) => {
    const winState = [
      [state[0][0], state[0][1], state[0][2]],
      [state[1][0], state[1][1], state[1][2]],
      [state[2][0], state[2][1], state[2][2]],
      [state[0][0], state[1][0], state[2][0]],
      [state[0][1], state[1][1], state[2][1]],
      [state[0][2], state[1][2], state[2][2]],
      [state[0][0], state[1][1], state[2][2]],
      [state[2][0], state[1][1], state[0][2]],
    ];

    return winState.some(
      (line) => line.filter((item) => item === playerMark).length === 3,
    );
  };

  return {
    gameOver,
  };
})();
