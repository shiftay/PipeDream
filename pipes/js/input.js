pipeGame.input = (function() {
	var inputHandlers;

	function init() {
		var dom = pipeGame.dom;
		var $ = dom.$;
		var controls = pipeGame.settings.controls;
		var board = $("#screen-game .game-board")[0];
		var pipes = $("#screen-game .game-hud")[0];
		inputHandlers = {};

		dom.bind(board, "mousedown", function(event) {
			handleClick(event, "CLICK", event);
		});
		dom.bind(board, "touchstart", function(event) {
			handleClick(event, "TOUCH", event.targetTouches[0]);
		});

		dom.bind(pipes, "mousedown", function(event) {
			handlePipesClick(event, "CLICK", event);
		});
		dom.bind(pipes, "touchstart", function(event) {
			handlePipes(event, "TOUCH", event.targetTouches[0]);
		});

	}

	function handlePipes(event, control, click) {
		var settings = pipeGame.settings;
		var action = settings.controls[control];

		if(!action) {
			return;
		}

		var pipes = pipeGame.dom.$("#screen-game .game-hud")[0];
		var pipeRect = pipes.getBoundingClientRect();
		var relaX, relaY;
		var pipeX, pipeY;

		relaX = click.clientX - pipeRect.left;
		relaY = click.clientY - pipeRect.top;

		pipeX = Math.floor(relaX / pipeRect.width * 5); // i dont know?
		pipeY = Math.floor(relaY / pipeRect.height);

		trigger(action, pipeX, pipeY, true);
		event.preventDefault();
	}

	function handlePipesClick(event, control, click) {
		var settings = pipeGame.settings;
		var action = settings.controls[control];

		if(!action) {
			return;
		}

		var pipes = pipeGame.dom.$("#screen-game .game-hud")[0];
		var pipeRect = pipes.getBoundingClientRect();
		var relaX, relaY;
		var pipeX, pipeY;

		relaX = click.clientX - pipeRect.left;
		relaY = click.clientY - pipeRect.top;

		pipeX = Math.floor(relaX / pipeRect.width * 7.5); // i dont know?
		pipeY = Math.floor(relaY / pipeRect.height);

		trigger(action, pipeX, pipeY, true);
		event.preventDefault();
	}


	function handleClick(event, control, click) {
		var settings = pipeGame.settings;
		var action = settings.controls[control];

		if(!action) {
			return;
		}

		var board = pipeGame.dom.$("#screen-game .game-board")[0];
		var rect = board.getBoundingClientRect();
		var relX, relY;
		var tileX, tileY;

		relX = click.clientX - rect.left;
		relY = click.clientY - rect.top;

		tileX = Math.floor(relX / rect.width * settings.cols);
		tileY = Math.floor(relY / rect.height * settings.rows);

		trigger(action, tileX, tileY, false);
		event.preventDefault();
	}


	function bind(action, handler) {
		if(!inputHandlers[action]) {
			inputHandlers[action] = [];
		}
		inputHandlers[action].push(handler);
	}

	function trigger(action) {
		var handlers = inputHandlers[action];
		var args = Array.prototype.slice.call(arguments, 1);
		// console.log("Game action: " + action);

		if(handlers) {
			for(var i = 0; i < handlers.length; i++) {
				handlers[i].apply(null, args);
			}
		}
	}

	return {
		init: init,
		bind: bind
	}

})();