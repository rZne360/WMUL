// Your Firebase config
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

let roomCode = "";
let solutionWord = "TREND"; // can be made dynamic later

function joinRoom() {
  roomCode = document.getElementById("roomCodeInput").value.toUpperCase();
  if (!roomCode) return alert("Enter a room code");

  document.getElementById("roomDisplay").innerText = roomCode;
  document.querySelector(".room-setup").classList.add("hidden");
  document.getElementById("gameArea").classList.remove("hidden");

  listenForGuesses();
}

function submitGuess() {
  const input = document.getElementById("guessInput");
  const guess = input.value.trim().toUpperCase();

  if (guess.length !== 5) {
    alert("Please enter a 5-letter word.");
    return;
  }

  const guessRef = db.ref(`game/${roomCode}/guesses`);
  guessRef.push(guess);
  input.value = "";
}

function listenForGuesses() {
  const guessRef = db.ref(`game/${roomCode}/guesses`);
  guessRef.on("child_added", (data) => {
    const guess = data.val();
    displayGuess(guess);
    if (guess === solutionWord) {
      document.getElementById("messages").innerText = `🎉 Someone guessed it! The word was ${solutionWord}`;
    }
  });
}

function displayGuess(word) {
  const board = document.getElementById("board");
  const div = document.createElement("div");
  div.textContent = word;
  board.appendChild(div);
}

