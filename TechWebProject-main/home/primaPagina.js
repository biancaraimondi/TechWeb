function cambiaPagina(url) {
		window.location.replace(url);
}

$(document).ready( function(){
	$("#eta").click(function() {
		document.getElementById("autore").hidden = true;
		document.getElementById("storie").hidden = false;
	});
})

$(document).ready( function(){
	$("#storie").click(function() {
		document.getElementById("buttonQRcode").disabled = false;
	});
})

$(document).ready( function(){
	$("#buttonQRcode").click(function() {
		document.getElementById("buttonQRcode").hidden = true;
		document.getElementById("imageQRcode").hidden = false;
		document.getElementById("eta").hidden = true;
		document.getElementById("storie").hidden = true;
	});
})

$(document).ready( function(){
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});
})