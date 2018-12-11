//For Canvas
let CANVAS_WIDTH = window.innerWidth-100 || document.body.clientWidth-100;
let CANVAS_HEIGHT = window.innerHeight-100 || document.body.clientHeight-100;
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

let fieldOfView   = 100; // angle (degrees) for field of view
let cameraHeight  = 1000;// z height of camera
let cameraDepth   = 0.8;//null;// z distance camera is from screen (computed) calculated using d=1/tan(fav/2)
let position = 0;

//For Track
let segmentLength=550;
let rumbleLength = 3;
let drawDistance = 300;
let roadWidth = 2000;
let lanes = 2;

let COLOR={
	GRASS_DARK:'#007f00',
	GRASS_LIGHT:'#00b200',
	ROAD:'gray',
	RUMBLE_DARK:'red',
	RUMBLE_LIGHT:'white',
	LANE_DARK:'gray',
	LANE_LIGHT:'white'
}

//For Player
let playerX=0;

let segments=[];

function addSegment(){
	let index = segments.length;

	segments.push({
		'index':index,
		'p1':{
			'camera':{x:0,y:0,z:0},
			'screen':{x:0,y:0,z:0},
			'world':{x:0,y:0,z:index*segmentLength}
		},
		'p2':{
			'camera':{x:0,y:0,z:0},
			'screen':{x:0,y:0,z:0},
			'world':{x:0,y:0,z:(index+1)*segmentLength}
		},
		'color':{
			'road':COLOR.ROAD,
			'grass':Math.floor(index/rumbleLength)&1?COLOR.GRASS_DARK:COLOR.GRASS_LIGHT,
			'rumble':Math.floor(index/rumbleLength)&1?COLOR.RUMBLE_DARK:COLOR.RUMBLE_LIGHT,
			'lane':Math.floor(index/rumbleLength)&1?COLOR.LANE_DARK:COLOR.LANE_LIGHT
		}
	});
}

function setInitialSegments(){
	for(let i=0;i<500;i++){
		addSegment();
	}
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

function renderRoad(){
	var baseSegment = findSegment(position);
	var maxy        = CANVAS_HEIGHT;
	var n, segment;

	for(n = 0 ; n <drawDistance ; n++) {

	  segment = segments[(baseSegment.index + n) % segments.length];

	  project(segment.p1, (playerX * roadWidth), cameraHeight, position, cameraDepth, CANVAS_WIDTH, CANVAS_HEIGHT, roadWidth);
	  project(segment.p2, (playerX * roadWidth), cameraHeight, position, cameraDepth, CANVAS_WIDTH, CANVAS_HEIGHT, roadWidth);

	  if ((segment.p1.camera.z <= cameraDepth) || // behind us
	      (segment.p2.screen.y >= CANVAS_HEIGHT)) {
	  	continue;
	  }
	  drawRoadSegment(ctx, CANVAS_WIDTH, lanes,
             segment.p1.screen.x,
             segment.p1.screen.y,
             segment.p1.screen.w,
             segment.p2.screen.x,
             segment.p2.screen.y,
             segment.p2.screen.w,
             segment.color);

	  maxy = segment.p2.screen.y;
	}
}


function drawRoadSegment(ctx, width, lanes, x1, y1, w1, x2, y2, w2, color) {

	// let r1 = w1 / 10, r2 = w2 / 10,
 //            l1 = w1 / 40, l2 = w2 / 40;
	var r1 = getRumbleWidth(w1, lanes),
	    r2 = getRumbleWidth(w2, lanes),
	    l1 = getLaneMarkerWidth(w1, lanes),
	    l2 = getLaneMarkerWidth(w2, lanes);
	let    lanew1, lanew2, lanex1, lanex2, lane;
	
	ctx.fillStyle = color.grass;
	ctx.fillRect(0, y2, width, y1 - y2);

	drawPolygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
	drawPolygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
	drawPolygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);

	if (color.lane) {
	  lanew1 = w1*2/lanes;
	  lanew2 = w2*2/lanes;
	  lanex1 = x1 - w1 + lanew1;
	  lanex2 = x2 - w2 + lanew2;
	  for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
	    drawPolygon(ctx, lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color.lane);
	}

}

function getRumbleWidth(projectedRoadWidth, lanes) { 
	return projectedRoadWidth/Math.max(6,  2*lanes); 
}
function getLaneMarkerWidth(projectedRoadWidth, lanes) { 
	return projectedRoadWidth/Math.max(32, 8*lanes); 
}


function drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.lineTo(x4, y4);
	ctx.closePath();
	ctx.fill();
}

function project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
  p.camera.x     = (p.world.x || 0) - cameraX;
  p.camera.y     = (p.world.y || 0) - cameraY;
  p.camera.z     = (p.world.z || 0) - cameraZ;
  p.screen.scale = cameraDepth/p.camera.z;
  p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
  p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
  p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
}

setInitialSegments();
function frame(time) {
	renderRoad();
	position+=segmentLength;
	position=position%(segmentLength*drawDistance);
	for(let i=0;i<1000;i++){

	}
	requestAnimationFrame(frame);
}

frame();