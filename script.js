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
      gameOver,
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
      playerVsAi();
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
      getPlayers,
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
            visualController.currentMarkChecked();
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
      markValidation,
    };
  })();

  const consoleController = (function () {
    // all validation are only for users who prefer to play via console,
    // to help them with available values
    console.log("-------------");

    console.info(
      `available methods:

      - To play, use the game.play() method
      - To restart, use the game.restart() method
      - To change init mark, use the game.reverseMark() method
      - To play vs player, use the game.playVsPlayer() method
      - To play vs ai, use the game.playVsAi() method
      - - To make ai first turn, use the game.aiFirstTurn() method
      `,
    );

    console.log("-------------");

    const getConsoleBoardValues = () =>
      gameBoard
        .getBoardValues()
        .map((row) => row.map((mark) => screenController.markValidation(mark)));

    const consoleReverseMark = () => {
      if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length !== 9) {
        return "use game.restart() first";
      }

      return playController.reverseMark();
    };

    const consolePlayerVsAi = () => {
      if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length !== 9) {
        return "use game.restart() first";
      }

      if (playController.getAiPlayer()) {
        return "you`re already playing vs ai";
      }

      return playController.playerVsAi();
    };

    const consolePlayerVsPlayer = () => {
      if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length !== 9) {
        return "use game.restart() first";
      }

      if (!playController.getAiPlayer()) {
        return "you`re already playing vs player";
      }

      return playController.playerVsPlayer();
    };

    function consolePlayRound(row, column) {
      if (row !== 0 && row !== 1 && row !== 2) {
        return "available row values: 0, 1, 2";
      }

      if (column !== 0 && column !== 1 && column !== 2) {
        return "available column values: 0, 1, 2";
      }

      if (gameBoard.getBoard()[row][column].getMark() !== 0) {
        return "cell is full";
      }

      playController.getPlayRound()(row, column);

      const node = gameBoard.getBoard()[row][column];
      screenController.setTextContent(node);

      getBoardResult();

      return getConsoleBoardValues();
    }

    function aiFirstTurn() {
      if (!playController.getAiPlayer()) {
        return "use game.playerVsAi() first";
      }

      if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length !== 9) {
        return "use game.restart() first";
      }

      playController.aiPlay();
      screenController.setAiTextContent();
    }

    function getBoardResult() {
      if (
        gameBoard.getEmptyCells(gameBoard.getBoardValues()).length === 0 &&
        !gameController.gameOverAll(
          gameBoard.getBoardValues(),
          playController.getActivePlayer().getMark(),
        )
      ) {
        console.log("-------------");
        console.log("Tie!");
        console.log("-------------");
      }

      if (
        gameController.gameOver(
          gameBoard.getBoardValues(),
          -playController.getActivePlayer().getMark(),
        )
      ) {
        console.log("-------------");
        console.log(
          `player ${playController
            .getPlayers()
            .find((player) => player !== playController.getActivePlayer())
            .getName()} wins`,
        );
        console.log("-------------");
      }
    }

    return {
      consolePlayRound,
      consoleReverseMark,
      consolePlayerVsAi,
      consolePlayerVsPlayer,
      aiFirstTurn,
    };
  })();

  const visualController = (function () {
    let initGameMode;
    const getInitGameMode = () => initGameMode;

    const getMarkInput = () => document.getElementById("change-mark");

    function currentMarkChecked() {
      switch (
        screenController.markValidation(
          playController.getActivePlayer().getMark(),
        )
      ) {
        case "X":
          getMarkInput().setAttribute("checked", "true");
          break;

        case "O":
          getMarkInput().removeAttribute("checked");
          break;

        default:
          break;
      }
    }

    (function startMenu() {
      const getVsPlayerBtn = () => document.getElementById("play-vs-player");
      const getVsAiBtn = () => document.getElementById("play-vs-ai");
      const getStartMenu = () => document.querySelector(".start-menu-screen");
      const getPlayScreen = () => document.querySelector(".play-screen");

      function toggleScreen() {
        getStartMenu().remove();
        getPlayScreen().classList.remove("display-none");
        settingsMenu();
      }

      function playVsPlayer(event) {
        event.preventDefault();

        getVsPlayerBtn().removeEventListener("click", playVsPlayer);
        playController.playerVsPlayer();
        initGameMode = playController.playerVsPlayer;

        toggleScreen();
      }

      function playVsAi(event) {
        event.preventDefault();

        getVsAiBtn().removeEventListener("click", playVsAi);
        playController.playerVsAi();
        initGameMode = playController.playerVsAi;

        toggleScreen();
      }

      getVsPlayerBtn().addEventListener("click", playVsPlayer);
      getVsAiBtn().addEventListener("click", playVsAi);
    })();

    function settingsMenu() {
      const getSettingsConsoleBtn = () =>
        document.getElementById("settings-btn-console");

      const getCloseConsoleBtn = () =>
        document.getElementById("close-btn-console");

      const getCloseModalBtn = () => document.querySelector(".close-btn-modal");
      const getSettingsModal = () => document.getElementById("settings-modal");

      const getGameModeInput = () => document.getElementById("game-mode");
      const getRestartbtn = () => document.getElementById("restart-btn");
      const getAiTurnBtn = () => document.getElementById("ai-turn");

      (function init() {
        if (getInitGameMode() === playController.playerVsAi) {
          getGameModeInput().toggleAttribute("checked");
        }

        currentMarkChecked();
      })();

      function closeModalByWindow(event) {
        if (event.target !== getSettingsModal()) {
          return;
        }

        closeSettings();
      }

      function closeModalByEsc(event) {
        if (event.key === "Escape") closeSettings();
      }

      function openModalByEsc(event) {
        if (event.key === "Escape") openSettings();
      }

      function openModal(modal) {
        modal.classList.remove("display-none");
        modal.show();
      }

      function closeModal(modal) {
        modal.classList.add("display-none");
        modal.show();
      }

      function openSettings() {
        openModal(getSettingsModal());

        getSettingsConsoleBtn().removeEventListener("click", openSettings);
        window.removeEventListener("keydown", openModalByEsc);

        getCloseConsoleBtn().addEventListener("click", closeSettings);
        getCloseModalBtn().addEventListener("click", closeSettings);
        window.addEventListener("click", closeModalByWindow);
        window.addEventListener("keydown", closeModalByEsc);

        settingsItems();
      }

      function closeSettings() {
        closeModal(getSettingsModal());

        getCloseConsoleBtn().removeEventListener("click", closeSettings);
        getCloseModalBtn().removeEventListener("click", closeSettings);
        window.removeEventListener("click", closeModalByWindow);
        window.removeEventListener("keydown", closeModalByEsc);

        getSettingsConsoleBtn().addEventListener("click", openSettings);
        window.addEventListener("keydown", openModalByEsc);
      }

      function toggleGameMode(event) {
        if (event.target.checked) {
          playController.restartRound();
          playController.playerVsAi();

          closeSettings();
        } else {
          playController.restartRound();
          playController.playerVsPlayer();

          closeSettings();
        }

        getGameModeInput().removeEventListener("change", toggleGameMode);
      }

      function pressRestart() {
        playController.restartRound();
        closeSettings();

        getRestartbtn().removeEventListener("click", pressRestart);
      }

      function toggleMark(event) {
        if (event.target.checked) {
          playController.restartRound();
          playController.reverseMark();

          closeSettings();
        } else {
          playController.restartRound();
          playController.reverseMark();

          closeSettings();
        }

        getMarkInput().removeEventListener("change", toggleMark);
      }

      function pressAiTurn() {
        if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length === 9) {
          playController.aiPlay();
          screenController.setAiTextContent();

          closeSettings();
        } else {
          playController.restartRound();
          playController.aiPlay();
          screenController.setAiTextContent();

          closeSettings();
        }

        getAiTurnBtn().removeEventListener("click", pressAiTurn);
      }

      function settingsItems() {
        getGameModeInput().addEventListener("change", toggleGameMode);
        getRestartbtn().addEventListener("click", pressRestart);
        getMarkInput().addEventListener("change", toggleMark);
        getAiTurnBtn().addEventListener("click", pressAiTurn);
      }

      getSettingsConsoleBtn().addEventListener("click", openSettings);
      window.addEventListener("keydown", openModalByEsc);
    }

    return { currentMarkChecked };
  })();

  return {
    play: consoleController.consolePlayRound,
    reverseMark: consoleController.consoleReverseMark,
    restart: playController.restartRound,
    aiFirstTurn: consoleController.aiFirstTurn,
    playerVsAi: consoleController.consolePlayerVsAi,
    playerVsPlayer: consoleController.consolePlayerVsPlayer,
  };
})();
