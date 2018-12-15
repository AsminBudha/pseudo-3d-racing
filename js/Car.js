class Car{

	constructor(){
		this.playerX = 0;
		this.playerZ = (GAME_VARIABLES.cameraHeight * GAME_VARIABLES.cameraDepth)+20;
		this.position=0;
		this.speed=0;
    this.maxSpeed       = GAME_VARIABLES.segmentLength/GAME_VARIABLES.step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
    this.accel          =  this.maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
    this.breaking       = -this.maxSpeed;               // deceleration rate when braking
    this.decel          = -this.maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
    this.offRoadDecel   = -this.maxSpeed/2;             // off road deceleration is somewhere in between
    this.offRoadLimit   =  this.maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. 
	}
	
	renderPlayer(ctx, width, height, resolution, roadWidth, sprites, speedPercent, scale, destX, destY, steer, updown) {
		ctx.save();
		let choices=[-1,1];
    let random=this.getRandomInt(0,2);
    let choice=choices[random];
	  let bounce = (1.5 * Math.random() * speedPercent * resolution) * choice;
	  let sprite =sprites[IMAGES.PLAYER_STRAIGHT];
	  // console.log(updown);
	  // updown=0;
    if (steer < 0){
    // ctx.rotate(60 * Math.PI / 180);
      sprite = (updown > 0) ? sprites[IMAGES.PLAYER_UPHILL_LEFT] : sprites[IMAGES.PLAYER_LEFT];
    }
    else if (steer > 0){
      sprite = (updown > 0) ? sprites[IMAGES.PLAYER_UPHILL_RIGHT] : sprites[IMAGES.PLAYER_RIGHT];
    }
    else
      sprite = (updown > 0) ? sprites[IMAGES.PLAYER_UPHILL_STRAIGHT] : sprites[IMAGES.PLAYER_STRAIGHT];
	    // console.log(choice,random);
	  this.renderSprite(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1);
	 	ctx.restore();
	};

  renderSprite(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY, offsetX, offsetY, clipY) {

    let spriteScale= 0.3 * (1/sprite.width);
    // console.log(spriteScale)
    var destW  = (sprite.width * scale * width/2) * (spriteScale * roadWidth);
    var destH  = (sprite.height * scale * width/2) * (spriteScale * roadWidth);

    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));

    var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;
    // console.log(clipH,destH);	
    if (clipH < destH){
    	// console.log(sprite)
    	// console.log(destX,destY,destW,destH-clipH)
      ctx.drawImage(sprite, destX, destY, destW, destH - clipH);
    }

  };

  updateSpeed(elapsed){
  	let speedChange = this.acceleration;// * (elapsed);
  	// console.log(this.speed+speedChange);
  	if(this.speed+speedChange<this.maxSpeed){
  		this.speed+=speedChange;
  		console.log(this.speed)
  	}
  }

  getRandomInt(min, max) {
	  min = Math.ceil(min);
	  max = Math.floor(max);
	  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}

}

