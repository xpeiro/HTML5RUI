window.onload = function() {
	document.getElementById('enlace').onclick = cambialink;
};
function cambialink() {
	cosa = document.getElementById('enlace');
	if (cosa.innerHTML == "marca") {
		cosa.innerHTML = "as";
		cosa.href = "http://www.marca.com";
	} else {
		cosa.innerHTML = "marca";
		cosa.href = "http://www.as.com";
	};

}

