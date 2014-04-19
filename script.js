window.onload = function() {
	document.getElementById('enlace').onclick = cambialink;
};
function cambialink() {
	cosa = document.getElementById('enlace');
	if (cosa.innerHTML == "marca") {
		cosa.href = "http://www.marca.com";
		cosa.innerHTML = "as";		
	} else {		
		cosa.href = "http://www.as.com";
		cosa.innerHTML = "marca";
	};

}

