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
		document.getElementById('campoNomeGiocatore').hidden = true;
        document.getElementById('campoTestoIniz').hidden = true;
        document.getElementById('row1').hidden = false;
		//document.getElementById('campoRisposte').hidden = false;
		document.getElementById('campoChat').hidden = false;
        document.getElementById('row4').hidden = false;
        document.getElementById('footer').hidden = false;
		
		messaggioPlayer = "Sono " + nomeGiocatore + ". Mi sono connesso";
		socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
	});
	
    //chat tra player e valutatore
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
	
	i = 0; //contatore per le missioni
	j = 0; //contatore per le attivita
    var numMissioni = storia.missioni.length; //lunghezza missioni -> numero delle missioni
    var numAttivita = storia.missioni[i].attivita.length;//lunghezza attivita -> numero delle attivita della missione i
    
    /*var risposta1 = document.getElementById('risposta1');
    var risposta2 = document.getElementById('risposta2');
    var risposta3 = document.getElementById('risposta3');
    var risposta4 = document.getElementById('risposta4');*/
    
    /*var valore1 = '';
    var valore2 = '';
    var valore3 = '';
    var valore4 = '';
    if(document.getElementById('risposta1').checked) {
         valore1 = document.getElementById('risposta1').value;
    }
    else if(document.getElementById('risposta2').checked) {
         valore2 = document.getElementById('risposta2').value;
    }
    else if(document.getElementById('risposta3').checked) {
         valore3 = document.getElementById('risposta3').value;
    }
    else if(document.getElementById('risposta4').checked) {
         valore4 = document.getElementById('risposta4').value;
    }*/
    
    function caricaAttivita(){
        //caso in cui è presente una domanda nella storia json
        if (storia.missioni[i].attivita[j].domanda){
            console.log("Entrato nell'if del campo domanda");
            document.getElementById('domanda').innerHTML = storia.missioni[i].attivita[j].domanda;
        }
        else {
            console.log("Entrato nell'else del campo domanda");
            //document.getElementById('domanda').innerHTML = "";
            document.getElementById('domanda').hidden = true;
        }
        //caso in cui è presente il bottone avanti nella storia json
        if (storia.missioni[i].attivita[j].avanti){
            console.log("Entrato nell'if del pulsante avanti");
            document.getElementById('campoAvanti').hidden = false;
        }
        else {
            console.log("Entrato nell'else del pulsante avanti");
            document.getElementById('campoAvanti').hidden = true;
        }
        //caso in cui è presente l'immagine per l'aiuto -> richiamare funzione che fa qualcosa
        /*if (storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto == null){
            console.log("Entrato nell'if dell'immagine aiuto");
            //div con tag img per foto con src nome_foto
            document.getElementById('').innerHTML += "<div id='campoImmAiuto'><img height='' width='' src='nome_foto.jpg'></div>";
            //creare un pop up alert contenente l'immagine aiuto e la descrizione dell'aiuto e bottone ok, tenendo in sottofondo la pagina html con le risposte dei vari bottoni
        }
        else{
            console.log("Entrato nell'else dell'immagine aiuto");
            //setto src="" per annullare l'immagine dell'attivita precedente
            document.getElementById('').innerHTML += "<div id='campoImmAiuto'><img height='' width='' src=''></div>";
        }
        //caso in cui è presente il campo di inserimento testo per la valutazione della risposta in amb. val.
        if(storia.missioni[i].attivita[j].camporisposta){
            console.log("Entrato nell'if del campo risposta");
            //settare text input per testo da tastiera
            document.getElementById('campoRisposte').hidden = true;
            document.getElementById('row3').innerHTML += "<div id='campoTextArea'><label for='name'>Inserisci qui il testo:</label><input type='text' id='nameTextArea' name='name' size='35'></div>"
         
        }
        else{
            console.log("Entrato nell'else del campo risposta");
            //se non è presente in json non visulizzo il camporisposta
            //quindi non mi basta non fare semplicemente niente?
        }*/
        //caso in cui è presente la scelta delle risposte (rispsote bottoni) nella storia json 
        if(storia.missioni[i].attivita[j].rispostebottoni){
            console.log("Entrato nell'if del risposta bottoni");
            document.getElementById('campoRisposte').hidden = false;
            document.getElementById('risposta1').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
            document.getElementById('risposta2').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.giusta;
            document.getElementById('risposta3').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
            document.getElementById('risposta4').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
            /*var listaRadioButton = document.getElementsByTagName("input");
              for (i = 0; i < listaRadioButton.length; i++) {
              listaRadioButton[i].value = storia.missioni[i].attivita[j].rispostebottoni;
               }
            console.log(listaRadioButton);*/
           /* var listaButton = [document.getElementsByTagName("bottoni")];
            console.log(listaButton);
            for (i = 0; i < listaButton.length; i++){
                listaButton[i].value = storia.missioni[i].attivita[j].rispostebottoni;
                console.log(risposta1 = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1);
                risposta1 = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                console.log("Risposta sbagliata1: " + storia.missioni[i].attivita[j].rispostebottoni.sbagliata1);
                risposta2 = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                console.log("Risposta giusta: " + storia.missioni[i].attivita[j].rispostebottoni.giusta);
                risposta3 = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                console.log("Risposta sbagliata2: " + storia.missioni[i].attivita[j].rispostebottoni.sbagliata2);
                risposta4 = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                console.log("Risposta sbagliata3: " + storia.missioni[i].attivita[j].rispostebottoni.sbagliata3);
            }*/
            
        }
        else {
            console.log("Entrato nell'else del risposta bottoni");
            document.getElementById('campoRisposte').hidden = true;
        }
    } //chiusura function caricaAttivita
    
    caricaAttivita();
    
    $('#avanti').click(function(){
        if(j < numAttivita){
            j++;
        }
        else{
            if(i < numMissioni){
                i++;
                j = 0;
                numAttivita = storia.missioni[i].attivita.length;
            }
            else{ //messaggio di conclusione storia
                document.getElementById('campoNomeGiocatore').hidden = true;
                document.getElementById('campoTestoIniz').hidden = true;
                document.getElementById('row1').hidden = true;
                document.getElementById('campoRisposte').hidden = true;
                document.getElementById('campoChat').hidden = true;
                document.getElementById('footer').hidden = true;
                document.getElementById('row4').hidden = true;
                document.getElementById('row2').innerHTML += "<div id='messageEndStory'><p> Complimenti! Hai terminato con successo la storia. Ritorna alla pagina principale. </p></div>";
                document.getElementById('row4').innerHTML += "<button class='btn btn-dark btn-sm' type='button' id='ok'> OK </button>";
            }
        }
        caricaAttivita();
    });
    
    $('#risposta1').click(function(){
        /*if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta1').value){ //metodo js che prende il valore contenuto nel bottone
            if(j < numAttivita){
                j++;
            }
            else{
                if(i < numMissioni){
                    i++;
                    j = 0;
                    numAttivita = storia.missioni[i].attivita.length;
                }
                else{ //messaggio di conclusione storia
                    document.getElementById('campoNomeGiocatore').hidden = true;
                    document.getElementById('campoTestoIniz').hidden = true;
                    document.getElementById('row1').hidden = true;
                    document.getElementById('campoRisposte').hidden = true;
                    document.getElementById('campoChat').hidden = true;
                    document.getElementById('footer').hidden = true;
                    document.getElementById('row4').hidden = true;
                    document.getElementById('row2').innerHTML += "<div id='messageEndStory'><p> Complimenti! Hai terminato con successo la storia. Ritorna alla pagina principale. </p></div>";
                    document.getElementById('row4').innerHTML += "<button class='btn btn-dark btn-sm' type='button' id='ok'> OK </button>";
                }
            }
            caricaAttivita();
        }
        else{*/
            //messaggio di incitamento nel caso di risposta sbagliata
            alert("Sei proprio sicuro della risposta? Riprovaci!"); //crea un pop up con un messaggio
        //}
    });
    $('#risposta2').click(function(){
        /*if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta2').value){ //metodo js che prende il valore contenuto nel bottone*/
            if(j < numAttivita){
                j++;
            }
            else{
                if(i < numMissioni){
                    i++;
                    j = 0;
                    numAttivita = storia.missioni[i].attivita.length;
                }
                else{ //messaggio di conclusione storia
                    document.getElementById('campoNomeGiocatore').hidden = true;
                    document.getElementById('campoTestoIniz').hidden = true;
                    document.getElementById('row1').hidden = true;
                    document.getElementById('campoRisposte').hidden = true;
                    document.getElementById('campoChat').hidden = true;
                    document.getElementById('footer').hidden = true;
                    document.getElementById('row4').hidden = true;
                    document.getElementById('row2').innerHTML += "<div id='messageEndStory'><p> Complimenti! Hai terminato con successo la storia. Ritorna alla pagina principale. </p></div>";
                    document.getElementById('row4').innerHTML += "<button class='btn btn-dark btn-sm' type='button' id='ok'> OK </button>";
                }
            }
            caricaAttivita();
        //}
        /*else{
            //messaggio di incitamento nel caso di risposta sbagliata
            alert("Sei proprio sicuro della risposta? Riprovaci!"); //crea un pop up con un messaggio
        }*/
    });
    $('#risposta3').click(function(){
        /*if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta3').value){ //metodo js che prende il valore contenuto nel bottone
            if(j < numAttivita){
                j++;
            }
            else{
                if(i < numMissioni){
                    i++;
                    j = 0;
                    numAttivita = storia.missioni[i].attivita.length;
                }
                else{ //messaggio di conclusione storia
                    document.getElementById('campoNomeGiocatore').hidden = true;
                    document.getElementById('campoTestoIniz').hidden = true;
                    document.getElementById('row1').hidden = true;
                    document.getElementById('campoRisposte').hidden = true;
                    document.getElementById('campoChat').hidden = true;
                    document.getElementById('footer').hidden = true;
                    document.getElementById('row4').hidden = true;
                    document.getElementById('row2').innerHTML += "<div id='messageEndStory'><p> Complimenti! Hai terminato con successo la storia. Ritorna alla pagina principale. </p></div>";
                    document.getElementById('row4').innerHTML += "<button class='btn btn-dark btn-sm' type='button' id='ok'> OK </button>";
                }
            }
            caricaAttivita();
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata*/
            alert("Sei proprio sicuro della risposta? Riprovaci!"); //crea un pop up con un messaggio
        //}
    });
    $('#risposta4').click(function(){
        /*if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta4').value){ //metodo js che prende il valore contenuto nel bottone
            if(j < numAttivita){
                j++;
            }
            else{
                if(i < numMissioni){
                    i++;
                    j = 0;
                    numAttivita = storia.missioni[i].attivita.length;
                }
                else{ //messaggio di conclusione storia
                    document.getElementById('campoNomeGiocatore').hidden = true;
                    document.getElementById('campoTestoIniz').hidden = true;
                    document.getElementById('row1').hidden = true;
                    document.getElementById('campoRisposte').hidden = true;
                    document.getElementById('campoChat').hidden = true;
                    document.getElementById('footer').hidden = true;
                    document.getElementById('row4').hidden = true;
                    document.getElementById('row2').innerHTML += "<div id='messageEndStory'><p> Complimenti! Hai terminato con successo la storia. Ritorna alla pagina principale. </p></div>";
                    document.getElementById('row4').innerHTML += "<button class='btn btn-dark btn-sm' type='button' id='ok'> OK </button>";
                }
            }
            caricaAttivita();
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata*/
            alert("Sei proprio sicuro della risposta? Riprovaci!"); //crea un pop up con un messaggio
        //}
    });
	
    
    
}); //chiusura document.ready

