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

$(document).ready( function(){
	var socket = io();
	var nomeStoria = "";
	var eta = "";
	var i = 0;

	$("#eta").click(function() {
		document.getElementById("autore").hidden = true;
		document.getElementById("storie").hidden = false;
		document.getElementById("valutatore").hidden = true;
		
		//inserisce in eta l'età cliccata nell'html
		var etaList = document.getElementsByName("eta");
		for (i = 0; i < etaList.length; i++) {
			if (etaList[i].checked) {
				eta = i;
			}
		}
		if(eta == 0){
			eta = "eta1";
		} else if(eta == 1){
			eta = "eta2";
		} else {
			eta = "eta3";
		}

		for (var i=0;i<storie.storie.length;i++){
			if (eta == storie.storie[i].eta && storie.storie[i].stato == "pubblicata"){
				document.getElementById("nomiStorie").innerHTML += "<div class='form-check'><input name='storia' type='radio' id='" + storie.storie[i].nome + "' value='" + storie.storie[i].nome + "'><label for='" + storie.storie[i].nome + "'>" + storie.storie[i].nome + "</label></div>";
			}
		}
	});
	
	$("#nomiStorie").click(function() {
		document.getElementById("buttonQRcode").disabled = false;
		var storiesList = document.getElementsByName("storia");
		console.log(storiesList);
		for (i = 0; i < storiesList.length; i++) {
			if (storiesList[i].checked) {
				nomeStoria = storiesList[i].value;
			}
		}
		console.log(nomeStoria);
		socket.emit('storia', nomeStoria);
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