class Snake {
    constructor() {
        this.isMoving = false;
        this.elongate = false;
        this.dx = 0;
        this.dy = 0;
        this.STARTSIZE = 3;
        this.STARTX = 200;
        this.STARTY = 200;
        this.BLOCKSIZE = 13;
        this.movement = 5;
        this.snakePoints = new Array();
        this.score = 0;
        for (let i = 0; i < this.STARTSIZE; i++) {
            this.snakePoints.push(new Point(this.STARTX - (i*this.BLOCKSIZE), this.STARTY));
        }
    }

    draw(ctx) {
        ctx.fillStyle = "green";
        ctx.fillRect(this.snakePoints[0].getx(), this.snakePoints[0].gety(), this.BLOCKSIZE, this.BLOCKSIZE);
        ctx.fillStyle = "pink";
        for (let i = 1; i < this.snakePoints.length; i++) {
            ctx.fillRect(this.snakePoints[i].getx(), this.snakePoints[i].gety(), this.BLOCKSIZE, this.BLOCKSIZE);
        }
        ctx.font = "20px Consolas";
        ctx.fillStyle = "yellow";
        ctx.fillText(this.score, canvas.width - 50, 50);
    }

    update() {
        if (this.isMoving) {
            let first = this.snakePoints[0];
            let last = this.snakePoints[this.snakePoints.length-1];
            let newFirst = new Point(first.getx() + (this.dx*this.BLOCKSIZE), first.gety() + (this.dy*this.BLOCKSIZE));
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
                show_game_over_toast();
                // document.exitFullscreen();
                _score.innerHTML = this.score;
                gameover = true;
                canvas.style.display = "none";
                game_over.style.display = "block";
                if (play_sound) {
                    dead.play();
                }
                dead.loop = true;
                this.isMoving = false;
            }
        }
    }

    reset() {
        this.score = 0;
        this.snakePoints = [];
        for (let i = 0; i < this.STARTSIZE; i++) {
            this.snakePoints.push(new Point(this.STARTX - (i*this.BLOCKSIZE), this.STARTY));
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
        ctx.fillStyle = "red";
        // ctx.fillRect(this.x, this.y, this.BLOCKSIZE, this.BLOCKSIZE);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.BLOCKSIZE, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x = Math.random() * (canvas.width-100) + 50;
        this.y = Math.random() * (canvas.height-100) + 50;
    }

    reset() {
        this.x = Math.random() * (canvas.width-100) + 70;
        this.y = Math.random() * (canvas.height-100) + 70;
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

let canvas = document.getElementById("myCanvas");
let context = canvas.getContext("2d");
let snake = new Snake();
let food = new Food();
let pause = false;
let fps = 150; // Frames per second

let dead = new Audio();
let eat = new Audio();
let up = new Audio();
let right = new Audio();
let left = new Audio();
let down = new Audio();
let key_press = new Audio();

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


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.addEventListener("keydown", events, false);

function events(e) {
    if (!gameover) {
        switch (e.keyCode) {
            case 13: // Enter key
                if (!snake.isMoving && !pause) {
                    stopAudio(dead);
                    if (play_sound) {
                        key_press.play();
                    }
                    snake.dx = 1;
                    snake.dy = 0;
                    snake.isMoving = true;
                    snake.reset();
                    food.reset();
                }
                break;
            case 37: // Left arrow key
                if (snake.isMoving && snake.dx != 1) {
                    if (play_sound) {
                        left.play();
                    }
                    snake.dx = -1;
                    snake.dy = 0;
                }
                break;
            case 38: // Up arrow key
                if (snake.isMoving && snake.dy != 1) {
                    if (play_sound) {
                        up.play();
                    }
                    snake.dy = -1;
                    snake.dx = 0;
                }
                break;
            case 39: // Right arrow key
                if (snake.isMoving && snake.dx != -1) {
                    if (play_sound) {
                        right.play();
                    }
                    snake.dx = 1;
                    snake.dy = 0;
                }
                break;
            case 40: // Down arrow key
                if (snake.isMoving && snake.dy != -1) {
                    if (play_sound) {
                        down.play();
                    }
                    snake.dy = 1;
                    snake.dx = 0;
                }
                break;
            case 32: // Spacebar
                if (snake.isMoving && !pause) {
                    if (play_sound) {
                        key_press.play();
                    }
                    dead.loop = true;
                    snake.isMoving = false;
                    pause = true;
                } else if (!snake.isMoving && pause) {
                    if (play_sound) {
                        key_press.play();
                    }
                    pause = false;
                    snake.isMoving = true;
                    stopAudio(dead);
                }
        }
    }
}

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    food.reset();
    draw();
}

function foodCollision() {
    let headx = snake.snakePoints[0].getx(),
        heady = snake.snakePoints[0].gety(),
        foodx = food.x,
        foody = food.y;
    
    if (snake.dx == 1) {
        if (headx + (snake.BLOCKSIZE - 3) >= foodx - food.BLOCKSIZE &&
        headx <= foodx + food.BLOCKSIZE) {
            if (heady + (snake.BLOCKSIZE - 3) > foody && heady < foody + food.BLOCKSIZE) {
                return true;
            } else if (heady + (snake.BLOCKSIZE) > foody - food.BLOCKSIZE &&
            heady + (snake.BLOCKSIZE - 3) < foody + food.BLOCKSIZE) {
                return true;
            }
        }
    }

    if (snake.dx == -1) {
        if (headx + 3 >= foodx &&
            headx <= foodx + food.BLOCKSIZE) {
            if (heady + (snake.BLOCKSIZE - 3) > foody && heady < foody + food.BLOCKSIZE) {
                return true;
            } else if (heady + (snake.BLOCKSIZE) > foody - food.BLOCKSIZE &&
            heady + (snake.BLOCKSIZE - 3) < foody + food.BLOCKSIZE) {
                return true;
            }
        }
            
    }

    if (snake.dy == 1) {
        if (heady + (snake.BLOCKSIZE - 3) >= foody - food.BLOCKSIZE &&
        heady <= foody + food.BLOCKSIZE) {
            if (headx + (snake.BLOCKSIZE - 3) > foodx && headx < foodx + food.BLOCKSIZE) {
                return true;
            } else if (headx + (snake.BLOCKSIZE) > foodx - food.BLOCKSIZE &&
            headx + (snake.BLOCKSIZE - 3) < foodx + food.BLOCKSIZE) {
                return true;
            }
        }
    }

    if (snake.dy == -1) {
        if (heady + 3 >= foody &&
            heady <= foody + food.BLOCKSIZE) {
            if (headx + (snake.BLOCKSIZE - 3) > foodx && headx < foodx + food.BLOCKSIZE) {
                return true;
            } else if (headx + (snake.BLOCKSIZE) > foodx - food.BLOCKSIZE &&
            headx + (snake.BLOCKSIZE - 3) < foodx + food.BLOCKSIZE) {
                return true;
            }
        }
    }

    return false;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    snake.draw(context);
    food.draw(context);

    if (pause) {
        context.fillStyle = "white";
        context.font = "40px Consolas";
        context.fillText("PAUSED", (canvas.width/2)-59, (canvas.height/2)-10);
    }
}

function update() {
    snake.update();
    if (foodCollision()) {
        if (play_sound) {
            eat.play();
        }
        snake.elongate = true;
        food.update();
        snake.score++;
    }
}

function run() {
    setInterval(() => {
        draw();
        update();
    }, fps);
}







// Code for recognizing touches.

let x1, y1, x2, y2, deltaX, deltaY;
let d_touch = false, t1 = 0, t2 = 0, delta_t;
let _p = false  /** Prevent sounds from playing before the game begins */

document.addEventListener("touchstart", (e) => {
    x1 = e.touches[0].clientX;
    y1 = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    // if (!d_touch) {
    //     t1 = new Date().getTime();
    //     d_touch = true;
    // } else {
    //     t2 = new Date().getTime();
    //     d_touch = false;
    // }
    // delta_t = t2-t1;
    // if (ddtouch()) {
    //     if (pause && !snake.isMoving) {
    //         pause = false;
    //         snake.isMoving = true;
    //     } else if (!pause && snake.isMoving) {
    //         pause = true;
    //         snake.isMoving = false;
    //     }
    // }

    x2 = e.changedTouches[0].clientX;
    y2 = e.changedTouches[0].clientY;
    deltaX = Math.abs(x2 - x1);
    deltaY = Math.abs(y2 - y1);

    if (deltaX > 3 || deltaY > 3) {
        if (!snake.isMoving && _p && !gameover) {
            stopAudio(dead);
            if (play_sound) {
                key_press.play();
            }
            snake.reset();
            food.reset();
            snake.isMoving = true;
        }
    }

    if (!gameover) {
        if (deltaX > deltaY) {
            if (x2 > x1) {
                if (snake.dx != -1 && snake.isMoving) {
                    if (play_sound) {
                        right.play();
                    }
                    snake.dy = 0;
                    snake.dx = 1;
                }
            } else if (x2 < x1) {
                if (snake.dx != 1 && snake.isMoving) {
                    if (play_sound) {
                        left.play();
                    }
                    snake.dy = 0;
                    snake.dx = -1;
                }
            }
        }
    
        if (deltaX < deltaY) {
            if (y2 > y1) {
                if (snake.dy != -1 && snake.isMoving) {
                    if (play_sound) {
                        down.play();
                    }
                    snake.dx = 0;
                    snake.dy = 1;
                }
            } else if (y2 < y1) {
                if (snake.dy != 1 && snake.isMoving) {
                    if (play_sound) {
                        up.play();
                    }
                    snake.dx = 0;
                    snake.dy = -1;
                }
            }
        }
    }
});


// Detect double touch to pause or resume the game
// function ddtouch() {
//     if (delta_t > 0 && delta_t < 300) {
//         return true;
//     }
//     return false;
// }



// Menu
let menu = document.getElementById("menu"); /** Main menu */
let play = document.getElementById("play"); /** Play game */
let toggle_sound = document.getElementById("toggle_sound"); /** Sound: on/off button */
let play_sound = true;
let btm = document.getElementById("btm");   /** back to menu */
let how_to_play = document.getElementById("htp");   /** how to play - instructions */
let htp_main = document.getElementById("htp_main"); /** 'How to play' button in the main menu */
let level = document.getElementById("level");
let about = document.getElementById("about");
let about_content = document.getElementById("about_content");
let back_about = document.getElementById("back_about");
let game_over = document.getElementById("game_over");
let back_score = document.getElementById("back_score");
let _score = document.getElementById("_score");
let gameover = false;
let game_over_toast = document.getElementById("g_o_t");

function show_game_over_toast() {
    game_over_toast.style.display = "block";
    setTimeout(() => {
        game_over_toast.style.display = "none";
    }, 1500);
}

back_score.onclick = () => {
    game_over.style.display = "none";
    menu.style.display = "block";
    stopAudio(dead);
    snake.reset();
    food.reset();
}

back_about.onclick = () => {
    about_content.style.display = "none";
    menu.style.display = "block";
}

htp_main.onclick = () => {
    menu.style.display = "none";
    how_to_play.style.display = "block";
}

btm.onclick = () => {
    how_to_play.style.display = "none";
    menu.style.display = "block";
}

play.onclick = () => {
    gameover = false;
    menu.style.display = "none";
    // document.body.webkitRequestFullscreen();
    canvas.style.display = "block";
    _p = true;
}

level.onclick = () => {
    switch (level.value) {
        case "1":
            fps = 100;
            level.value = "2";
            level.innerHTML = "Level: Medium";
            break;
        case "2":
            fps = 50;
            level.value = "3";
            level.innerHTML = "Level: Hard";
            break;
        case "3":
            fps = 150;
            level.value = "1";
            level.innerHTML = "Level: Easy";
            break;
    }
}

about.onclick = () => {
    menu.style.display = "none";
    about_content.style.display = "block";
}

toggle_sound.onclick = () => {
    if (toggle_sound.value == "on") {
        play_sound = false;
        toggle_sound.value = "off";
        toggle_sound.innerHTML = "Sound: Off";
    } else if (toggle_sound.value == "off") {
        play_sound = true;
        toggle_sound.value = "on";
        toggle_sound.innerHTML = "Sound: On";
    }
}







run();