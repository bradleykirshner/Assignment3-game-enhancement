var myGamePiece;
var myObstacles = [];
var myScore;
var myBackgroud;

var passSound = new Audio("pass-pipe.wav");
var collisionSound = new Audio("collision.wav");

function startGame() {
  myGamePiece = new component(30, 30, "bird.png", 10, 120, "image");
  myScore = new component("30px", "Consolas", "black", 280, 40, "text");
  myBackground = new component(656, 270, "background.png", 0, 0, "image");
  myGameArea.start();
}

var myGameArea = {
  canvas: document.createElement("canvas"),
  isPaused: false,
  start: function () {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
    window.addEventListener("keydown", function (e) {
      if (e.code == "ArrowUp") {
        myGamePiece.speedY = -1;
        myGamePiece.speedX = 0;
      } 
      else if (e.code == "ArrowDown") {
        myGamePiece.speedY = 1;
        myGamePiece.speedX = 0;
      } 
      else if (e.code == "ArrowLeft") {
        myGamePiece.speedY = 0;
        myGamePiece.speedX = -1;
      } 
      else if (e.code == "ArrowRight") {
        myGamePiece.speedY = 0;
        myGamePiece.speedX = 1;
      }
    }),
      window.addEventListener("keyup", function (e) {
        myGameArea.key = false;
      });
    // Add an event listener to the pause button
    document.getElementById("pause").addEventListener("click", function () {
      myGameArea.pauseGame(); // Toggle pause when the button is clicked
    });
    document.getElementById("restart").addEventListener("click", function () {
        myGameArea.restartGame();
    })
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function () {
    clearInterval(this.interval);
  },
  pauseGame: function () {
    if (this.isPaused) {
      this.interval = setInterval(updateGameArea, 20); // Resume the game
      document.getElementById("pause").innerText = "Pause"; // Update button text
      this.isPaused = false;
    } else {
      clearInterval(this.interval); // Pause the game
      document.getElementById("pause").innerText = "Resume"; // Update button text
      this.isPaused = true;
    }
  },
  restartGame: function() {
    this.stop(); // Stop the current game loop
    myObstacles = []; // Clear obstacles
    myGamePiece = new component(30, 30, "bird.png", 10, 120, "image"); // Reset the bird
    myScore = new component("30px", "Consolas", "black", 280, 40, "text"); // Reset the score
    this.frameNo = 0; // Reset the frame number
    this.start(); // Restart the game
  }
};

function component(width, height, color, x, y, type) {
  this.type = type;
  if (type == "image" || type == "background") {
    this.image = new Image();
    this.image.src = color;
  }
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    if (this.type == "text") {
      ctx.font = this.width + " " + this.height;
      ctx.fillStyle = color;
      ctx.fillText(this.text, this.x, this.y);
    } else if (this.type == "image" || this.type == "background") {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;

    // Reset x position when the image has completely scrolled out of view
    if (this.type == "background" && this.x <= -this.width) {
      this.x = 0;
    }
  };
  this.crashWith = function (otherobj) {
    var myleft = this.x;
    var myright = this.x + this.width;
    var mytop = this.y;
    var mybottom = this.y + this.height;
    var otherleft = otherobj.x;
    var otherright = otherobj.x + otherobj.width;
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + otherobj.height;
    var crash = true;
    if (
      mybottom < othertop ||
      mytop > otherbottom ||
      myright < otherleft ||
      myleft > otherright
    ) {
      crash = false;
    }
    return crash;
  };
}

function updateGameArea() {
  var x, height, gap, minHeight, maxHeight, minGap, maxGap;
  for (i = 0; i < myObstacles.length; i += 1) {
    if (myGamePiece.crashWith(myObstacles[i])) {
      collisionSound.play();
      myGameArea.stop();
      return;
    }
  }
  myGameArea.clear();
  myBackground.speedX = -1;
  myBackground.newPos();
  myBackground.update();
  myGameArea.frameNo += 1;

  if (myGameArea.frameNo == 1 || everyinterval(150)) {
    x = myGameArea.canvas.width;
    minHeight = 20;
    maxHeight = 200;
    height = Math.floor(
      Math.random() * (maxHeight - minHeight + 1) + minHeight
    );
    minGap = 50;
    maxGap = 200;
    gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    myObstacles.push(new component(10, height, "pipe-down.png", x, 0, "image"));
    myObstacles.push(
      new component(
        10,
        x - height - gap,
        "pipe-up.png",
        x,
        height + gap,
        "image"
      )
    );
  }

  for (i = 0; i < myObstacles.length; i += 1) {
    myObstacles[i].speedX = -1;
    myObstacles[i].newPos();
    myObstacles[i].update();

    // Check if the bird has passed this obstacle
    if (
      !myObstacles[i].passed &&
      myGamePiece.x > myObstacles[i].x + myObstacles[i].width
    ) {
      passSound.play(); // Play the .wav audio file
      myObstacles[i].passed = true; // Mark this obstacle as passed
    }
  }

  myScore.text = "SCORE: " + myGameArea.frameNo;
  myScore.update();
  key(myGameArea.key);
  myGamePiece.newPos();
  myGamePiece.update();
}

function everyinterval(n) {
  if ((myGameArea.frameNo / n) % 1 == 0) {
    return true;
  }
  return false;
}

function key(e) {
  if (e == "ArrowUp") {
    myGamePiece.speedY = -1;
    myGamePiece.speedX = 0;
  } else if (e == "ArrowDown") {
    myGamePiece.speedY = 1;
    myGamePiece.speedX = 0;
  } else if (e == "ArrowLeft") {
    myGamePiece.speedY = 0;
    myGamePiece.speedX = -1;
  } else if (e == "ArrowRight") {
    myGamePiece.speedY = 0;
    myGamePiece.speedX = 1;
  }
}

function moveup() {
  myGamePiece.speedY = -1;
}

function movedown() {
  myGamePiece.speedY = 1;
}

function moveleft() {
  myGamePiece.speedX = -1;
}

function moveright() {
  myGamePiece.speedX = 1;
}

function clearmove() {
  myGamePiece.speedX = 0;
  myGamePiece.speedY = 0;
}
