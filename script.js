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

let playerId, playerName, roomCode, targetWord, guesses = [];

// On-screen keyboard letters
const KEYS = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");

function createRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  playerId = Date.now().toString(36);
  roomCode = Math.random().toString(36).substr(2,5).toUpperCase();
  targetWord = getRandomWord();

  db.ref(`rooms/${roomCode}`).set({
    targetWord,
    status: "started",
    players: { [playerId]: { name: playerName, guesses: [], status: "active" } }
  });

  startGame();
}

function joinRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  playerId = Date.now().toString(36);
  const code = document.getElementById("roomCodeInput").value.trim().toUpperCase();
  if (!code) return alert("Enter a room code");
  roomCode = code;

  db.ref(`rooms/${roomCode}/targetWord`).once("value", snap => {
    if (!snap.exists()) return alert("Room not found");
    targetWord = snap.val();
    db.ref(`rooms/${roomCode}/players/${playerId}`)
      .set({ name: playerName, guesses: [], status: "active" });
    startGame();
  });
}

function startGame() {
  document.getElementById("lobby").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("roomCodeDisplay").innerText = roomCode;
  buildKeyboard();
  listenPlayers();
  listenGuesses();
}

// Track players list
function listenPlayers() {
  db.ref(`rooms/${roomCode}/players`).on("value", snap => {
    const html = [];
    snap.forEach(child => {
      html.push(`${child.val().name}: ${child.val().status}`);
    });
    document.getElementById("playersList").innerHTML = html.join("<br>");
  });
}

// Track your guesses
function listenGuesses() {
  db.ref(`rooms/${roomCode}/players/${playerId}/guesses`)
    .on("value", snap => {
      guesses = snap.val() || [];
      renderBoard();
    });
}

// Submit guess via input or keyboard
function submitGuess() {
  const val = document.getElementById("guessInput").value.toUpperCase();
  if (val.length !== 5) return alert("Enter 5 letters");
  saveGuess(val);
}

// Save guess to Firebase
function saveGuess(word) {
  guesses.push(word);
  db.ref(`rooms/${roomCode}/players/${playerId}/guesses`)
    .set(guesses);
  if (word === targetWord) {
    db.ref(`rooms/${roomCode}/players/${playerId}/status`).set("won");
    document.getElementById("status").innerText = "🎉 You won!";
  }
}

// Draw grid
function renderBoard() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  guesses.forEach(word => {
    [...word].forEach((ch, i) => {
      const div = document.createElement("div");
      div.classList.add("tile");
      div.textContent = ch;
      if (ch === targetWord[i]) div.classList.add("correct");
      else if (targetWord.includes(ch)) div.classList.add("present");
      else div.classList.add("absent");
      grid.appendChild(div);
    });
  });
}

// Build mobile keyboard
function buildKeyboard() {
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  KEYS.forEach(key => {
    const btn = document.createElement("div");
    btn.className = "key";
    btn.textContent = key;
    btn.onclick = () => {
      const inp = document.getElementById("guessInput");
      if (inp.value.length < 5) inp.value += key;
    };
    kb.appendChild(btn);
  });
}

// Random word
function getRandomWord() {
  const list = ["CRANE","SLATE","BRAVE","GHOST","LIGHT","STONE","PLANT"];
  return list[Math.floor(Math.random() * list.length)];
}


