var storia = {};
var xhr = new XMLHttpRequest();
xhr.open('GET', '/player/ottienistoria', true); //apro connessione tipo GET
xhr.onreadystatechange = function() {
	if (xhr.readyState === 4 && xhr.status === 200){
		var storiaJson = xhr.responseText; //ottengo storia in formato json	
		storia = JSON.parse(storiaJson); //ottengo storia in js
	}
};
xhr.send();

$(document).ready(function () {
	var nomeGiocatore = "";
	var messaggioPlayer = "";
	var valutatore = "valutatore";
	var socket = io();
	var i;
	
	//appena il player si connette manda un messaggio al valutatore
	$('#nome').click(function(){
		nomeGiocatore = document.getElementById('nomeGiocatore').value;
		document.getElementById('nomeGiocatore').value = "";
		//document.getElementById("nomeGiocatore").hidden = true;
		//document.getElementById("nome").hidden = true;
		//document.getElementById("chat").hidden = false;
		
		messaggioPlayer = "Sono " + nomeGiocatore + ". Mi sono connesso";
		socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
	});
	
	$('#invia').click(function(/*e*/){
		//e.preventDefault(); //previene il reload della pagina
		messaggioPlayer = document.getElementById('testoDaInviare').value;
		socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
		document.getElementById('messaggiChat').innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioPlayer + "</div></div></div>";
		document.getElementById('testoDaInviare').value = "";
		//return false;
	});
	
	socket.on('chat message', function(msg, id){
		document.getElementById('messaggiChat').innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
	});
	
	i = 0;//contatore per le missioni
	j = 0;//contatore per le attività
	if (storia.missioni[i].attivita[j].domanda){
		document.getElementById('domanda').innerHTML = storia.missioni[i].attivita[j].domanda;
	}
	if (storia.missioni[i].attivita[i].avanti){
		//visualizza freccia con relativa funzione cambio domanda
	}
	//if(document.getElementById('bottoneRisposta').value==storia.missione[i].attivita[j].giusta){chiamare funzione cambio domanda} else{cout<<missione[i].attivita[j].aiuto}
	
});

