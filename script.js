// ————— Replace these with your real Firebase project values —————
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "woodle-3eaa5.firebaseapp.com",
  databaseURL: "https://woodle-3eaa5-default-rtdb.firebaseio.com",
  projectId: "woodle-3eaa5",
  storageBucket: "woodle-3eaa5.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Game State
let playerId = "";
let playerName = "";
let roomCode = "";
let targetWord = "";
let guesses = [];

// Predefined word lists
const WORD_LIST = ["CRANE","SLATE","BRAVE","GHOST","LIGHT","STONE","PLANT","WATER","BRAIN","SHINE"];

// Utility
function randWord() {
  return WORD_LIST[Math.floor(Math.random()*WORD_LIST.length)];
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ————— Lobby: room creation & joining —————

function createRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  playerId = genId();
  roomCode = Math.random().toString(36).substr(2,5).toUpperCase();
  targetWord = randWord();

  db.ref(`rooms/${roomCode}`).set({
    targetWord,
    status: "started",
    players: {
      [playerId]: { name: playerName, guesses: [], status: "active" }
    }
  });

  startGame();
}

function joinRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  playerId = genId();
  const input = document.getElementById("roomCodeInput").value.trim().toUpperCase();
  if (!input) return alert("Enter room code!");

  roomCode = input;
  db.ref(`rooms/${roomCode}/currentWord`).once("value", snap => {
    if (!snap.exists()) return alert("Room not found.");
    targetWord = snap.val();
    db.ref(`rooms/${roomCode}/players/${playerId}`).set({
      name: playerName, guesses: [], status: "active"
    });
    startGame();
  });
}

// ————— Game Start & Real-time listening —————

function startGame() {
  document.getElementById("lobby").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
  document.getElementById("roomDisplay").innerText = roomCode;
  listenGuesses();

  db.ref(`rooms/${roomCode}/players/${playerId}/status`)
    .on("value", snap => {
      if (snap.val() === "won") {
        document.getElementById("status").innerText = "🎉 YOU WON!";
      }
    });
}

function listenGuesses() {
  db.ref(`rooms/${roomCode}/players/${playerId}/guesses`)
    .on("value", snap => {
      guesses = snap.val() || [];
      renderBoard();
    });
}

// ————— Submit Guess —————

function submitGuess() {
  const val = document.getElementById("guessInput").value.trim().toUpperCase();
  if (val.length !== 5) return alert("Enter a 5‑letter word");
  guesses.push(val);
  db.ref(`rooms/${roomCode}/players/${playerId}/guesses`)
    .set(guesses);

  if (val === targetWord) {
    db.ref(`rooms/${roomCode}/players/${playerId}/status`)
      .set("won");
  }
  document.getElementById("guessInput").value = "";
}

// ————— Render Wordle Tiles —————

function renderBoard() {
  const board = document.getElementById("grid");
  board.innerHTML = "";

  guesses.forEach(word => {
    for (let i = 0; i < 5; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      if (word[i] === targetWord[i]) tile.classList.add("correct");
      else if (targetWord.includes(word[i])) tile.classList.add("present");
      else tile.classList.add("absent");

      tile.innerText = word[i];
      board.appendChild(tile);
    }
  });
}


