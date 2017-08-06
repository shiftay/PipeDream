pipeGame.display = (function(){
	var canvas;
	var ctx;
	var cols;
	var rows;
	var tileSize;
	var firstRun = true;

	var tiles;
	var pipes;

	var pipeSprite;
	var tileSprite;
	var waterSprites;
	var cursor;


	var tileSelect;
	var tileCtx;

	var grid;

	function setup() {
		var $ = pipeGame.dom.$;
		var boardElement = $("#screen-game .game-board")[0];

		cols = pipeGame.settings.cols;
		rows = pipeGame.settings.rows;
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		pipeGame.dom.addClass(canvas, "board");

		var tileElement = $("#screen-game .game-hud")[0];
		tileSelect = document.createElement("canvas");
		tileCtx = tileSelect.getContext("2d");
		pipeGame.dom.addClass(tileSelect, "hud");

		var tileRect = tileElement.getBoundingClientRect();
		tileSelect.width = tileRect.width;
		tileSelect.height = tileRect.height;


		var rect = boardElement.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
		tileSize = rect.width / cols;

		boardElement.appendChild(canvas);
		tileElement.appendChild(tileSelect);
	}

	function init(callback) {
		if(firstRun) {
			setup();

			grid = new Image();
			grid.addEventListener("load", callback, false);
			grid.src = "images/boxSS.png";

			pipeSprite = new Image();
			pipeSprite.addEventListener("load", callback, false);
			pipeSprite.src = "images/pipes/pipeOL_ss.png";

			waterSprites = new Image();
			waterSprites.addEventListener("load", callback, false);
			waterSprites.src = "images/pipes/waterpipes_spritesheet.png"

			firstRun = false;
		} else {
			if(callback){
				callback();
			}
		}
	}

	function drawPipes(type, x) {
		tileCtx.drawImage(pipeSprite, type * 60, 0 , 60, 60, x * tileSize, 0, tileSize,tileSize);
	}


	function drawGrid(type, x, y) {
		ctx.drawImage(grid, type * 60, 0, 60, 60, x * tileSize, y * tileSize, tileSize, tileSize);
	}


	function redraw(newTiles, newPipes, callback) {
		var x, y;
		tiles = newTiles;
		pipes = newPipes;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for(x = 0; x < cols; x++) {
			for(y = 0; y < rows; y++) {
				drawGrid(tiles[x][y],x,y);
			}
		}

		for (var i = 0; i < 5; i++) {
			drawPipes(pipes[i], i);
		}

		if(callback) {
			callback();
		}

		renderCursor();
	}

	function clearCursor() {
		if(cursor) {
			var x = cursor.x;
			var y = cursor.y;
			var inPipe = cursor.isPipe;
			if(!inPipe) {
				clearTile(x, y);
				drawGrid(tiles[x][y], x, y);
			} else {
				clearPipe(x, y);
				drawPipes(pipes[x], x);
			}

		}
	}

	function setCursor(x, y, selected, isPipe) {
		clearCursor();
		if(arguments.length > 0) {
			cursor = {
				x : x,
				y : y,
				selected : selected,
				isPipe : isPipe
			};
		} else {
			cursor = null;
		}

		renderCursor();
	}

	function clearTile(x, y) {
		ctx.clearRect(
			x * tileSize, y * tileSize, tileSize, tileSize
		);
	}

	function clearPipe(x,y) {
		tileCtx.clearRect(x * tileSize, y * tileSize, tileSize, tileSize);
	}

	function renderCursor() {
		if(!cursor) {
			return;
		}

		var x = cursor.x;
		var y = cursor.y;
		var inPipe = cursor.isPipe;

		clearCursor();

		if(!inPipe) {
			ctx.save();
			ctx.lineWidth = 0.05 * tileSize;
			ctx.strokeStyle = "rgba(250,250,150,0.8)";
			ctx.strokeRect((x + 0.05) * tileSize, (y + 0.05) * tileSize, 0.9 * tileSize, 0.9 * tileSize);
			ctx.restore();
		} else {
			tileCtx.save();
			tileCtx.lineWidth = 0.05 * tileSize;
			tileCtx.strokeStyle = "rgba(250,250,150,0.8)";
			tileCtx.strokeRect((x + 0.05) * tileSize, (y + 0.05) * tileSize, 0.9 * tileSize, 0.9 * tileSize);
			tileCtx.restore();
		}
	}

	function moveTiles(movedTiles, callback) {
		// if(!board.getgamestate()) { // cant place tiles after game over.
		// 	return;
		// }


		var n = pipeGame.board.getBoard().length;
		var mover, i;
		var gameOver = movedTiles[0].gameOver;

		pipeGame.board.fillPipes(); // refresh the pipes

		redraw(pipeGame.board.getBoard(), pipeGame.board.getpipes(), function() {
			// nothing yet;
		});
	}

	function removeTiles(removedTiles, callback) {
		var n = removedTiles.length;
		for(var i = 0; i < n; i++) {
			clearTile(removedTiles[i].x, removedTiles[i].y);
		}
		if(callback) {
			callback();
		}
	}

	function drawWater(pipes) {
		var x, y;

		for(x = 0; x < 8; x++) {
			for(y = 0; y < 8; y++) {
				if(pipes[x][y] > 3) {
					waterPipe(pipes[x][y], x, y);
				}
			}
		}
	}

	function waterPipe(type, x, y) {
		ctx.drawImage(waterSprites, (type - 4) * 60, 0 , 60, 60, x * tileSize, y * tileSize, tileSize,tileSize);
	}



	return {
		init : init,
		redraw : redraw,
		setCursor : setCursor,
		moveTiles : moveTiles,
		waterPipe : waterPipe,
		refill : redraw
	};
})();