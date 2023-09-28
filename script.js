const gameboard = (() => {
  const gameContent = [];

  const gameNode = (btn) => {
    const link = btn;
    const textContent = btn.textContent;

    return {
      link,
      textContent,
    };
  };

  function getBtns() {
    const buttons = document.querySelectorAll(".screen > button");

    buttons.forEach((btn) => {
      gameContent.push(gameNode(btn));
    });
  }

  function fillBtns() {
    for (let node of gameContent) {
      const randomMark = ["X", "O"][Math.floor(Math.random() * 2)];

      node.textContent = randomMark;
    }
  }

  function updateBtns() {
    for (let node of gameContent) {
      node.link.textContent = node.textContent;
    }
  }

  (function _render() {
    getBtns();
    fillBtns();
    updateBtns();
  })();

  return {
    gameContent,
  };
})();
