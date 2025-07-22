// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD_TBfmoZaYVGTQtblDMsUsNi_odpQKfQ4",
  authDomain: "woodle-3eaa5.firebaseapp.com",
  databaseURL: "https://woodle-3eaa5-default-rtdb.firebaseio.com",
  projectId: "woodle-3eaa5",
  storageBucket: "woodle-3eaa5.firebasestorage.app",
  messagingSenderId: "1058533729670",
  appId: "1:1058533729670:web:d3275a6d307f97313ff807"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Global state
let playerId, playerName, roomCode, targetWord, guesses = [];

// Predefined gibberish-friendly words
const WORD_LIST = ["CRANE","SLATE","BRAVE","GHOST","LIGHT","STONE","PLANT","BRAIN","SHINE"];

// Generate ID and random words
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function pickWord() {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

// Wait for elements to exist
document.addEventListener("DOMContentLoaded", () => {
  // Buttons
  document.getElementById("create-room-btn").onclick = () => initGame(true);
  document.getElementById("join-room-btn").onclick = () => initGame(false);

  // Guess submission
  document.getElementById("guess-form").onsubmit = e => {
    e.preventDefault();
    const val = document.getElementById("guess-input").value.trim().toUpperCase();
    if (val.length !== 5) return alert("Enter a 5-letter word");
    guesses.push(val);
    db.ref(`rooms/${roomCode}/players/${playerId}/guesses`).set(guesses);
    document.getElementById("guess-input").value = "";
  };
});

function initGame(isCreate) {
  playerName = document.getElementById("player-name").value.trim() || "Player";
  const inputCode = document.getElementById("room-code").value.trim().toUpperCase();

  playerId = genId();

  if (isCreate) {
    roomCode = genId().slice(-5).toUpperCase();
    targetWord = pickWord();
    db.ref(`rooms/${roomCode}`).set({
      targetWord,
      status: "started",
      players: { [playerId]: { name: playerName, guesses: [], status: "active" } }
    }).then(startGame);
  } else {
    if (!inputCode) return alert("Enter room code to join!");
    roomCode = inputCode;
    db.ref(`rooms/${roomCode}/targetWord`).once("value", snap => {
      if (!snap.exists()) return alert("Room not found!");
      targetWord = snap.val();
      db.ref(`rooms/${roomCode}/players/${playerId}`).set({
        name: playerName, guesses: [], status: "active"
      }).then(startGame);
    });
  }
}

function startGame() {
  document.getElementById("join-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  document.getElementById("room-name").innerText = `Room: ${roomCode}`;

  // Sync players
  db.ref(`rooms/${roomCode}/players`).on("value", snap => {
    const html = [];
    snap.forEach(c => {
      const p = c.val();
      html.push(`${p.name} — ${p.status}`);
    });
    document.getElementById("playersList").innerHTML = html.map(s => `<div>${s}</div>`).join("");
  });

  // Sync guesses for this player
  db.ref(`rooms/${roomCode}/players/${playerId}/guesses`)
    .on("value", snap => {
      guesses = snap.val() || [];
      renderGrid();
    });
}

function renderGrid() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";
  guesses.forEach(word => {
    [...word].forEach((ch, i) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      if (ch === targetWord[i]) tile.classList.add("correct");
      else if (targetWord.includes(ch)) tile.classList.add("present");
      else tile.classList.add("absent");
      tile.innerText = ch;
      board.appendChild(tile);
    });
  });
}
