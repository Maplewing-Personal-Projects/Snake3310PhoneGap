var Canvas = (function(){

	function Canvas(canvas, ratio){
		this.canvas = canvas;
		if(typeof canvas === 'string'){
			this.canvas = document.getElementById(canvas);
		}

		this.ratio = ratio;
		if( !ratio ) this.ratio = 16 / 9;

		this.draw = [];
	}

	Canvas.prototype.Resize = function(){
		var width = window.innerWidth;
		var height = window.innerHeight;

		if( height * this.ratio > width ){
			this.canvas.width = width;
			this.canvas.height = width / this.ratio;
		}
		else{
			this.canvas.width = height * this.ratio;
			this.canvas.height = height;
		}

		for( var i = 0 ; i < this.draw.length ; ++i ){
			this.draw[i].call(this);
		}
	};

	Canvas.prototype.addDraw = function(f){
		this.draw.push(f);
	}

	return Canvas;
})();