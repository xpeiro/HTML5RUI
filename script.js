
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

var radius = 100;
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
		
		forceIntoCircle(point,200);

		circle(joystickctx, point.x, point.y,radius, true);
		drawLineFromCenter(vectorctx, point.x, point.y);
		position.innerHTML="x:"+ (point.x -250) +" y:"+ (250 - point.y); //update position label.
		
	};
	
}

function resetJoystick () {
	joystickctx.fillStyle = "white";
	joystickctx.fillRect(0,0,500,500);
	joystickctx.fillStyle = "black";
	circle( joystickctx, 250, 250, 200);
	x=250;
	y=250;	
}



function resetVector () {
	vectorctx.fillStyle = "white";
	vectorctx.fillRect(0,0,500,500);
	vectorctx.fillStyle = "black";
	vectorctx.fillRect(248,248,4,4);
	circle(vectorctx, 250, 250, 200);
}

function resetAll () {
	resetJoystick();
	resetVector();
	circle( joystickctx, 250, 250, 100, true);
}

function checkCircle (x,y,radius) {
	return ( (x*x + y*y) <= (radius*radius));
}

function circle (ctx, x, y, radius, greyFill) {
	ctx.beginPath();
	ctx.arc( x, y, radius, 0, 2 * Math.PI, false);
	if (greyFill) { 
		ctx.fillStyle = "grey";
		ctx.fill();
	};
	ctx.stroke();
}

function drawLineFromCenter (ctx, x, y) {
	ctx.beginPath();
	ctx.moveTo(250,250);
	ctx.lineTo( x, y);
	ctx.stroke();	
}

function forceIntoCircle (point,radius) {
	if (!checkCircle(point.x - 250, 250 - point.y, radius)) {
		var x = point.x - 250;
		var y = 250 - point.y;
		var a = y/x;
		if (x>0) {
			x = radius/Math.sqrt(1+a*a) + 250;				
		} else  {
			x = -radius/Math.sqrt(1+a*a) + 250;
			
		}
		if (y>0) {
			y = 250  - radius/Math.sqrt(1+1/(a*a));
		} else {
			y = 250  + radius/Math.sqrt(1+1/(a*a));
		}

		point.x = Math.floor(x);
	    point.y = Math.floor(y);		
	};
}