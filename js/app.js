// game variables and functions
// It could be an object, but there won't be more than 1 game...
// Or it's still a good idea?

var game = {
  maxCol: 4,
  maxRow: 5,
  tileHeight: 83,
  tileWidth: 101,
  enemyCount: 4,
  // stores if the game is started or note
  started: false,
  // handles inputs for selecting number of players
  handleInput: function(key) {
    // check if it good key
    if (!key) return false;
    // initialize enemies
    for (var i = 0; i < game.enemyCount; i++) {
      allEnemies.push(new Enemy);
    };
    // add the correct number of players and start the game
    switch (key) {
      case 1:
        allPlayers.push(new Player(0));
        game.start();
        break;
      case 2:
        allPlayers.push(new Player(0));
        allPlayers.push(new Player(1));
        game.start();
        break;
    }
  },
  // listens for keys 1 and 2
  eventListener: function(e) {
    var allowedKeys = {
      49: 1,
      50: 2
    };
    game.handleInput(allowedKeys[e.keyCode]);
  },
  // starts the game
  start: function() {
    document.removeEventListener('keyup', game.eventListener);
    game.started = true;
    document.getElementById('controls')
      .innerHTML = '';
  }
}

// Enemies our player must avoid
var Enemy = function() {
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started

  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';
  this.width = 101;
  this.height = 171;
  this.init();
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  for (var i = 0; i < allPlayers.length; i++) {
    this.checkCollision(allPlayers[i]);
  };
  this.x += this.speed * dt;
  if (this.x > ctx.canvas.width) {
    this.init();
  }
}

// Check if this enemy hits the player
Enemy.prototype.checkCollision = function(player) {
  if (player.x > (this.x - player.width + 50) && player.x < (this.x + this.width - 30) &&
    player.row === this.row) {
    player.lives--;
    player.refreshPoints();
    player.goToStart();
  }
}

// set start position, row and speed of enemy
Enemy.prototype.init = function() {
  this.randomStart();
  this.randomRow();
  this.randomSpeed();
}

// set speed to 100-300
Enemy.prototype.randomSpeed = function() {
  this.speed = Math.floor(Math.random() * 5 + 1) * 50 + 50;
}

// set row to 1-3
Enemy.prototype.randomRow = function() {
  this.row = Math.floor(Math.random() * 3 + 1);
  this.y = this.row * game.tileHeight - 23;
}

// set start position
Enemy.prototype.randomStart = function() {
  this.x = 0 - (Math.floor(Math.random() * 5 + 1)) * this.width;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

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
}

// top bar handler
Player.prototype.refreshPoints = function() {
  // clear the top bar
  ctx.clearRect(0, this.canvasTop, ctx.canvas.width, 50);

  // check if he/she still lives
  if (this.lives <= 0) {
    ctx.font = '30px Impact';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER!', 185, 30 + this.canvasTop);
  }

  // show the lives and score if it's started
  if (game.started) {
    ctx.font = '30px Impact';
    ctx.fillStyle = 'black';
    ctx.fillText('Lives: ' + this.lives, 400, 30 + this.canvasTop);
    ctx.fillText('Score: ' + this.score, 10, 30 + this.canvasTop);
  }
}

// refresh the score board
Player.prototype.update = function(dt) {
  this.refreshPoints();
}

// check if player reached the river
Player.prototype.checkRiver = function() {
  if (this.row === 0) {
    this.score++;
    this.goToStart();
  }
}

// Invoked on collisions and when they catch the river
Player.prototype.goToStart = function() {
  // at the start of the game, put player to one col left, otherwise to the same col
  var putToDifferentCol = (this.score > 0 ? 0 : this.id);
  this.col = 2 + putToDifferentCol;
  this.row = 5;
  // check 0 lives
  if (this.lives === 0) {
    // noone can move without life!
    this.canMove = false;
  }
  // check game end
  var gameEnd = true;
  allPlayers.forEach(function(player) {
    if (player.lives > 0) gameEnd = false;
  });
  if (gameEnd && allPlayers.length > 1) {
    // that's the end
    if (allPlayers[0].score > allPlayers[1].score) {
      var winner = 'Player 1 won!!';
    } else if (allPlayers[0].score < allPlayers[1].score) {
      var winner = 'Player 2 won!!';
    } else {
      var winner = "It's a tie!!";
    }
    // Write out the winner
    document.getElementById('controls')
      .innerHTML = winner;
  }
}

// calculate x/y from col/row
Player.prototype.xFromCol = function(col) {
  return (col * game.tileWidth);
}

Player.prototype.yFromRow = function(row) {
  return (row * game.tileHeight) - 23;
}

// Render player object
Player.prototype.render = function() {
  this.x = this.xFromCol(this.col);
  this.y = this.yFromRow(this.row);
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Move the players
Player.prototype.handleInput = function(key) {
  if (!key) return false;
  if (this.canMove) {
    switch (key) {
      case 'up':
        if (this.row > 0) this.row--;
        this.checkRiver();
        break;
      case 'down':
        if (this.row < game.maxRow) this.row++;
        break;
      case 'left':
        if (this.col > 0) this.col--;
        break;
      case 'right':
        if (this.col < game.maxCol) this.col++;
        break;
    }
  }
};

// Listen for controls
Player.prototype.eventListener = function(e) {
  if (this.id > 0) {
    // WSAD for player 2
    var allowedKeys = {
      65: 'left',
      87: 'up',
      68: 'right',
      83: 'down'
    };
  } else {
    // arrows for player 1
    var allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };
  }
  this.handleInput(allowedKeys[e.keyCode]);
}

// Now instantiate your objects.
// allPlayers introduced so we can have multiple players :)
var allEnemies = [],
  allPlayers = [];


// event listener for game settings
document.addEventListener('keyup', game.eventListener);
