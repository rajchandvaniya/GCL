// @ts-nocheck
var roundScore,
  activePlayer,
  players,
  roundNumber = null;
var diceSound = new Audio("img/dice-sound.mp3");

init(false);

// rolling two dice
document.querySelector("#roll-dice-btn").addEventListener("click", function () {
  document.querySelector("#sum").textContent = "-";
  document
    .querySelectorAll(".dice")
    .forEach((elem) => (elem.style.display = "block"));
  diceSound.play();
  // document.getElementById("next-btn").disabled = true;
  (function rollDiceAnimation(i) {
    setTimeout(() => {
      // showing animation
      let [dice1, dice2] = rollDice(2);
      document.getElementById("dice1").src = "img/dice-" + dice1 + ".png";
      document.getElementById("dice2").src = "img/dice-" + dice2 + ".png";
      if (i > 1) rollDiceAnimation(--i);
      else {
        // finalize the dice values
        document.getElementById("dice1").src = "img/dice-" + dice1 + ".png";
        document.getElementById("dice2").src = "img/dice-" + dice2 + ".png";

        roundScore = dice1 + dice2;
        document.querySelector("#sum").textContent = roundScore;

        setTimeout(() => {
          save();
        }, 1000);
      }
    }, 100);
  })(10);
});

// document.querySelector("#next-btn").addEventListener("click", function () {
//   players[activePlayer]["score"] += roundScore;

//   document.querySelector("#score-" + activePlayer).textContent =
//     players[activePlayer]["score"];
//   nextPlayer();
//   document.getElementById("roll-dice-btn").disabled = false;
// });

// document.querySelector("#reset-btn").addEventListener("click", reset());

function save() {
  // updating current player's scores
  players[activePlayer]["score"] += roundScore;
  const currentRoundScore = players[activePlayer].score;
  const sumLastRoundScores = players[activePlayer].roundScoreHistory.reduce(
    (accumulator, currentValue) => {
      return accumulator + currentValue;
    },
    0
  );
  players[activePlayer].roundScoreHistory.push(
    currentRoundScore - sumLastRoundScores
  );

  document.querySelector("#score-" + activePlayer).textContent =
    players[activePlayer]["score"];
  document
    .querySelector(".player-" + activePlayer + "-panel")
    .classList.add("round-complete");
  nextPlayer();
  document.getElementById("roll-dice-btn").disabled = false;

  // close modal
  let myModalEl = document.getElementById("diceModal");
  let modal = bootstrap.Modal.getInstance(myModalEl);
  modal.hide();

  storeStateInLocalStorage();
}

function init() {
  loadStateFromLocalStorageOrDefault();
  document
    .querySelectorAll(".dice")
    .forEach((elem) => (elem.style.display = "none"));
  document.getElementById("round").textContent = roundNumber;
  renderPlayerCards();
  document.getElementById("round-history").innerHTML = "";
  grayOutPlayersIfTheyHaveAlreadyPlayed();
  renderRoundHistoryTable();
}

function reset() {
  localStorage.clear();
  init();
}

function nextPlayer() {
  let nextPlayer = (activePlayer + 1) % players.length;
  while (hasPlayerPlayedCurrentRound(nextPlayer)) {
    nextPlayer = (nextPlayer + 1) % players.length;
    if (nextPlayer === activePlayer) {
      // we've checked all players and all have played
      startNewRound();
    }
  }
  if (nextPlayer === activePlayer) {
    // next round scenario
    activePlayer = 0;
  } else {
    activePlayer = nextPlayer;
  }
  roundScore = 0;
  focusActivePlayerCard();
  document.querySelector("#sum").textContent = "-";
  document
    .querySelectorAll(".dice")
    .forEach((elem) => (elem.style.display = "none"));
}

function startNewRound() {
  roundNumber += 1;
  document.getElementById("round").textContent = roundNumber;
  for (let i = 0; i < players.length; i++) {
    document
      .querySelector(".player-" + i + "-panel")
      .classList.remove("round-complete");
  }
  players.sort((a, b) => b.score - a.score);
  renderPlayerCards();
  renderRoundHistoryTable();
}

function updateActivePlayer(updated) {
  activePlayer = updated;
  if (hasPlayerPlayedCurrentRound(activePlayer)) {
    document.getElementById("roll-dice-btn").disabled = true;
  } else {
    document.getElementById("roll-dice-btn").disabled = false;
  }
  focusActivePlayerCard();
}

function rollDice(numOfDice) {
  let values = [];
  for (let i = 0; i < numOfDice; i++) {
    values[i] = Math.floor(Math.random() * 6) + 1;
  }
  return values;
}

function renderPlayerCards() {
  for (var i = 0; i < players.length; i++) {
    document.getElementById("name-" + i).innerHTML =
      i + 1 + ". " + players[i]["name"];
    document.getElementById("score-" + i).textContent = players[i]["score"];
    document.getElementById("logo-" + i).innerHTML =
      "<img src=" + players[i]["logo"] + "/>";
  }
  focusActivePlayerCard();
}

function focusActivePlayerCard() {
  for (let i = 0; i < players.length; i++) {
    document
      .querySelector(".player-" + i + "-panel")
      .classList.remove("active");
  }
  document
    .querySelector(".player-" + activePlayer + "-panel")
    .classList.add("active");
}

function renderRoundHistoryTable() {
  let table = document.getElementById("round-history");
  table.innerHTML = "";
  if (roundNumber > 1) {
    let thead = table.createTHead();
    let headRow = thead.insertRow();
    for (let key of ["Rank", "Name", "Round Scores", "Total Score"]) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      headRow.appendChild(th);
    }
    let tbody = table.createTBody();
    for (let i = 0; i < players.length; i++) {
      let row = tbody.insertRow();
      for (let data of [
        i + 1,
        players[i].name.replaceAll("<br>", ""),
        players[i].roundScoreHistory,
        players[i].score,
      ]) {
        let cell = row.insertCell();
        let text = document.createTextNode(data);
        cell.appendChild(text);
      }
    }
  }
}

function grayOutPlayersIfTheyHaveAlreadyPlayed() {
  for (let i = 0; i < players.length; i++) {
    if (hasPlayerPlayedCurrentRound(i)) {
      document
        .querySelector(".player-" + i + "-panel")
        .classList.add("round-complete");
    } else {
      document
        .querySelector(".player-" + i + "-panel")
        .classList.remove("round-complete");
    }
  }
}

function hasPlayerPlayedCurrentRound(playerNumber) {
  return players[playerNumber].roundScoreHistory[roundNumber - 1] != undefined;
}

function storeStateInLocalStorage() {
  localStorage.setItem("roundScore", roundScore);
  localStorage.setItem("activePlayer", activePlayer);
  localStorage.setItem("players", JSON.stringify(players));
  localStorage.setItem("roundNumber", roundNumber);
}

function loadStateFromLocalStorageOrDefault() {
  roundScore = localStorage.getItem("roundScore");
  activePlayer = localStorage.getItem("activePlayer");
  players = localStorage.getItem("players");
  roundNumber = localStorage.getItem("roundNumber");

  if (roundScore == null) {
    roundScore = 0;
  } else {
    roundScore = parseInt(roundScore);
  }

  if (activePlayer == null) {
    activePlayer = 0;
  } else {
    activePlayer = parseInt(activePlayer);
  }

  if (roundNumber == null) {
    roundNumber = 1;
  } else {
    roundNumber = parseInt(roundNumber);
  }

  if (players == null) {
    players = [
      {
        name: "Saral <br> Strikers",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Saral Strikers.png'",
      },
      {
        name: "Bhoolku <br> Challengers",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Bhoolku Challengers.png'",
      },
      {
        name: "Gunatit <br> Titans",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Gunatit Titans.png'",
      },
      {
        name: "Nimit <br> Knights",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Nimit Knights.png'",
      },
      {
        name: "Ekantik <br> Warriors",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Ekantik Warriors.png'",
      },
      {
        name: "Sevak <br> Super Kings",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Sevak Super Kings.png'",
      },
      {
        name: "Sahjanand <br> Rockers",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Sahajanand Rockers.png'",
      },
      {
        name: "Nishkam <br> Royals",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Nishkam Royals.png'",
      },
      {
        name: "Suhrad <br> Sunrisers",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Suhrad Sunrisers.png'",
      },
      {
        name: "Bhakti <br> Blasters",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Bhakti Blasters.png'",
      },
      {
        name: "Atmiya <br> Avengers",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Atmiya Avengers.png'",
      },
      {
        name: "Swadharmi <br> Lions",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Swadharmi Lions.png'",
      },
      {
        name: "Akshar <br> Army",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Akshar Army.png'",
      },
      {
        name: "Das <br> Daredevils",
        score: 0,
        roundScoreHistory: [],
        logo: "'img/Das Daredevils.png'",
      },
    ];
  } else {
    players = JSON.parse(players);
  }
}
