function cambiaPagina(url) {
    window.location.replace(url);
}

$(document).ready(function () {
    
	var nomeGiocatore = "";
	var messaggioPlayer = "";
	var valutatore = "valutatore";
	var socket = io();
	var i; //Contatore missioni
    var j; //Contatore attivita
	var storia = {};
	var numMissioni; //Numero delle missioni (lunghezza missioni)
    var numAttivita; //Numero delle attivita della missione i (lunghezza attivita)
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
    var punteggioIntermedio = 0.0;
    var punteggioTotale = 0;
    let picture;
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'environment', canvasElement);
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
    
    //Setta il focus al primo paragrafo della pagina iniziale del player
    var primoElemento = document.getElementById('primoElemento');
    primoElemento.setAttribute("tabindex", "0");
    primoElemento.focus();
    
	//Appena il player si connette manda un messaggio al valutatore
	$('#nome').click(function(){
        document.getElementById('bottoneChat').hidden = false;
        document.getElementById('nomeUtenteErrato').hidden = true;
        nomeGiocatore = document.getElementById('nomeGiocatore').value;
        nomeGiocatore = nomeGiocatore.replaceAll(" ", "");
        document.getElementById('nomeGiocatore').value = "";
        socket.emit('connesso', nomeGiocatore, 'player');

        setTimeout(function(){
            if(document.getElementById('nomeUtenteErrato').hidden == true){
                messaggioPlayer = "Sono " + nomeGiocatore + ". Mi sono connesso";
                socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
                document.getElementById('campoNomeGiocatore').hidden = true;
                document.getElementById('campoTestoIniz').hidden = true;
                document.getElementById('row1').hidden = false;
                document.getElementById('campoChat').hidden = false;
                document.getElementById('row4').hidden = false;
                document.getElementById('footer').hidden = false;
                
                i = 0;
                j = 0;
                numMissioni = storia.missioni.length;
                numAttivita = storia.missioni[0].attivita.length;
                for (z=0; z<storia.missioni.length; z++){
                    if (storia.missioni[z].stato == "attiva"){
                        for(var y=0; y<storia.missioni[z].attivita.length; y++){
                            if(storia.missioni[z].attivita[y].stato == "attiva"){
                                contatoreAttivita++;
                            }
                        }
                    }
                }
                caricaAttivita();
            }
        }, 100);
	});
    
    //Chat tra player e valutatore
	$('#invia').click(function(){
		messaggioPlayer = document.getElementById('testoDaInviare').value;
		socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
		document.getElementById('messaggiChat').innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioPlayer + "</div></div></div>";
		document.getElementById('testoDaInviare').value = "";
	});
    
    //-- Socket-on
	socket.on('chat message', function(msg, trasmittente, ricevente){
        document.getElementById('messaggiChat').innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
	});
    
    socket.on('valutazione', function(domanda, valutazione, commentoValutazione, player){
        contatoreValutazioniEffettive++;
        punteggio += parseFloat(valutazione);
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
        if(i == (numMissioni-1) && j == (numAttivita-1)){ //Se siamo nell'ultima attivita dell'ultima missione allora visualizza le valutazioni
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
    
    //Gestione fotocamera from https://www.npmjs.com/package/webcam-easy e https://github.com/bensonruan/webcam-easy
    $('#bottoneFoto').click(function(){
        webcam.start()
           .then(result =>{
              console.log("Webcam started.");
           })
           .catch(err => {
               console.log(err);
           });
        
        var bottoneScattaFoto = document.getElementById('scattaFoto');
        bottoneScattaFoto.focus();
    });
    
    $('#scattaFoto').click(function(){
        picture = webcam.snap();
        var newDiv = document.getElementById('fotoAnteprima');
        var newImg = document.createElement("img");
        newImg.setAttribute("width", "100em");
        newImg.setAttribute("src", picture);
        newImg.setAttribute("alt", "Anteprima foto scattata");
        var immagineJson = JSON.stringify(newImg);
        newDiv.appendChild(newImg);
        console.log("Acquisita immagine.");
        webcam.stop();
        console.log("Webcam stopped.");
        
        var testoAnteprimaFoto = document.getElementById('testoAnteprimaFoto');
        testoAnteprimaFoto.setAttribute('tabindex', '0');
        testoAnteprimaFoto.focus();
    });
    
    $('#bottoneRuotaFotocamera').click(function(){
        //facingMode = user - fotocamera frontale
        //facingMode = environment - fotocamera posteriore
        webcam._facingMode = (webcam._facingMode == 'user')? 'environment': 'user'; //Se modalità user allora passa all'environment, altrimenti modalità user
        webcam.selectCamera();
        webcam.start();
        
        var bottoneScattaFoto = document.getElementById('scattaFoto');
        bottoneScattaFoto.focus();
    });
    
    $('#aiuto').click(function(){
        var campoMessaggio = document.getElementById('campoMessaggio');
        campoMessaggio.setAttribute('tabindex', '0');
        campoMessaggio.focus();
        
        document.getElementById('campoMessaggio').hidden = false;
        document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.aiuto;
        if(storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto){
            document.getElementById('campoMessaggio').innerHTML += "<br> <img height='200em' src='"+storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto+"' alt='Immagine inerente al messaggio di aiuto'>"
        }
    });
    
    $('#avanti').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        cambioAttivita();
    });
    
    $('#risposta1').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta1').value){ //Metodo js che prende il valore contenuto nel bottone
            punteggio += punteggioIntermedio;
            cambioAttivita();
        }
        else{
            //Messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= parseFloat(storia.missioni[i].attivita[j].rispostebottoni.punteggio)/4.0;
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
            
            var campoMessaggio = document.getElementById('campoMessaggio');
            campoMessaggio.setAttribute('tabindex', '0');
            campoMessaggio.focus();
        }
    });
    
    $('#risposta2').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta2').value){
            punteggio += punteggioIntermedio;
            cambioAttivita();
        }
        else{
            //Messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= parseFloat(storia.missioni[i].attivita[j].rispostebottoni.punteggio)/4.0;
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
            
            var campoMessaggio = document.getElementById('campoMessaggio');
            campoMessaggio.setAttribute('tabindex', '0');
            campoMessaggio.focus();
        }
    });
    
    $('#risposta3').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta3').value){
            punteggio += punteggioIntermedio;
            cambioAttivita();
        }
        else{
            //Messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= parseFloat(storia.missioni[i].attivita[j].rispostebottoni.punteggio)/4.0;
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
            
            var campoMessaggio = document.getElementById('campoMessaggio');
            campoMessaggio.setAttribute('tabindex', '0');
            campoMessaggio.focus();
        }
    });
    
    $('#risposta4').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta4').value){
            punteggio += punteggioIntermedio;
            cambioAttivita();
        }
        else{
            //Messaggio di incitamento nel caso di risposta sbagliata
            punteggioIntermedio -= parseFloat(storia.missioni[i].attivita[j].rispostebottoni.punteggio)/4.0;
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
            
            var campoMessaggio = document.getElementById('campoMessaggio');
            campoMessaggio.setAttribute('tabindex', '0');
            campoMessaggio.focus();
        }
    });
    
    $('#inviaRisposta').click(function(){
        var risposta = document.getElementById('nameTextArea').value;
        var domanda = storia.missioni[i].attivita[j].domanda;
        //Inserisco l'oggetto js dentro l'array, settando i valori dei rispettivi campi
        valutazioni.push({
            domanda : domanda,
            risposta : risposta,
            immagine : null,
            valutazione : null,
            commentoValutazione : null
        });
        
        //Se il campo risposta è vuoto allora la risposta testuale sarà valutata dall'Ambiente Valutatore
        if(storia.missioni[i].attivita[j].camporisposta == ""){
            socket.emit('risposta testo', domanda, risposta, nomeGiocatore);
        }
        else{ //Se il campo risposta contiene un valore allora la risposta testuale sarà valutata automaticamente dal server
            var rispostaCorretta = storia.missioni[i].attivita[j].camporisposta;
            rispostaCorretta = rispostaCorretta.toLowerCase();
            socket.emit('black-box', domanda, risposta, rispostaCorretta, nomeGiocatore);
        }
        cambioAttivita();
    });
    
    $('#inviaRispostaFoto').click(function(){
        var domanda = storia.missioni[i].attivita[j].domanda;
        socket.emit('risposta immagine', domanda, picture, nomeGiocatore);
        //Inserisco l'oggetto js dentro l'array, settando i valori dei rispettivi campi
        valutazioni.push({
            domanda : domanda,
            risposta : null,
            immagine : picture,
            valutazione : null,
            commentoValutazione : null
        });
        cambioAttivita();
    });
    
    $("#aiutoChat").click(function(){
        var messaggioPlayer = "RICHIESTA AIUTO: " + storia.missioni[i].attivita[j].domanda;
        socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
        document.getElementById('messaggiChat').innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioPlayer + "</div></div></div>";
        document.getElementById('campoChat').hidden = false;
        
        var messaggioStaticoChat = document.getElementById('messaggioStaticoChat');
        messaggioStaticoChat.setAttribute('tabindex', '0');
        messaggioStaticoChat.focus();
    });
    
    $("#bottoneChat").click(function(){
        if(document.getElementById('campoChat').hidden == true){
            document.getElementById('campoChat').hidden = false;
            
            var messaggioStaticoChat = document.getElementById('messaggioStaticoChat');
            messaggioStaticoChat.setAttribute('tabindex', '0');
            messaggioStaticoChat.focus();
        }
        else{
            document.getElementById('campoChat').hidden = true;
        }
    });
    
    $("#bottoneChiudiChat").click(function(){
        document.getElementById('campoChat').hidden = true;
        
        var domanda = document.getElementById('domanda');
        domanda.setAttribute('tabindex', '0');
        domanda.focus();
    });

    $("#campoMessaggio").keydown(function(e){
       document.getElementById('risposta1').focus();
    });
    
    //Richiedo la storia al server
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/player/ottienistoria', true); //Apro connessione tipo GET
    xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200){
    		var storiaJson = xhr.responseText; //Ottengo storia in formato json
    		console.log(storiaJson);
            storia = JSON.parse(storiaJson); //Ottengo storia in js
    	}
    };
    xhr.send();
    
    //-- Funzione per caricare le attività presenti nella storia
    function caricaAttivita(){
        if(i == 0 && j == 0){
            var domanda = document.getElementById('domanda');
            domanda.setAttribute('tabindex', '0');
            domanda.focus();
        }
        if(storia.missioni[i].attivita[j].stato == "attiva" && storia.missioni[i].stato == "attiva"){
            contatoreAvanzamento++;
            console.log("CONTATORI: Avanzamento " + contatoreAvanzamento + " di " + contatoreAttivita + " attività, nome giocatore: " + nomeGiocatore);
            socket.emit('avanzamento', contatoreAvanzamento, contatoreAttivita, nomeGiocatore);
            document.getElementById('campoChat').hidden = true;
            //Caso in cui è presente una domanda nella storia json
            if (storia.missioni[i] && storia.missioni[i].attivita[j].domanda){
                document.getElementById('domanda').innerHTML = storia.missioni[i].attivita[j].domanda;
                var altezzaDomanda = document.getElementById('domanda').offsetHeight; //Prende l'altezza della nuvola della domanda
                altezzaDomanda = altezzaDomanda + 20;
                var domanda = document.getElementById('row1');
                domanda.style.height = altezzaDomanda.toString() + "px"; //Converte in stringa il valore dell'altezza della domanda (intero)
            }
            else {
                document.getElementById('domanda').innerHTML = "";
            }
            //Caso in cui è presente il bottone avanti nella storia json
            if (storia.missioni[i] && storia.missioni[i].attivita[j].avanti){
                document.getElementById('campoAvanti').hidden = false;
            }
            else {
                document.getElementById('campoAvanti').hidden = true;
            }
            //Caso in cui è presente l'immagine dello sfondo
            if(storia.missioni[i] && storia.missioni[i].attivita[j].immaginesfondo){
                matchMediaQuery(x);
                
                /*document.body.style.background = "url('"+storia.missioni[i].attivita[j].immaginesfondo+"') no-repeat fixed";
                var altezzaFinestra = window.outerHeight; //Restituisce l'altezza dell'intera finestra del browser, incluse eventuali barre laterali e bordi di ridimensionamento delle finestre.
                var larghezzaFinestra = window.outerWidth; //Restituisce la larghezza dell'intera finestra del browser, inclusa la barra laterale (se espansa) e i bordi di ridimensionamento della finestra.
                //var altezzaFinestra = window.innerHeight;
                //var larghezzaFinestra = window.innerWidth;
                document.body.style.backgroundSize = larghezzaFinestra + "px " + altezzaFinestra + "px";*/
            }
            else {
                document.body.style.background = "white";
            }
            //Caso in cui è presente il campo di inserimento testo per la valutazione della risposta
            if(storia.missioni[i].attivita[j].camporisposta != null && storia.missioni[i].attivita[j].camporisposta == ""){
                contatoreValutazioni++;
                punteggioTotale += 10;
                document.getElementById('campoTextArea').hidden = false;
            }
            else{
                if(storia.missioni[i].attivita[j].camporisposta != null && storia.missioni[i].attivita[j].camporisposta != ""){
                    contatoreValutazioni++;
                    punteggioTotale += 1;
                    document.getElementById('campoTextArea').hidden = false;
                }
                else{
                    document.getElementById('nameTextArea').value = "";
                    document.getElementById('campoTextArea').hidden = true;
                }
            }
            //Caso in cui è presente il campo di inserimento foto per la valutazione della risposta
            if(storia.missioni[i].attivita[j].camporispostafoto != null && storia.missioni[i].attivita[j].camporispostafoto == ""){
                contatoreValutazioni++;
                punteggioTotale += 10;
                document.getElementById('campoFoto').hidden = false;
            }
            else{
                document.getElementById('campoFoto').hidden = true;
            }
            //Caso in cui è presente la scelta delle risposte (rispsote bottoni)
            if(storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni){
                punteggioIntermedio = parseFloat(storia.missioni[i].attivita[j].rispostebottoni.punteggio);
                punteggioTotale += punteggioIntermedio;
                document.getElementById('campoRisposte').hidden = false;
                //Randomizza l'ordine dei bottoni delle risposte
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
                document.getElementById('campoRisposte').hidden = true;
            }
            //Caso in cui è presente l'aiuto
            if(storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni && storia.missioni[i].attivita[j].rispostebottoni.aiuto){
                document.getElementById('aiuto').hidden = false;
            }
            else{
                document.getElementById('aiuto').hidden = true;
                document.getElementById('campoMessaggio').innerHTML = "";
            }
        }
        else{
            //Stato: disattiva
            cambioAttivita();
        }
    }
    
    //-- Funzione che gestisce lo sfondo in base alla dimensione dello schermo
    function matchMediaQuery(x) {
      if (x.matches) { //If media query matches
          document.body.style.background = "url('"+storia.missioni[i].attivita[j].immaginesfondo+"') no-repeat fixed";
          var altezzaPagina = document.getElementById('contenitorePagina').height;
          document.body.style.height = altezzaPagina; 
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundPosition = "center center";
      }
      else {
          document.body.style.background = "url('"+storia.missioni[i].attivita[j].immaginesfondo+"') no-repeat fixed";
          var altezzaFinestra = window.outerHeight; //Restituisce l'altezza dell'intera finestra del browser, incluse eventuali barre laterali e bordi di ridimensionamento delle finestre.
          var larghezzaFinestra = window.outerWidth; //Restituisce la larghezza dell'intera finestra del browser, inclusa la barra laterale (se espansa) e i bordi di ridimensionamento della finestra.
          document.body.style.backgroundSize = larghezzaFinestra + "px " + altezzaFinestra + "px";
      }
    }

    var x = window.matchMedia("(max-width: 415px)");
    
    //-- Funzione per cambiare attività
    function cambioAttivita(){
        var domanda = document.getElementById('domanda');
        domanda.setAttribute('tabindex', '0');
        domanda.focus();
        
        if (storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni && (storia.missioni[i].attivita[j].stato == "attiva" && storia.missioni[i].stato == "attiva")){
            var tentativi = 0;
            switch(punteggioIntermedio){
                    case storia.missioni[i].attivita[j].rispostebottoni.punteggio :
                        tentativi = 1;
                        break;
                    case storia.missioni[i].attivita[j].rispostebottoni.punteggio - storia.missioni[i].attivita[j].rispostebottoni.punteggio/4 :
                        tentativi = 2;
                        break;
                    case  storia.missioni[i].attivita[j].rispostebottoni.punteggio - 2 * (storia.missioni[i].attivita[j].rispostebottoni.punteggio/4) :
                        tentativi = 3;
                        break;
                    default :
                        tentativi = 4;
                        break;
            }
            //Inserisco l'oggetto js dentro l'array, settando i valori dei rispettivi campi (risposta bottoni)
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
            //Inserisco l'oggetto js dentro l'array, settando i valori dei rispettivi campi (risposta testo)
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
            //Inserisco l'oggetto js dentro l'array, settando i valori dei rispettivi campi (risposta foto)
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
            else{ //Messaggio di conclusione storia
                document.getElementById('campoNomeGiocatore').hidden = true;
                document.getElementById('row1').hidden = false;
                document.getElementById('campoTestoIniz').hidden = true;
                document.getElementById('campoRisposte').hidden = true;
                document.getElementById('campoChat').hidden = true;
                document.getElementById('footer').hidden = true;
                document.getElementById('campoAvanti').hidden = true;
                document.getElementById('bottoneChat').hidden = true;
                document.getElementById('campoFoto').hidden = true;
                document.getElementById('campoTextArea').hidden = true;
                document.body.style.background = "white";
                document.getElementById('domanda').innerHTML = "Complimenti! Hai terminato con successo la storia. Sotto potrai vedere visualizzate tutte le tue valutazioni che prima erano in attesa di una valutazione. Quando tutte le tue risposte saranno state valutate potrai inviare i tuoi dati riassuntivi attraverso l'apposito bottone in basso a sinistra.";
                inserisciMargine = true; //Settato solo per la prima volta che chiamo visualizzaValutazioni
                visualizzaValutazioni();
            }
        }
    }
    
    //-- Funzione per visualizzare le valutazioni
    function visualizzaValutazioni(){
        //Informazioni da visualizzare le prendo dall'array valutazioni[]
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
                    newDiv.appendChild(Img); //Aggiunge un nodo alla fine dell'elenco di figli di un nodo genitore specificato
                    newDiv.innerHTML += "<br>" + "Valutazione: " + valutazioni[z].valutazione + "<br>" + "Commento alla valutazione: " + valutazioni[z].commentoValutazione + "<br>" + "<br>";
                }
                if(inserisciMargine == true){ //Se è la prima volta che chiamo visualizzaValutazioni allora setto il margine superiore
                    var altezzaDomanda = document.getElementById('domanda').offsetHeight; //Prende l'altezza della nuvola della domanda
                    altezzaDomanda = altezzaDomanda + 20;
                    newDiv.style.marginTop = altezzaDomanda.toString() + "px"; //Converte in stringa il valore dell'altezza della domanda (intero)
                }
                inserisciMargine = false;
                newDiv.style.marginBottom = "50px";
                newDiv.style.width = "900px";
                newDiv.style.fontFamily = "Baskerville";
                newDiv.style.fontSize = "20px";
                var oldDiv = document.getElementById('row1');
                oldDiv.appendChild(newDiv);
                window.scroll();
                valutazioni.splice(z,1); //Elimino un solo oggetto in posizione z
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
            console.log("Dati riassuntivi inviati: " + JSON.stringify(datiRiassuntivi));
        }
    }
    
    $("#inviaDatiRiassuntivi").click(function(){
        socket.emit("dati riassuntivi", JSON.stringify(datiRiassuntivi), punteggioTotale, nomeGiocatore);
        var myNode = document.getElementById("row1");
        
        //Elimina la visualizzazione dalle valutazioni
        while (myNode.children[1]) { //Elimina tutti i figli a partire dal secondo
               myNode.removeChild(myNode.children[1]);
        }
        
        //punteggio : punteggioTotale = x : 10 -> x = (punteggio * 10) / punteggioTotale
        var x = punteggio * 10 / punteggioTotale;
        
        if(x > 0 && x < 4){
            document.getElementById('domanda').innerHTML = "Hai totalizzato: " + punteggio + " punti su " + punteggioTotale + ". Sei riuscito a portare a termine la tua partita ma la prossima volta prova ad impegnarti di più! <br> Resta in attesa fino a quando non verrai reindirizzato alla pagina principale.";
        }
        else if(x >= 4 && x < 7){
            document.getElementById('domanda').innerHTML = "Hai totalizzato: " + punteggio + " punti su " + punteggioTotale + ". Sei stato bravo nel portare a termine la partita ma sappiamo che puoi dare molto di più! <br> Resta in attesa fino a quando non verrai reindirizzato alla pagina principale.";
        }
        else{
            document.getElementById('domanda').innerHTML = "Hai totalizzato: " + punteggio + " punti su " + punteggioTotale + ". Sei stato bravissimo! Ottima partita! <br> Resta in attesa fino a quando non verrai reindirizzato alla pagina principale.";
        }
        
        document.getElementById('inviaDatiRiassuntivi').hidden = true;
        
        var domanda = document.getElementById('domanda');
        domanda.setAttribute('tabindex', '0');
        domanda.focus();
    });

    $("#paginaPrincipale").click(function() {
        cambiaPagina('primaPagina.html');
    });
    
});
