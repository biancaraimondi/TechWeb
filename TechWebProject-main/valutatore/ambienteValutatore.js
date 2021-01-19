var idGiocatore = "";//player visualizzato attualmente
var nomeValutatore = "valutatore";//il valutatore può essere solo uno
var utenti = [];//lista dei nomi dei player -> {nome, avanzamento, numAttivita}
var messaggi = [];//lista dei messaggi in chat non ancora visualizzati dal valutatore -> {nomeTrasmittente, nomeRicevente, messaggio}
var inserisci;//booleano utilizzato per i cicli for
var playersList;//variabile utilizzata nell'ottenere il valore del player da visualizzare
var i;//iteratore per cicli for
var idGiocatorePrecendente;//player visualizzato precedentemente
var socket = io();//utilizzato per gestire la chat
var rispostaAttuale = null;
var risposteDaValutare = [];//lista di risposte date dai player ancora da valutare
var datiDaSalvare = [];//{player : valore, datiRiassuntivi : [{}], punteggio : num}
var contatoreDisconnessi = 0;

function cambiaPagina(url) {
	window.location.replace(url);
}

//prende in input il numero di domande a cui il player ha risposto correttamente e modifica l'avanzamento nella schermata del valutatore
function modificaAvanzamento(domandeCompletate, domandeEffettive) {
	//var avanzamentoAttuale = $(".progress-bar").width();
	var fineMissioni = $(".progress").width();
	if (domandeEffettive != 0 && domandeEffettive!=null){
		$(".progress-bar").width(domandeCompletate * fineMissioni/domandeEffettive);
		document.getElementById('testoAvanzamento').innerHTML = "DOMANDA " + domandeCompletate + "/" + domandeEffettive;
	}
	else{
		$(".progress-bar").width(0);
		document.getElementById('testoAvanzamento').innerHTML = "AVANZAMENTO";
	}
}

$(document).ready( function(){
	//carica i player già connessi nell'array 'utenti'
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			for (i=0;i<obj.length;i++){
				if (obj[i].nome != 'valutatore'){//non carico anche il nome di un eventuale altro valutatore
					utenti.push({nome : obj[i].nome, avanzamento : obj[i].avanzamento, numAttivita : obj[i].attivita});
					document.getElementById('giocatore').innerHTML += "<div class='form-check'><input name='giocatore' type='radio' value='" + obj[i].nome + "' id='" + obj[i].nome + "'><label for=" + obj[i].nome + ">" + obj[i].nome + "</label></div>";
				}
			}
			var labels = document.getElementsByTagName('LABEL');
			for (i = 0; i < labels.length; i++) {
				labels[i].style.color = "#8b0000";
				labels[i].style.textDecoration = "underline";
			}
			//mostra i player connessi
			console.log('VALUTATORE: players: ' + obj);
			//appena il valutatore si connette crea il relativo utente all'interno del server
			messaggioValutatore = nomeValutatore + " connesso";
			socket.emit('chat message', messaggioValutatore, nomeValutatore, idGiocatore);
		}
	};
	xmlhttp.open("GET", "/valutatore/utenti", true);
	xmlhttp.send();

	//carica i messaggi chat già spediti dai player nell'array 'messaggi'
	var xmlhttp2 = new XMLHttpRequest();
	xmlhttp2.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			for (i=0;i<obj.length;i++){
				if (obj[i].ricevente == 'valutatore'){
					messaggi.push({nomeTrasmittente : obj[i].trasmittente, nomeRicevente: obj[i].ricevente, messaggio : obj[i].messaggio});
				}
			}
			//mostra i messaggi ricevuti
			console.log('VALUTATORE: messaggi: ' + obj);
		}
	};
	xmlhttp2.open("GET", "/valutatore/messaggi", true);
	xmlhttp2.send();
	
	//carica le risposte già date dai player nell'array 'risposteDaValutare'
	var xmlhttp3 = new XMLHttpRequest();
	xmlhttp3.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			for (i=0;i<obj.length;i++){
				risposteDaValutare.push({domanda: obj[i].domanda, risposta : obj[i].risposta, immagine : obj[i].immagine, player : obj[i].player});
			}
			console.log('VALUTATORE: risposte da valutare: ' + obj);
		}
	};
	xmlhttp3.open("GET", "/valutatore/risposte", true);
	xmlhttp3.send();
	
	//carica i dati da salvare già spedite dai player nell'array 'datiDaSalvare'
	var xmlhttp4 = new XMLHttpRequest();
	xmlhttp4.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			for (i=0;i<obj.length;i++){
				datiDaSalvare.push({
					player : obj[i].player,
					datiRiassuntivi : obj[i].datiRiassuntivi,
					punteggio : obj[i].punteggio
				});
			}
			console.log('VALUTATORE: dati da salvare: ' + obj);
		}
	};
	xmlhttp4.open("GET", "/valutatore/datiDaSalvare", true);
	xmlhttp4.send();
	
	$("#giocatore").click(function() {
		
		//visualizza chat, avanzamento e risposte relative al player scelto
		document.getElementById("aiuto").hidden = false;
		document.getElementById("chat").hidden = false;
		
		//setta idGiocatore al valore che ha la label del giocatore appena scelto (cliccato)
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
			
			//cambia il background-color del giocatore per far notare che non è più in attesa di visualizzazione da parte del valutatore
			var labels = document.getElementsByTagName('LABEL');
			for (i = 0; i < labels.length; i++) {
				if (labels[i].htmlFor == idGiocatore) {
					labels[i].style.color = "black";
					labels[i].style.textDecoration = "none";
				}
			}
			
			//inseriamo nella chat i messaggi corrispondenti al nuovo giocatore selezionato
			document.getElementById("messaggiChat").innerHTML = "";
			for (i = 0; i < messaggi.length; i++) {
				if (messaggi[i].nomeTrasmittente == idGiocatore){//se il messaggio arriva dal player
					document.getElementById("messaggiChat").innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + messaggi[i].messaggio + "</div></div></div>";
				} else if(messaggi[i].nomeTrasmittente == nomeValutatore && messaggi[i].nomeRicevente == idGiocatore ) {//se il messaggio arriva dal valutatore
					document.getElementById("messaggiChat").innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggi[i].messaggio + "</div></div></div>";
				}
			}
			
			//visualizza l'avanzamento del giocatore selezionato
			for (i=0;i<utenti.length;i++){
				if (utenti[i].nome == idGiocatore){
					modificaAvanzamento(utenti[i].avanzamento, utenti[i].numAttivita);
					i=utenti.length;
				}else{
					modificaAvanzamento(0, 0);
				}
			}
			
			//visualizza le risposte da valutare del giocatore selezionato
			inserisci = true;
			for (i=0;i<risposteDaValutare.length;i++){
				if (risposteDaValutare[i].player == idGiocatore){
					if(risposteDaValutare[i].immagine == null){
						document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + risposteDaValutare[i].domanda;
						document.getElementById('testoRispostaPlayer').innerHTML += "<br>RISPOSTA: " + risposteDaValutare[i].risposta;
						rispostaAttuale = risposteDaValutare[i];
						document.getElementById('testoRispostaPlayer').hidden = false;
					}
					else{
						document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + risposteDaValutare[i].domanda;
						var immagine = document.getElementById('immagineRispostaPlayer');
						immagine.src = risposteDaValutare[i].immagine;
						rispostaAttuale = risposteDaValutare[i];
						document.getElementById('testoRispostaPlayer').hidden = false;
						document.getElementById('immagineRispostaPlayer').hidden = false;
					}
					i=risposteDaValutare.length;
					inserisci = false;
				}
			}
			if(inserisci){
				console.log("Per il momento non ci sono risposte da valutare per questo player");
				rispostaAttuale = null;
				var element = document.getElementById('testoRispostaPlayer');
				element.innerHTML = "";
			}
			
			//visualizza il bottone per salvare i dati del player se ha concluso la partita
			inserisci = false;
			for(i=0; i<datiDaSalvare.length; i++){
				if(datiDaSalvare[i].player == idGiocatore){
					inserisci = true;
				}
			}
			if (inserisci){
				document.getElementById('salvaDati').hidden = false;
			}else{
				document.getElementById('salvaDati').hidden = true;
			}
		}
	});
	
	//bottone 'torna alla pagina principale'
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});
	
	//funzione che al click di "invia" invia il messaggio al player e copia il messaggio come message-right e nella lista dei messaggi
	$('#invia').click(function(){
		messaggioValutatore = document.getElementById('testoDaInviare').value;
		socket.emit('chat message', messaggioValutatore, nomeValutatore, idGiocatore);
		document.getElementById("messaggiChat").innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioValutatore + "</div></div></div>";
		messaggi.push({nomeTrasmittente : nomeValutatore, nomeRicevente: idGiocatore, messaggio : messaggioValutatore});
		document.getElementById('testoDaInviare').value = '';
	});

	//funzione che spedisce la valutazione al player corrente e gestisce il caricamento di una nuova risposta da valutare
	function emettiValutazione(valutazione) {
		var commentoValutazione = document.getElementById("testoValutazione").value;
		document.getElementById("testoValutazione").value = "";
		for (i=0;i<risposteDaValutare.length;i++){
			if(risposteDaValutare[i].domanda == rispostaAttuale.domanda
					&&	risposteDaValutare[i].risposta == rispostaAttuale.risposta
					&&	risposteDaValutare[i].player == rispostaAttuale.player
					&&	risposteDaValutare[i].immagine == rispostaAttuale.immagine){
				socket.emit('valutazione', rispostaAttuale.domanda, valutazione, commentoValutazione, idGiocatore);
				console.log("valutazione spedita al player");
				risposteDaValutare.splice(i, 1);
				i=risposteDaValutare.length;
				document.getElementById('testoRispostaPlayer').hidden = true;
				document.getElementById('immagineRispostaPlayer').hidden = true;
			}
		}
		console.log("VALUTATORE: Risposte ancora da valutare: " + JSON.stringify(risposteDaValutare));

		inserisci = true;
		for (i=0;i<risposteDaValutare.length;i++){
			//se la risposta da valutare corrisponde a quella spedita dal player attualmente scelto
			if (risposteDaValutare[i].player == idGiocatore){
				//se la risposta da valutare contiene solo testo
				if(risposteDaValutare[i].immagine == null){
					document.getElementById('testoRispostaPlayer').hidden = false;
					document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + risposteDaValutare[i].domanda;
					document.getElementById('testoRispostaPlayer').innerHTML += "<br>RISPOSTA: " + risposteDaValutare[i].risposta;
					rispostaAttuale = risposteDaValutare[i];
				}
				//se la risposta da valutare contiene solo un'immagine
				else{
					document.getElementById('testoRispostaPlayer').hidden = false;
					document.getElementById('immagineRispostaPlayer').hidden = false;
					document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + risposteDaValutare[i].domanda;
					var immagine = document.getElementById('immagineRispostaPlayer');
					immagine.src = risposteDaValutare[i].picture;
					rispostaAttuale = risposteDaValutare[i];
				}
				i=risposteDaValutare.length;
				inserisci = false;
			}
		}
		//nel caso in cui per il giocatore selezionato non ci siano più risposte da valutare
		if (inserisci == true){
			console.log("Per il momento non ci sono piu' risposte da valutare per questo player");
			rispostaAttuale = null;
			var element = document.getElementById('testoRispostaPlayer');
			element.innerHTML = "";
		}
	}
	
	$("#valutazione1").click(function(){
		emettiValutazione("1");
	});
	
	$("#valutazione2").click(function(){
		emettiValutazione("2");
	});
	
	$("#valutazione3").click(function(){
		emettiValutazione("3");
	});
	
	$("#valutazione4").click(function(){
		emettiValutazione("4");
	});
	
	$("#valutazione5").click(function(){
		emettiValutazione("5");
	});
	
	$("#valutazione6").click(function(){
		emettiValutazione("6");
	});
	
	$("#valutazione7").click(function(){
		emettiValutazione("7");
	});
	
	$("#valutazione8").click(function(){
		emettiValutazione("8");
	});
	
	$("#valutazione9").click(function(){
		emettiValutazione("9");
	});
	
	$("#valutazione10").click(function(){
		emettiValutazione("10");
	});
	
	$("#salvaDati").click(function(){
		var text;
		for(i=0; i<datiDaSalvare.length; i++){
			if(datiDaSalvare[i].player == idGiocatore){
				text = JSON.stringify(datiDaSalvare[i]);
				console.log("text : " + text);
			}
		}
		var data = new Blob([text], {type: 'application/json'});
		var url = window.URL.createObjectURL(data);
		document.getElementById('salvaDati').href = url;

		//TODO reindirizza player alla pagina principale
		socket.emit('disconnesso', idGiocatore);
		
		contatoreDisconnessi++;
		var playersList = document.getElementsByTagName("input");
		for (i = 0; i < playersList.length; i++) {
			if (playersList[i].value == idGiocatore) {
				playersList[i].value = "Disconnesso" + contatoreDisconnessi;
			}
		}
		var labels = document.getElementsByTagName('LABEL');
		for (i = 0; i < labels.length; i++) {
			if (labels[i].htmlFor == idGiocatore) {
				labels[i].innerHTML = "<label for=Disconnesso" + contatoreDisconnessi + ">Disconnesso" + contatoreDisconnessi + "</label>";
			}
		}
		idGiocatore = "Disconnesso" + contatoreDisconnessi;
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
		if (inserisci && player!=""){
			utenti.push({nome : player, avanzamento : null, numAttivita : null});
			document.getElementById('giocatore').innerHTML += "<div class='form-check'><input name='giocatore' type='radio' value='" + player + "' id='" + player + "'><label for=" + player + ">" + player + "</label></div>";
		}

		//aggiunge il messaggio nella lista dei messaggi
		messaggi.push({nomeTrasmittente : player, nomeRicevente: valutatore, messaggio : msg});

		console.log("messaggi : " + JSON.stringify(messaggi));
		//aggiunge il messaggio direttamente in chat se corrisponde all'idGiocatore attualmente cliccato
		if (idGiocatore == player){
			document.getElementById("messaggiChat").innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
		}else{//cambia il color del giocatore per far notare che è in attesa di visualizzazione da parte del valutatore
			if(msg != "Sono " + player + ". Mi sono connesso"){
				var labels = document.getElementsByTagName('LABEL');
				for (i = 0; i < labels.length; i++) {
					if (labels[i].htmlFor == player) {
						labels[i].style.color = "#8B008B";
						labels[i].style.textDecoration = "underline";
					}
				}
			}
		}
	});

	//funzione che modifica l'avanzamento del player
	socket.on('avanzamento', function(avanzamento, numAttivita, player) {
		console.log('VALUTATORE: messaggio di avanzamento dal player ' + player + " " + avanzamento + " " + numAttivita);
		
		//modifica la barra di avanzamento direttamente se corrisponde all'idGiocatore attualmente cliccato
		if (idGiocatore == player){
			modificaAvanzamento(avanzamento, numAttivita);
		}else{//cambia il color del giocatore per far notare che è in attesa di visualizzazione da parte del valutatore
			var labels = document.getElementsByTagName('LABEL');
			for (i = 0; i < labels.length; i++) {
				if (labels[i].htmlFor == player) {
					labels[i].style.color = "#ff6600";
					labels[i].style.textDecoration = "underline";
				}
			}
		}
		for (i=0;i<utenti.length;i++){
			if (utenti[i].nome == player){
				utenti[i].avanzamento = avanzamento;
				utenti[i].numAttivita = numAttivita;
			}
		}
	});

	socket.on('risposta testo', function(domanda, risposta, player) {
		console.log('VALUTATORE: risposta di testo dal player ' + player + ": domanda: " + domanda + ", risposta: " + risposta);

		//modifica il campo risposte da valutare direttamente se corrisponde all'idGiocatore attualmente cliccato
		if (idGiocatore == player){
			if (rispostaAttuale == null){
				document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + domanda;
				document.getElementById('testoRispostaPlayer').innerHTML += "<br>RISPOSTA: " + risposta;
				document.getElementById('testoRispostaPlayer').hidden = false;
				rispostaAttuale = {
					domanda: domanda,
					risposta : risposta,
					immagine : null,
					player : player
				}
			}	
		}else{//cambia il color del giocatore per far notare che è in attesa di visualizzazione da parte del valutatore
			var labels = document.getElementsByTagName('LABEL');
			for (i = 0; i < labels.length; i++) {
				if (labels[i].htmlFor == player) {
					labels[i].style.color = "#8b0000";
					labels[i].style.textDecoration = "underline";
				}
			}
		}
		risposteDaValutare.push({
			domanda: domanda,
			risposta : risposta,
			immagine : null,
			player : player
		});
		console.log("VALUTATORE: Risposte ancora da valutare" + JSON.stringify(risposteDaValutare));
	});

	socket.on('risposta immagine', function(domanda, picture, player) {
		console.log('VALUTATORE: risposta con immagine dal player ' + player + ": " + picture + ", domanda: " + domanda);

		//modifica il campo risposte da valutare direttamente se corrisponde all'idGiocatore attualmente cliccato
		if (idGiocatore == player){
			if(rispostaAttuale == null){
				document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + domanda;
				var immagine = document.getElementById('immagineRispostaPlayer');
				immagine.src = picture;
				document.getElementById('testoRispostaPlayer').hidden = false;
				document.getElementById('immagineRispostaPlayer').hidden = false;
				rispostaAttuale = {
					domanda : domanda,
					risposta : null,
					immagine : picture,
					player : player
				}
			}
		}else{//cambia il color del giocatore per far notare che è in attesa di visualizzazione da parte del valutatore
			var labels = document.getElementsByTagName('LABEL');
			for (i = 0; i < labels.length; i++) {
				if (labels[i].htmlFor == player) {
					labels[i].style.color = "#8b0000";
					labels[i].style.textDecoration = "underline";
				}
			}
		}
		risposteDaValutare.push({
			domanda: domanda,
			risposta : null,
			immagine : picture,
			player : player
		});
		console.log("VALUTATORE: Risposte ancora da valutare" + JSON.stringify(risposteDaValutare));
	});

	socket.on('dati riassuntivi', function(datiRiassuntivi, punteggio, player) {
		console.log("VALUTATORE: dati riassuntivi da: " + player + " con punteggio: " + punteggio + " : " + datiRiassuntivi);
		if (idGiocatore == player){
			document.getElementById('salvaDati').hidden = false;
		}else{//cambia il color del giocatore per far notare che è in attesa di visualizzazione da parte del valutatore
			var labels = document.getElementsByTagName('LABEL');
			for (i = 0; i < labels.length; i++) {
				if (labels[i].htmlFor == player) {
					labels[i].style.color = "#00cc00";
					labels[i].style.textDecoration = "underline";
				}
			}
		}
		datiDaSalvare.push({
			player : player,
			datiRiassuntivi : JSON.parse(datiRiassuntivi),
			punteggio : punteggio
		});
	});

	socket.on('disconnesso', function(player) {
		console.log("VALUTATORE: player: " + player + " disconnesso");

		//cancella i messaggi relativi al player dall'array
		for (i = 0; i < messaggi.length; i++) {
			if (messaggi[i].nomeTrasmittente == player || messaggi[i].nomeRicevente == player ){//se il messaggio arriva dal player
				messaggi.splice(i,1);
				i--;
			}
		}

		//cancella le risposte da valutare relative al player dall'array
		for (i = 0; i < risposteDaValutare.length; i++) {
			if (risposteDaValutare[i].player == player){//se il messaggio arriva dal player
				risposteDaValutare.splice(i,1);
				i--;
			}
		}

		//cancella i dati da salvare relativi al player dall'array
		for (i = 0; i < datiDaSalvare.length; i++) {
			if (datiDaSalvare[i].player == player){//se il messaggio arriva dal player
				datiDaSalvare.splice(i,1);
				i--;
			}
		}

		//cancella l'utente relativo al player dall'array
		for (i = 0; i < utenti.length; i++) {
			if (utenti[i].nome == player){//se il messaggio arriva dal player
				utenti.splice(i,1);
				i--;
			}
		}

		if (idGiocatore == player){
			document.getElementById('salvaDati').hidden = true;
			modificaAvanzamento(0, 0);
			idGiocatore = "Disconnesso" + contatoreDisconnessi;
		}
		
		contatoreDisconnessi++;
		var playersList = document.getElementsByTagName("input");
		for (i = 0; i < playersList.length; i++) {
			if (playersList[i].value == player) {
				playersList[i].value = "Disconnesso" + contatoreDisconnessi;
			}
		}
		var labels = document.getElementsByTagName('LABEL');
		for (i = 0; i < labels.length; i++) {
			if (labels[i].htmlFor == player) {
				labels[i].innerHTML = "<label for=Disconnesso" + contatoreDisconnessi + ">Disconnesso" + contatoreDisconnessi + "</label>";
			}
		}
	});

});