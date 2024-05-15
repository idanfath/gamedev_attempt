const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

//attributes
let lives = 3,
	score = 0,
	play = 0,
	highscore = localStorage.getItem('highscore')

let ballx = canvas.width / 2 + (Math.random() - 0.5) * 200,
	bally = canvas.height / 2,
	ballsize = 10,
	ballspdx = Math.random() <= 0.5 ? 3.2 : -3.5,
	ballspdy = -5

let paddlewidth = 200,
	paddleheight = 20

const p_iv = [
	canvas.width / 2 - paddlewidth / 2,
	canvas.height - paddleheight
]
let paddlex = p_iv[0],
	paddley = p_iv[1],
	paddlespd = 10,
	toright = false,
	toleft = false

let brickwidth = 85,
	brickheight = 40,
	bricks = []

// generating bricks with rows (y), and columns (x)
for (let y = 0; y < 4; y++) {
	for (let x = 0; x < 7; x++) {
		let brick = {
			// level = using ternary to set level rarity
			level: Math.random() <= 0.1 ? 1 : Math.random() <= 0.3 ? 2 : 3,
			// level: 1,
			x: x * (brickwidth + 10) + 20,
			y: y * (brickheight + 20) + 40,
		}
		bricks.push(brick)
	}
}

// game utils functions for qol
const popup = document.getElementById("popup")
function up(content = '', color, fontsize = "30px") {
	popup.innerHTML += `<div style="color: ${color}; font-size: ${fontsize};"> ${content}</div>`
}
function upbtn(content = '', att) {
	popup.innerHTML += `<button onclick="${att}"> ${content} </button>`
}

const popuptop = document.getElementById("popuptop")
function upboard(content = '') { popuptop.innerHTML = `<div> ${content} </div>` }

function down() { popup.innerHTML = ''; popuptop.innerHTML = '' }

function draw(type, color, x, y, a, b, c) {
	context.beginPath();
	switch (type) {
		case 'rect': context.rect(x, y, a, b); break;
		case 'arc': context.arc(x, y, a, b, c); break;
		case 'rect': context.rect(x, y, a, b); break;
		default: return content.closePath()
	}
	context.fillStyle = color;
	context.fill();
	context.closePath();
}

function upscore() { if (score > highscore) { localStorage.setItem('highscore', score); up('New Highscore!!') } }

let gamestate
function initplay() {
	down()
	gamestate = setInterval(rendergame, 10);
}

// handle game state popup
const ifgameover = () => {
	down()
	upscore()
	up(`Game Over!! <br> Score: ${score}`, 'red')
	upbtn('play again', 'window.location.reload()')
	upbtn('close window', 'window.close()')
}
const ifgamefinish = () => {
	down()
	upscore()
	up(`You Won!! <br> Score: ${score}`, 'lightgreen')
	upbtn('play again', 'window.location.reload()')
	upbtn('close window', 'window.close()')
}
const ifmainmenu = () => {
	down()
	if (highscore > 0) { upboard(`Highscore: ${highscore}`) }
	up('My Test Game')
	upbtn('play now', 'initplay();')
	upbtn('close window', 'window.close()')
}
const scores = () => {
	upboard(`Score: ${score} <br> Lives: ${lives} <br><br>` + (highscore > 0 ? `Highscore: ${highscore}` : ''))
}


const renderbrick = () => {
	bricks.forEach((e) => {
		let color;
		switch (e.level) {
			case 1: color = 'red'; break
			case 2: color = 'yellow'; break
			case 3: color = 'green'; break
		}
		if (color) { draw('rect', color, e.x, e.y, brickwidth, brickheight) }
	});
}

const renderpaddle = () => {
	draw('rect', 'skyblue', paddlex, paddley, paddlewidth, paddleheight)
	if (toleft && paddlex >= 0) { paddlex -= paddlespd }
	if (toright && paddlex <= canvas.width - paddlewidth) { paddlex += paddlespd }
};

const renderball = () => {
	draw('arc', 'white', ballx, bally, ballsize, 0, 6)
	handlewhileplay();
};

const handlewhileplay = () => {
	ballx += ballspdx;
	bally += ballspdy;

	let paddleendx = paddlex + paddlewidth,
		paddletop = canvas.height - paddleheight

	//left, top wall
	if (ballx <= ballsize) { ballspdx = -ballspdx; }
	if (bally <= ballsize) { ballspdy = -ballspdy; }
	//right wall
	if (ballx + ballsize >= canvas.width) { ballspdx = -ballspdx; }
	//paddle
	if (ballx + ballsize >= paddlex && ballx <= paddleendx) {
		if (bally + ballsize == paddletop) {
			ballspdy = -ballspdy;
		} else if (bally + ballsize >= paddletop) {
			ballspdx = -ballspdx;
		}
		//bottom
	} 
	if (bally + ballsize >= canvas.height) {
		console.log('out!')
		lives -= 1
		ballspdy = -ballspdy
		canvas.style.border = '2px solid red';
		setTimeout(function() {
			canvas.style.border = '2px solid white';
		}, 500);
	}

	let i = 0;
	bricks.forEach((brick) => {
		if (
			//levl 0
			brick.level > 0 
			
		) {
			if (
				// Check if the ball is within the brick's x range
				ballx + ballsize >= brick.x &&
				ballx <= brick.x + brickwidth &&
				// Check if the ball is within the brick's y range
				bally + ballsize >= brick.y &&
				bally <= brick.y + brickheight
			) {
				// Check if the ball is touching the top/bottom of the brick
				if (bally + ballsize == brick.y || bally == brick.y + brickheight) {
					ballspdy = -ballspdy;
				} else {
					// If the ball is not touching the top/bottom, it must be touching the left/right
					ballspdx = -ballspdx;
				}
				score += 1;
				brick.level -= 1;
			}
		}
		i++;
	});
};

const keyhandler = (e, state) => {
	e.keyCode == 37 ? toleft = state : e.keyCode == 39 ? toright = state : null
};

const rendergame = () => {
	context.clearRect(0, 0, canvas.width, canvas.height);

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
			clearInterval(gamestate)
		} else {
			scores()
			renderbrick();
			renderpaddle();
			renderball();
		}
	}
};

document.addEventListener("keydown", (e) => keyhandler(e, true));
document.addEventListener("keyup", (e) => keyhandler(e, false));
ifmainmenu()
