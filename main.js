/* HACK: Manual selection on sidebar causes document to scroll with animation because scroll-behavior is set to smooth.
However, it causes scroll event to trigger on document which causes the selection in sidebar to cycle between all the intermediate sections;
clearly undesirable. However, to prevent it, a timeout function is set whenever user manually selects an anchor from the sidebar,
which disables document scroll event for 1 second, by setting a flag. */

function initializeSnippets() {
  for (const snippet of snippets) {
    let parts = [];
    parts.push("snippets");
    parts.push(snippet.children[0].textContent);

    let fileName = parts.join("/");

    fetch(fileName)
      .then((response) => response.text())
      .then((text) => {
        text = text.trim();

        let pre = document.createElement("pre");
        let code = document.createElement("code");

        code.textContent = text;
        pre.appendChild(code);
        snippet.removeChild(snippet.firstChild);
        snippet.appendChild(pre);
      })
      .then(() => {
        hljs.highlightAll();
        initializeScrollOffsets();
      });

    let snippetMsg = document.createElement("p");
    snippetMsg.textContent = "Copied";
    snippetMsg.classList = "snippet-msg";

    let button = document.createElement("button");

    button.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" class="snippet-copy-icon"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>';
    button.className = "snippet-copy-button";
    button.title = "Copy to clipboard";

    snippet.appendChild(button);
    snippet.appendChild(snippetMsg);

    button.addEventListener("click", () => {
      let c = button.parentNode.querySelector("pre code");

      navigator.clipboard.writeText(c.textContent);

      snippetMsg.style.visibility = "visible";

      if (uid != undefined) {
        clearTimeout(uid);
      }

      uid = setTimeout(() => {
        snippetMsg.style.visibility = "hidden";
      }, 1500);
    });
  }
}

function checkGuess() {
  const userGuess = Number(guessField.value);

  if (id != undefined) {
    clearTimeout(id);
  }

  let flag = false;

  if (userGuess === "" || userGuess === 0) {
    msg = "Please enter a number.";
    flag = true;
  } else if (Number.isInteger(userGuess) === false) {
    msg = "Enter an integer please.";
    flag = true;
  } else if (userGuess < 1 || userGuess > 100) {
    msg = "Number should be in range 1 to 100.";
    flag = true;
  }

  if (flag === true) {
    showNotice(msg);
    guessField.value = "";
    return;
  }

  if (userGuess === randomNumber) {
    setGameOver("win");
    return;
  } else {
    let img = lives[maxGuesses - guessCount].children[0];
    let p = lives[maxGuesses - guessCount].children[1];

    img.src = "images/gray-heart.png";
    p.textContent = userGuess.toString();

    if (userGuess > randomNumber) {
      p.classList.add("high");
    } else if (userGuess < randomNumber) {
      p.classList.add("low");
    }
  }

  guessCount++;
  guessField.value = "";
  guessField.focus();

  if (guessCount === maxGuesses + 1) {
    setGameOver("lose");
  }
}

function showNotice(msg) {
  notice.children[1].textContent = msg;
  notice.style.visibility = "visible";

  id = setTimeout(() => {
    notice.style.visibility = "hidden";
  }, 2000);
}

function setGameOver(winOrLose) {
  guessField.disabled = true;
  guessSubmit.disabled = true;

  if (winOrLose === "win") {
    score = 100 - guessCount * 10;

    winPopup.style.visibility = "visible";
    winPopup.children[2].textContent = "Your score: " + score;
  } else if (winOrLose === "lose") {
    losePopup.style.visibility = "visible";
    losePopup.children[1].textContent = "Your score: " + score;
  }
}

function resetGame() {
  winPopup.style.visibility = "hidden";
  losePopup.style.visibility = "hidden";

  for (const life of lives) {
    let img = life.children[0];
    let p = life.children[1];

    img.src = "images/red-heart.png";
    p.textContent = "";
    p.classList = "";
  }

  randomNumber = Math.floor(Math.random() * 100) + 1;
  guessCount = 1;
  guessField.disabled = false;
  guessSubmit.disabled = false;
  guessField.value = "";
  guessField.focus();
}

function selectSidebar(sidebar) {
  for (const i of sidebars) {
    i.classList = "";
  }
  sidebar.classList.add("sidebar-selected");
}

function initializeScrollOffsets() {
  for (const section of sections) {
    scrollOffsets[section.id] = section.offsetTop;
  }
}

function selectClosestSidebar() {
  if (isManualSidebar) return;
  let closestId = "home";
  let closestScroll = 0;

  for (const [sectionId, sectionScroll] of Object.entries(scrollOffsets)) {
    if (sectionScroll <= currentScroll && sectionScroll > closestScroll) {
      closestScroll = sectionScroll;
      closestId = sectionId;
    }
  }

  for (const sidebar of sidebars) {
    if (sidebar.getAttribute("href") === "#" + closestId) {
      selectSidebar(sidebar);
    }
  }
}

function selectManualSidebar(sidebar) {
  if (sid != undefined) {
    clearTimeout(sid);
  }

  isManualSidebar = true;

  sid = setTimeout(() => {
    isManualSidebar = false;
  }, 1000);

  selectSidebar(sidebar);
}

function initializeEventListeners() {
  guessSubmit.addEventListener("click", checkGuess);
  guessField.addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
      checkGuess();
    }
  });

  for (const resetButton of resetButtons) {
    resetButton.addEventListener("click", resetGame);
  }

  for (const sidebar of sidebars) {
    sidebar.addEventListener("click", () => {
      selectManualSidebar(sidebar);
    });
  }

  document.addEventListener("scroll", () => {
    currentScroll = window.scrollY;

    window.requestAnimationFrame(() => {
      selectClosestSidebar();
    });
  });
}

const snippets = document.querySelectorAll("div.snippet");
const lives = document.querySelectorAll(".life");
const notice = document.querySelector(".notice");
const winPopup = document.querySelector(".popup-win");
const losePopup = document.querySelector(".popup-lose");
const resetButtons = document.querySelectorAll(".reset-button");
const guessSubmit = document.querySelector(".guessSubmit");
const guessField = document.querySelector(".guessField");
const sidebars = document.querySelectorAll(".sidebar-nav li a");
const sections = document.querySelectorAll("main section");

let currentScroll = 0;
let maxGuesses = lives.length;
let isManualSidebar = false;
let guessCount;
let randomNumber;
let id;
let sid;
let uid;
let score;
let msg;
let scrollOffsets = {};

resetGame();
initializeSnippets();
initializeEventListeners();
