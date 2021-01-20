function cambiaPagina(url) {
    window.location.replace(url);
}

$(document).ready(function () {
	var nomeGiocatore = "";
	var messaggioPlayer = "";
	var valutatore = "valutatore";
	var socket = io();
	var i; //contatore missioni
    var j; //contatore attivita
	var storia = {};
	var numMissioni; //lunghezza missioni -> numero delle missioni
    var numAttivita; //lunghezza attivita -> numero delle attivita della missione i
    var contatoreAvanzamento = 0;
    var contatoreAttivita = 0;
    var z = 0;
    var contatoreValutazioni = 0;
    var contatoreValutazioniEffettive = 0;
    var valutazioni = [];
    /*valutazioni[
        {
            domanda: valore,
            risposta : valore,
            immagine : valore,
            valutazione : valore,
            commentoValutazione : valore
        }
    ]*/
    var inserisciMargine;
    var punteggio = 0.0;
    var punteggioIntermedio = 1.0;
    var punteggioTotale = 0;
    let picture;
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'user', canvasElement);
    var datiRiassuntivi = [];
    /*datiRiassuntivi[
        {
            domanda: valore,
            rispostaTesto : valore,
            rispostaImmagine : valore,
            rispostaBottoni : valore,
            tentativi : valore,
            valutazione : valore,
            commentoValutazione : valore
        }
    ]*/
    
	//appena il player si connette manda un messaggio al valutatore
	$('#nome').click(function(){
        document.getElementById('bottoneChat').hidden = false;
        document.getElementById('nomeUtenteErrato').hidden = true;
        nomeGiocatore = document.getElementById('nomeGiocatore').value;
        document.getElementById('nomeGiocatore').value = "";
        socket.emit('connesso', nomeGiocatore, 'player');

        setTimeout(function(){
            if(document.getElementById('nomeUtenteErrato').hidden == true){
                messaggioPlayer = "Sono " + nomeGiocatore + ". Mi sono connesso";
                socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
                document.getElementById('campoNomeGiocatore').hidden = true;
                document.getElementById('campoTestoIniz').hidden = true;
                document.getElementById('row1').hidden = false;
                //document.getElementById('campoRisposte').hidden = false;
                document.getElementById('campoChat').hidden = false;
                document.getElementById('row4').hidden = false;
                document.getElementById('footer').hidden = false;
                
                i = 0; //contatore per le missioni
                j = 0; //contatore per le attivita
                numMissioni = storia.missioni.length; //lunghezza missioni -> numero delle missioni
                numAttivita = storia.missioni[0].attivita.length; //lunghezza attivita -> numero delle attivita della missione i
                for(z = 0; z < numMissioni; z++){
                    contatoreAttivita += storia.missioni[z].attivita.length; //contiene il numero di tutte le attività che son presenti nella storia
                }
                caricaAttivita();
            }
        }, 100);
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
    
	socket.on('chat message', function(msg, trasmittente, ricevente){
        document.getElementById('messaggiChat').innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
	});
    
    socket.on('valutazione', function(domanda, valutazione, commentoValutazione, player){
        contatoreValutazioniEffettive++;
        punteggio += parseFloat(valutazione);
        console.log(punteggio);
        for(z=0; z < valutazioni.length; z++){
            if(valutazioni[z].domanda == domanda){
                valutazioni[z].valutazione = valutazione;
                valutazioni[z].commentoValutazione = commentoValutazione;
            }
        }
        for(z=0; z < datiRiassuntivi.length; z++){
            if(datiRiassuntivi[z].domanda == domanda){
                datiRiassuntivi[z].valutazione = valutazione;
                datiRiassuntivi[z].commentoValutazione = commentoValutazione;
            }
        }
        console.log("Messaggio ricevuto dal valutatore: " + valutazione);
        if(i == (numMissioni-1) && j == (numAttivita-1)){
            visualizzaValutazioni();
        }
    });
    
    socket.on('nomeErrato', function(){
        console.log("PLAYER: Nome Errato");
        document.getElementById('nomeUtenteErrato').hidden = false;
    });
    
    socket.on('disconnesso', function(player){
        cambiaPagina('primaPagina.html');
    });
    
    $('#aiuto').click(function(){
        document.getElementById('campoMessaggio').hidden = false;
        document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.aiuto;
        if(storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto){
            //document.getElementById('campoMessaggio').innerHTML += storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto;
            document.getElementById('campoMessaggio').innerHTML += "<br> <img height='200em' src='"+storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto+"' alt='Immagine inerente al messaggio di aiuto'>"
        }
    });
    
    //gestione fotocamera from https://www.npmjs.com/package/webcam-easy
    $('#bottoneFoto').click(function(){
        webcam.start()
           .then(result =>{
              console.log("Webcam started.");
           })
           .catch(err => {
               console.log(err);
           });
    });
    
    $('#scattaFoto').click(function(){
        picture = webcam.snap();
        var newDiv = document.getElementById('fotoAnteprima');
        var newImg = document.createElement("img");
        newImg.setAttribute("width", "100em");
        newImg.setAttribute("src", picture);
        newImg.setAttribute("alt", "Anteprima foto scattata");
        var immagineJson = JSON.stringify(newImg);
        console.log(immagineJson);
        newDiv.appendChild(newImg);
        console.log("Acquisita immagine.");
        webcam.stop();
        console.log("Webcam stopped.");
    });
    
    $('#avanti').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        cambioAttivita();
    });
    
    $('#risposta1').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta1').value){ //metodo js che prende il valore contenuto nel bottone
            punteggio += punteggioIntermedio;
            console.log(punteggio);
            cambioAttivita();
            punteggioIntermedio = 1;
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= 0.25;
            console.log(punteggio);
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#risposta2').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta2').value){ //metodo js che prende il valore contenuto nel bottone
            punteggio += punteggioIntermedio;
            console.log(punteggio);
            cambioAttivita();
            punteggioIntermedio = 1;
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= 0.25;
            console.log(punteggio);
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#risposta3').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta3').value){ //metodo js che prende il valore contenuto nel bottone
            punteggio += punteggioIntermedio;
            console.log(punteggio);
            cambioAttivita();
            punteggioIntermedio = 1;
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= 0.25;
            console.log(punteggio);
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#risposta4').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta4').value){ //metodo js che prende il valore contenuto nel bottone
            punteggio += punteggioIntermedio;
            console.log(punteggio);
            cambioAttivita();
            punteggioIntermedio = 1;
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= 0.25;
            console.log(punteggio);
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#inviaRisposta').click(function(){
        var risposta = document.getElementById('nameTextArea').value;
        var domanda = storia.missioni[i].attivita[j].domanda;
        socket.emit('risposta testo', domanda, risposta, nomeGiocatore);
        valutazioni.push({
            domanda : domanda,
            risposta : risposta,
            immagine : null,
            valutazione : null,
            commentoValutazione : null
        });
        cambioAttivita();
    });
    
    $('#inviaRispostaFoto').click(function(){
        var domanda = storia.missioni[i].attivita[j].domanda;
        socket.emit('risposta immagine', domanda, picture, nomeGiocatore);
        valutazioni.push({
            domanda : domanda,
            risposta : null,
            immagine : picture,
            valutazione : null,
            commentoValutazione : null
        });
        cambioAttivita();
    });
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/player/ottienistoria', true); //apro connessione tipo GET
    xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200){
    		var storiaJson = xhr.responseText; //ottengo storia in formato json	
    		console.log(storiaJson);
            storia = JSON.parse(storiaJson); //ottengo storia in js
    		//console.log(JSON.stringify(storia));
    	}
    };
    xhr.send();
    
    function caricaAttivita(){
        if(storia.missioni[i].attivita[j].stato == "attiva" && storia.missioni[i].stato == "attiva"){
            console.log("Entrato nell'if dello stato: ATTIVA");
            contatoreAvanzamento++;
            console.log("contatori: " + contatoreAvanzamento + " " + contatoreAttivita + " " + nomeGiocatore);
            socket.emit('avanzamento', contatoreAvanzamento, contatoreAttivita, nomeGiocatore);
            document.getElementById('campoChat').hidden = true;
            //document.getElementById('campoMessaggio').hidden = true;
            //caso in cui è presente una domanda nella storia json
            if (storia.missioni[i] && storia.missioni[i].attivita[j].domanda){
                console.log("Entrato nell'if del campo domanda");
                document.getElementById('domanda').innerHTML = storia.missioni[i].attivita[j].domanda;
                var altezzaDomanda = document.getElementById('domanda').offsetHeight;
                console.log(altezzaDomanda);
                altezzaDomanda = altezzaDomanda + 20;
                console.log(altezzaDomanda);
                var domanda = document.getElementById('row1');
                domanda.style.height = altezzaDomanda.toString() + "px";
                console.log(altezzaDomanda.toString() + "px");
            }
            else {
                console.log("Entrato nell'else del campo domanda");
                document.getElementById('domanda').innerHTML = "";
                //document.getElementById('domanda').hidden = true;
            }
            //caso in cui è presente il bottone avanti nella storia json
            if (storia.missioni[i] && storia.missioni[i].attivita[j].avanti){
                console.log("Entrato nell'if del pulsante avanti");
                document.getElementById('campoAvanti').hidden = false;
            }
            else {
                console.log("Entrato nell'else del pulsante avanti");
                document.getElementById('campoAvanti').hidden = true;
            }
            //caso in cui è presente l'immagine sfondo
            if(storia.missioni[i] && storia.missioni[i].attivita[j].immaginesfondo){
                console.log("Entrato nell'if dell'immagine sfondo");
                document.body.style.background = "url('"+storia.missioni[i].attivita[j].immaginesfondo+"') no-repeat fixed";
                var altezzaFinestra = window.outerHeight;
                var larghezzaFinestra = window.outerWidth;
                console.log("Altezza Finestra: " + altezzaFinestra);
                console.log("Larghezza Finestra: " + larghezzaFinestra);
                document.body.style.backgroundSize = larghezzaFinestra + "px " + altezzaFinestra + "px";
            }
            else {
                console.log("Entrato nell'else dell'immagine sfondo");
                document.body.style.background = "white";
            }
            //caso in cui è presente il campo di inserimento testo per la valutazione della risposta in amb. val.
            if(storia.missioni[i].attivita[j].camporisposta != null && storia.missioni[i].attivita[j].camporisposta == ""){
                contatoreValutazioni++;
                punteggioTotale += 10;
                console.log("Entrato nell'if del campo risposta");
                document.getElementById('campoTextArea').hidden = false;
            }
            else{
                console.log("Entrato nell'else del campo risposta");
                document.getElementById('nameTextArea').value = "";
                document.getElementById('campoTextArea').hidden = true;
            }
            //caso in cui è presente il campo di inserimento foto per la valutazione della risposta in amb. val.
            if(storia.missioni[i].attivita[j].camporispostafoto != null && storia.missioni[i].attivita[j].camporispostafoto == ""){
                contatoreValutazioni++;
                punteggioTotale += 10;
                console.log("Entrato nell'if del campo risposta foto");
                document.getElementById('campoFoto').hidden = false;
            }
            else{
                console.log("Entrato nell'else del campo risposta foto");
                document.getElementById('campoFoto').hidden = true;
            }
            //caso in cui è presente la scelta delle risposte (rispsote bottoni) nella storia json
            if(storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni){
                punteggioTotale++;
                console.log("Entrato nell'if del risposta bottoni");
                document.getElementById('campoRisposte').hidden = false;
                var numeroCasuale = Math.round(Math.random() * (4 - 1) + 1);
                switch(numeroCasuale){
                        case 1 :
                            document.getElementById('risposta1').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta1').value = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta2').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta2').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta3').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta3').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta4').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            document.getElementById('risposta4').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            break;
                        case 2 :
                            document.getElementById('risposta2').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta2').value = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta3').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta3').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta4').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta4').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta1').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            document.getElementById('risposta1').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            break;
                        case 3 :
                            document.getElementById('risposta3').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta3').value = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta4').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta4').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta1').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta1').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta2').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            document.getElementById('risposta2').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            break;
                        case 4 :
                            document.getElementById('risposta4').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta4').value = storia.missioni[i].attivita[j].rispostebottoni.giusta;
                            document.getElementById('risposta1').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta1').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata1;
                            document.getElementById('risposta2').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta2').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata2;
                            document.getElementById('risposta3').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            document.getElementById('risposta3').value = storia.missioni[i].attivita[j].rispostebottoni.sbagliata3;
                            break;
                }
            }
            else {
                console.log("Entrato nell'else del risposta bottoni");
                document.getElementById('campoRisposte').hidden = true;
            }
            //caso in cui è presente l'aiuto nella storia json
            if(storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni && storia.missioni[i].attivita[j].rispostebottoni.aiuto){
                console.log("Entrato nell'if dell'aiuto");
                document.getElementById('aiuto').hidden = false;
            }
            else{
                console.log("Entrato nell'else dell'aiuto");
                document.getElementById('aiuto').hidden = true;
                document.getElementById('campoMessaggio').innerHTML = "";
            }
        }
        else{
            console.log("Entrato nell'if dello stato: DISATTIVA");
            contatoreAttivita--;
            cambioAttivita();
        }
    } //chiusura function caricaAttivita
    
    function cambioAttivita(){
        if (storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni && (storia.missioni[i].attivita[j].stato == "attiva" && storia.missioni[i].stato == "attiva")){
            var tentativi = 0;
            console.log(punteggioIntermedio);
            switch(punteggioIntermedio){
                    case 1 :
                        tentativi = 1;
                        break;
                    case 0.75 :
                        tentativi = 2;
                        break;
                    case 0.5 :
                        tentativi = 3;
                        break;
                    default :
                        tentativi = 4;
                        break;
            }
            datiRiassuntivi.push({
                domanda: storia.missioni[i].attivita[j].domanda,
                rispostaTesto: null,
                rispostaImmagine: null,
                rispostaBottoni: storia.missioni[i].attivita[j].rispostebottoni.giusta,
                tentativi: tentativi,
                valutazione: null,
                commentoValutazione: null
            });
        }
        if (storia.missioni[i].attivita[j].camporisposta != null && storia.missioni[i].attivita[j].camporisposta == "" && (storia.missioni[i].attivita[j].stato == "attiva" && storia.missioni[i].stato == "attiva")){
            datiRiassuntivi.push({
                domanda: storia.missioni[i].attivita[j].domanda,
                rispostaTesto: document.getElementById('nameTextArea').value,
                rispostaImmagine: null,
                rispostaBottoni: null,
                tentativi: null,
                valutazione: null,
                commentoValutazione: null
            });
        }
        if(storia.missioni[i].attivita[j].camporispostafoto != null && storia.missioni[i].attivita[j].camporispostafoto == "" && (storia.missioni[i].attivita[j].stato == "attiva" && storia.missioni[i].stato == "attiva")){
            datiRiassuntivi.push({
                domanda: storia.missioni[i].attivita[j].domanda,
                rispostaTesto: null,
                rispostaImmagine: picture,
                rispostaBottoni: null,
                tentativi: null,
                valutazione: null,
                commentoValutazione: null
            });
        }
        if(j < numAttivita-1){
            j++;
            caricaAttivita();
        }
        else{
            if(i < numMissioni-1){
                i++;
                j = 0;
                numAttivita = storia.missioni[i].attivita.length;
                caricaAttivita();
            }
            else{ //messaggio di conclusione storia
                document.getElementById('campoNomeGiocatore').hidden = true;
                document.getElementById('row1').hidden = false;
                document.getElementById('campoTestoIniz').hidden = true;
                document.getElementById('campoRisposte').hidden = true;
                document.getElementById('campoChat').hidden = true;
                document.getElementById('footer').hidden = true;
                document.getElementById('campoAvanti').hidden = true;
                document.getElementById('domanda').innerHTML = "Complimenti! Hai terminato con successo la storia. Sotto potrai vedere visualizzate tutte le tue valutazioni che prima erano in attesa di valutazione. Quando tutte le tue risposte saranno state valutate potrai ritornare alla pagina principale cliccando il pulsante in basso a sinistra.";
                inserisciMargine = true;
                visualizzaValutazioni();
            }
        }
    } //chiusura function cambioAttivita
    
    function visualizzaValutazioni(){
        //le info da visualizzare le prendo dall'array valutazioni[]
        for(z=0; z < valutazioni.length; z++){
            var newDiv = document.createElement("div");
            if (valutazioni[z].valutazione != null && valutazioni[z].commentoValutazione != null){
                if (valutazioni[z].immagine == null){
                    newDiv.innerHTML = "<br> Domanda: " + valutazioni[z].domanda + "<br>" + "Risposta: " + valutazioni[z].risposta + "<br>" + "Valutazione: " + valutazioni[z].valutazione + "<br>" + "Commento alla valutazione: " + valutazioni[z].commentoValutazione + "<br>" + "<br>";
                }
                else{
                    newDiv.innerHTML = "<br> Domanda: " + valutazioni[z].domanda + "<br> Risposta immagine: ";
                    var Img = document.createElement("img");
                    Img.src = valutazioni[z].immagine;
                    Img.setAttribute("width", "150em");
                    Img.setAttribute("alt", "Foto scattata con fotocamera per la risposta");
                    newDiv.appendChild(Img);
                    newDiv.innerHTML += "<br>" + "Valutazione: " + valutazioni[z].valutazione + "<br>" + "Commento alla valutazione: " + valutazioni[z].commentoValutazione + "<br>" + "<br>";
                }
                if(inserisciMargine == true){
                    newDiv.style.marginTop = "180px";
                }
                inserisciMargine = false;
                newDiv.style.marginBottom = "50px";
                newDiv.style.width = "900px";
                newDiv.style.fontFamily = "Baskerville";
                newDiv.style.fontSize = "20px";
                var oldDiv = document.getElementById('row1');
                oldDiv.appendChild(newDiv);
                window.scroll();
                valutazioni.splice(z,1);
                z--;
            }
            if(contatoreValutazioniEffettive == contatoreValutazioni && z == valutazioni.length-1){
                var newDivDue = document.createElement("div");
                newDivDue.style.fontFamily = "Baskerville";
                newDivDue.style.fontSize = "20px";
                newDivDue.style.height = "100px";
                newDivDue.innerHTML = "Punteggio ottenuto: " + punteggio + "/" + punteggioTotale;
                newDivDue.style.fontWeight = "bold";
                newDivDue.style.float = "left";
                newDivDue.style.marginBottom = "300px";
                newDiv.appendChild(newDivDue);
            }
        }
        if(contatoreValutazioniEffettive == contatoreValutazioni && z == valutazioni.length){
            document.getElementById('footer').hidden = false;
            document.getElementById('paginaPrincipale').hidden = true;
            document.getElementById('inviaDatiRiassuntivi').hidden = false;
            console.log(JSON.stringify(datiRiassuntivi));
        }
    } //chiusura function visualizzaValutazioni
    
    $("#inviaDatiRiassuntivi").click(function(){
        socket.emit("dati riassuntivi", JSON.stringify(datiRiassuntivi), punteggioTotale, nomeGiocatore);
        var myNode = document.getElementById("row1");
        //elimina la visualizzazione delle valutazioni
        while (myNode.children[1]) { //elimina tutti i figli a partire dal secondo
               myNode.removeChild(myNode.children[1]);
        }
        //punteggio : punteggioTotale = x : 10 -> x = (punteggio * 10) / punteggioTotale
        var x = punteggio * 10 / punteggioTotale;
        console.log(x);
        if(x > 0 && x < 4){
            document.getElementById('domanda').innerHTML = "Hai totalizzato: " + punteggio + " punti su " + punteggioTotale + ". Sei riuscito a portare a termine la tua partita ma la prossima volta prova ad impegnarti di più! <br> Resta in attesa fino a quando non verrai reindirizzato alla pagina principale.";
        }
        else if(x >= 4 && x < 7){
            document.getElementById('domanda').innerHTML = "Hai totalizzato: " + punteggio + " punti su " + punteggioTotale + ". Sei stato bravo nel portare a termine la partita ma sappiamo che puoi dare di più! <br> Resta in attesa fino a quando non verrai reindirizzato alla pagina principale.";
        }
        else{
            document.getElementById('domanda').innerHTML = "Hai totalizzato: " + punteggio + " punti su " + punteggioTotale + ". Sei stato bravissimo! Ottima partita! <br> Resta in attesa fino a quando non verrai reindirizzato alla pagina principale.";
        }
        document.getElementById('inviaDatiRiassuntivi').hidden = true;
    });
    
    $("#aiutoChat").click(function(){
        var messaggioPlayer = "RICHIESTA AIUTO: " + storia.missioni[i].attivita[j].domanda;
        socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
        document.getElementById('messaggiChat').innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioPlayer + "</div></div></div>";
    });
    
    $("#bottoneChat").click(function(){
        if(document.getElementById('campoChat').hidden == true){
            document.getElementById('campoChat').hidden = false;
        }
        else{
            document.getElementById('campoChat').hidden = true;
        }
    });

    $("#paginaPrincipale").click(function() {
        cambiaPagina('primaPagina.html');
    });
    
}); //chiusura document.ready
