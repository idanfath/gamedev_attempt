const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")



//attributes
let lives = 3,
	score = 0,
	play = 0,
	highscore = localStorage.getItem('highscore')
let ballx = canvas.width / 2,
	bally = canvas.height - 100,
	ballsize = 10,
	ballspdx = -2,
	ballspdy = -2
let paddlewidth = 200,
	paddleheight = 20,
	paddlex = canvas.width / 2 - paddlewidth / 2,
	paddley = canvas.height - paddleheight,
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
			// level: Math.random() <= 0.1 ? 1 : Math.random() <= 0.3 ? 2 : 3,
			level: 1,
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
function upboard(content = '') {
	popuptop.innerHTML = `<div> ${content} </div>`
}
function down() {
	popup.innerHTML = ''
	popuptop.innerHTML = ''
}

function draw(type, color, x,y, a,b,c){
	if (!type) {return}
	context.beginPath();
	switch (type) {
		case 'rect': context.rect(x, y, a, b); break;
		case 'arc': context.arc(x, y, a, b, c); break;
		case 'rect': context.rect(x, y, a, b); break;
	}
	context.fillStyle = color;
	context.fill();
	context.closePath();
}

let gamestate
function initplay() {
	down()
	play = 1
	gamestate = setInterval(rendergame, 10);
}

// handle game state popup
const ifgameover = () => {
	down()
	if (score > highscore) {localStorage.setItem('highscore', score); up('New Highscore!!')}
	up(`Game Over!! <br> Score: ${score}`, 'red')
	upbtn('play again', 'window.location.reload()')
	upbtn('close window', 'window.close()')
}
const ifgamefinish = () => {
	if (score > highscore) {localStorage.setItem('highscore', score); up('New Highscore!!')}
	down()
	up(`You Won!! <br> Score: ${score}`, 'lightgreen')
	upbtn('play again', 'window.location.reload()')
	upbtn('close window', 'window.close()')
}
const ifmainmenu = () => {
	down()
	if (highscore > 0) {upboard(`Highscore: ${highscore}`)}
	up('My Test Game')
	upbtn('play now', 'initplay(1);')
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
		if (color){draw('rect', color, e.x, e.y, brickwidth, brickheight)}
	});
}

const renderpaddle = () => {
	draw('rect', 'skyblue', paddlex, paddley, paddlewidth, paddleheight)
	if (toleft && paddlex >= 0) {paddlex -= paddlespd}
	if (toright && paddlex <= canvas.width - paddlewidth) {paddlex += paddlespd}
};

const renderball = () => {
	draw('arc', 'white', ballx, bally, ballsize, 0, 6)
	handlewhileplay();
};

const handlewhileplay = () => {
	ballx += ballspdx;
	bally += ballspdy;

	//these two process validate wether the ball touches left/top side of canvas
	//its simpler than right/bottom since we know that the wall position is 0 
	//check if ball position is less than ball size, then reverse the momentum
	if (ballx <= ballsize) {ballspdx = -ballspdx;}
	if (bally <= ballsize) {ballspdy = -ballspdy;}

	//these two are a bit complicated as they check for right wall and bottom wall
	//taking into account ball-paddle interaction
	//!continue here
	if (ballx >= canvas.width - ballsize) {ballspdx = -ballspdx;}
	if (bally >= canvas.height - ballsize - paddleheight) {
		if (
			ballx + ballsize >= paddlex &&
			ballx + ballsize <= paddlex + paddlewidth
		) {
			ballspdy = -ballspdy;
		} else {
			lives -= 1;
			ballx = canvas.width / 2;
			bally = canvas.height / 2;
			ballspdx = -2;
			ballspdy = -2;
			paddlex = canvas.width / 2 - paddlewidth / 2;
			paddley = canvas.height - paddleheight;
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

const keyhandler = (e, state) => {
	e.keyCode == 37 ? toleft = state : e.keyCode == 39 ? toright = state : null
};

const keyup = (e) => {
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
		} else if (play == 0) {
			ifmainmenu()
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


rendergame()





