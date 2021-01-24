//richiedo i nomi delle storie da caricare
var storie= {};
var xhr = new XMLHttpRequest();
xhr.open('GET', '/primaPagina/ottieniStorie', true);
xhr.onreadystatechange = function() {
	if (xhr.readyState === 4 && xhr.status === 200){
		var storieJson = xhr.responseText;
		storie = JSON.parse(storieJson);
	}
};
xhr.send();

function cambiaPagina(url) {
	window.location.replace(url);
}

function scegliEta(eta) {
	document.getElementById("autore").hidden = true;
	document.getElementById("storie").hidden = false;
	document.getElementById("valutatore").hidden = true;
	
	//inserisce in eta l'età cliccata nell'html
	document.getElementById("nomiStorie").innerHTML = "";
	for (var i=0;i<storie.storie.length;i++){
		if (eta == storie.storie[i].eta && storie.storie[i].stato == "pubblicata"){
			document.getElementById("nomiStorie").innerHTML += "<div class='form-check'><input name='storia' type='radio' id='" + storie.storie[i].nome + "' value='" + storie.storie[i].nome + "'>&nbsp<label for='" + storie.storie[i].nome + "'>" + storie.storie[i].nome + "</label></div>";
		}
	}
}

$(document).ready( function(){
	var socket = io();
	var i = 0;

	$("#eta1").click(function() {
		scegliEta("eta1");
	});
	
	$("#eta2").click(function() {
		scegliEta("eta2");
	});
	
	$("#eta3").click(function() {
		scegliEta("eta3");
	});
	
	$("#nomiStorie").click(function() {

		var nomeStoria = "";
		var storiesList = document.getElementsByName("storia");
		for (i = 0; i < storiesList.length; i++) {
			if (storiesList[i].checked) {
				nomeStoria = storiesList[i].value;
			}
		}

		if(nomeStoria != ""){
			socket.emit('storia', nomeStoria);
			document.getElementById("buttonQRcode").disabled = false;
		}

	});
	
	socket.on('storia non caricabile', function(){
		document.getElementById('storiaSbagliata').hidden = false;
	});
	
	$("#buttonQRcode").click(function() {
		document.getElementById('storiaSbagliata').hidden = true;
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
	
	$("#valutatore").click(function() {
		socket.emit('connesso', 'valutatore', 'home');
		document.getElementById('nomeValutatore').hidden = true;
		setTimeout(function(){
			if(document.getElementById('nomeValutatore').hidden == true){
				cambiaPagina('ambienteValutatore.html');
			}else{
				console.log("PRIMA PAGINA: valutatore gia connesso");
			}
		}, 100);
	});
	
	socket.on('nomeErrato', function(){
		console.log("PRIMA PAGINA: Nome Errato");
		document.getElementById('nomeValutatore').hidden = false;
	});
})
