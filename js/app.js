'use strict';

/* global ctx, Resources */

/**
 * Game constants, variables and functions
 * @type {Object}
 */
var Game = {
  MAX_COL: 4,
  MAX_ROW: 5,
  TILE_HEIGHT: 83,
  TILE_WIDTH: 101,
  ENEMY_COUNT: 4,
  // stores if the game is started or note
  started: false,
  /**
   * Input handler for selecting the number of players
   * @param  {number} key The number of players
   * @return {bool}     success
   */
  handleInput: function(key) {
    // check if it good key
    if (!key) return false;
    // initialize enemies
    for (var i = 0; i < Game.ENEMY_COUNT; i++) {
      allEnemies.push(new Enemy());
    }
    // add the correct number of players and start the game
    switch (key) {
      case 1:
        allPlayers.push(new Player(0));
        Game.start();
        break;
      case 2:
        allPlayers.push(new Player(0));
        allPlayers.push(new Player(1));
        Game.start();
        break;
    }
    return true;
  },
  /**
   * Listen for inputs (for selecting the number of players)
   * @param  {event} e Event that happened
   * @return {bool}   success
   */
  eventListener: function(e) {
    var allowedKeys = {
      49: 1,
      50: 2
    };
    Game.handleInput(allowedKeys[e.keyCode]);
    return true;
  },
  /**
   * Start the game
   * @return {bool} success
   */
  start: function() {
    document.removeEventListener('keyup', Game.eventListener);
    Game.started = true;
    document.getElementById('controls')
      .innerHTML = '';
    return true;
  }
};

/**
 * Enemy objects
 * @constructor
 */
var Enemy = function() {
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started

  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';
  this.width = 101;
  this.height = 171;
  this.init();
};

/**
 * Update the Enemy object
 * @param  {number} dt Delta of time and last time
 * @return {bool}    success
 */
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  for (var i = 0, len = allPlayers.length; i < len; i++) {
    this.checkCollision(allPlayers[i]);
  }
  this.x += this.speed * dt;
  if (this.x > ctx.canvas.width) {
    this.init();
  }
  return true;
};

/**
 * Checks enemy-player collision
 * @param  {Player} player Checking against this Player objects
 * @return {bool}   success
 */
Enemy.prototype.checkCollision = function(player) {
  // Makes the game a little easier (harder to collide)
  var threshold = 25;
  if (player.x > (this.x - player.width + threshold * 2) && player.x < (this.x +
      this.width - threshold) &&
    player.row === this.row) {
    player.lives--;
    player.refreshPoints();
    player.goToStart();
    return true;
  }
  return false;
};

/**
 * Initialize the Enemy objects
 * @return {bool} success
 */
Enemy.prototype.init = function() {
  this.randomStart();
  this.randomRow();
  this.randomSpeed();
  return true;
};

/**
 * Set random speed to the Enemy
 * @return {bool} success
 */
Enemy.prototype.randomSpeed = function() {
  this.speed = Math.floor(Math.random() * 5 + 1) * 50 + 50;
  return true;
};

/**
 * Set random row to the Enemy
 * @return {bool} success
 */
Enemy.prototype.randomRow = function() {
  this.row = Math.floor(Math.random() * 3 + 1);
  this.y = this.row * Game.TILE_HEIGHT - 23;
  return true;
};

/**
 * Set random start position to the Enemy
 * @return {bool} success
 */
Enemy.prototype.randomStart = function() {
  this.x = 0 - (Math.floor(Math.random() * 5 + 1)) * this.width;
  return true;
};

/**
 * Render the Enemy
 * @return {bool} success
 */
Enemy.prototype.render = function() {
  return ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

/**
 * Represents a player
 * @constructor
 * @param {number} id id of the player
 */
var Player = function(id) {
  this.id = id;
  if (this.id > 0) {
    this.sprite = 'images/char-boy.png';
  } else {
    this.sprite = 'images/char-cat-girl.png';
  }
  // I had a lot of trouble with this line, got solution from here:
  // http://stackoverflow.com/questions/11364163/how-can-i-add-a-prototype-function-to-an-event-listener-in-the-initialization-fu
  document.addEventListener('keyup', this.eventListener.bind(this));
  // set starting col/row
  this.goToStart();
  this.width = 101;
  this.height = 171;
  this.lives = 5;
  this.score = 0;
  this.canMove = true;
  this.canvasTop = this.id * 605;
};

/**
 * Refresh the lives and scores of the player
 * @return {bool} success
 */
Player.prototype.refreshPoints = function() {
  // clear the top bar
  ctx.clearRect(0, this.canvasTop, ctx.canvas.width, 50);

  // check if he/she still lives
  if (this.lives <= 0) {
    ctx.font = '30px Impact';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER!', 185, 30 + this.canvasTop);
    return true;
  }
  // show the lives and score if it's started
  if (Game.started) {
    ctx.font = '30px Impact';
    ctx.fillStyle = 'black';
    ctx.fillText('Lives: ' + this.lives, 400, 30 + this.canvasTop);
    ctx.fillText('Score: ' + this.score, 10, 30 + this.canvasTop);
    return true;
  }
  return false;
};

/**
 * Update the player
 * @return {bool} success
 */
Player.prototype.update = function() {
  return this.refreshPoints();
};

/**
 * Check if the player reached the river
 * @return {bool} success
 */
Player.prototype.checkRiver = function() {
  if (this.row === 0) {
    this.score++;
    this.goToStart();
    return true;
  }
  return false;
};

/**
 * Check if he has a life
 * @return {bool} success
 */
Player.prototype.checkZeroLife = function() {
  if (this.lives === 0) {
    // noone can move without life!
    this.canMove = false;
    return true;
  }
  return false;
};

/**
 * Check if the game is ended (noone lives)
 * @return {bool} success
 */
Player.prototype.checkGameEnd = function() {
  var gameEnd = true;
  allPlayers.forEach(function(player) {
    if (player.lives > 0) gameEnd = false;
  });
  if (gameEnd && allPlayers.length > 1) {
    // that's the end
    var winner;
    if (allPlayers[0].score > allPlayers[1].score) {
      winner = 'Player 1 won!!';
    } else if (allPlayers[0].score < allPlayers[1].score) {
      winner = 'Player 2 won!!';
    } else {
      winner = 'It\'s a tie!!';
    }
    // Write out the winner
    document.getElementById('controls')
      .innerHTML = winner;
    return true;
  }
  return false;
};

/**
 * Put the player to the starting position
 * @return {bool} success
 */
Player.prototype.goToStart = function() {
  // at the start of the game, put player to one col left, otherwise to the same col
  var putToDifferentCol = (this.score > 0 ? 0 : this.id);
  this.col = 2 + putToDifferentCol;
  this.row = 5;

  this.checkZeroLife();
  this.checkGameEnd();

};

/**
 * Calculate x from column
 * @param  {number} col The column where the player is
 * @return {number}     The x calculated from the column
 */
Player.prototype.xFromCol = function(col) {
  return (col * Game.TILE_WIDTH);
};

/**
 * Calculate y from row
 * @param  {number} row The row where the player is
 * @return {number}     The y calculated from the row
 */
Player.prototype.yFromRow = function(row) {
  return (row * Game.TILE_HEIGHT) - 23;
};

/**
 * Render player
 * @return {bool} success
 */
Player.prototype.render = function() {
  this.x = this.xFromCol(this.col);
  this.y = this.yFromRow(this.row);
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  return true;
};

/**
 * Handle player inputs
 * @param  {string} key The key what the user pressed (not the keycode!)
 * @return {bool}     success
 */
Player.prototype.handleInput = function(key) {
  if (!key) return false;
  if (this.canMove) {
    switch (key) {
      case 'up':
        if (this.row > 0) this.row--;
        this.checkRiver();
        break;
      case 'down':
        if (this.row < Game.MAX_ROW) this.row++;
        break;
      case 'left':
        if (this.col > 0) this.col--;
        break;
      case 'right':
        if (this.col < Game.MAX_COL) this.col++;
        break;
    }
    return true;
  }
  return false;
};

/**
 * Listen for user inputs
 * @param  {event} e The event that happened
 * @return {bool}   success
 */
Player.prototype.eventListener = function(e) {
  var allowedKeys;
  if (this.id > 0) {
    // WSAD for player 2
    allowedKeys = {
      65: 'left',
      87: 'up',
      68: 'right',
      83: 'down'
    };
  } else {
    // arrows for player 1
    allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };
  }
  this.handleInput(allowedKeys[e.keyCode]);
  return true;
};

// Now instantiate your objects.
// allPlayers introduced so we can have multiple players :)

/**
 * Array with every enemy
 * @type {Array}
 */
var allEnemies = []

/**
 * Array with every player
 * @type {Array}
 */
var allPlayers = [];


// event listener for game settings
document.addEventListener('keyup', Game.eventListener);
