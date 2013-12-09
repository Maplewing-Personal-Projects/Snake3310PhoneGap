var Game = (function(){
	function Game(canvas){
		this.canvas = canvas;
		if(typeof canvas === 'string'){
			this.canvas = document.getElementById(canvas);
		}

		this.update = [];
		this.draw = [];

		var that = this;
		var resize = function(){ 
			var width = window.innerWidth * 0.8;
			var height = window.innerHeight;

			if( height * Game.ratio > width ){
				that.canvas.width = width;
				that.canvas.height = width / Game.ratio;
			}
			else{
				that.canvas.width = height * Game.ratio;
				that.canvas.height = height;
			}
		};
		resize();
		window.addEventListener('resize', resize);

	}

	Game.prototype.clear = function(){
		var ctx = this.canvas.getContext("2d");
		// Store the current transformation matrix
		ctx.save();

		// Use the identity matrix while clearing the canvas
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Restore the transform
		ctx.restore();
	};

	Game.prototype.onUpdate = function(f){
		this.update.push(f);
	};

	Game.prototype.onDraw = function(f){
		this.draw.push(f);
	};

	Game.prototype.onKeyboardControl = function(f){
		this._control = f;
		window.addEventListener('keydown', f);
	}

	Game.prototype.run = function(time){
		var that = this;
		this._delay = function(){
			that._runID = setInterval( that._run, 1000/60 );
		};
		this._run = function(){
			for( var i = 0 ; i < that.update.length ; ++i ){
				that.update[i].call(that, that.canvas.width, that.canvas.height);
			}
			that.clear();
			for( var i = 0 ; i < that.draw.length ; ++i ){
				that.draw[i].call(that, that.canvas.width, that.canvas.height);
			}
		};
		this._delayID = setTimeout( this._delay, time );
	}

	Game.prototype.exit = function(){
		window.removeEventListener('keyup', this._control);
		clearTimeout(this._delayID);
		clearInterval(this._runID);
	}

	Game.ratio = 16 / 9;

	return Game;
})();