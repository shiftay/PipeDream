pipeGame.board = (function(){
	var settings;
	var tiles; // will be the multidimensional array of tiles
	var pipes;
	var cols;
	var rows;
	var baseScore;
	var numGridTypes;
	var numPipes;
	var newPipePlaced = false;
	var game_over = false;

	var startx, starty;

	function init(callback) {

		settings = pipeGame.settings;
		numGridTypes = settings.numGridTypes;
		numPipes = settings.numPipes;
		baseScore = settings.baseScore;
		rows = settings.rows;
		cols = settings.cols;
		fillBoard();
		fillPipes();

		if(callback) {
			callback();
		}
	}

	function fillPipes() {
		var x, type;

		pipes = [];

		for(x = 0; x < 5; x++) {
			pipes[x] = randomPipe();		// TODO: fix
		}
	}

	function randomPipe() {
		return Math.floor(Math.random() * numPipes);
	}

	function fillBoard() {
		var x,y;
		var type;

		tiles = [];

		for(x = 0; x < cols; x++) {

			tiles[x] = [];
			for(y = 0; y < rows; y++) {
				if(y === 0 || x === 0 || x === 7 || y === 7) {
					type = 1;
				} else {
					type = 0;
				}

				tiles[x][y] = type;
			}
		}
		
		setExits();

		placeRandomBlocks();
		// TODO: 
		//		add a few random blocks to make puzzles interesting
		//		test the block so it isn't placed infront of an entrance/exit.

	}

	function placeRandomBlocks() {

		for(var i = 0; i < 5; i++) {

			do {
				var x = Math.floor(Math.random() * 6) + 1;
				var y = Math.floor(Math.random() * 6) + 1;
			}while( getTile(x-1, y) == 2 || getTile(x-1, y) == 3 || 
					getTile(x+1, y) == 2 || getTile(x+1, y) == 3 || 
					getTile(x, y-1) == 2 || getTile(x, y-1) == 3 || 
					getTile(x, y+1) == 2 || getTile(x, y+1) == 3 || getTile(x, y) == 1 );

			tiles[x][y] = 1;
		}
	}



	function setExits() {
		var x,y;

		x = Math.floor(Math.random() * 4) + 1;
		do {
			y = Math.floor(Math.random() * 4) + 1;
		}while(y == x);

		// 1 - top row
		// 2 - left side
		// 3 - right side
		// 4 - bottom 
		setPosition(x,false);
		setPosition(y,true);
	}

	function setPosition(placement, exit) {
		var type;
		var randVal = Math.floor(Math.random() * 6) + 1;
		start = {};


		if(!exit) {
			type = 2;
		} else {
			type = 3;
		}

		switch(placement) {
			case 1:
				tiles[randVal][0] = type;
				if(!exit) {
					startx = randVal;
					starty = 0;
				}
				break;
			case 2:
				tiles[0][randVal] = type;
				if(!exit) {
					startx = 0;
					starty = randVal;
				}
				break;
			case 3:
				tiles[7][randVal] = type;
				if(!exit) {
					startx = 7;
					starty = randVal;
				}
				break;
			case 4:
				tiles[randVal][7] = type;
				if(!exit) {
					startx = randVal;
					starty = 7;
				}
				break;
		}
	}

	function randomTile() {
		return Math.floor(Math.random() * numGridTypes);
	}

	function getTile(x,y) {
		if(x < 0 || x > cols-1 || y<0 || y > rows-1) {
			return -1;
		} else {
			return tiles[x][y];
		}
	}

	function check(events) {
		var score = 0;
		var moved = [];

		events = events || [];

		if(newPipePlaced) {
			if(!hasMoves()) {
				moved.push({
					newPipePlaced : newPipePlaced,
					gameOver : true
				});
			} else {
				moved.push({
					newPipePlaced : newPipePlaced,
					gameOver : false
				});
			}

			events.push({
				type : "move",
				data : moved
			});

			newPipePlaced = false;
			return check(events);
		} else {
			return events;
		}
	}

    function hasMoves() {
    	var spaceLeft = false;

		for (var x = 0; x < cols; x++) {
		    for (var y = 0; y < rows; y++) {
		    	if(tiles[x][y] === 0) {
		    		spaceLeft = true;
		    	}
			}
		}

		return spaceLeft;
	}

    function canTileMove(x, y) {
        return ((x > 0 && canSwap(x, y, x-1 , y)) ||
                (x < cols-1 && canSwap(x, y, x+1 , y)) ||
                (y > 0 && canSwap(x, y, x , y-1)) ||
                (y < rows-1 && canSwap(x, y, x , y+1)));
    }

    function getpipes() {
    	return pipes;
    }

    function getBoard() {
        var copy = [];
        var x;
        for (x = 0; x < cols; x++) {
            copy[x] = tiles[x].slice(0);
        }
        return copy;
    }

    function placePipe(x1, y1, pipeType, callback) {
    	var tmp = getTile(x1,y1);
    	var events;

    	if(tmp === 0) {
    		tiles[x1][y1] = pipeType + 4;   // place pipe in here
    										// ( +4 ) -- spritesheet values
    		newPipePlaced = true;

    		events = check();

    		callback(events);
    	} else {
    		return;
    	}
    }

    function gameOver(x, y, direction) {
    	var test;
    	var display = pipeGame.display;

    	if(arguments.length <= 1) { // starting position if through time / button press.
    		x = startx;
    		y = starty; 
    	} 
    	

    	test = getTile(x, y); // the tile we're testing
    	

    	switch(test) {
    		case 2:
    			//start
    			if(getTile(x,y+1) == 6 || getTile(x,y+1) == 7 || getTile(x,y+1) == 8) {
    				gameOver(x, y+1, "top");
    			}else if(getTile(x+1,y) == 5 || getTile(x+1,y) == 6  || getTile(x+1,y) == 9) {
	    				gameOver(x+1,y,"left");
	    		}else if(getTile(x-1,y) == 4 || getTile(x-1,y) == 7 || getTile(x-1,y) == 9) {
	    				gameOver(x-1,y,"right");
	    		}else if(getTile(x,y-1) == 4 || getTile(x,y-1) == 5 || getTile(x,y-1) == 8) {
	    				gameOver(x, y-1 ,"bottom");
	    		}else {
    				finalOverlay(false);
    			}

    			break;
    		case 3:
    			//end

    			return true;
    			break;
    		case 4:
    			//pipes
    			if(direction === "bottom") {
	    			if(getTile(x+1,y) == 5 || getTile(x+1,y) == 6  || getTile(x+1,y) == 9) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x+1,y,"left");
	    			} else if(getTile(x+1,y) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			} else {
	    				finalOverlay(false);
	    			}
	    		} else { // checking underneath
	    			if(getTile(x,y+1) == 6 || getTile(x,y+1) == 7 || getTile(x,y+1) == 8) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x, y+1 ,"top");
	    			} else if(getTile(x,y+1) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			}else {
	    				finalOverlay(false);
	    			}
	    		}
    			return false;
    			break;
    		case 5:
    			if(direction === "left") {
	    			if(getTile(x,y+1) == 6 || getTile(x,y+1) == 7 || getTile(x,y+1) == 8) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x , y+1,"top");
	    			}else if(getTile(x,y+1) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			}else {
	    				finalOverlay(false);
	    			}
	    		} else { 
	    			if(getTile(x-1,y) == 4 || getTile(x-1,y) == 7 || getTile(x-1,y) == 9) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x-1,y ,"right");
	    			} else if(getTile(x-1,y) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			} else {
	    				finalOverlay(false);
	    			}
	    		}
    			return false;
    			break;
    		case 6:
    			if(direction === "top") {
	    			if(getTile(x-1,y) == 4 || getTile(x-1,y) == 7 || getTile(x-1,y) == 9) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x-1,y,"right");
	    			} else if(getTile(x-1,y) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			} else {
	    				finalOverlay(false);
	    			}
	    		} else {
	    			if(getTile(x,y-1) == 4 || getTile(x,y-1) == 5 || getTile(x,y-1) == 8) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x, y-1 ,"bottom");
	    			} else if(getTile(x,y-1) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			}else {
	    				finalOverlay(false);
	    			}
	    		}
    			return false;
    			break;
    		case 7:
    			if(direction === "top") {
	    			if(getTile(x+1,y) == 5 || getTile(x+1,y) == 6 || getTile(x+1,y) == 9) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x+1,y,"left");
	    			} else if(getTile(x+1,y) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			}else {
	    				finalOverlay(false);
	    			}
	    		} else {
	    			if(getTile(x,y-1) == 4 || getTile(x,y-1) == 5 || getTile(x,y-1) == 8) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x, y-1,"bottom");
	    			} else if(getTile(x,y-1) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			} else {
	    				finalOverlay(false);
	    			}
	    		}
    			return false;
    			break;	
    		case 8:

    			if(direction === "bottom") {
	    			if(getTile(x,y-1) == 4 || getTile(x,y-1) == 5 || getTile(x,y-1) == 8) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x,y-1,"bottom");
	    			} else if(getTile(x,y-1) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			} else {
	    				finalOverlay(false);
	    			}
	    		} else {
	    			if(getTile(x,y+1) == 6 || getTile(x,y+1) == 7 || getTile(x,y+1) == 8) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x, y+1 ,"top");
	    			} else if (getTile(x,y+1) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			} else {
	    				finalOverlay(false);
	    			}
	    		}
    			return false;
    			break;
    		case 9:
    			if(direction === "left") {
	    			if(getTile(x+1,y) == 5 || getTile(x+1,y) == 6 || getTile(x+1,y) == 9) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x+1,y,"left");
	    			} else if(getTile(x+1,y) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			}else {
	    				finalOverlay(false);
	    			}
	    		} else {
	    			if(getTile(x-1,y) == 4 || getTile(x-1,y) == 7 || getTile(x-1,y) == 9) {
	    				display.waterPipe(test, x, y);
	    				gameOver(x-1, y ,"right");
	    			} else if(getTile(x-1,y) == 3){
	    				display.waterPipe(test, x, y);
	    				finalOverlay(true);
	    			} else {
	    				finalOverlay(false);
	    			}
	    		}    		
    			return false;
    			break;
    	}
    }

	function print() {
		var str = "";
		for(var y = 0; y < rows; y++ ) {
			for (var x = 0; x < cols; x++) {
				str += getTile(x,y) + " ";
			}
			str += "\n";
		}

		console.log(str);
	}

	function finalOverlay(win) {
		game_over = true;

		var display = pipeGame.display;

		setTimeout(function() {
			finalScreen(win);
		}, 2500);
	}


	function finalScreen(win) {
		var dom = pipeGame.dom;
		var $ = dom.$;
		var overlay = $("#screen-game .final-overlay")[0];
		var text = $("#screen-game .final-text")[0];
		overlay.style.display = "block";

		if(win) {
			text.innerHTML = "Good Job";
		} else {
			text.innerHTML = "Maybe next time";
		}
	}

	function getgamestate() { return game_over;	}

	function setgamestate(value) { game_over = value; }


	return {
		init : init,
		//swap : swap,
		// canSwap : canSwap,
		getBoard : getBoard,
		getpipes : getpipes,
		gameOver : gameOver,
		fillPipes : fillPipes,
		placePipe: placePipe,
		getgamestate : getgamestate,
		setgamestate : setgamestate,
		print : print
	};

})(); 