window.onload = function  () {
	
	var boton = document.getElementById('boton');
	var hola = document.getElementById('canvas');
	var context = hola.getContext('2d');

	boton.onclick = pulsado;

	diagonal(context);
}


function pulsado () {
	var hola = document.getElementById('canvas');
	var context = hola.getContext('2d');
	context.beginPath();
	context.moveTo(500,0);
	context.lineTo(0,250);
	context.lineTo(500,500);
	context.stroke();
}


function diagonal(context) {



context.beginPath();
context.moveTo(0,0);
context.lineTo(500,250);
context.lineTo(0,500);
context.stroke();
}






