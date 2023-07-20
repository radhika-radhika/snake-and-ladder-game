// Making Connection 
const socket = io.connect("http://localhost:3000");
socket.emit("joined");
//This let all players in the game
let players = [];
// This is the  object for individual players
let currentPlayer; 
let canvas = document.getElementById("canvas");
//adjust the width of the canvas
canvas.width = document.documentElement.clientHeight * 0.9;
//adjust the height of the canvas
canvas.height = document.documentElement.clientHeight * 0.9;
let ctx = canvas.getContext("2d");
//assign images link to const variables 
const redPieceImg = "../images/red_piece.png";
const bluePieceImg = "../images/blue_piece.png";
const yellowPieceImg = "../images/yellow_piece.png";
const greenPieceImg = "../images/green_piece.png";
//set side equals to width by 10
const side = canvas.width / 10;
//set offsetX equals to side by 2
const offsetX = side / 2;
//set offsetY equals to side by 2 and add 20 to it
const offsetY = side / 2 + 20;
const images = [redPieceImg, bluePieceImg, yellowPieceImg, greenPieceImg];
//create a class for ladders
const ladders = [
  [2, 23],
  [4, 68],
  [6, 45],
  [20, 59],
  [30, 96],
  [52, 72],
  [57, 96],
  [71, 92],
];
// create a class for snakes
const snakes = [
  [98, 40],
  [84, 58],
  [87, 49],
  [73, 15],
  [56, 8],
  [50, 5],
  [43, 17],
];
//create a class for players
class Player {
  constructor(id, name, pos, img) {
    this.id = id;
    this.name = name;
    this.pos = pos;
    this.img = img;
  }
  draw() {
    let xPos =
      Math.floor(this.pos / 10) % 2 == 0
        ? (this.pos % 10) * side - 15 + offsetX
        : canvas.width - ((this.pos % 10) * side + offsetX + 15);
    let yPos = canvas.height - (Math.floor(this.pos / 10) * side + offsetY);

    let image = new Image();
    image.src = this.img;
    ctx.drawImage(image, xPos, yPos, 30, 40);
  }
//update the position of the number
  updatePos(num) {
    if (this.pos + num <= 99) {
      this.pos += num;
      this.pos = this.isLadderOrSnake(this.pos + 1) - 1;
    }
  }
  isLadderOrSnake(pos) {
    let newPos = pos;
    for (let i = 0; i < ladders.length; i++) {
      if (ladders[i][0] == pos) {
        newPos = ladders[i][1];
        break;
      }
    }

    for (let i = 0; i < snakes.length; i++) {
      if (snakes[i][0] == pos) {
        newPos = snakes[i][1];
        break;
      }
    }

    return newPos;
  }
}

document.getElementById("start-btn").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  document.getElementById("name").disabled = true;
  document.getElementById("start-btn").hidden = true;
  document.getElementById("roll-button").hidden = false;
  currentPlayer = new Player(players.length, name, 0, images[players.length]);
  document.getElementById(
    "current-player"
  ).innerHTML = `<p>Anyone can roll</p>`;
  socket.emit("join", currentPlayer);
});

document.getElementById("roll-button").addEventListener("click", () => {
  const num = rollDice();
  currentPlayer.updatePos(num);
  socket.emit("rollDice", {
    num: num,
    id: currentPlayer.id,
    pos: currentPlayer.pos,
  });
});
function rollDice() {
  const number = Math.ceil(Math.random() * 6);
  return number;
}
function drawPins() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  players.forEach((player) => {
    player.draw();
  });
}
// Listen for events
socket.on("join", (data) => {
  players.push(new Player(players.length, data.name, data.pos, data.img));
  drawPins();
  document.getElementById(
    "players-table"
  ).innerHTML += `<tr><td>${data.name}</td><td><img src=${data.img} height=50 width=40></td></tr>`;
});

socket.on("joined", (data) => {
  data.forEach((player, index) => {
    players.push(new Player(index, player.name, player.pos, player.img));
    console.log(player);
    document.getElementById(
      "players-table"
    ).innerHTML += `<tr><td>${player.name}</td><td><img src=${player.img}></td></tr>`;
  });
  drawPins();
});
socket.on("rollDice", (data, turn) => {
  players[data.id].updatePos(data.num);
  document.getElementById("dice").src = `./images/dice/dice${data.num}.png`;
  drawPins();
  if (turn != currentPlayer.id) {
    document.getElementById("roll-button").hidden = true;
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>It's ${players[turn].name}'s turn</p>`;
  } else {
    document.getElementById("roll-button").hidden = false;
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>It's your turn</p>`;
  }
  let winner;
  for (let i = 0; i < players.length; i++) {
    if (players[i].pos == 99) {
      winner = players[i];
      break;
    }
  }
  if (winner) {
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>${winner.name} has won!</p>`;
    document.getElementById("roll-button").hidden = true;
    document.getElementById("dice").hidden = true;
    document.getElementById("restart-btn").hidden = false;
  }
});
// Logic to restart the game
document.getElementById("restart-btn").addEventListener("click", () => {
  socket.emit("restart");
});

socket.on("restart", () => {
  window.location.reload();
});
