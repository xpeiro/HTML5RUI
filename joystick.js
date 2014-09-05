var resetbutton = document.getElementById('resetbutton');
var joystick = document.getElementById('joystick');
var joystickctx = joystick.getContext('2d');
var vector = document.getElementById('vector');
var vectorctx = vector.getContext('2d');
var position = document.getElementById('position');
var point = {
	x: 0,
	y: 0
};

var maxRadius = joystick.width/2*0.8;
var radius = joystick.width*0.3;
var leftClick=0;


resetAll();

joystick.addEventListener('touchstart', touch, false);
joystick.addEventListener('touchend', resetAll, false);
joystick.addEventListener('touchmove', touch, false);
joystick.addEventListener('mousedown', function (evt) {
	leftClick=1;
	mouseMove(evt);
}, false);
joystick.addEventListener('mouseup', function () {
	leftClick=0;
	resetAll();
}, false);
joystick.addEventListener('mousemove', mouseMove, false);

function touch (evt) {
	evt.preventDefault();
	leftClick=1;
	mouseMove(evt);
}

function mouseMove (evt) {

	if (leftClick==1) { //check if left mouse button down.
		resetJoystick();
		resetVector();

		if (evt.type == 'touchstart' || evt.type == 'touchmove') {
			point.x = evt.touches[0].pageX;
			point.y = evt.touches[0].pageY;
		} else{
			point.x = evt.pageX - 12;
			point.y = evt.pageY - 12;
		};
		
		forceIntoCircle(point,maxRadius);

		
		drawLineFromCenter(vectorctx, point.x, point.y);
		drawLineFromCenter(joystickctx, point.x, point.y);
		circle(joystickctx, point.x, point.y,radius, true, "grey");
		position.innerHTML="x:"+ (point.x -joystick.width) +" y:"+ (joystick.height - point.y); //update position label.
		
	};
	
}

function resetJoystick () {
	joystickctx.fillStyle = "#081628";
	joystickctx.fillRect(0,0,joystick.width,joystick.height);
	joystickctx.fillStyle = "black";
	circle( joystickctx, joystick.width/2, joystick.height/2, maxRadius, true, "#8e98a4");
	position.innerHTML="x:0"+" y:0"; //update position label.	
}

function resetVector () {
	vectorctx.fillStyle = "white";
	vectorctx.fillRect(0,0,vector.width,vector.height);
	vectorctx.fillStyle = "black";
	vectorctx.fillRect(vector.width/2-2,vector.height/2-2,4,4);
	circle(vectorctx, vector.width/2, vector.height/2, maxRadius);
}

function resetAll () {
	resetJoystick();
	resetVector();
	circle( joystickctx, joystick.width/2, joystick.height/2, radius, true, "grey");
}

function checkCircle (x,y,radius) {
	return ( (x*x + y*y) <= (radius*radius));
}

function circle (ctx, x, y, radius, fill, fillColor) {
	ctx.beginPath();
	ctx.arc( x, y, radius, 0, 2 * Math.PI, false);
	if (fill) { 
		ctx.fillStyle = fillColor;
		ctx.fill();
	};
	ctx.stroke();
}

function drawLineFromCenter (ctx, x, y) {
	ctx.beginPath();
	ctx.moveTo(vector.width/2,vector.height/2);
	ctx.lineTo( x, y);
	ctx.stroke();	
}

function forceIntoCircle (point,radius) {
	if (!checkCircle(point.x - joystick.width/2, joystick.height/2 - point.y, radius)) {
		point.x = point.x - joystick.width/2;
		point.y = joystick.height/2 - point.y;
		var a = point.y/point.x;
		if (point.x>0) {
			point.x = radius/Math.sqrt(1+a*a) + joystick.width/2;				
		} else  {
			point.x = -radius/Math.sqrt(1+a*a) + joystick.width/2;
			
		}
		if (point.y>0) {
			point.y = joystick.height/2  - radius/Math.sqrt(1+1/(a*a));
		} else {
			point.y = joystick.height/2  + radius/Math.sqrt(1+1/(a*a));
		}

		
	};

	point.x = Math.floor(point.x);
    point.y = Math.floor(point.y);	
}