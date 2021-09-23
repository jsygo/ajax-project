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
}

function stand() {
  getScore(data.currentPlayer);
  getScore(data.dealer);

  if (data.dealer.score < 17) {
    drawCards(7, dealerHit);
  }
}

function dealerHit(response) {
  var i = 0;

  var intervalId = setInterval(function () {

    data.dealer.hand.push(response.cards[i]);

    getScore(data.dealer);

    renderCards();

    if (data.dealer.score > 16) {
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

// event handlers

function startGame(event) {
  var newPlayer = new Player('player 1');
  data.players.push(newPlayer);
  data.currentPlayer = newPlayer;
  getDecks(6);
  $startPage.setAttribute('class', 'start-page center-content hidden');
  $gamePage.setAttribute('class', 'game-page container');
}

function dealCardsBtnClick(event) {
  drawCards(4, dealAtStart);

  $dealCardsBtn.setAttribute('class', 'hidden');
  $hitStandContainer.setAttribute('class', 'hit-stand-container');
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

// event listeners

$startGameBtn.addEventListener('click', startGame);

$dealCardsBtn.addEventListener('click', dealCardsBtnClick);

$hitStandContainer.addEventListener('click', hitStandHandler);
