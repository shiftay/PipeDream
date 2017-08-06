pipeGame.screens["screen-about"] = (function(){
	var firstRun = true;
	var dom = pipeGame.dom;

	function setup() {
		dom.bind("#screen-about footer", "click", function(e){
			if(e.target.nodeName.toLowerCase() === "footer") {
				var action = e.target.getAttribute("name");
				pipeGame.showScreen(action);
			}
		});
	}

	function run() {
		if(firstRun){
			setup();
			firstRun = false;
		}
	}

	return {
		run : run
	};


})();