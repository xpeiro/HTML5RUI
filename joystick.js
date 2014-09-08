var resetbutton = document.getElementById('resetbutton');
var joystick = document.getElementById('joystick');
var joystickctx = joystick.getContext('2d');
var vector = document.getElementById('vector');
var vectorctx = vector.getContext('2d');
var position = document.getElementById('position');
var lockJoystick = document.getElementById('lockJoystick');

var point = {
	x : 0,
	y : 0,
};

var maxRadius = joystick.width*0.4;
var radius = joystick.width * 0.3;
var leftClick = 0;

resetAll();

joystick.addEventListener('touchstart', mouseDown, false);
joystick.addEventListener('touchmove', touch, false);
joystick.addEventListener('touchend', mouseUp, false);
joystick.addEventListener('mousedown', mouseDown, false);
joystick.addEventListener('mousemove', mouseMove, false);
joystick.addEventListener('mouseup', mouseUp, false);
lockJoystick.addEventListener('change',resetAll,false);

function mouseDown(evt) {
	leftClick=1;
	mouseMove(evt);
}

function mouseUp() {
	leftClick=0;
	if (!lockJoystick.checked) resetAll(); 	
}

function touch(evt) {
	evt.preventDefault();
	leftClick = 1;
	mouseMove(evt);
}

function mouseMove(evt) {
	
	if (leftClick == 1) {//check if left mouse button down or touch
		resetJoystick();
		resetVector();
		
		if (evt.type == 'touchstart' || evt.type == 'touchmove') {
			point.x = evt.touches[0].pageX - joystick.offsetLeft;
			point.y = evt.touches[0].pageY - joystick.offsetTop;
		} else {
			point.x = evt.pageX - 12 - joystick.offsetLeft;
			point.y = evt.pageY - 12 - joystick.offsetTop;
		};

		point = centerCoord(point,joystick);
		point = forceIntoCircle(point.x, point.y, maxRadius);
		point = canvasCoord(point,joystick);
		
		drawLineFromCenter(joystickctx, point.x, point.y);
		drawLineFromCenter(vectorctx, point.x *vector.width/joystick.width, point.y *vector.width/joystick.width);
		drawCircle(joystickctx, point.x, point.y, radius, "grey");
		point = centerCoord(point,joystick);
		vectorctx.font=joystick.height*0.05+"px Arial";
		vectorctx.fillText("x:" + point.x.toFixed(2) + " y:" + point.y.toFixed(2),vector.width*0.02,vector.height*0.1);//update position label.

	};

}

function resetJoystick() {
	joystickctx.fillStyle = "#081628";
	joystickctx.fillRect(0, 0, joystick.width, joystick.height);
	joystickctx.fillStyle = "black";
	drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, maxRadius, "#8e98a4");
}

function resetVector() {
	vectorctx.fillStyle = "white";
	vectorctx.fillRect(0, 0, vector.width, vector.height);
	vectorctx.fillStyle = "black";
	vectorctx.fillRect(vector.width / 2 - 2, vector.height / 2 - 2, 4, 4);
	drawCircle(vectorctx, vector.width / 2, vector.height / 2, vector.width*0.4);
}

function resetAll() {
	leftClick = 0;
	resetJoystick();
	resetVector();
	drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, radius, "grey");
	
}

function isInsideCircle(x, y, radius) {
	return ((x * x + y * y) <= (radius * radius));
}

function isInsideSquare (x,y,l) {
  return (Math.abs(x) <= l && Math.abs(y) <= l);	
}

function drawCircle(ctx, x, y, radius, fillColor) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	if (!!fillColor) {
		ctx.fillStyle = fillColor;
		ctx.fill();
	};
	ctx.stroke();
}

function drawLineFromCenter(ctx, x, y) {
	ctx.beginPath();
	ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
	ctx.lineTo(x, y);
	ctx.stroke();
}

function forceIntoCircle(x, y, radius) {
	if (!isInsideCircle(x, y, radius)) {
		var a = y / x;
		if (x > 0) {
			x = radius / Math.sqrt(1 + a * a);
		} else {
			x = -radius / Math.sqrt(1 + a * a);

		}
		if (y > 0) {
			y = radius / Math.sqrt(1 + 1 / (a * a));
		} else {
			y = -radius / Math.sqrt(1 + 1 / (a * a));
		}

	};

	return {
		x : x,
		y : y
	};
}

function centerCoord(point, canvas) {
	return {
		x: point.x - canvas.width / 2,
		y: canvas.height / 2 - point.y,
	};
}

function canvasCoord(point, canvas) {
	return {
		x: point.x + canvas.width / 2,
		y: canvas.height / 2 - point.y,
	};
	
}



