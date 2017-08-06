// Anonymous function requires '()' at the end
var pipeGame = (function() {
	// Array
	var scriptQueue = [];
	var numResourcesLoaded = 0;
	var numResources = 0;
	var executeRunning = false;
	var settings = {
		rows: 8,
		cols: 8,
		baseTimer : 60000,
		numGridType: 2,
		numPipes: 6,
		controls : {
			KEY_UP : "moveUp",
			KEY_LEFT : "moveLeft",
			KEY_DOWN : "moveDown",
			KEY_RIGHT : "moveRight",
			KEY_ENTER : "selectTile",
			KEY_SPACE : "selectTile",
			CLICK : "selectTile",
			TOUCH : "selectTile"
		}
	};

	function getLoadProgress() {
		return numResourcesLoaded / numResources;
	}

	function executeScriptQueue() {
		var next = scriptQueue[0];
		var first;
		var script;

		if(next && next.loaded) {
			executeRunning = true;
			// remove the first item from the queue
			scriptQueue.shift();
			first = document.getElementsByTagName("script")[0];
			script = document.createElement("script");
			script.onload = function() {
				if(next.callback) {
					next.callback();
				}
				// try to execute more
				executeScriptQueue();
			};
			script.src = next.src;
			first.parentNode.insertBefore(script, first);
		} else {
			executeRunning = false;
		}
	}

	function load(src, callback) {
		var image;
		var queueEntry;

		numResources++;

		// add resources to executionQueue
		queueEntry = {
			src: src,
			callback: callback,
			loaded: false
		};

		scriptQueue.push(queueEntry);

		image = new Image();
		image.onload = image.onerror = function() {
			numResourcesLoaded++;
			queueEntry.loaded = true;
			if(!executeRunning) {
				executeScriptQueue();
			}
		};
		
		image.src = src;
	}


	function detectOS() {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;

		// Windows Phone must come first because its UA also contains "Android"
		if (/windows phone/i.test(userAgent)) {
			return "Windows Phone";
		}

		if (/android/i.test(userAgent)) {
			return "Android";
		}

		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			return "iOS";
		}

		return "unknown"; 

	}

	// TODO: fix this
	function isStandalone() {
		if(detectOS() === "iOS") {
			return (window.navigator.standalone !== false);
			console.log("ios");
		} else {
			return (window.matchMedia('(display-mode: standalone)').matches);
			console.log("android/other");
		}
	}

	// TODO: fix this
	function setup() {
		// if (isStandalone()) {
			pipeGame.showScreen("screen-splash");
		// } else {
		// 		pipeGame.showScreen("screen-install");
		// 	if(pipeGame.detectOS() === "iOS") {
		// 		pipeGame.showScreen("screen-install-apple");
		// 	} else {
		// 		pipeGame.showScreen("screen-install-android");
		// 	}
		// }
	}

	function showScreen(screenId) {
		var dom = pipeGame.dom;
		var $ = dom.$;
		var activeScreen = $("#game .screen.active")[0];
		var screen = $("#" + screenId)[0];

		if(!pipeGame.screens[screenId]) {
			console.warn("Screen module " + screenId + " is not implemented yet.");
			return; //TODO: clean this shit up
		}

		if(activeScreen) {
			dom.removeClass(activeScreen, "active");
		}

		dom.addClass(screen, "active");
		pipeGame.screens[screenId].run();
	}

	function hasWebWorkers() {
		return ("Worker" in window);
	}

	function preload(src) {
		var image = new Image();
		image.src = src;
	}

	return {
		load: load,
		setup: setup,
		showScreen: showScreen,
		isStandalone: isStandalone,
		detectOS: detectOS,
		settings: settings,
		hasWebWorkers : hasWebWorkers,
		preload : preload,
		getLoadProgress : getLoadProgress,
		screens: {}
	};

})();