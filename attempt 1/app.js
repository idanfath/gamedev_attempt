const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
const popup = document.getElementById("popup")
const popuptop = document.getElementById("popuptop")

// [1] ease of calling
const canvaswidth = canvas.width;
const canvasheight = canvas.height;

// [2] clogging debug function
function debug() { ifmainmenu() }

// player attribute
let lives = 3,
    score = 0,
	play = 0,
	highscore = localStorage.getItem('highscore')
// game attribute
let ballx = canvaswidth,
    bally = canvasheight - 100,
    ballsize = 10,
    ballspdx = -2,
    ballspdy = 2
let paddlewidth = 200,
    paddleheight = 20,
    paddlex = canvaswidth / 2 - paddlewidth / 2,
    paddley = canvasheight - paddleheight - 40,
    paddlespd = 10,
    toright = false,
    toleft = false
let brickwidth = 85,
    brickheight = 40,
    bricks = []

// generating bricks with rows (y), and columns (x)
for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 7; x++) {
        let brick = {
            // level = using ternary to set level rarity
            level: Math.random() <= 0.1 ? 1 : Math.random() <= 0.3 ? 2 : 3,
            x: x * (brickwidth + 10) + 20,
            y: y * (brickheight + 20) + 40,
        }
        bricks.push(brick)
    }
}

// game utils functions for qol
function up(content = '', color, fontsize = "30px") {
    popup.innerHTML +=
        `<div style="color: ${color}; font-size: ${fontsize};"> ${content}</div>`
}
function upboard(content = '') {
    popuptop.innerHTML =
        `<div> ${content} </div>`
}
function upbtn(content = '', att){
    popup.innerHTML += 
        `<button onclick="${att}"> ${content} </button>`
}
function down() {
    popup.innerHTML = ''
	popuptop.innerHTML = ''
}
function makebrick(x, y, color = 'white'){
    context.beginPath();
	context.rect(x, y, brickwidth, brickheight);
	context.fillStyle = color;
	context.fill();
	context.closePath();
}

let gamestate
function initplay(){
	down()
	play = 1
	gamestate = setInterval(rendergame, 10);
}

// handle game state popup
const ifgameover = () => {
    down()
	if (score > highscore) {
		localStorage.setItem('highscore', score)
		up('New Highscore!!')
	}
    up(
		`Game Over!! <br> 
        Score: ${score}`,
        'red'
    )
    upbtn('play again', 'window.location.reload()')
    upbtn('close window', 'window.close()')
}
const ifgamefinish = () => {
    down()
    up(`You Won!! <br> Score: ${score}`, 'lightgreen')
    upbtn('play again', 'window.location.reload()')
    upbtn('close window', 'window.close()')
	
}
const ifmainmenu = () => {
	down()
	if (highscore > 0) {
		upboard(`Highscore: ${highscore}`)
	}
    up('My Test Game')
    upbtn('play now', 'initplay(1);')
    upbtn('close window', 'window.close()')
}
const scores = () => {
	showhighscore = highscore > 0 ? `Highscore: ${highscore}` : '';
	upboard(`Score: ${score} <br> Lives: ${lives} <br><br>` + showhighscore )
}


const renderbrick = () => {
    bricks.forEach((e) => {
        if (e.level == 1) {
			makebrick(e.x, e.y, 'red');
		}
		if (e.level == 2) {
			makebrick(e.x, e.y, 'yellow');
		}
		if (e.level == 3) {
			makebrick(e.x, e.y, 'green');
		}
    });
}

const renderpaddle = () => {
	context.beginPath();
	context.rect(paddlex, paddley, paddlewidth, paddleheight);
	context.fillStyle = "skyblue";
	context.fill();
	context.closePath();

	if (toleft == true && paddlex >= 0) {
		paddlex -= paddlespd;
	}
	if (toright == true && paddlex <= canvaswidth - paddlewidth) {
		paddlex += paddlespd;
	}
};

const renderball = () => {
	context.beginPath();
	context.arc(ballx, bally, ballsize, 0, 3 + Math.PI);
	context.fillStyle = "purple";
	context.fill();
	context.closePath();
	handlewhileplay();
};

const handlewhileplay = () => {
	ballx += ballspdx;
	bally += ballspdy;

	if (ballx >= canvaswidth - ballsize) {
		ballspdx = -ballspdx;
	}

	if (ballx <= ballsize) {
		ballspdx = -ballspdx;
	}

	if (bally <= ballsize) {
		ballspdy = -ballspdy;
	}

	if (bally >= canvasheight - ballsize - paddleheight) {
		if (
			ballx + ballsize >= paddlex &&
			ballx + ballsize <= paddlex + paddlewidth
		) {
			ballspdy = -ballspdy;
		} else {
			lives -= 1;
			ballx = canvaswidth / 2;
			bally = canvasheight / 2;
			ballspdx = -2;
			ballspdy = -2;
			paddlex = canvaswidth / 2 - paddlewidth / 2;
			paddley = canvasheight - paddleheight - 40;
		}
	}

	let i = 0;
	bricks.forEach((e) => {
		if (
			e.level > 0 &&
			ballx >= e.x &&
			ballx <= e.x + brickwidth &&
			bally >= e.y &&
			bally <= e.y + brickheight
		) {
			{
				ballspdy = -ballspdy;
				e.level == 3 ? score += 1 : e.level == 2 ? score += 2 : score += 3
				e.level -= 1;
			}
		}
		i++;
	});
};

const keydown = (e) => {
	if (e.keyCode == 37) {toleft = true} else if (e.keyCode == 39) {toright = true}
};

const keyup = (e) => {
	if (e.keyCode == 37) {
		toleft = false;
	}
	if (e.keyCode == 39) {
		toright = false;
	}
};

const rendergame = () => {
	context.clearRect(0, 0, canvaswidth, canvasheight);

	let win = true;

	bricks.forEach((e) => {
		if (e.level != 0) {
			win = false;
		}
	});
	if (lives <= 0) {
		ifgameover();
		clearInterval(gamestate)

	} else {
		if (win) {
			ifgamefinish();
		} else if (play == 0){
			ifmainmenu()
		} else {
			scores()
			renderbrick();
			renderpaddle();
			renderball();
		}
	}
};

document.addEventListener("keydown", keydown);
document.addEventListener("keyup", keyup);


rendergame()





