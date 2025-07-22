// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD_TBfmoZaYVGTQtblDMsUsNi_odpQKfQ4",
  authDomain: "woodle-3eaa5.firebaseapp.com",
  databaseURL: "https://woodle-3eaa5-default-rtdb.firebaseio.com",
  projectId: "woodle-3eaa5",
  storageBucket: "woodle-3eaa5.appspot.com",
  messagingSenderId: "1058533729670",
  appId: "1:1058533729670:web:d3275a6d307f97313ff807"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let roomCode, playerId, playerName, currentWord;

function createRoom() {
  roomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
  playerName = document.getElementById("player-name").value || "Player";
  playerId = Date.now().toString();

  currentWord = getRandomWord();
  db.ref(`rooms/${roomCode}`).set({
    currentWord,
    status: "started",
    players: {
      [playerId]: {
        name: playerName,
        guesses: [],
        status: "active"
      }
    }
  });

  startGame();
}

function joinRoom() {
  roomCode = document.getElementById("room-code").value.toUpperCase();
  playerName = document.getElementById("player-name").value || "Player";
  playerId = Date.now().toString();

  db.ref(`rooms/${roomCode}/players/${playerId}`).set({
    name: playerName,
    guesses: [],
    status: "active"
  });

  db.ref(`rooms/${roomCode}/currentWord`).once("value", snapshot => {
    currentWord = snapshot.val();
    startGame();
  });
}

function startGame() {
  document.getElementById("room-ui").classList.add("hidden");
  document.getElementById("game-ui").classList.remove("hidden");
  document.getElementById("room-info").innerText = `Room: ${roomCode}`;
  listenToGuesses();
}

function submitGuess() {
  const guess = document.getElementById("guess-input").value.toUpperCase();
  if (guess.length !== 5) return alert("Enter a 5-letter word.");
  db.ref(`rooms/${roomCode}/players/${playerId}/guesses`).push(guess);
  document.getElementById("guess-input").value = "";
}

function listenToGuesses() {
  db.ref(`rooms/${roomCode}/players/${playerId}/guesses`).on("value", snapshot => {
    const guesses = snapshot.val() || {};
    drawBoard(Object.values(guesses));
  });
}

function drawBoard(guesses) {
  const board = document.getElementById("board");
  board.innerHTML = "";
  guesses.forEach(guess => {
    for (let i = 0; i < 5; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.innerText = guess[i];
      if (guess[i] === currentWord[i]) tile.classList.add("correct");
      else if (currentWord.includes(guess[i])) tile.classList.add("present");
      else tile.classList.add("absent");
      board.appendChild(tile);
    }
  });
}

function getRandomWord() {
  const words = ["CRANE", "LIGHT", "STONE", "PLANT", "COVER", "FLAME", "BRICK"];
  return words[Math.floor(Math.random() * words.length)];
}

