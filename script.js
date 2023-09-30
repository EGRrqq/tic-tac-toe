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

  const makeMark = (row, column, choice) => board[row][column].pickMark(choice);

  const printBoardValues = () => {
    const boardValues = gameBoard
      .getBoard()
      .map((row) => row.map((node) => node.getMark()));

    return boardValues;
  };

  return {
    getBoard,
    printBoardValues,
    makeMark,
  };
})();

function gameNode() {
  let mark = "";
  let playerId = "";

  const getMark = () => mark;

  const pickMark = (choice) => {
    const marks = ["X", "O"];

    mark = marks[choice];
  };

  const setPlayerId = (playerName) => (playerId = playerName);
  const getPlayerId = () => playerId;

  return {
    getMark,
    pickMark,
    setPlayerId,
    getPlayerId,
  };
}

function gamePlayer(initName) {
  let name = initName;
  const gameHistory = [];

  const getName = () => name;
  const changeName = (newName) => (name = newName);

  const addToGameHistory = (row, column) =>
    gameHistory.push(gameBoard.getBoard()[row][column].getMark());

  const resetPlayerHistory = () => gameHistory.splice(0, gameHistory.length);
  const getFullHistory = () => gameHistory;
  const getLastHistory = () => gameHistory[gameHistory.length - 1];

  return {
    getName,
    changeName,
    addToGameHistory,
    resetPlayerHistory,
    getFullHistory,
    getLastHistory,
  };
}

const gameController = (function () {
  const players = [gamePlayer("juh"), gamePlayer("bluh")];
  let activePlayer = players[0];

  const switchActivePlayer = () =>
    (activePlayer = activePlayer === players[0] ? players[1] : players[0]);

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    console.log("Current board state: ", gameBoard.printBoardValues());
    console.log(`Player ${getActivePlayer().getName()} turn.`);
  };

  const playRound = (row, column, choice) => {
    // Why are you using these big ass conditions to validate rows and columns?
    // - Other conditions lose the `choice` return statement.
    // - Row and column return messages appears only after the `choice` value is typed.
    //
    // Why not put this validation in a separate function?
    // - I want to have some kind of validation "on type" and on submit.
    // - If I move the validation to a separate function, I will only have validation on submit.
    // - It`s possible to make a separate validation function with a separate console.log that will contain all the requirements, but I don't want to do that

    if (row !== 0 && row !== 1 && row !== 2)
      return "available row values: 0, 1, 2";

    if (column !== 0 && column !== 1 && column !== 2)
      return "available column values: 0, 1, 2";

    if (parseInt(choice) !== 0 && parseInt(choice) !== 1)
      return "available choice values: 0 for X, 1 for O";

    if (gameBoard.getBoard()[row][column].getMark() !== "")
      return "cell is full";

    gameBoard.getBoard()[row][column].setPlayerId(getActivePlayer().getName());

    gameBoard.makeMark(row, column, choice);
    getActivePlayer().addToGameHistory(row, column);

    console.log(
      `Player ${getActivePlayer().getName()} place ${getActivePlayer().getLastHistory()} mark to (${row}, ${column}) `,
    );

    switchActivePlayer();
    printNewRound();
  };

  console.log("Current board state: ", gameBoard.printBoardValues());

  return {
    playRound,
    getActivePlayer,
  };
})();
