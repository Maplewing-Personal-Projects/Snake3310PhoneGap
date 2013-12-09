var hide = function(e, callback){
	e.style.opacity = "0";
	setTimeout(function(){ 
		e.style.display = "none";
		callback();
	}, 300);
}

var show = function(e, callback, display){
	e.style.display = display;
	e.style.opacity = "1";
	setTimeout(callback, 300);
}

Setting = { 
	speed: 5,
	convertDifficulty: {
		'3' : 'Difficult',
		'5' : 'Normal',
		'10' : 'Easy'
	}
 };

var eventCleaner = [];

window.addEventListener("load", function(){
	if( !window.localStorage.maxScore ){
		window.localStorage.maxScore = JSON.stringify({
			'3': 0,
			'5': 0,
			'10': 0
		});
	}

	if( !JSON.parse(window.localStorage.maxScore)['5'] ){
		window.localStorage.maxScore = JSON.stringify({
			'3': 0,
			'5': parseInt(JSON.parse(window.localStorage.maxScore)),
			'10': 0
		});
	}

	var maxScoreStorage = JSON.parse(window.localStorage.maxScore);
	if( !maxScoreStorage['5'] ){
		maxScoreStorage['5'] = 0;
		window.localStorage.maxScore = JSON.stringify(maxScoreStorage);
	}


	var gameStart = function(){
		hide( document.getElementById('gameMenu'), function(){

			var gameMain = document.getElementById("gameMain");
			var game = new Game(gameMain);
			var pause = document.getElementById('pause');

			var exitGame = function(){
				pauseToggle("pause");
				if(confirm('Are you sure to leave the game?')){
					hide( document.getElementById('gameContent'), function(){
						game.exit();
						document.getElementById('pauseMessage').style.height = "0px";
						document.getElementById('gameoverMessage').style.height = "0px";
						show( document.getElementById('gameMenu'), function(){
							document.getElementById('startGame').addEventListener('click', gameStart );
						}, "block" );
					});
				}
			};
			document.getElementById('startGame').removeEventListener('click', gameStart );
			game.pause = false;
			pause.innerHTML = '<img src="img/pause.png" />';
			document.getElementById('pauseMessage').style.height = "0px";

			game.gameover = false;

			game.score = 0;

			game.map = {
				x: 32,
				y: 18,
				dot: {x: 5, y: 5}
			};

			game.snake = { 
				position: [{ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 }],
				speed: Setting.speed,
				now: 0,
				faceTo: { x: 1, y: 0 },
				changeFace: false
			};

			var checkCollision = function(point){
				for( var i = 0 ; i < game.snake.position.length ; ++i ){
					if( point.x === game.snake.position[i].x &&
						point.y === game.snake.position[i].y ){
						return true;
					}
				}
				return false;
			}

			
			var pauseToggle = function(value){
				if( value === 'pause' && game.pause ) return;
				if( value === 'continue' && !game.pause ) return;
				if(game.pause){
					pause.innerHTML = '<img src="img/pause.png" />';
					document.getElementById('pauseMessage').style.height = "0px";
				}
				else{
					pause.innerHTML = '<img src="img/play.png" />';
					document.getElementById('pauseMessage').style.height = "70px";
				}
				game.pause = !game.pause;
			}

			if(eventCleaner[0]){ 
				window.removeEventListener('blur', eventCleaner[0]);
			} 
			eventCleaner[0] = function(){
				pauseToggle('pause');
			};
			window.addEventListener('blur', eventCleaner[0]);

			if(!eventCleaner[1]){ 
				pause.removeEventListener('click', eventCleaner[1]);
			}
			eventCleaner[1] = function(){
				pauseToggle();
			};
			pause.addEventListener('click', eventCleaner[1]);

			game.onUpdate(function(){
				if(!this.pause && !this.gameover){
					var map = this.map;
					var snake = this.snake;
					var position = { x: snake.position[0].x, y: snake.position[0].y };
					++snake.now;
					if(snake.now > snake.speed){
						position.x = (position.x + snake.faceTo.x + map.x) % map.x;
						position.y = (position.y + snake.faceTo.y + map.y) % map.y;
						snake.now %= snake.speed;
						if(position.x === map.dot.x && position.y === map.dot.y){
							snake.position.unshift({ x: map.dot.x, y: map.dot.y });
							do{
								map.dot.x = Math.floor((Math.random()*map.x));
								map.dot.y = Math.floor((Math.random()*map.y));
							}while(checkCollision(map.dot));
							this.score += 10;
						}
						else if(checkCollision(position)){
							this.gameover = true;
							var gameover = document.getElementById('gameoverMessage');
							gameover.innerHTML = "<span style='color: red'>Game Over</span>";
							gameover.innerHTML += "<br /><span style='font-size: 30px'>Score: " + this.score.toString() + "</span>";
							gameover.style.height = "150px";
							if( this.score > maxScoreStorage[this.snake.speed] ){
								maxScoreStorage[this.snake.speed] = this.score;
								window.localStorage.maxScore = JSON.stringify(maxScoreStorage);
								document.getElementById('maxScore').innerHTML = maxScoreStorage[this.snake.speed].toString() + "(" + Setting.convertDifficulty[Setting.speed] + ")";
							}
						}
						else{
							snake.position[snake.position.length-1] = position;
							snake.position.unshift(snake.position[snake.position.length-1]);
							snake.position.length--;
						}
						snake.changeFace = false;
					}

					document.getElementById('score').innerHTML = this.score.toString();

				}
			});
			game.onDraw(function(width, height){
				var map = this.map;
				var snake = this.snake;
				var ctx = this.canvas.getContext("2d");
				ctx.strokeStyle = "#6A6C3A";
				ctx.fillStyle = "#6A6C3A";
				for( var i = 0 ; i < snake.position.length ; ++i ){
					ctx.fillRect(width/map.x * snake.position[i].x,
					  height/map.y * snake.position[i].y,
					  width/map.x, height/map.y);
					ctx.strokeRect(width/map.x * snake.position[i].x,
					  height/map.y * snake.position[i].y,
					  width/map.x, height/map.y);
				}
				ctx.fillRect(width/map.x * map.dot.x,
				  height/map.y * map.dot.y,
				  width/map.x, height/map.y);
				ctx.strokeRect(width/map.x * map.dot.x,
				  height/map.y * map.dot.y,
				  width/map.x, height/map.y);
			});

			game.onKeyboardControl(function(event){
				controlHandler(event.keyCode);
			});

			var controlHandler = function(control){
				document.getElementById('touchPanel').style.opacity = "0";
				if(!game.pause){
					switch(control){
						case 37:
							if(!game.snake.changeFace && game.snake.faceTo.x === 0){
								game.snake.faceTo = {x: -1, y: 0};
								game.snake.changeFace = true;
							}
						break;
						case 38:
							if(!game.snake.changeFace && game.snake.faceTo.y === 0){
								game.snake.faceTo = {x: 0, y: -1};
								game.snake.changeFace = true;
							}
						break;
						case 39:
							if(!game.snake.changeFace && game.snake.faceTo.x === 0){
								game.snake.faceTo = {x: 1, y: 0};
								game.snake.changeFace = true;
							}
						break;
						case 40:
							if(!game.snake.changeFace && game.snake.faceTo.y === 0){
								game.snake.faceTo = {x: 0, y: 1};
								game.snake.changeFace = true;
							}
						break;
					}
				}
				if(control === 27){
					if(game.gameover) exitGame();
					else pauseToggle();
				}
			}

			var controlAnimation = function(e){
				e.className = 'control active';
				setTimeout( function(){ e.className = 'control'; }, 300);
			}
			var upControl = document.getElementById('upControl'),
				downControl = document.getElementById('downControl'),
				leftControl = document.getElementById('leftControl'),
				rightControl = document.getElementById('rightControl');

			if(eventCleaner[2]){ window.removeEventListener('touchstart', eventCleaner[2]); }
			eventCleaner[2] = function(e){
				document.getElementById('touchPanel').style.opacity = "1";
			};
			window.addEventListener('touchstart', eventCleaner[2]);

			if(eventCleaner[3]){ window.removeEventListener('mousedown', eventCleaner[3]); }
			eventCleaner[3] = function(e){
				document.getElementById('touchPanel').style.opacity = "1";
			};
			window.addEventListener('mousedown', eventCleaner[3]);
			/*
			if(eventCleaner[4]){ window.removeEventListener('touchcancel', eventCleaner[4]); }
			eventCleaner[4] = function(e){
				document.getElementById('touchPanel').style.opacity = "1";
			};
			window.addEventListener('touchcancel', eventCleaner[4]);
			*/

			if(eventCleaner[5]){ upControl.removeEventListener('touchstart', eventCleaner[5]); }
			eventCleaner[5] = function(e){
				e.preventDefault();
				controlAnimation(upControl);
				controlHandler(38);
			};
			upControl.addEventListener('touchstart', eventCleaner[5]);
			if(eventCleaner[6]){ upControl.removeEventListener('mousedown', eventCleaner[6]); }
			eventCleaner[6] = function(e){
				e.preventDefault();
				controlAnimation(upControl);
				controlHandler(38);
			};
			upControl.addEventListener('mousedown', eventCleaner[6]);
			/*if(eventCleaner[7]){ upControl.removeEventListener('touchcancel', eventCleaner[7]); }
			eventCleaner[7] = function(e){
				e.preventDefault();
				controlAnimation(upControl);
				controlHandler(38);
			};
			upControl.addEventListener('touchcancel', eventCleaner[7]);
			*/
			if(eventCleaner[8]){ downControl.removeEventListener('touchstart', eventCleaner[8]); }
			eventCleaner[8] = function(e){
				e.preventDefault();
				controlAnimation(downControl);
				controlHandler(40);
			};
			downControl.addEventListener('touchstart', eventCleaner[8]);
			if(eventCleaner[9]){ downControl.removeEventListener('mousedown', eventCleaner[9]); }
			eventCleaner[9] = function(e){
				e.preventDefault();
				controlAnimation(downControl);
				controlHandler(40);
			};
			downControl.addEventListener('mousedown', eventCleaner[9]);
			/*if(eventCleaner[10]){ downControl.removeEventListener('touchcancel', eventCleaner[10]); }
			eventCleaner[10] = function(e){
				e.preventDefault();
				controlAnimation(downControl);
				controlHandler(40);
			};
			downControl.addEventListener('touchcancel', eventCleaner[10]);
			*/
			if(eventCleaner[11]){ leftControl.removeEventListener('touchstart', eventCleaner[11]); }
			eventCleaner[11] = function(e){
				e.preventDefault();
				controlAnimation(leftControl);
				controlHandler(37);
			};
			leftControl.addEventListener('touchstart', eventCleaner[11]);
			if(eventCleaner[12]){ leftControl.removeEventListener('mousedown', eventCleaner[12]); }
			eventCleaner[12] = function(e){
				e.preventDefault();
				controlAnimation(leftControl);
				controlHandler(37);
			};
			leftControl.addEventListener('mousedown', eventCleaner[12]);
			/*
			if(eventCleaner[13]){ leftControl.removeEventListener('touchcancel', eventCleaner[13]); }
			eventCleaner[13] = function(e){
				e.preventDefault();
				controlAnimation(leftControl);
				controlHandler(37);
			};
			leftControl.addEventListener('touchcancel', eventCleaner[13]);
			*/
			if(eventCleaner[14]){ rightControl.removeEventListener('touchstart', eventCleaner[14]); }
			eventCleaner[14] = function(e){
				e.preventDefault();
				controlAnimation(rightControl);
				controlHandler(39);
			};
			rightControl.addEventListener('touchstart', eventCleaner[14]);
			if(eventCleaner[15]){ rightControl.removeEventListener('mousedown', eventCleaner[15]); }
			eventCleaner[15] = function(e){
				e.preventDefault();
				controlAnimation(rightControl);
				controlHandler(39);
			};
			rightControl.addEventListener('mousedown', eventCleaner[15]);
			/*
			if(eventCleaner[16]){ rightControl.removeEventListener('touchcancel', eventCleaner[16]); }
			eventCleaner[16] = function(e){
				e.preventDefault();
				controlAnimation(rightControl);
				controlHandler(39);
			};
			rightControl.addEventListener('touchcancel', eventCleaner[16]);
			*/
			game.run(500);
			show( document.getElementById('gameContent'), function(){}, "inline-block");

			if(eventCleaner[17]){ document.getElementById('exit').removeEventListener('click', eventCleaner[17]); }
			eventCleaner[17] = exitGame;
			document.getElementById('exit').addEventListener('click', eventCleaner[17]);
		});
	};

	document.getElementById('maxScore').innerHTML = maxScoreStorage[Setting.speed].toString() + "(" + Setting.convertDifficulty[Setting.speed] + ")";
	document.getElementById('startGame').addEventListener('click', gameStart );
	document.getElementById('option').addEventListener('click', function(){
		hide(document.getElementById('gameMenu'), function(){
			show(document.getElementById('gameOption'), function(){}, "block");
		});
	});
	document.getElementById('back').addEventListener('click', function(){
		hide(document.getElementById('gameOption'), function(){
			show(document.getElementById('gameMenu'), function(){}, "block");
		});
	});

	document.getElementById('difficulty').addEventListener('change',function(event){
		Setting.speed = parseInt(document.getElementById('difficulty').value);
		document.getElementById('maxScore').innerHTML = maxScoreStorage[Setting.speed].toString() + "(" + Setting.convertDifficulty[Setting.speed] + ")";
	});
	document.body.addEventListener('contextmenu', function(event){
		event.preventDefault();
	});
}, false);
