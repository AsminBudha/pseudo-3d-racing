class Game{

	constructor(){
		GAME_VARIABLES.canvas.height = GAME_VARIABLES.CANVAS_HEIGHT;
		GAME_VARIABLES.canvas.width = GAME_VARIABLES.CANVAS_WIDTH;

		this.position = 0;

		gameThat=this;

		this.keyPressedFlags=[false,false,false,false];//LEFT , UP , RIGHT , DOWN
	}

	start(){
		this.timer=0;

		this.road = new Road();
		this.player = new Car();

		this.playerSprites=[];

		let totalImg=0;
		let onLoad=()=>{
			totalImg++;
			if(totalImg==IMAGES_SRC.length){
				document.addEventListener('keydown',this.keyDownHandler);
				document.addEventListener('keyup',this.keyUpHandler);

				this.road.renderRoad(gameThat.position,gameThat.player,gameThat.playerSprites);
				this.lastTime=Date.now();
				this.currentTime=this.lastTime;
				this.fpsInterval=1000/GAME_VARIABLES.fps;
				this.frame();
			}
		};

		for(let i=0;i<IMAGES_SRC.length;i++){
			let imgObj=new Image();
			imgObj.onload=onLoad();
			imgObj.src=IMAGES_SRC[i];
			this.playerSprites.push(imgObj);
		}

	}

	frame() {

		requestAnimationFrame(gameThat.frame);

		gameThat.currentTime=Date.now();
		let elapsed=(gameThat.currentTime - gameThat.lastTime);
		
		console.log(elapsed)
		if(elapsed>gameThat.fpsInterval){

			if(gameThat.player.speed){
				gameThat.road.renderRoad(gameThat.position,gameThat.player,gameThat.playerSprites
					,gameThat.keyPressedFlags[0],gameThat.keyPressedFlags[2]);
			}

			if(gameThat.keyPressedFlags[1]){
				gameThat.player.updateSpeed(elapsed);
			}
			gameThat.position+=	GAME_VARIABLES.segmentLength;
			gameThat.position=(gameThat.position+GAME_VARIABLES.segmentLength*gameThat.road.segments.length)%(GAME_VARIABLES.segmentLength*gameThat.road.segments.length);

			gameThat.player.position=gameThat.position;
			gameThat.lastTime=gameThat.currentTime - (elapsed%gameThat.fpsInterval);

			gameThat.update();	
		}
	}

	update(){
		if(gameThat.keyPressedFlags[0]){
			gameThat.player.playerX-=0.01;
		}
		else if(gameThat.keyPressedFlags[2]){
			gameThat.player.playerX+=0.01;
		}
	}

	keyDownHandler(e){
		//arrow key ranges from 37-40 with 37=LEFT in clockwise
		gameThat.keyPressedFlags[e.keyCode-37]=true;
		// console.log(e.keyCode)
	}

	keyUpHandler(e){
		//arrow key ranges from 37-40 with 37=LEFT in clockwise
		gameThat.keyPressedFlags[e.keyCode-37]=false;
	}

}
let gameThat=null;
new Game().start();