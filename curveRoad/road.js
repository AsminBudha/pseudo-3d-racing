let segments=[]; //initial segments to draw road
var position      = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
var drawDistance  = 300;                     // number of segments to draw
var fieldOfView   = 100; // angle (degrees) for field of view
var cameraHeight  = 1000;// z height of camera
var cameraDepth   = 0.2;//null;// z distance camera is from screen (computed) calculated using d=1/tan(fav/2)
var segmentLength = 200;                     // length of a single segment
var rumbleLength  = 1;                       // number of segments per red/white rumble strip
var trackLength   = null;                    // z length of entire track (computed)
var canvas        = document.getElementById('canvas');       // our canvas...
var ctx           = canvas.getContext('2d'); // ...and its drawing context
var width         = window.innerWidth-50 || document.body.clientWidth-50;                    // logical canvas width
var height        = window.innerHeight-50 || document.body.clientHeight-50;                     // logical canvas height
var playerX       = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
var roadWidth     = 1000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
var lanes         = 3;                       // number of lanes

const COLOR_DARK='brown';
const COLOR_LIGHT='yellow';
const COLOR_ROAD='gray';

canvas.width=width;
canvas.height=height;

function resetRoad(){
	segments=[];
	for(let i=0;i<500;i++){
		segments.push({
			index:i,
			p1:{world:{z:i*segmentLength},camera:{},screen:{}},
			p2:{world:{z:(i+1)*segmentLength},camera:{},screen:{}},
			color:Math.floor(i/rumbleLength)&1?COLOR_DARK:COLOR_LIGHT
		});
	}
}

resetRoad();


function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

function renderRoad(){
	var baseSegment = findSegment(position);
	var maxy        = height;
	var n, segment;
	console.log(width,height);
	for(n = 0 ; n <drawDistance ; n++) {

	  segment = segments[(baseSegment.index + n) % segments.length];

	  // console.log(n,segment);

	  project(segment.p1, (playerX * roadWidth), cameraHeight, position, cameraDepth, width, height, roadWidth);
	  project(segment.p2, (playerX * roadWidth), cameraHeight, position, cameraDepth, width, height, roadWidth);

	  if ((segment.p1.camera.z <= cameraDepth) || // behind us
	      (segment.p2.screen.y >= height)) {
	  		console.log('inside',segment.p1.camera.z,cameraDepth)
	  	
	  		console.log('inside',segment.p2.screen.y,maxy)
	  		continue;
	      }         // clip by (already rendered) segment
	    
		console.log(n);
	  segment.color={
	  	'road':segment.color,
	  	'lane':'white',
	  	'grass':'green',
	  	'rumble':'red'
	  };
	  // console.log(segment.color);
	  drawRoadSegment(ctx, width, lanes,
	                 segment.p1.screen.x,
	                 segment.p1.screen.y,
	                 segment.p1.screen.w,
	                 segment.p2.screen.x,
	                 segment.p2.screen.y,
	                 segment.p2.screen.w,
	                 5,
	                 segment.color);

	  maxy = segment.p2.screen.y;
	}
}


function drawRoadSegment(ctx, width, lanes, x1, y1, w1, x2, y2, w2, fog, color) {

	let r1 = w1 / 10, r2 = w2 / 10,
            l1 = w1 / 40, l2 = w2 / 40;
	// var r1 = getRumbleWidth(w1, lanes),
	//     r2 = getRumbleWidth(w2, lanes),
	//     l1 = getLaneMarkerWidth(w1, lanes),
	//     l2 = getLaneMarkerWidth(w2, lanes),
	let    lanew1, lanew2, lanex1, lanex2, lane;
	// console.log(color);
	ctx.fillStyle = color.grass;
	ctx.fillRect(0, y2, width, y1 - y2);

	drawPolygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
	drawPolygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
	drawPolygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);

	console.log(x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);

	if (color.lane) {
	  lanew1 = w1*2/lanes;
	  lanew2 = w2*2/lanes;
	  lanex1 = x1 - w1 + lanew1;
	  lanex2 = x2 - w2 + lanew2;
	  for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
	    drawPolygon(ctx, lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color);
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
// function project(p, cameraX, cameraY, cameraZ, CAMERA_DEPTH, CANVAS_WIDTH, CANVAS_HEIGHT, WIDTH) {
//         //translation the world coordinates into camera coordiantes
//     p.camera.x = (p.world.x||0) - cameraX;

//     p.camera.y = (p.world.y||0) - cameraY;
//     p.camera.z = (p.world.z||0) - cameraZ;

//     p.screen.scale = CAMERA_DEPTH / p.cameraCoordinates.z;

//     //combination of projection from camera coordiantes to projection plane and 
//     //scaling the projected cordinates to physical screen coordinates
//     p.screenCoordinates.x = Math.round((CANVAS_WIDTH / 2) + (p.screenCoordinates.scale * p.cameraCoordinates.x * CANVAS_WIDTH / 2));
//     p.screenCoordinates.y = Math.round((CANVAS_HEIGHT / 2) - (p.screenCoordinates.scale * p.cameraCoordinates.y * CANVAS_HEIGHT / 2));
//     p.screenCoordinates.w = Math.round((p.screenCoordinates.scale * WIDTH * CANVAS_WIDTH / 2));
// }

renderRoad();