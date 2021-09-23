/* global data */
/* exported data */

// DOM elements

var $startPage = document.querySelector('.start-page');
var $gamePage = document.querySelector('.game-page');

var $startGameBtn = document.querySelector('.start-game-btn');

var $dealCardsBtn = document.querySelector('.deal-cards-btn');

var $playerHand = document.querySelector('.player-hand');

var $dealerHand = document.querySelector('.dealer-hand');

// global variables

var xhr;

// XHR

function getDecks(numOfDecks) {
  xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=' + numOfDecks);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    data.currentDeckId = xhr.response.deck_id;
  });

  xhr.send();
}

function drawCards(numOfCards, loadCallback) {
  xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://deckofcardsapi.com/api/deck/' + data.currentDeckId + '/draw/?count=' + numOfCards);
  xhr.responseType = 'json';
  xhr.addEventListener('load', loadCallback);
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
}

function removeAllChildren(node, nodeList) {
  for (var i = 0; i < nodeList.length; i++) {
    node.removeChild(nodeList[i]);
  }
}

// function dealCards(player, cardsArray) {
//   player.hand = cardsArray;
// }

function dealAtStart() {
  var playersCards = xhr.response.cards.slice(0, 2);
  var dealersCards = xhr.response.cards.slice(2, 4);

  data.currentPlayer.hand = playersCards;
  data.dealer.hand = dealersCards;

  renderCards();
}

// function hit() {
//   dealCards();
// }

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
}

// event listeners

$startGameBtn.addEventListener('click', startGame);

$dealCardsBtn.addEventListener('click', dealCardsBtnClick);
