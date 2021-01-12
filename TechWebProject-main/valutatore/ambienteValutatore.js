var idGiocatore = "";//player visualizzato attualmente
var nomeValutatore = "valutatore";//il valutatore può essere solo uno
var utenti = [];//lista dei nomi dei player -> {nome, avanzamento, numAttivita}
var messaggi = [];//lista dei messaggi in chat non ancora visualizzati dal valutatore -> {nomeTrasmittente, nomeRicevente, messaggio}
var inserisci;//booleano utilizzato per i cicli for
var playersList;//variabile utilizzata nell'ottenere il valore del player da visualizzare
var i;//iteratore per cicli for
var idGiocatorePrecendente;//player visualizzato precedentemente
var socket = io();//utilizzato per gestire la chat
var storia = {};
var rispostaAttuale = null;
var risposteDaValutare = [];

function cambiaPagina(url) {
	window.location.replace(url);
}

//prende in input il numero di domande a cui il player ha risposto correttamente e modifica l'avanzamento nella schermata del valutatore
function modificaAvanzamento(domandeCompletate, domandeEffettive) {
	//var avanzamentoAttuale = $(".progress-bar").width();
	var fineMissioni = $(".progress").width();
	if (domandeEffettive)
		$(".progress-bar").width(domandeCompletate * fineMissioni/domandeEffettive);
	else
		$(".progress-bar").width(0);
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
					utenti.push({nome : obj[i].nome, avanzamento : obj[i].avanzamento, numAttivita : obj[i].attivita});
					document.getElementById('giocatore').innerHTML += "<div class='form-check'><input name='giocatore' type='radio' value='" + obj[i].nome + "' id='" + obj[i].nome + "'><label for=" + obj[i].nome + ">" + obj[i].nome + "</label></div>";
				}
			}
			//mostra i player connessi
			console.log('VALUTATORE: players: ');
			for(i=0;i<utenti.length;i++){
				console.log('nome: ' + utenti[i].nome);
			}

			//appena il valutatore si connette crea il relativo utente all'interno del server
			messaggioValutatore = nomeValutatore + " connesso";
			socket.emit('chat message', messaggioValutatore, nomeValutatore, idGiocatore);
			console.log('VALUTATORE: valutatore connesso alla chat');
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
	
	//ottiene le risposte date dai player
	var xmlhttp3 = new XMLHttpRequest();
	xmlhttp3.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			for (i=0;i<obj.length;i++){
				risposteDaValutare.push({missione : obj[i].missione, attivita: obj[i].attivita, risposta : obj[i].risposta, immagine : obj[i].immagine, player : obj[i].player});
			}
			console.log(JSON.stringify(risposteDaValutare));
		}
	};
	xmlhttp3.open("GET", "/valutatore/risposte", true);
	xmlhttp3.send();
	
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/player/ottienistoria', true); //apro connessione tipo GET
    xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200){
    		var storiaJson = xhr.responseText; //ottengo storia in formato json	
    		console.log(storiaJson);
            storia = JSON.parse(storiaJson); //ottengo storia in js
    		console.log(JSON.stringify(storia));
    	}
    };
    xhr.send();
	
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
			
			//visualizza l'avanzamento del giocatore selezionato
			for (i=0;i<utenti.length;i++){
				if (utenti[i].nome == idGiocatore){
					console.log("VALUTATORE: contatori: " + utenti[i].avanzamento + " " + utenti[i].numAttivita + " " + utenti[i].nome);
					modificaAvanzamento(utenti[i].avanzamento, utenti[i].numAttivita);
				}
			}
			
			//visualizza le risposte da valutare del giocatore selezionato
			for (i=0;i<risposteDaValutare.length;i++){
				if (risposteDaValutare[i].player == idGiocatore){
					document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + storia.missioni[risposteDaValutare[i].missione].attivita[risposteDaValutare[i].attivita].domanda;
					document.getElementById('testoRispostaPlayer').innerHTML += "<br>RISPOSTA: " + risposteDaValutare[i].risposta;
					rispostaAttuale = risposteDaValutare[i];
					i=risposteDaValutare.length;
				}
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

	function emettiValutazione(valutazione) {
		var commentoValutazione = document.getElementById("testoValutazione").value;
		document.getElementById("testoValutazione").value = "";
		for (i=0;i<risposteDaValutare.length;i++){
			if(risposteDaValutare[i].missione == rispostaAttuale.missione
					&&	risposteDaValutare[i].attivita == rispostaAttuale.attivita
					&&	risposteDaValutare[i].risposta == rispostaAttuale.risposta
					&&	risposteDaValutare[i].player == rispostaAttuale.player){
				socket.emit('valutazione', rispostaAttuale.missione, rispostaAttuale.attivita, valutazione, commentoValutazione, idGiocatore);
				console.log("valutazione spedita al player");
				risposteDaValutare.splice(i, 1);
				i=risposteDaValutare.length;
			}
		}
		console.log("risposteDaValutare: " + JSON.stringify(risposteDaValutare));
		//TODO gestire se si carica un'immagine o un testo
		inserisci = true;
		for (i=0;i<risposteDaValutare.length;i++){
			if (risposteDaValutare[i].player == idGiocatore){
				document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + storia.missioni[risposteDaValutare[i].missione].attivita[risposteDaValutare[i].attivita].domanda;
				document.getElementById('testoRispostaPlayer').innerHTML += "<br>RISPOSTA: " + risposteDaValutare[i].risposta;
				rispostaAttuale = risposteDaValutare[i];
				i=risposteDaValutare.length;
				inserisci = false;
			}
		}
		if (inserisci == true){
			console.log("Per il momento non ci sono piu' risposte da valutare per questo player");
			rispostaAttuale = null;
			var element = document.getElementById('testoRispostaPlayer');
			element.innerHTML = "";
		}
	}
	
	/*$("#si").click(function(){
		emettiValutazione("si");
	});
	
	$("#no").click(function() {
		emettiValutazione("no");
	});*/
	
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
			utenti.push({nome : player, avanzamento : null, numAttivita : null});
			document.getElementById('giocatore').innerHTML += "<div class='form-check'><input name='giocatore' type='radio' value='" + player + "' id='" + player + "'><label for=" + player + ">" + player + "</label></div>";
		}
		
		//aggiunge il messaggio direttamente in chat se corrisponde all'idGiocatore attualmente cliccato
		if (idGiocatore == player){
			document.getElementById("messaggiChat").innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
		}
		messaggi.push({nomeTrasmittente : player, nomeRicevente: valutatore, messaggio : msg});
	});
	
	//funzione che modifica l'avanzamento del player
	socket.on('avanzamento', function(avanzamento, numAttivita, player) {
		console.log('VALUTATORE: messaggio di avanzamento dal player ' + player + " " + avanzamento + " " + numAttivita);
		
		//modifica la barra di avanzamento direttamente se corrisponde all'idGiocatore attualmente cliccato
		if (idGiocatore == player){
			modificaAvanzamento(avanzamento, numAttivita);
		}
		for (i=0;i<utenti.length;i++){
			if (utenti[i].nome == player){
				utenti[i].avanzamento = avanzamento;
				utenti[i].numAttivita = numAttivita;
			}
		}
	});
            
    socket.on('risposta testo', function(risposta, missione, attivita, player) {
            console.log('VALUTATORE: risposta di testo dal player ' + player + ": " + risposta + ", missione: " + missione + ", attivita: " + attivita);
            
            //modifica il campo risposte da valutare direttamente se corrisponde all'idGiocatore attualmente cliccato
            if (idGiocatore == player && rispostaAttuale == null){
                //TODO creare funzione per valutare la risposta testuale del player
            	console.log("VALUTATORE: la rispostaAttuale è null");
            	document.getElementById('testoRispostaPlayer').innerHTML = "DOMANDA: " + storia.missioni[missione].attivita[attivita].domanda;
    			document.getElementById('testoRispostaPlayer').innerHTML += "<br>RISPOSTA: " + risposta;
                rispostaAttuale = {
                        missione : missione,
                        attivita: attivita,
                        risposta : risposta,
                        immagine : null,
                        player : player
                    }
            }
            risposteDaValutare.push({
                        missione : missione,
                        attivita: attivita,
                        risposta : risposta,
                        immagine : null,
                        player : player
                    });
            console.log(JSON.stringify(risposteDaValutare));
        });
});
