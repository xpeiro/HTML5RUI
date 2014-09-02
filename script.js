
var resetbutton = document.getElementById('resetbutton');
var joystick = document.getElementById('joystick');
var joystickctx = joystick.getContext('2d');
var vector = document.getElementById('vector');
var vectorctx = vector.getContext('2d');
var position = document.getElementById('position');


joystick.addEventListener('mousedown', mouseMove, false);
joystick.addEventListener('mousemove', mouseMove, false);
joystick.addEventListener('mouseup', function () {
	resetJoystick();
	resetVector();
	circle( joystickctx, 250, 250, 100, true);
}, false);


resetJoystick();
resetVector();
circle( joystickctx, 250, 250, 100, true);

function mouseMove (evt) {

	if (evt.which==1) { //check if left mouse button down.
		var x = evt.clientX - 12;
		var y = evt.clientY - 12;		
		if (!checkCircle(x - 250, 250 - y, 200)) {
			x = x - 250;
			y = 250 - y;
			var a = y/x;
			if (x>0) {
				x = 200/Math.sqrt(1+a*a) + 250;				
			} else  {
				x = -200/Math.sqrt(1+a*a) + 250;
				
			}
			if (y>0) {
				y = 250  - 200/Math.sqrt(1+1/(a*a));
			} else {
				y = 250  + 200/Math.sqrt(1+1/(a*a));
			}

			x = Math.floor(x);
			y = Math.floor(y);
		};

		resetJoystick();
		resetVector();		
		
		var radius = 100;
		var arrow = new Image();
		arrow.src = "arrow.png";

		circle(joystickctx, x, y,radius, true);
		
		drawLineFromCenter(vectorctx,x,y);
			
		
		position.innerHTML="x:"+ (x -250) +" y:"+ (250 - y); //update position label.
	};
	
}

function resetJoystick () {
	joystickctx.fillStyle = "white";
	joystickctx.fillRect(0,0,500,500);
	joystickctx.fillStyle = "black";
	circle( joystickctx, 250, 250, 200);
	position.innerHTML="x:0 y:0";
}



function resetVector () {
	vectorctx.fillStyle = "white";
	vectorctx.fillRect(0,0,500,500);
	vectorctx.fillStyle = "black";
	vectorctx.fillRect(248,248,4,4);
	circle(vectorctx, 250, 250, 200);
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