"use strict";

const ANIMATION_VELOCITY = 2; // INTERVAL (DEPRECATED)

const FOOD_RESPAWN_RATE = 500; // how long 'til the food respawns
const FOOD_INCREASE_RATE = 10; // how much will the food grow 'on eat'
const FOOD_COLOUR = '#FF0000';
const FOOD_STROKE = '#FFFFFF';
const FOOD_SIZE_THRESHOLD = 250; // 250 seems to be ok
const STARTING_FOOD_SIZE = 20;

const SNAKE_SIZE = 10;
// TAMANHO DO "PASSO" DA SNAKE (POR "FRAME")
const SNAKE_HEAD_MULTIPLIER = SNAKE_SIZE; // DEFAULT: SNAKE_SIZE OR 1
const SNAKE_COLOUR = '#0000FF';
const SNAKE_STROKE = '#00FF00';

let IS_FOOD_ALIVE = false;
let foodPositionX = 0, foodPositionY = 0;
let actualFoodSize = STARTING_FOOD_SIZE;


/*
JOGO ATUAL: TIPO SNAKE MAS A COBRA NÃO DESAPARECE, SÓ CRESCE;

TODO:	FAZER A SNAKE AUMENTAR A VELOCIDADE A CADA FOOD COMIDA (VIA INTERVAL OU NO DRAW?)

FIXME:	SE A FOOD FOR GRANDE O SUFICIENTE, DÁ PRA NOTAR QUE A SNAKE VAI SEMPRE NO PONTO INFERIOR ESQUERDO DA FOOD PRA COME-LA; DEVE-SE CONSIDERAR O TAMANHO DA FOOD PRA CALCULAR A SEARCH

FIXME:	SNAKE ESTÁ VOLTANDO PELO PRÓPRIO CAMINHO (DE ESQUERDA PRA DIREITA, CIMA PRA BAIXO) DIRETAMENTE. DEVERIA FAZER UMA "VOLTA": DIREITA -> BAIXO -> ESQUERDA AO INVÉS DE DIREITA -> ESQUERDA DIRETO
FIXME:	FOOD NÃO DEVE SER CRIADA ONDE EXISTE COBRA (HEAD)
FIXME:	FOOD NÃO DEVE SER CRIADA ONDE JÁ EXISTE CAMINHO DA COBRA (*)
FIXME:	AJUSTAR O clearRect QUE CRIA 'BURACOS' NA TELA AO INVÉS DE SÓ LIMPAR A FOOD
FIXME:	A VELOCIDADE DA ANIMAÇÃO VARIA POR ALGUM MOTIVO DESCONHECIDO. CHROME E FIREFOX RODAM DIFERENTEMENTE
*/
let c, ctx;
let posX = 0, posY = 0;
let bigSnakeSize = 0;
let direction = 'R'; // default: R (right)

let actualHead = {
	x: posX*SNAKE_HEAD_MULTIPLIER,
	y: posY*SNAKE_HEAD_MULTIPLIER
};
// SNAKE começa com uma cabeça apenas (?)
let bigSnake = new Array();
bigSnake.push(actualHead);
bigSnake.push({x:actualHead.x+10, y:actualHead.y+10});
bigSnake.push({x:actualHead.x+20, y:actualHead.y+20});

function updateCoordsScreen(x,y) {
	let co = document.getElementById('coords');
	
	co.textContent = `x: ${x} y: ${y}`;
	//console.log(`direction = ${direction}`);
}

// KEYBINDS
document.addEventListener("keydown", getDirection);

function getDirection(e) {
	if (e.keyCode == 37 && direction !== 'R') {
		direction = 'L';
	} else if (e.keyCode == 38 && direction !== 'D') {
		direction = 'U';
	} else if (e.keyCode == 39 && direction !== 'L') {
		direction = 'R';
	} else if (e.keyCode == 40 && direction !== 'U') {
		direction = 'D';
	}
}

// RUN ASAP
function init() {
	c = document.getElementById("myCanvas");
	ctx = c.getContext("2d");
	
	//window.setInterval(draw, ANIMATION_VELOCITY); // DEPRECATED
	// FIXME: se eu chamar apenas o draw() e o requestAnimationFrame dentro dele?
	//window.requestAnimationFrame(draw);
	draw();
	createFood(actualFoodSize);
}

function aiSearchFood(actualHead, foodPositionX, foodPositionY) {
	// Com a posicão de foodPositionX e foodPositionY, muda a var direction de acordo com a posição relativa a actualHead.x e actualHead.y
	//console.log(actualHead); console.log(this.actualHead);
	if (IS_FOOD_ALIVE) {
		if (Math.floor(foodPositionX/SNAKE_HEAD_MULTIPLIER) > Math.floor(actualHead.x/SNAKE_HEAD_MULTIPLIER)) {
			direction = 'R';
		} else if (Math.floor(foodPositionX/SNAKE_HEAD_MULTIPLIER) < Math.floor(actualHead.x/SNAKE_HEAD_MULTIPLIER)) {
			direction = 'L';
		} else if (Math.floor(foodPositionY/SNAKE_HEAD_MULTIPLIER) > Math.floor(actualHead.y/SNAKE_HEAD_MULTIPLIER)) {
			direction = 'D';
		} else if (Math.floor(foodPositionY/SNAKE_HEAD_MULTIPLIER) < Math.floor(actualHead.y/SNAKE_HEAD_MULTIPLIER)) {
			direction = 'U';
		}
	//console.log(`${foodPositionX/SNAKE_HEAD_MULTIPLIER}x ${foodPositionY/SNAKE_HEAD_MULTIPLIER}y ${actualHead.x/SNAKE_HEAD_MULTIPLIER}`);
	}
}

// "MAIN" THAT IS CALLED EVERY INTERVAL / FRAME REQUESTED
function draw() {
/*
// ??
	let newHead = {
		x: posX,
		y: posY
	};

	bigSnake[bigSnakeSize] = newHead;
	bigSnakeSize++;
*/
	// ADJUST direction VARIABLE THAT MOVES SNAKE
	switch (direction) {
		case 'R':
			posX++;
			break;
		case 'L':
			posX--;
			break;
		case 'U':
			posY--;
			break;
		case 'D':
			posY++;
			break;
	}

	// HAS THE MULTIPLIER TO 'MOVE' THE SNAKE (EACH STEP) BY THE SIZE O SNAKE_HEAD_MULTIPLIER
	actualHead = {
		x: posX*SNAKE_HEAD_MULTIPLIER,
		y: posY*SNAKE_HEAD_MULTIPLIER
	};
	
	bigSnake[0] = actualHead;
		
		// Tudo errado nessas somas FIXME
	for (let n=1; n<bigSnake.length; n++) {
		bigSnake[n].x = bigSnake[n].x - SNAKE_SIZE;
		bigSnake[n].y = bigSnake[n].y - SNAKE_SIZE;
	}
	
	//ctx.clearRect(0, 0, c.width, c.height); // CLEAR THE SNAKE TRAIL (BUT CLEARS THE FOOD TOO...) FIXME
	ctx.fillStyle = '#a2bbc3';
	ctx.fillRect(actualHead.x, actualHead.y, SNAKE_SIZE, SNAKE_SIZE);
	drawSnake(1, 1);
	
	// Collision with food
	checkCollision(actualHead);
	
	aiSearchFood(actualHead, foodPositionX, foodPositionY);
	
	updateCoordsScreen(actualHead.x, actualHead.y);
	
	window.requestAnimationFrame(draw); // Remove if not using requestAnimationFrame()
}

function drawSnake(x, y) {
	ctx.fillStyle = SNAKE_COLOUR;
	ctx.strokeStyle = SNAKE_STROKE;
		
	for (let n=0; n<bigSnake.length; n++) {		
		ctx.fillRect(x*bigSnake[n].x, y*bigSnake[n].y, SNAKE_SIZE, SNAKE_SIZE);
		ctx.strokeRect(x*bigSnake[n].x, y*bigSnake[n].y, SNAKE_SIZE, SNAKE_SIZE);
	}
}

function checkCollision(actualHead) {
	// Collision with food
	let thFoodMinusX = foodPositionX;
	let thFoodPlusX = (foodPositionX + actualFoodSize);
	let thFoodMinusY = foodPositionY;
	let thFoodPlusY = (foodPositionY + actualFoodSize);
	
	if (IS_FOOD_ALIVE) {
		if ((actualHead.x+SNAKE_SIZE) >= thFoodMinusX && actualHead.x <= thFoodPlusX && (actualHead.y+SNAKE_SIZE) >= thFoodMinusY && actualHead.y <= thFoodPlusY) {
			//console.log("Bateu no X = "+actualHead.x+" & Y = "+actualHead.y);
			ctx.clearRect(foodPositionX, foodPositionY, actualFoodSize, actualFoodSize);
			
			IS_FOOD_ALIVE = false;
			
			actualFoodSize += FOOD_INCREASE_RATE; // pra ficar aumentando a comida sempre que 'comer'
			
			if (bigSnake.length <= 2) bigSnake.push(bigSnake[bigSnake.length-1]);
			// console.log(bigSnake);
			
			window.setTimeout(createFood, FOOD_RESPAWN_RATE, actualFoodSize);
		}
	}
}

function createFood(foodSize) {
	actualFoodSize = (foodSize > FOOD_SIZE_THRESHOLD ? STARTING_FOOD_SIZE : foodSize); // Adjust food size when gets too big
	
	foodPositionX = Math.floor(Math.random() * (c.width - actualFoodSize)) + 1; // + actualFoodSize ? To fix left cropping?
	foodPositionY = Math.floor(Math.random() * (c.height - actualFoodSize)) + 1;
	
	// Plot food:
	ctx.fillStyle = FOOD_COLOUR;
	ctx.fillRect(foodPositionX, foodPositionY, actualFoodSize, actualFoodSize);
	
	ctx.strokeStyle = FOOD_STROKE;
	ctx.strokeRect(foodPositionX, foodPositionY, actualFoodSize, actualFoodSize);
	
	IS_FOOD_ALIVE = true;
	//console.log(`FOOD PLOTTED: X=${foodPositionX} Y=${foodPositionY} size=${actualFoodSize}`);
}


window.onload = init;