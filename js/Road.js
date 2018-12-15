class Road{
	
	constructor(){
		this.totalLenghtOfRoad=0;
		this.segments=[];
		this.initSegment();
	}
	
	initSegment(){
		trackMap.forEach((item)=>{

			let length=Math.floor(item.length/3);
			
			this.addRoad(length,length,length,item.curve,item.height);
			
			this.totalLenghtOfRoad+=item.length;
			
		});

	}

	renderRoad(position,player,sprites,keyLeft,keyRight){

		let playerX=player.playerX;
		let playerZ=player.playerZ;
		let playerSegment = this.findSegment(position+playerZ);

		player.playerX = player.playerX - (playerSegment.curve * GAME_VARIABLES.centrifugal);

		GAME_VARIABLES.ctx.clearRect(0, 0, GAME_VARIABLES.CANVAS_WIDTH, GAME_VARIABLES.CANVAS_HEIGHT);
		
		var baseSegment = this.findSegment(position);
		var maxy        = GAME_VARIABLES.CANVAS_HEIGHT;
		var n, segment;

		var basePercent   = this.percentRemaining(position, GAME_VARIABLES.segmentLength);
		var dx = - (baseSegment.curve * basePercent), x = 0;

		var playerPercent = this.percentRemaining(position+playerZ, GAME_VARIABLES.segmentLength);
		var playerY = this.interpolate(baseSegment.p1.world.y, baseSegment.p2.world.y, playerPercent);      

		for(n = 0 ; n <GAME_VARIABLES.drawDistance ; n++) {

		  segment = this.segments[(baseSegment.index + n) % this.segments.length];

		  segment.looped= segment.index<baseSegment.index;

		  
	    
	    this.project(segment.p1, (playerX * GAME_VARIABLES.roadWidth)-x, playerY+GAME_VARIABLES.cameraHeight
		  	, position-((segment.looped)?this.segments.length*GAME_VARIABLES.segmentLength:0)
		  	, GAME_VARIABLES.cameraDepth, GAME_VARIABLES.CANVAS_WIDTH, GAME_VARIABLES.CANVAS_HEIGHT, GAME_VARIABLES.roadWidth);
		  
		  this.project(segment.p2, (playerX * GAME_VARIABLES.roadWidth)-dx-x, playerY+GAME_VARIABLES.cameraHeight
		  	, position-((segment.looped)?this.segments.length*GAME_VARIABLES.segmentLength:0)
		  	, GAME_VARIABLES.cameraDepth, GAME_VARIABLES.CANVAS_WIDTH, GAME_VARIABLES.CANVAS_HEIGHT, GAME_VARIABLES.roadWidth);
		  
		  x += dx;
		  dx += segment.curve; 

		  if ((segment.p1.camera.z <= GAME_VARIABLES.cameraDepth)         || // behind us
	      (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
	      (segment.p2.screen.y >= maxy))                  // clip by (already rendered) segment
	    continue;
		  
		  this.drawRoadSegment(GAME_VARIABLES.ctx, GAME_VARIABLES.CANVAS_WIDTH, GAME_VARIABLES.lanes,
	             segment.p1.screen.x,
	             segment.p1.screen.y,
	             segment.p1.screen.w,
	             segment.p2.screen.x,
	             segment.p2.screen.y,
	             segment.p2.screen.w,
	             segment.color);
		  
		  if(segment.index==8){
		  	GAME_VARIABLES.ctx.fillStyle = 'white';
				GAME_VARIABLES.ctx.fillRect(0, segment.p2.screen.y, GAME_VARIABLES.CANVAS_WIDTH, segment.p1.screen.y - segment.p2.screen.y);
		  }

	  	if (segment == playerSegment) {

	  	}

		  maxy = segment.p2.screen.y;
		}
		// console.log(playerSegment);
      player.renderPlayer(GAME_VARIABLES.ctx, GAME_VARIABLES.CANVAS_WIDTH, GAME_VARIABLES.CANVAS_HEIGHT
      	, GAME_VARIABLES.resolution, GAME_VARIABLES.roadWidth, sprites, GAME_VARIABLES.speed/GAME_VARIABLES.maxSpeed
      	, GAME_VARIABLES.cameraDepth/playerZ, GAME_VARIABLES.CANVAS_WIDTH/2
      	, (GAME_VARIABLES.CANVAS_HEIGHT/2) - (GAME_VARIABLES.cameraDepth/playerZ * this.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * GAME_VARIABLES.CANVAS_HEIGHT/2)
      	, GAME_VARIABLES.speed * (keyLeft ? -1 : keyRight ? 1 : 0), playerSegment.p2.world.y - playerSegment.p1.world.y);
    
	}

	drawRoadSegment(ctx, width, lanes, x1, y1, w1, x2, y2, w2, color) {

		let r1 = this.getRumbleWidth(w1, lanes),
		    r2 = this.getRumbleWidth(w2, lanes),
		    l1 = this.getLaneMarkerWidth(w1, lanes),
		    l2 = this.getLaneMarkerWidth(w2, lanes);
		let    lanew1, lanew2, lanex1, lanex2, lane;
		
		ctx.fillStyle = color.grass;
		ctx.fillRect(0, y2, width, y1 - y2);

		this.drawPolygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
		this.drawPolygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
		this.drawPolygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);

		if (color.lane) {
		  lanew1 = w1*2/lanes;
		  lanew2 = w2*2/lanes;
		  lanex1 = x1 - w1 + lanew1;
		  lanex2 = x2 - w2 + lanew2;
		  for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++){
		    this.drawPolygon(ctx, lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color.lane);
		  }
		}

	}


	addRoad(enter, hold, leave, curve, y) {
	  var startY   = this.lastY();
	  var endY     = startY + (y * GAME_VARIABLES.segmentLength);
	  var n, total = enter + hold + leave;
	  for(n = 0 ; n < enter ; n++)
	    this.addSegment(this.easeIn(0, curve, n/enter), this.easeInOut(startY, endY, n/total));
	  for(n = 0 ; n < hold  ; n++)
	    this.addSegment(curve, this.easeInOut(startY, endY, (enter+n)/total));
	  for(n = 0 ; n < leave ; n++)
	    this.addSegment(this.easeInOut(curve, 0, n/leave), this.easeInOut(startY, endY, (enter+hold+n)/total));
	}

	addSegment(curve,y){
		let index = this.segments.length;
		this.segments.push({
			'index':index,
			'p1':{
				'camera':{x:0,y:0,z:0},
				'screen':{x:0,y:0,z:0},
				'world':{x:0,y:this.lastY(),z:index*GAME_VARIABLES.segmentLength}
			},
			'p2':{
				'camera':{x:0,y:0,z:0},
				'screen':{x:0,y:0,z:0},
				'world':{x:0,y:y,z:(index+1)*GAME_VARIABLES.segmentLength}
			},
			curve:curve,
			'color':{
				'road':GAME_VARIABLES.COLOR.ROAD,
				'grass':Math.floor(index/GAME_VARIABLES.rumbleLength)&1?GAME_VARIABLES.COLOR.GRASS_DARK:GAME_VARIABLES.COLOR.GRASS_LIGHT,
				'rumble':Math.floor(index/GAME_VARIABLES.rumbleLength)&1?GAME_VARIABLES.COLOR.RUMBLE_DARK:GAME_VARIABLES.COLOR.RUMBLE_LIGHT,
				'lane':Math.floor(index/GAME_VARIABLES.rumbleLength)&1?GAME_VARIABLES.COLOR.LANE_DARK:GAME_VARIABLES.COLOR.LANE_LIGHT
			}
		});
	}

	getRumbleWidth(projectedRoadWidth, lanes) { 
		return projectedRoadWidth/Math.max(6,  2*lanes); 
	}
	getLaneMarkerWidth(projectedRoadWidth, lanes) { 
		return projectedRoadWidth/Math.max(32, 8*lanes); 
	}

	drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x3, y3);
		ctx.lineTo(x4, y4);
		ctx.closePath();
		ctx.fill();
	}

	project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
	  p.camera.x     = (p.world.x || 0) - cameraX;
	  p.camera.y     = (p.world.y || 0) - cameraY;
	  p.camera.z     = (p.world.z || 0) - cameraZ;

	  p.screen.scale = cameraDepth/p.camera.z;
	  p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
	  p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
	  p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
	}

	lastY() {
	  return (this.segments.length == 0) ? 0 : this.segments[this.segments.length-1].p2.world.y;
	}

	findSegment(z) {
	  return this.segments[Math.floor(z/GAME_VARIABLES.segmentLength) % this.segments.length];
	}

	percentRemaining(n, total){ 
		return (n%total)/total;
	}

	interpolate(a,b,percent)       { 
		return a + (b-a)*percent;
	}

	easeIn(a,b,percent) { 
		return a + (b-a)*Math.pow(percent,2);
	}
	easeOut(a,b,percent) {
	 return a + (b-a)*(1-Math.pow(1-percent,2));                     
	}
	easeInOut(a,b,percent) {
	 return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);        
	}
}