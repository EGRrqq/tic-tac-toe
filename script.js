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

      visualController.toggleMarkConsole();

      return playController.reverseMark();
    };

    const consolePlayerVsAi = () => {
      if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length !== 9) {
        return "use game.restart() first";
      }

      if (playController.getAiPlayer()) {
        return "you`re already playing vs ai";
      }

      visualController.toggleGameModeConsole();

      return playController.playerVsAi();
    };

    const consolePlayerVsPlayer = () => {
      if (gameBoard.getEmptyCells(gameBoard.getBoardValues()).length !== 9) {
        return "use game.restart() first";
      }

      if (!playController.getAiPlayer()) {
        return "you`re already playing vs player";
      }

      visualController.toggleGameModeConsole();

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
      visualController.currentMarkChecked();

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

    let focusedIndex = 0;
    const getDPad = () => document.querySelector(".d-pad");
    const getClickBtn = () => document.querySelector(".click-btn-console");

    let activeMenuBtns = document.querySelectorAll(
      ".start-menu-screen > section button",
    );
    const getActiveMenuBtns = () => activeMenuBtns;
    const getScreenCursor = () =>
      getActiveMenuBtns()[0]
        .closest("form")
        .querySelector(".screen-cursor-btn");

    const getBtnId = () => getActiveMenuBtns()[focusedIndex].getAttribute("id");
    const setCursorFor = () =>
      getScreenCursor().setAttribute("for", getBtnId());

    const getMarkInput = () => document.getElementById("change-mark");
    const getGameModeInput = () => document.getElementById("game-mode");

    function toggleGameModeConsole() {
      getGameModeInput().checked = !getGameModeInput().checked;
    }

    function toggleMarkConsole() {
      getMarkInput().checked = !getMarkInput().checked;
    }

    function currentMarkChecked() {
      switch (
        screenController.markValidation(
          playController.getActivePlayer().getMark(),
        )
      ) {
        case "X":
          getMarkInput().checked = true;
          break;

        case "O":
          getMarkInput().checked = false;
          break;

        default:
          break;
      }
    }

    function modalInit() {
      getScreenCursor().style.cssText = `grid-area: ${focusedIndex + 1} / 1`;
      getActiveMenuBtns()
        [focusedIndex].closest("section")
        .classList.add("screen-focus-item");

      setCursorFor();
      getActiveMenuBtns()[focusedIndex].focus();
    }

    function moveUpMenu(btns) {
      btns()
        [focusedIndex].closest("section")
        .classList.remove("screen-focus-item");

      if (focusedIndex === 0) {
        focusedIndex = btns().length - 1;
      } else {
        focusedIndex--;
      }

      btns()
        [focusedIndex].closest("section")
        .classList.add("screen-focus-item");

      setCursorFor();
      btns()[focusedIndex].focus();
      getScreenCursor().style.cssText = `grid-area: ${focusedIndex + 1} / 1`;
    }

    function moveDownMenu(btns) {
      btns()
        [focusedIndex].closest("section")
        .classList.remove("screen-focus-item");

      if (focusedIndex === btns().length - 1) {
        focusedIndex = 0;
      } else {
        focusedIndex++;
      }

      btns()
        [focusedIndex].closest("section")
        .classList.add("screen-focus-item");

      setCursorFor();
      btns()[focusedIndex].focus();
      getScreenCursor().style.cssText = `grid-area: ${focusedIndex + 1} / 1`;
    }

    function windowMenuMove(event) {
      switch (event.key) {
        case "ArrowUp":
          moveUpMenu(getActiveMenuBtns);
          break;
        case "ArrowDown":
          moveDownMenu(getActiveMenuBtns);
          break;
        default:
          break;
      }
    }

    function clickBtn(event) {
      event.preventDefault();

      getActiveMenuBtns()[focusedIndex].click();
    }

    function dPadMenuMove(event) {
      const position = event.target.getAttribute("data-position");

      switch (position) {
        case "top":
          moveUpMenu(getActiveMenuBtns);
          break;
        case "bottom":
          moveDownMenu(getActiveMenuBtns);
          break;
        default:
          break;
      }
    }

    function moveUpScreen(btns) {
      if (focusedIndex === 0 || focusedIndex === 1 || focusedIndex === 2) {
        focusedIndex += 6;
      } else {
        focusedIndex -= 3;
      }

      btns()[focusedIndex].focus();
    }

    function moveDownScreen(btns) {
      if (focusedIndex === 6 || focusedIndex === 7 || focusedIndex === 8) {
        focusedIndex -= 6;
      } else {
        focusedIndex += 3;
      }

      btns()[focusedIndex].focus();
    }

    function moveRightScreen(btns) {
      if (focusedIndex === 2 || focusedIndex === 5 || focusedIndex === 8) {
        focusedIndex -= 2;
      } else {
        focusedIndex++;
      }

      btns()[focusedIndex].focus();
    }

    function moveLeftScreen(btns) {
      if (focusedIndex === 0 || focusedIndex === 3 || focusedIndex === 6) {
        focusedIndex += 2;
      } else {
        focusedIndex--;
      }

      btns()[focusedIndex].focus();
    }

    function windowScreenMove(event) {
      switch (event.key) {
        case "ArrowUp":
          moveUpScreen(getActiveMenuBtns);
          break;
        case "ArrowRight":
          moveRightScreen(getActiveMenuBtns);
          break;
        case "ArrowDown":
          moveDownScreen(getActiveMenuBtns);
          break;
        case "ArrowLeft":
          moveLeftScreen(getActiveMenuBtns);
          break;
        default:
          break;
      }
    }

    function dPadMenuScreen(event) {
      const position = event.target.getAttribute("data-position");

      switch (position) {
        case "top":
          moveUpScreen(getActiveMenuBtns);
          break;
        case "right":
          moveRightScreen(getActiveMenuBtns);
          break;
        case "bottom":
          moveDownScreen(getActiveMenuBtns);
          break;
        case "left":
          moveLeftScreen(getActiveMenuBtns);
          break;
        default:
          break;
      }
    }

    function tabFocus(event) {
      getActiveMenuBtns()
        [focusedIndex].closest("section")
        .classList.remove("screen-focus-item");

      focusedIndex = Array.from(getActiveMenuBtns()).findIndex(
        (item) => item.id === event.target.id,
      );

      event.target.closest("section").classList.add("screen-focus-item");
    }

    (function startMenu() {
      const getVsPlayerBtn = () => document.getElementById("play-vs-player");
      const getVsAiBtn = () => document.getElementById("play-vs-ai");
      const getStartMenu = () => document.querySelector(".start-menu-screen");
      const getPlayScreen = () => document.querySelector(".play-screen");
      const getPlayerIcon = () => document.querySelector(".player-icon");
      const getAiIcon = () => document.querySelector(".ai-icon");

      (function init() {
        getGameModeInput().checked = false;
        getMarkInput().checked = false;

        modalInit();
        switchIcons();

        getActiveMenuBtns().forEach((btn) =>
          btn.addEventListener("focus", startMenuTabFocus),
        );

        window.addEventListener("keydown", startMenuWindowMove);
        getDPad().addEventListener("click", startMenuDPadMove);
        getClickBtn().addEventListener("click", clickBtn);
      })();

      function startMenuTabFocus(event) {
        tabFocus(event);

        switchIcons();
        getScreenCursor().style.cssText = `grid-area: ${focusedIndex + 1} / 1`;
      }

      function startMenuWindowMove(event) {
        switch (event.key) {
          case "ArrowUp":
            moveUpMenu(getActiveMenuBtns);
            switchIcons();
            break;
          case "ArrowDown":
            moveDownMenu(getActiveMenuBtns);
            switchIcons();
            break;
          default:
            break;
        }
      }

      function startMenuDPadMove(event) {
        const position = event.target.getAttribute("data-position");

        switch (position) {
          case "top":
            moveUpMenu(getActiveMenuBtns);
            switchIcons();
            break;
          case "bottom":
            moveDownMenu(getActiveMenuBtns);
            switchIcons();
            break;
          default:
            break;
        }
      }

      function switchIcons() {
        switch (focusedIndex) {
          case 0:
            getPlayerIcon().classList.remove("display-none");
            getAiIcon().classList.add("display-none");
            break;
          case 1:
            getAiIcon().classList.remove("display-none");
            getPlayerIcon().classList.add("display-none");
            break;
          default:
            break;
        }
      }

      function toggleScreen() {
        getStartMenu().remove();
        getPlayScreen().classList.remove("display-none");
        settingsMenu();
      }

      function playVsPlayer(event) {
        event.preventDefault();

        getActiveMenuBtns().forEach((btn) =>
          btn.removeEventListener("focus", startMenuTabFocus),
        );

        getVsPlayerBtn().removeEventListener("click", playVsPlayer);
        window.removeEventListener("keydown", startMenuWindowMove);
        getDPad().removeEventListener("click", startMenuDPadMove);
        getClickBtn().removeEventListener("click", clickBtn);

        focusedIndex = 0;
        activeMenuBtns = null;

        playController.playerVsPlayer();
        initGameMode = playController.playerVsPlayer;

        toggleScreen();

        getActiveMenuBtns()[focusedIndex].focus();
      }

      function playVsAi(event) {
        event.preventDefault();

        getActiveMenuBtns().forEach((btn) =>
          btn.removeEventListener("focus", startMenuTabFocus),
        );

        getVsAiBtn().removeEventListener("click", playVsAi);
        window.removeEventListener("keydown", startMenuWindowMove);
        getDPad().removeEventListener("click", startMenuDPadMove);
        getClickBtn().removeEventListener("click", clickBtn);

        focusedIndex = 0;
        activeMenuBtns = null;

        playController.playerVsAi();
        initGameMode = playController.playerVsAi;

        toggleScreen();

        getActiveMenuBtns()[focusedIndex].focus();
      }

      getVsPlayerBtn().addEventListener("click", playVsPlayer);
      getVsAiBtn().addEventListener("click", playVsAi);
    })();

    function settingsMenu() {
      const getSettingsConsoleBtn = () =>
        document.getElementById("settings-btn-console");

      const getCloseConsoleBtn = () =>
        document.getElementById("close-btn-console");

      const getCloseModalBtn = () =>
        document.querySelector(".settings-modal .close-btn-modal");
      const getSettingsModal = () => document.getElementById("settings-modal");

      const getResultModal = () => document.getElementById("result-modal");
      const getCloseResModalBtn = () =>
        document.querySelector("#result-modal .close-btn-modal");

      const getSettingsRestartBtn = () =>
        getSettingsModal().querySelector("#restart-btn");
      const getAiTurnBtn = () => document.getElementById("ai-turn");

      const getResRestartBtn = () =>
        getResultModal().querySelector("#restart-btn");

      const getResEm = () => getResultModal().querySelector("em");

      const getSettingsItems = () =>
        Array.from(
          getSettingsModal().querySelectorAll(".settings-item"),
        ).filter(
          (item) => !item.closest("section").classList.contains("display-none"),
        );

      const getPlayScreenBtns = () =>
        document.querySelectorAll(".play-screen > button");

      (function renderMark() {
        gameBoard.getBoard().forEach((row, i) =>
          row.forEach((node, j) => {
            node.getBtn().addEventListener("click", () => {
              playController.getPlayRound()(i, j);

              screenController.setTextContent(node);

              currentMarkChecked();
              getActiveMenuBtns()[focusedIndex].focus();

              if (
                gameBoard.getEmptyCells(gameBoard.getBoardValues()).length ===
                  0 &&
                !gameController.gameOverAll(
                  gameBoard.getBoardValues(),
                  playController.getActivePlayer().getMark(),
                )
              ) {
                getResEm().textContent = "Tie";

                showResults();
              }

              if (
                gameController.gameOver(
                  gameBoard.getBoardValues(),
                  -playController.getActivePlayer().getMark(),
                )
              ) {
                getResEm().textContent = `Player ${screenController.markValidation(
                  playController
                    .getPlayers()
                    .find(
                      (player) => player !== playController.getActivePlayer(),
                    )
                    .getMark(),
                )} wins`;

                showResults();
              }
            });
          }),
        );
      })();

      const colorGameMode = () => {
        const getPurple300 = () =>
          getComputedStyle(document.documentElement).getPropertyValue(
            "--purple-300",
          );

        const getYellow200 = () =>
          getComputedStyle(document.documentElement).getPropertyValue(
            "--yellow-200",
          );

        if (getGameModeInput().checked) {
          document.documentElement.style.setProperty(
            "--gamemode-color",
            `${getPurple300()}`,
          );
        } else {
          document.documentElement.style.setProperty(
            "--gamemode-color",
            `${getYellow200()}`,
          );
        }
      };

      function initModalSettings() {
        getSettingsConsoleBtn().addEventListener("click", openSettings);
        window.addEventListener("keydown", openModalByEsc);

        focusedIndex = 4;
        activeMenuBtns = getPlayScreenBtns();

        window.addEventListener("keydown", windowScreenMove);
        getDPad().addEventListener("click", dPadMenuScreen);
        getClickBtn().addEventListener("click", clickBtn);

        getActiveMenuBtns()[focusedIndex].focus();
      }

      function removeInitModalSetings() {
        getSettingsConsoleBtn().removeEventListener("click", openSettings);
        window.removeEventListener("keydown", openModalByEsc);

        focusedIndex = 0;
        activeMenuBtns = null;

        window.removeEventListener("keydown", windowScreenMove);
        getDPad().removeEventListener("click", dPadMenuScreen);
        getClickBtn().removeEventListener("click", clickBtn);
      }

      (function init() {
        if (getInitGameMode() === playController.playerVsAi) {
          getGameModeInput().checked = true;
        } else {
          getGameModeInput().checked = false;
        }

        currentMarkChecked();
        initModalSettings();
      })();

      function openModal(modal) {
        modal.classList.remove("display-none");
        modal.show();
      }

      function closeModal(modal) {
        modal.classList.add("display-none");
        modal.close();
      }

      function closeModalByWindow(event) {
        if (event.target !== getSettingsModal()) {
          return;
        }

        closeSettings();
      }

      function closeModalByEsc(event) {
        if (event.key === "Escape") closeSettings();
      }

      function closeResModalByWindow(event) {
        if (event.target !== getResultModal()) {
          return;
        }

        closeResults();
      }

      function closeResModalByEsc(event) {
        if (event.key === "Escape") closeResults();
      }

      function openModalByEsc(event) {
        if (event.key === "Escape") openSettings();
      }

      function settingsTabFocus(event) {
        tabFocus(event);

        getScreenCursor().style.cssText = `grid-area: ${focusedIndex + 1} / 1`;
      }

      function openSettings() {
        openModal(getSettingsModal());

        removeInitModalSetings();

        getCloseConsoleBtn().addEventListener("click", closeSettings);
        getCloseModalBtn().addEventListener("click", closeSettings);
        window.addEventListener("click", closeModalByWindow);
        window.addEventListener("keydown", closeModalByEsc);

        settingsItems();
        colorGameMode();

        activeMenuBtns = getSettingsItems();
        window.addEventListener("keydown", windowMenuMove);
        getDPad().addEventListener("click", dPadMenuMove);
        getClickBtn().addEventListener("click", clickBtn);

        getActiveMenuBtns().forEach((btn) =>
          btn.addEventListener("focus", settingsTabFocus),
        );

        modalInit();
      }

      function closeSettings() {
        closeModal(getSettingsModal());

        getCloseConsoleBtn().removeEventListener("click", closeSettings);
        getCloseModalBtn().removeEventListener("click", closeSettings);
        window.removeEventListener("click", closeModalByWindow);
        window.removeEventListener("keydown", closeModalByEsc);

        getActiveMenuBtns()
          [focusedIndex].closest("section")
          .classList.remove("screen-focus-item");

        getActiveMenuBtns().forEach((btn) =>
          btn.removeEventListener("focus", settingsTabFocus),
        );

        activeMenuBtns = null;
        focusedIndex = 0;

        window.removeEventListener("keydown", windowMenuMove);
        getDPad().removeEventListener("click", dPadMenuMove);
        getClickBtn().removeEventListener("click", clickBtn);

        initModalSettings();
      }

      function toggleGameMode(event) {
        if (event.target.checked) {
          playController.restartRound();
          initGameMode = playController.playerVsAi;
          playController.playerVsAi();

          closeSettings();
        } else {
          playController.restartRound();
          initGameMode = playController.playerVsPlayer;
          playController.playerVsPlayer();

          closeSettings();
        }

        getGameModeInput().removeEventListener("change", toggleGameMode);
      }

      function pressRestart(event) {
        playController.restartRound();

        if (event.target.closest("dialog") === getSettingsModal()) {
          closeSettings();
        } else {
          closeResults();
        }

        event.target.removeEventListener("click", pressRestart);
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
        getSettingsRestartBtn().addEventListener("click", pressRestart);
        getMarkInput().addEventListener("change", toggleMark);

        if (getInitGameMode() === playController.playerVsAi) {
          getAiTurnBtn().closest("section").classList.remove("display-none");
          getAiTurnBtn().addEventListener("click", pressAiTurn);
        } else {
          getAiTurnBtn().closest("section").classList.add("display-none");
        }
      }

      function resultItems() {
        getResRestartBtn().addEventListener("click", pressRestart);
      }

      function showResults() {
        openModal(getResultModal());

        removeInitModalSetings();

        getCloseConsoleBtn().addEventListener("click", closeResults);
        getCloseResModalBtn().addEventListener("click", closeResults);
        window.addEventListener("click", closeResModalByWindow);
        window.addEventListener("keydown", closeResModalByEsc);

        resultItems();
        colorGameMode();

        activeMenuBtns = [getResRestartBtn()];
        getClickBtn().addEventListener("click", clickBtn);

        modalInit();

        getScreenCursor().style.cssText = `grid-area: ${focusedIndex + 2} / 1`;
      }

      function closeResults() {
        closeModal(getResultModal());

        getCloseConsoleBtn().removeEventListener("click", closeResults);
        getCloseResModalBtn().removeEventListener("click", closeResults);
        window.removeEventListener("click", closeResModalByWindow);
        window.removeEventListener("keydown", closeResModalByEsc);

        activeMenuBtns = null;
        focusedIndex = 0;

        getClickBtn().removeEventListener("click", clickBtn);

        initModalSettings();
      }
    }

    return { currentMarkChecked, toggleGameModeConsole, toggleMarkConsole };
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
