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

  const makeMark = (row, column, choice) => {
    // The main idea is to use this big ass condition for rows and columns:
    // - Other conditions lose the `choice` return statement.
    // - Row and column return messages appears only after the `choice` value is typed.

    if (row !== 0 && row !== 1 && row !== 2)
      return "available row values: 0, 1, 2";

    if (column !== 0 && column !== 1 && column !== 2)
      return "available column values: 0, 1, 2";

    if (parseInt(choice) !== 0 && parseInt(choice) !== 1)
      return "available choice values: 0, 1";

    if (board[row][column].getMark() !== "") return "cell is full";

    board[row][column].pickMark(choice);
  };

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

  const getMark = () => mark;

  const pickMark = (choice) => {
    const marks = ["X", "O"];

    mark = marks[choice];
  };

  return { getMark, pickMark };
}
