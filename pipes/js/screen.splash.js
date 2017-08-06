pipeGame.screens["screen-splash"] = (function(){

	var firstRun = true;

	function checkProgess() {
		var $ = pipeGame.dom.$;
		var p = pipeGame.getLoadProgress() * 100;

		$("#screen-splash .indicator")[0].style.width = p + "%";

		if(p == 100) {
			setup();
		} else {
			setTimeout(checkProgess, 30); // timer function gives control to browser.
		}
	}


	function setup() {
		var dom = pipeGame.dom;
		var $ = dom.$;
		var screen = $("#screen-splash")[0];
		$(".continue", screen)[0].style.display = "block";

		dom.bind("#screen-splash", "click", function() {
			pipeGame.showScreen("screen-menu");
		});
	}

	function run() {
		if(firstRun) {
			checkProgess();
			firstRun = false;
		}
	}

	return {
		run: run
	};

})();