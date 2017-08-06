pipeGame.screens["screen-game"] = (function(){

	var firstRun = true;
	var paused;
	var pauseStart;
	var game_over = false;
	var board = pipeGame.board;
	var dom = pipeGame.dom;
	var overlay = dom.$("#screen-game .pause-overlay")[0];
	var finalScreen = dom.$("#screen-game .final-overlay")[0];
	var cursor;
	var lastPipeSelected;
	var gameState;

	function startGame() {
		var board = pipeGame.board;
		var display = pipeGame.display;

		game_over = false;
		board.setgamestate(false);
		gameState = {
			timer : 0,
			startTime : 0,
			endTime : 0
		};

		updateGameInfo();
		setLevelTimer(true);
		board.init(function(){
			display.init(function(){
				cursor = {
					x : 0,
					y : 0,
					selected : false,
					isPipe : false
				}
				display.redraw(board.getBoard(), board.getpipes(), function(){
					// nothing yet
				});
			});
		});
		paused = false;
		overlay.style.display = "none";
		finalScreen.style.display = "none";
	}

	function exitGame() {
		pauseGame();
		var confirmed = window.confirm("Do you want to return to the main menu?");
		if(confirmed) {
			pipeGame.showScreen("screen-menu");
		} else {
			resumeGame();
		}
	}

	function updateGameInfo() {
		var $ = pipeGame.dom.$;
		$("#screen-game .timer")[0].innerHTML = gameState.timer;
	}


	function pauseGame() {
		if(paused) {
			return;
		}
		overlay.style.display = "block";
		paused = true;
		pauseStart = Date.now();
		clearTimeout(gameState.timer);
	}

	function resumeGame() {
		paused = false;
		overlay.style.display = "none";
		var pauseTime = Date.now() - pauseStart;
		gameState.startTime += pauseTime;
		setLevelTimer();
	}

	function run() {
		if(firstRun) {
			setup();
			firstRun = false;
		}
		startGame();
	}

	function setCursor(x,y,select,isPipe) {
		cursor.x = x;
		cursor.y = y;
		cursor.selected = select;
		cursor.isPipe = isPipe;
		pipeGame.display.setCursor(x,y,select,isPipe);
	}

	function selectTile(x, y, isPipe) {
		if(arguments.length === 0) {
			selectTile(cursor.x, cursor.y, cursor.isPipe);
			return;
		}

		if(isPipe) {
			lastPipeSelected = pipeGame.board.getpipes()[x];
		}

		if(cursor.selected) {
			var dx = Math.abs(x - cursor.x);
			var dy = Math.abs(y - cursor.y);
			var dist = dx + dy;

			if(lastPipeSelected != null && !isPipe) {
				// console.log("selected a pipe, and in the grid.");
				pipeGame.board.placePipe(x, y, lastPipeSelected, playBoardEvents);
			} 

			// TODO: Get rid of?
			if(dist === 0) {
				setCursor(x, y, false, isPipe);
			} else if (dist == 1) {
				setCursor(x, y, false, isPipe);
			} else {
				setCursor(x, y, true, isPipe);
			}
		} else {
			setCursor(x, y, true, isPipe);
		}
	}

	function playBoardEvents(events) {
		var display = pipeGame.display;

		if(events.length > 0) {
			var boardEvent = events.shift();
			var next = function() {
				playBoardEvents(events);
			};

			switch(boardEvent.type) {
				case "move" :
					display.moveTiles(boardEvent.data, next);
					lastPipeSelected = null;
					break;
				case "refill" :
					display.refill(boardEvent.data, next);
					break;
				default :
					next();
					break;
			}
		} else {
			display.redraw(pipeGame.board.getBoard(), function() {
				// ??
			});
		}
	}

	function moveCursor(x,y) { 
		var settings = pipeGame.settings;
		if(cursor.selected) {
			x += cursor.x;
			y += cursor.y;
			if(x >= 0 && x < settings.cols && y >= 0 && y < settings.rows) {
				selectTile(x,y);
			}
		} else {
			x = (cursor.x + x + settings.cols) % settings.cols;
			y = (cursor.y + y + settings.rows) % settings.rows;
			setCursor(x, y, false, false);
		}
	}

	function moveUp() {
		moveCursor(0, -1);
	}

	function moveDown() {
		moveCursor(0, 1);
	}

	function moveLeft() {
		moveCursor(-1, 0);
	}

	function moveRight() {
		moveCursor(1, 0);
	}

	function setCursor(x, y, select, isPipe) {
		cursor.x = x;
		cursor.y = y;
		cursor.selected = select;
		cursor.isPipe = isPipe;
		pipeGame.display.setCursor(x, y, select, isPipe);
	}

	function setup() {
		var dom = pipeGame.dom;
		dom.bind("footer button.exit", "click", exitGame);
		dom.bind("footer button.pause", "click", pauseGame);
		dom.bind(".pause-overlay", "click", resumeGame);
		dom.bind("button.game-over", "click", pipeGame.board.gameOver);

		dom.bind("#screen-game ul.finalScreen", "click", function(e) {
			if(e.target.nodeName.toLowerCase() === "span") {
				var action = e.target.getAttribute("name");
				pipeGame.showScreen(action);
			}
		});

		var input = pipeGame.input;
		input.init();
		input.bind("selectTile", selectTile);
		input.bind("moveUp", moveUp);
		input.bind("moveDown", moveDown);
		input.bind("moveLeft", moveLeft);
		input.bind("moveRight", moveRight);
		// nothing ????
	}

	function setLevelTimer(reset) {
		var $ = pipeGame.dom.$;
		var settings = pipeGame.settings;

		if(game_over) {
			return;
		}


		if(gameState.timer) {
			clearTimeout(gameState.timer);
			gameState.timer = 0;
		}

		if(reset) {
			gameState.startTime = Date.now();
			gameState.endTime = settings.baseTimer;
		}

		if(pipeGame.board.getgamestate() && !game_over) {
			clearTimeout(gameState.timer);
			game_over = true;
		}

		var delta = gameState.startTime + gameState.endTime - Date.now();
		var time = Math.floor(delta/1000);
		var progress = $("#screen-game .timer")[0];


		if(delta < 0) {
			pipeGame.board.gameOver();
			// clear timer or leave at 0.
		} else {
			// set timer element
			progress.innerHTML = time;
			gameState.timer = setTimeout(setLevelTimer, 30);
		}

	}


	return {
		run : run
	};



})();