var idGiocatore = "";//player visualizzato attualmente
var nomeValutatore = "valutatore";//il valutatore può essere solo uno
var utenti = [];//lista dei nomi dei player -> {nome}
var messaggi = [];//lista dei messaggi in chat non ancora visualizzati dal valutatore -> {nomeTrasmittente, nomeRicevente, messaggio}
var inserisci;//booleano utilizzato per i cicli for
var playersList;//variabile utilizzata nell'ottenere il valore del player da visualizzare
var i;//iteratore per cicli for
var idGiocatorePrecendente;//player visualizzato precedentemente

function cambiaPagina(url) {
	window.location.replace(url);
}

//prende in input il numero di domande a cui il player ha risposto correttamente e modifica l'avanzamento nella schermata del valutatore
function modificaAvanzamento(domandeCompletate) {
	//var avanzamentoAttuale = $(".progress-bar").width();
	var fineMissioni = $(".progress").width();
	$(".progress-bar").width(domandeCompletate * fineMissioni/10);
}

//funzione che ogni tre secondi fa qualcosa
/*function functionName() {
	(function(){
		//
	}, 3000);
}*/

$(document).ready( function(){
	//nomeValutatore = prompt("inserisci qui il tuo nome: ", "");

	//carica i player già connessi nell'array 'utenti'
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			for (i=0;i<obj.length;i++){
				if (obj[i].nome != 'valutatore'){//non carico anche il nome di un eventuale altro valutatore
					utenti.push({nome : obj[i].nome});
					document.getElementById('giocatore').innerHTML += "<div class='form-check'><input name='giocatore' type='radio' value='" + obj[i].nome + "' id='" + obj[i].nome + "'><label for=" + obj[i].nome + ">" + obj[i].nome + "</label></div>";
				}
			}
			//mostra i player connessi
			console.log('VALUTATORE: players: ');
			for(i=0;i<utenti.length;i++){
				console.log('nome: ' + utenti[i].nome);
			}
		}
	};
	xmlhttp.open("GET", "/valutatore/utenti", true);
	xmlhttp.send();
	
	var xmlhttp2 = new XMLHttpRequest();
	xmlhttp2.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			for (i=0;i<obj.length;i++){
				if (obj[i].ricevente == 'valutatore'){
					messaggi.push({nomeTrasmittente : obj[i].trasmittente, nomeRicevente: obj[i].ricevente, messaggio : obj[i].messaggio});
				}
			}
		}
	};
	xmlhttp2.open("GET", "/valutatore/messaggi", true);
	xmlhttp2.send();
	
	/*$.get( "/server/utenti", function(data) {
		var obj = JSON.parse(data);
		for (i=0;i<obj.length;i++){
			utenti.push({nome : obj[i].nome});
			document.getElementById('giocatore').innerHTML += "<div class='form-check'><input name='giocatore' type='radio' value='" + obj[i].nome + "' id='" + obj[i].nome + "'><label for=" + obj[i].nome + ">" + obj[i].nome + "</label></div>";
		}
		//mostra i player connessi
		console.log('VALUTATORE: players: ');
		for(i=0;i<utenti.length;i++){
			console.log('nome: ' + utenti[i].nome);
		}
	});*/
	
	$("#giocatore").click(function() {
		
		//setta idGiocatore al valore che ha la label
		idGiocatorePrecendente = idGiocatore;
		playersList = document.getElementsByTagName("input");
		for (i = 0; i < playersList.length; i++) {
			if (playersList[i].checked) {
				idGiocatore = playersList[i].value;
			}
		}
		console.log('VALUTATORE: giocatore attuale: ' + idGiocatore);
		
		//se cambia il giocatore selezionato
		if (idGiocatorePrecendente != idGiocatore) {
			
			//inseriamo nella chat i messaggi corrispondenti al nuovo giocatore selezionato
			document.getElementById("messaggiChat").innerHTML = "";
			for (i = 0; i < messaggi.length; i++) {
				if (messaggi[i].nomeTrasmittente == idGiocatore){//se il messaggio arriva dal player
					document.getElementById("messaggiChat").innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + messaggi[i].messaggio + "</div></div></div>";
				} else if(messaggi[i].nomeTrasmittente == nomeValutatore && messaggi[i].nomeRicevente == idGiocatore ) {//se il messaggio arriva dal valutatore
					document.getElementById("messaggiChat").innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggi[i].messaggio + "</div></div></div>";
				}
			}
			
			//TODO visualizzare l'avanzamento e le risposte del nuovo giocatore selezionato
		}
	});
	
	//bottone 'torna alla pagina principale'
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});

	//TODO associare la funzione aggiungiAvanzamento ai dati ricevuti dal player (utilizzare una nuova connessione socket??)
	$("#si").click(function() {
		modificaAvanzamento(7);
	});

	var socket = io();//utilizzato per gestire la chat
	
	//appena il valutatore si connette crea il relativo utente all'interno del server
	messaggioValutatore = nomeValutatore + " connesso";
	socket.emit('chat message', messaggioValutatore, nomeValutatore, idGiocatore);
	console.log('VALUTATORE: valutatore connesso alla chat');
	
	//funzione che al click di "invia" invia il messaggio al player e copia il messaggio come message-right e nella lista dei messaggi
	$('#invia').click(function(){
		messaggioValutatore = document.getElementById('testoDaInviare').value;
		socket.emit('chat message', messaggioValutatore, nomeValutatore, idGiocatore);
		document.getElementById("messaggiChat").innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioValutatore + "</div></div></div>";
		messaggi.push({nomeTrasmittente : nomeValutatore, nomeRicevente: idGiocatore, messaggio : messaggioValutatore});
		document.getElementById('testoDaInviare').value = '';
	});
	
	//funzione che riceve un messaggio dal server e copia il messaggio come message-left e nella lista dei messaggi
	socket.on('chat message', function(msg, player, valutatore) {
		console.log('VALUTATORE: messaggio da ' + player + ' per ' + valutatore + ': ' + msg);
		
		//inserisce il player nella lista dei players 'utenti'
		inserisci = true;
		for (i=0;i<utenti.length;i++){
			if (utenti[i].nome == player){
				inserisci = false;
			}
		}
		if (inserisci){
			utenti.push({nome : player});
			document.getElementById('giocatore').innerHTML += "<div class='form-check'><input name='giocatore' type='radio' value='" + player + "' id='" + player + "'><label for=" + player + ">" + player + "</label></div>";
		}
		
		//aggiunge il messaggio direttamente in chat se corrisponde all'idGiocatore attualmente cliccato
		if (idGiocatore == player){
			document.getElementById("messaggiChat").innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
		}
		messaggi.push({nomeTrasmittente : player, nomeRicevente: valutatore, messaggio : msg});
	});
});