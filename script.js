
// Paste your Firebase config below before using
const firebaseConfig = {
  apiKey: "AIzaSyD_TBfmoZaYVGTQtblDMsUsNi_odpQKfQ4",
  authDomain: "woodle-3eaa5.firebaseapp.com",
  databaseURL: "https://woodle-3eaa5-default-rtdb.firebaseio.com",
  projectId: "woodle-3eaa5",
  storageBucket: "woodle-3eaa5.appspot.com",
  messagingSenderId: "1058533729670",
  appId: "1:1058533729670:web:d3275a6d307f97313ff807",
  measurementId: "G-Z15B7QPMYV"
};
,
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let username = "", room = "", correctWord = "";
let allowedWords = [];

fetch('words.json')
  .then(response => response.json())
  .then(data => allowedWords = data);

function joinRoom() {
  username = document.getElementById('username').value.trim();
  room = document.getElementById('room').value.trim();
  if (!username || !room) return alert("Enter username and room name!");
  document.getElementById('game').style.display = 'block';
  setupRoom();
}

function setupRoom() {
  const today = new Date().toISOString().slice(0, 10);
  db.ref('rooms/' + room + '/wordDate').once('value', snap => {
    if (snap.val() !== today) {
      const word = allowedWords[Math.floor(Math.random() * allowedWords.length)];
      db.ref('rooms/' + room).set({ word: word, wordDate: today, guesses: [] });
    }
  });
  db.ref('rooms/' + room + '/guesses').on('value', snapshot => {
    const guesses = snapshot.val() || [];
    displayGuesses(guesses);
  });
}

function submitGuess() {
  const input = document.getElementById('guessInput');
  const guess = input.value.trim().toLowerCase();
  if (guess.length !== 5 || !allowedWords.includes(guess)) {
    alert("Invalid guess!");
    return;
  }
  db.ref('rooms/' + room + '/guesses').once('value', snap => {
    const guesses = snap.val() || [];
    db.ref('rooms/' + room + '/guesses').set([...guesses, { user: username, word: guess }]);
  });
  input.value = '';
}

function displayGuesses(guesses) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  db.ref('rooms/' + room + '/word').once('value', snap => {
    const correct = snap.val();
    correctWord = correct;
    guesses.forEach(g => {
      for (let i = 0; i < 5; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerText = g.word[i];
        if (g.word[i] === correct[i]) tile.classList.add('correct');
        else if (correct.includes(g.word[i])) tile.classList.add('present');
        else tile.classList.add('absent');
        board.appendChild(tile);
      }
    });
    const last = guesses[guesses.length - 1];
    if (last && last.word === correct) {
      document.getElementById('message').innerText = last.user + " wins!";
    }
  });
}

function resetRoom() {
  db.ref('rooms/' + room).remove();
  location.reload();
}
