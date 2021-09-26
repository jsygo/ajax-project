/* global data */
/* exported data */

// DOM elements

var $startPage = document.querySelector('.start-page');
var $gamePage = document.querySelector('.game-page');

var $startGameBtn = document.querySelector('.start-game-btn');
var $dealCardsBtn = document.querySelector('.deal-cards-btn');
var $hitStandContainer = document.querySelector('.hit-stand-container');

var $playerHand = document.querySelector('.player-hand');
var $dealerHand = document.querySelector('.dealer-hand');

var $fullModal = document.querySelector('.modal-overlay');
var $modalPlayerScore = document.querySelector('.player-score span');
var $modalDealerScore = document.querySelector('.dealer-score span');
var $modalGameOutcome = document.querySelector('.game-outcome');
var $playAgainBtn = document.querySelector('.play-again-btn');

var $betForm = document.querySelector('.bet-input-form');
var $betInput = document.querySelector('.bet-input');
var $betAmount = document.querySelector('#bet-amount');

var $balance = document.querySelector('.balance span');
var $currentBet = document.querySelector('.current-bet span');

// global variables

// XHR

function getDecks(numOfDecks) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=' + numOfDecks);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    data.currentDeckId = xhr.response.deck_id;
  });

  xhr.send();
}

function drawCards(numOfCards, loadCallback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://deckofcardsapi.com/api/deck/' + data.currentDeckId + '/draw/?count=' + numOfCards);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    loadCallback(xhr.response);
  });
  xhr.send();
}

// constructor functions

function Player(name) {
  this.name = name;
  this.hand = [];
  this.score = 0;
  this.balance = 1000;
  this.pastHands = [];
}

function PastHand(playerHand, dealerHand, bet) {
  this.playerHand = playerHand;
  this.dealerHand = dealerHand;
  this.bet = bet;
}

// DOM tree creation

function buildCardDOMTree(cardImg) {

  // <div class="card-container">
  //   <img src="images/king-of-spades.png" class="card-img">
  // </div>

  var $cardContainer = document.createElement('div');
  $cardContainer.setAttribute('class', 'card-container');

  var $card = document.createElement('img');
  $card.setAttribute('src', cardImg);
  $card.setAttribute('class', 'card-img');

  $cardContainer.append($card);

  return $cardContainer;
}

// functions

function renderCards() {
  var $dealerHandNodeList = document.querySelectorAll('.dealer-hand > div');
  var $playerHandNodeList = document.querySelectorAll('.player-hand > div');

  removeAllChildren($dealerHand, $dealerHandNodeList);
  removeAllChildren($playerHand, $playerHandNodeList);

  for (var dealerHandIndex = 0; dealerHandIndex < data.dealer.hand.length; dealerHandIndex++) {
    $dealerHand.append(buildCardDOMTree(data.dealer.hand[dealerHandIndex].image));
  }
  for (var playerHandIndex = 0; playerHandIndex < data.currentPlayer.hand.length; playerHandIndex++) {
    $playerHand.append(buildCardDOMTree(data.currentPlayer.hand[playerHandIndex].image));
  }

  if (data.whosTurn === 'player') {
    $dealerHandNodeList = document.querySelectorAll('.dealer-hand > div');
    $dealerHandNodeList[1].firstChild.setAttribute('src', 'images/cropped-back-of-playing-card-2.png');
  }
}

function removeAllChildren(node, nodeList) {
  for (var i = 0; i < nodeList.length; i++) {
    node.removeChild(nodeList[i]);
  }
}

function dealAtStart(response) {
  var playersCards = response.cards.slice(0, 2);
  var dealersCards = response.cards.slice(2, 4);

  data.currentPlayer.hand = playersCards;
  data.dealer.hand = dealersCards;

  renderCards();
}

function playerHit(response) {
  data.currentPlayer.hand.push(response.cards[0]);

  renderCards();

  getScore(data.currentPlayer);

  if (data.currentPlayer.score >= 21) {
    data.whosTurn = 'dealer';
    renderCards();
    setTimeout(stand, 1000);
  }
}

function stand() {
  getScore(data.currentPlayer);
  getScore(data.dealer);

  if (data.dealer.score < 17) {
    drawCards(7, dealerHit);
  } else {
    setTimeout(function () {
      getWinner();
      handleBets();
      endOfGameModal();
    }, 1000);
  }
}

function dealerHit(response) {
  var i = 0;

  var intervalId = setInterval(function () {

    data.dealer.hand.push(response.cards[i]);

    getScore(data.dealer);

    renderCards();

    if (data.dealer.score > 16) {
      setTimeout(function () {
        getWinner();
        handleBets();
        endOfGameModal();
      }, 1000);

      clearInterval(intervalId);
    }

    i++;
  }, 1000);

  getScore(data.dealer);
}

function getScore(player) {
  player.score = 0;
  var acesArr = [];

  for (var i = 0; i < player.hand.length; i++) {
    if (parseInt(player.hand[i].value)) {
      player.score += parseInt(player.hand[i].value);
    } else if (player.hand[i].value !== 'ACE') {
      player.score += 10;
    } else {
      acesArr.push(player.hand[i]);
    }
  }

  for (var j = 0; j < acesArr.length; j++) {
    if ((player.score + 11) <= 21) {
      player.score += 11;
    } else {
      player.score += 1;
    }
  }
}

function getWinner() {
  if ((data.currentPlayer.score > 21) && (data.dealer.score > 21)) {
    data.winner = null;
  } else if (((data.currentPlayer.score > data.dealer.score) && (data.currentPlayer.score <= 21)) ||
  ((data.currentPlayer.score < data.dealer.score) && (data.dealer.score > 21))) {
    data.winner = data.currentPlayer;
  } else if (((data.currentPlayer.score < data.dealer.score) && (data.dealer.score <= 21)) ||
  ((data.currentPlayer.score > data.dealer.score) && (data.currentPlayer.score > 21))) {
    data.winner = data.dealer;
  }
}

function endOfGameModal() {
  $fullModal.setAttribute('class', 'modal-overlay center-content');

  $modalPlayerScore.textContent = data.currentPlayer.score;
  if (data.currentPlayer.score === 21) {
    $modalPlayerScore.setAttribute('class', 'green-text');
  } else if (data.currentPlayer.score > 21) {
    $modalPlayerScore.setAttribute('class', 'red-text');
  } else {
    $modalPlayerScore.setAttribute('class', 'black-text');
  }

  $modalDealerScore.textContent = data.dealer.score;
  if (data.dealer.score === 21) {
    $modalDealerScore.setAttribute('class', 'green-text');
  } else if (data.dealer.score > 21) {
    $modalDealerScore.setAttribute('class', 'red-text');
  } else {
    $modalDealerScore.setAttribute('class', 'black-text');
  }

  if (data.winner === data.currentPlayer) {
    $modalGameOutcome.textContent = 'You Win!';
    $modalGameOutcome.setAttribute('class', 'game-outcome green-text');
  } else if (data.winner === data.dealer) {
    $modalGameOutcome.textContent = 'Dealer Wins';
    $modalGameOutcome.setAttribute('class', 'game-outcome red-text');
  } else {
    $modalGameOutcome.textContent = 'It\'s a Tie';
  }
}

function handleBets() {
  if ((data.winner === data.currentPlayer) && (data.currentPlayer.score === 21)) {
    data.currentPlayer.balance += (data.currentBet * 2.5);
  } else if (data.winner === data.currentPlayer) {
    data.currentPlayer.balance += (data.currentBet * 2);
  } else if (data.winner === null) {
    data.currentPlayer.balance += data.currentBet;
  }

  $balance.textContent = data.currentPlayer.balance;
}

// event handlers

function startGame(event) {
  var newPlayer = new Player('player 1');
  data.players.push(newPlayer);
  data.currentPlayer = newPlayer;
  getDecks(6);
  $startPage.setAttribute('class', 'start-page center-content hidden');
  $gamePage.setAttribute('class', 'game-page container');
  $betForm.elements.amount.value = 100;
}

function dealCardsBtnClick(event) {
  drawCards(4, dealAtStart);

  $dealCardsBtn.setAttribute('class', 'deal-cards-btn hidden');
  $betInput.setAttribute('class', 'bet-input center-content align-content-around hidden');
  $hitStandContainer.setAttribute('class', 'hit-stand-container');

  data.currentPlayer.balance -= data.currentBet;

  $balance.textContent = data.currentPlayer.balance;
  $currentBet.textContent = data.currentBet;
}

function hitStandHandler(event) {
  if (event.target.matches('.hit-btn')) {
    drawCards(1, playerHit);
  }

  if (event.target.matches('.stand-btn')) {
    data.whosTurn = 'dealer';
    renderCards();
    stand();
  }
}

function incrementDecrementBet(event) {
  if (((event.target.matches('.increment-bet')) || (event.target.matches('.fa-plus'))) && ((data.currentBet + 100) <= data.currentPlayer.balance)) {
    data.currentBet += 100;
  }
  if (((event.target.matches('.decrement-bet')) || (event.target.matches('.fa-minus'))) && ((data.currentBet - 100) >= 0)) {
    data.currentBet -= 100;
  }
  $betForm.elements.amount.value = data.currentBet;
}

function betAmountInput(event) {
  data.currentBet = parseInt($betForm.elements.amount.value);
}

function playAgain(event) {
  var lastHand = new PastHand(data.currentPlayer.hand, data.dealer.hand, data.currentBet);
  data.currentPlayer.pastHands.push(lastHand);

  data.currentBet = 100;
  $currentBet.textContent = data.currentBet;
  $betForm.elements.amount.value = data.currentBet;

  data.currentPlayer.hand = [];
  data.dealer.hand = [];
  renderCards();

  $fullModal.setAttribute('class', 'modal-overlay center-content hidden');

  $dealCardsBtn.setAttribute('class', 'deal-cards-btn');
  $betInput.setAttribute('class', 'bet-input center-content align-content-around');

  $hitStandContainer.setAttribute('class', 'hit-stand-container hidden');

  data.whosTurn = 'player';
  data.winner = null;
}

// event listeners

$startGameBtn.addEventListener('click', startGame);

$dealCardsBtn.addEventListener('click', dealCardsBtnClick);

$hitStandContainer.addEventListener('click', hitStandHandler);

$betForm.addEventListener('submit', function () {
  event.preventDefault();
});

$betForm.addEventListener('click', incrementDecrementBet);

$playAgainBtn.addEventListener('click', playAgain);

$betAmount.addEventListener('input', betAmountInput);
