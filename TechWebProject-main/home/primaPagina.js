var storie= {};
var xhr = new XMLHttpRequest();
xhr.open('GET', '/primaPagina/ottieniStorie', true); //apro connessione tipo GET
xhr.onreadystatechange = function() {
	if (xhr.readyState === 4 && xhr.status === 200){
		var storieJson = xhr.responseText; //ottengo storia in formato json	
		storie = JSON.parse(storieJson); //ottengo storia in js
	}
};
xhr.send();

function cambiaPagina(url) {
		window.location.replace(url);
}

$(document).ready( function(){
	var socket = io();
	var nomeStoria = "";

	$("#eta").click(function() {
		document.getElementById("autore").hidden = true;
		document.getElementById("storie").hidden = false;
	});
	
	$("#nomiStorie").click(function() {
		//TODO aggiungere storie in base all'età cliccata
		for (var i=0;i<storie.length;i++){
			document.getElementById("nomiStorie").innerHTML += "<div class='form-check'><input name='storia' type='radio' id='" + storie[i].nome + "'><label for='" + storie[i].nome + "'>" + storie[i].nome + "</label></div>"
		}
	});
	
	$("#storie").click(function() {
		document.getElementById("buttonQRcode").disabled = false;
		var storiesList = document.getElementsByTagName("input");
		for (i = 0; i < storiesList.length; i++) {
			if (storiesList[i].checked) {
				nomeStoria = storiesList[i].value;
			}
		}
		socket.emit('storia', nomeStoria);//es. storiaDaCaricare = 'interrail' e non 'interrail.json'
	});
	
	$("#buttonQRcode").click(function() {
		document.getElementById("buttonQRcode").hidden = true;
		document.getElementById("imageQRcode").hidden = false;
		document.getElementById("eta").hidden = true;
		document.getElementById("storie").hidden = true;
	});
	
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});
	
	$("#qrlink").click(function() {
		cambiaPagina('player.html');
	});
})