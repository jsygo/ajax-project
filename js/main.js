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

var drawnCards = null;

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

function dealCards(player, numOfCards) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://deckofcardsapi.com/api/deck/' + data.currentDeckId + '/draw/?count=' + numOfCards);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    drawnCards = xhr.response;

    for (var i = 0; i < drawnCards.cards.length; i++) {
      player.hand.push(drawnCards.cards[i]);
    }

    if (data.dealer.hand.length === 0) {
      dealCards(data.dealer, 2);
    }

    renderCards();
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
  if (data.dealer.hand.length === 0) {
    return;
  }

  for (var dealerHandIndex = 0; dealerHandIndex < data.dealer.hand.length; dealerHandIndex++) {
    $dealerHand.append(buildCardDOMTree(data.dealer.hand[dealerHandIndex].image));
  }
  for (var playerHandIndex = 0; playerHandIndex < data.currentPlayer.hand.length; playerHandIndex++) {
    $playerHand.append(buildCardDOMTree(data.currentPlayer.hand[playerHandIndex].image));
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
  dealCards(data.currentPlayer, 2);
}

// event listeners

$startGameBtn.addEventListener('click', startGame);

$dealCardsBtn.addEventListener('click', dealCardsBtnClick);
