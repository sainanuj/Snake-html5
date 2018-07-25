class Snake {
    constructor() {
        this.isMoving = false;
        this.elongate = false;
        this.dx = 0;
        this.dy = 0;
        this.STARTSIZE = 7;
        this.STARTX = 200;
        this.STARTY = 200;
        this.BLOCKSIZE = 7;
        this.snakePoints = new Array();
        for (let i = 0; i < this.STARTSIZE; i++) {
            this.snakePoints.push(new Point(this.STARTX - (i*this.BLOCKSIZE), this.STARTY));
        }
    }

    draw(ctx) {
        ctx.fillStyle = "pink";
        for (let i = 0; i < this.snakePoints.length; i++) {
            ctx.fillRect(this.snakePoints[i].getx(), this.snakePoints[i].gety(), this.BLOCKSIZE, this.BLOCKSIZE);
        }
    }

    update() {
        if (this.isMoving) {
            var first = this.snakePoints[0];
            var last = this.snakePoints[this.snakePoints.length-1];
            var newFirst = new Point(first.getx() + (this.dx*this.BLOCKSIZE), first.gety() + (this.dy*this.BLOCKSIZE));
            for (let i = this.snakePoints.length-1; i > 0; i--) {
                this.snakePoints[i].setx(this.snakePoints[i-1].getx());
                this.snakePoints[i].sety(this.snakePoints[i-1].gety());
            }
            this.snakePoints[0] = newFirst;
            
            if (this.elongate) {
                // this.snakePoints.push(last);
                this.snakePoints.push(new Point(last.getx() + (this.dx*this.BLOCKSIZE), last.gety() + (this.dy*this.BLOCKSIZE)))
                this.elongate = false;
            }

            // Move through walls.
            if (this.snakePoints[0].getx() > canvas.width-this.BLOCKSIZE && this.dx == 1) {
                this.snakePoints[0].setx(-this.BLOCKSIZE);
            }
            if (this.snakePoints[0].getx() < 0 && this.dx == -1) {
                this.snakePoints[0].setx(canvas.width);
            }
            if (this.snakePoints[0].gety() > canvas.height-this.BLOCKSIZE && this.dy == 1) {
                this.snakePoints[0].sety(-this.BLOCKSIZE);
            }
            if (this.snakePoints[0].gety() < 0 && this.dy == -1) {
                this.snakePoints[0].sety(canvas.height);
            }

            if (this.suicide()) {
                dead.play();
                dead.loop = true;
                this.isMoving = false;
            }
        }
    }

    // The snake stops moving if it bites itself.
    suicide() {
        var headx = this.snakePoints[0].getx() + (this.BLOCKSIZE / 2);
        var heady = this.snakePoints[0].gety() + (this.BLOCKSIZE / 2);
        for (let i = 1; i < this.snakePoints.length; i++) {
            if (headx > this.snakePoints[i].getx() && headx < this.snakePoints[i].getx() + this.BLOCKSIZE) {
                if (heady > this.snakePoints[i].gety() && heady < this.snakePoints[i].gety() + this.BLOCKSIZE) {
                    return true;
                }
            }
        }
        return false;
    }
}

class Food {
    constructor() {
        this.x = Math.random() * (canvas.width-100) + 70;
        this.y = Math.random() * (canvas.height-100) + 70;
        this.BLOCKSIZE = 10;
    }

    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.BLOCKSIZE, this.BLOCKSIZE);
    }

    update() {
        this.x = Math.random() * (canvas.width-100) + 50;
        this.y = Math.random() * (canvas.height-100) + 50;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setx(input) {
        this.x = input;
    }
    getx() {
        return this.x;
    }
    sety(input) {
        this.y = input;
    }
    gety() {
        return this.y;
    }
}








var dead = new Audio();
var eat = new Audio();
var up = new Audio();
var right = new Audio();
var left = new Audio();
var down = new Audio();
var key_press = new Audio();

dead.src = "sounds/game_over.wav";
eat.src = "sounds/eat.mp3";
up.src = "sounds/up.mp3";
right.src = "sounds/right.mp3";
left.src = "sounds/left.mp3";
down.src = "sounds/down.mp3";
key_press.src = "sounds/keypress.wav";

function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
}

var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var snake = new Snake();
var food = new Food();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.addEventListener("keydown", events, false);

let pause = false;

function events(e) {
    switch (e.keyCode) {
        case 13: // Enter key
            if (!snake.isMoving) {
                stopAudio(dead);
                key_press.play();
                snake.dx = 1;
                snake.dy = 0;
                snake.isMoving = true;
            }
            break;
        case 37: // Left arrow key
            if (snake.isMoving && snake.dx != 1) {
                left.play();
                snake.dx = -1;
                snake.dy = 0;
            }
            break;
        case 38: // Up arrow key
            if (snake.isMoving && snake.dy != 1) {
                up.play();
                snake.dy = -1;
                snake.dx = 0;
            }
            break;
        case 39: // Right arrow key
            if (snake.isMoving && snake.dx != -1) {
                right.play();
                snake.dx = 1;
                snake.dy = 0;
            }
            break;
        case 40: // Down arrow key
            if (snake.isMoving && snake.dy != -1) {
                down.play();
                snake.dy = 1;
                snake.dx = 0;
            }
            break;
        case 32: // Spacebar
            if (snake.isMoving && !pause) {
                key_press.play();
                dead.loop = true;
                snake.isMoving = false;
                pause = true;
            } else if (!snake.isMoving && pause) {
                key_press.play();
                pause = false;
                snake.isMoving = true;
                stopAudio(dead);
            }
    }
}


window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    snake.draw(context);
    food.draw(context);
}

function foodCollision() {
    let headx = snake.snakePoints[0].getx() + (snake.BLOCKSIZE/2);
	let heady = snake.snakePoints[0].gety() + (snake.BLOCKSIZE/2);
	if  (headx > food.x && headx < food.x + food.BLOCKSIZE) {
		if (heady > food.y && heady < food.y + food.BLOCKSIZE) {
            snake.elongate = true;
			return true;
		}
	}
	return false;
}

function update() {
    snake.update();
    if (foodCollision()) {
        eat.play();
        food.update();
    }
}

function run() {
    try {
        dead.play();
        dead.loop = true;
    } catch (error) {
        console.log("Error: " + error);
    }
    setInterval(() => {
        draw();
        update();
    }, 33);
}

run();