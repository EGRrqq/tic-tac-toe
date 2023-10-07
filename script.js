const game = (function () {
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

    const getEmptyCells = (boardState) => {
      const cells = [];

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (boardState[x][y] === 0) cells.push([x, y]);
        }
      }

      return cells;
    };

    const checkCell = (x, y) =>
      getEmptyCells(getBoardValues()).some((cell) =>
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
      getEmptyCells,
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
    const type = "HUMAN";
    let name = initName;
    let playerMark = initMark;

    const getType = () => type;
    const getName = () => name;
    const getMark = () => playerMark;
    const changeMark = () => (playerMark = -getMark());

    const playerTurn = (x, y) => {
      if (gameController.gameOverAll(gameBoard.getBoardValues(), initMark)) {
        x = -1;
        y = -1;
      }

      return [x, y, getMark()];
    };

    const makeTurn = (x, y) => gameBoard.makeMark(...playerTurn(x, y));

    return {
      getType,
      getName,
      getMark,
      makeTurn,
      changeMark,
    };
  }

  function aiPlayer(initName, initMark) {
    const type = "AI";
    const getType = () => type;
    const { getName, getMark, changeMark } = gamePlayer(initName, initMark);
    let turn = [];

    const aiTurn = () => {
      let x = Math.floor(Math.random() * 3);
      let y = Math.floor(Math.random() * 3);

      if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length !== 9) {
        const move = gameController.minimax(
          gameBoard.getBoardValues(),
          gameBoard.getEmptyCells(gameBoard.getBoardValues()).length,
          getMark(),
        );

        x = move[0];
        y = move[1];
      }

      turn = [x, y, getMark()];

      return turn;
    };

    const makeTurn = () => gameBoard.makeMark(...aiTurn());
    const getTurn = () => {
      return turn.slice(0, 2);
    };

    return {
      getType,
      getName,
      getMark,
      changeMark,
      makeTurn,
      getTurn,
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

    const gameOverAll = (boardState, playerMark) =>
      gameOver(boardState, playerMark) || gameOver(boardState, -playerMark);

    const evaluateScore = (boardState, playerMark) => {
      let score = 0;

      switch (true) {
        case gameOver(boardState, -playerMark):
          score = -playerMark;
          break;
        default:
          score = 0;
          break;
      }

      return score;
    };

    function minimax(boardState, depth, playerMark) {
      let best;

      switch (playerMark) {
        case 1:
          best = [-1, -1, -Infinity];
          break;
        case -1:
          best = [-1, -1, +Infinity];
          break;
      }

      if (depth === 0 || gameOverAll(boardState, playerMark)) {
        const score = evaluateScore(boardState, playerMark);

        return [-1, -1, score];
      }

      gameBoard.getEmptyCells(boardState).forEach((cell) => {
        const x = cell[0];
        const y = cell[1];

        boardState[x][y] = playerMark;
        const score = minimax(boardState, depth - 1, -playerMark);
        boardState[x][y] = 0;

        score[0] = x;
        score[1] = y;

        switch (playerMark) {
          case 1:
            if (score[2] > best[2]) best = score;
            break;
          case -1:
            if (score[2] < best[2]) best = score;
            break;
        }
      });

      return best;
    }

    return {
      gameOverAll,
      minimax,
    };
  })();

  const playController = (function () {
    const players = [];
    let playRound = () => {};

    const getPlayRound = () => playRound;
    const getPlayers = () => players;
    const getAiPlayer = () =>
      getPlayers().find((player) => player.getType() === "AI");

    let activePlayer = getPlayers()[0];

    const switchPlayerTurn = () =>
      (activePlayer =
        activePlayer === getPlayers()[0] ? getPlayers()[1] : getPlayers()[0]);

    const getActivePlayer = () => activePlayer;

    (function init() {
      playerVsPlayer();
    })();

    function playerVsPlayer() {
      getPlayers().splice(0);
      getPlayers().push(gamePlayer("juh", -1), gamePlayer("wuh", 1));
      activePlayer = getPlayers()[0];

      const playerVsPlayerRound = (row, col) => {
        if (getActivePlayer().makeTurn(row, col)) {
          switchPlayerTurn();
        }
      };

      playRound = (row, col) => playerVsPlayerRound(row, col);
    }

    function playerVsAi() {
      getPlayers().splice(0);
      getPlayers().push(gamePlayer("juh", -1), aiPlayer("cortana", 1));
      activePlayer = getPlayers()[0];

      const playerVsAIRound = (row, col) => {
        if (getActivePlayer().makeTurn(row, col)) {
          aiPlay();
        }
      };

      playRound = (row, col) => playerVsAIRound(row, col);
    }

    const reverseMark = () => {
      getPlayers()[0].changeMark();

      getPlayers()[1].changeMark();
    };

    const restartRound = () => {
      gameBoard.getBoard().forEach((row) =>
        row.forEach((node) => {
          node.setMark(0);

          screenController.setTextContent(node);
        }),
      );

      activePlayer = getPlayers()[0];
    };

    function aiPlay() {
      switchPlayerTurn();
      getActivePlayer().makeTurn();
      switchPlayerTurn();
    }

    return {
      playRound,
      playerVsAi,
      playerVsPlayer,
      aiPlay,
      getAiPlayer,
      reverseMark,
      restartRound,
      getActivePlayer,
      getPlayRound,
    };
  })();

  const screenController = (function () {
    const rows = 3;
    const columns = 3;
    const screenBtns = [];

    const getScreenBtns = () => screenBtns;

    (function fillScreenBtns() {
      const btns = document.querySelectorAll(".screen button");

      for (let i = 0; i < rows; i++) {
        screenBtns[i] = [];

        for (let j = 0; j < columns; j++) {
          screenBtns[i].push(btns[i * rows + j]);
        }
      }
    })();

    (function addBtnToBoard() {
      gameBoard.getBoard().forEach((row, i) =>
        row.forEach((node, j) => {
          node.getBtn = () => getScreenBtns()[i][j];
        }),
      );
    })();

    (function renderMark() {
      gameBoard.getBoard().forEach((row, i) =>
        row.forEach((node, j) => {
          node.getBtn().addEventListener("click", () => {
            playController.getPlayRound()(i, j);

            setTextContent(node);
          });
        }),
      );
    })();

    function setTextContent(node) {
      setPlayerTextContent(node);
      setAiTextContent();
    }

    function markValidation(mark) {
      switch (mark) {
        case -1:
          return "X";
        case 1:
          return "O";
        default:
          return "";
      }
    }

    function setPlayerTextContent(node) {
      const mark = node.getMark();

      node.getBtn().textContent = markValidation(mark);
    }

    function setAiTextContent() {
      if (!playController.getAiPlayer()) return;

      const x = playController.getAiPlayer().getTurn()[0];
      const y = playController.getAiPlayer().getTurn()[1];

      if (x >= 0 && y >= 0) {
        const node = gameBoard.getBoard()[x][y];

        const mark = node.getMark();
        node.getBtn().textContent = markValidation(mark);
      }
    }

    return {
      setTextContent,
      setAiTextContent,
    };
  })();

  const consoleController = (function () {
    console.info("To play, use the game.playConsole() method");

    (function init() {})();

    function playConsole(x, y) {
      playController.getPlayRound()(x, y);

      const node = gameBoard.getBoard()[x][y];
      screenController.setTextContent(node);

      console.log("board:", gameBoard.getBoardValues());
    }

    function aiFirstPlay() {
      playController.aiPlay();
      screenController.setAiTextContent();
    }

    return {
      playConsole,
      aiFirstPlay,
    };
  })();

  return {
    playConsole: consoleController.playConsole,
    reverseMark: playController.reverseMark,
    restartRound: playController.restartRound,
    aiFirstPlay: consoleController.aiFirstPlay,
    playerVsAi: playController.playerVsAi,
    playerVsPlayer: playController.playerVsPlayer,
  };
})();
