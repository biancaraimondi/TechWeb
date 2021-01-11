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
            missione : valore,
            attivita: valore,
            rispostaAlunno : valore,
            valutazione : valore
        },
        {
            missione : valore,
            attivita: valore,
            rispostaAlunno : valore,
            valutazione : valore
        }
    ]*/
	
	//appena il player si connette manda un messaggio al valutatore
	$('#nome').click(function(){
        document.getElementById('nomeUtenteErrato').hidden = true;
        nomeGiocatore = document.getElementById('nomeGiocatore').value;
        document.getElementById('nomeGiocatore').value = "";
        messaggioPlayer = "Sono " + nomeGiocatore + ". Mi sono connesso";
        socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
        //setTimeout(function(){
            //if(document.getElementById('nomeUtenteErrato').hidden == true){
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
                    contatoreAttivita += storia.missioni[z].attivita.length;
                }
                caricaAttivita();
            //}
        //}, 1000);
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
        if(msg == "nomeErrato"){
            document.getElementById('nomeUtenteErrato').hidden = false;
        }
        else{
		document.getElementById('messaggiChat').innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
        }
	});
    
    socket.on('valutazione', function(missione, attivita, valutazione){
        contatoreValutazioniEffettive++;
        for(z=0; z < valutazioni.length; z++){
            if(valutazioni[z].missione == missione && valutazioni[z].attivita == attivita){
                valutazioni[z].valutazione = valutazione;
            }
        }
        console.log("Messaggio ricevuto dal valutatore: " + valutazione);
    });
    
    /*socket.on('nome', function(pippo){
        document.getElementById('nomeUtenteErrato').hidden = false;
        console.log("Siamo dentro a nome: " + pippo);
    });*/
    
    $('#aiuto').click(function(){
        document.getElementById('campoMessaggio').hidden = false;
        document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.aiuto;
        if(storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto){
            //document.getElementById('campoMessaggio').innerHTML += storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto;
            document.getElementById('campoMessaggio').innerHTML += "<img width='4em' src='"+storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto+"'>"
        }
    });
    
    //gestione fotocamera from https://www.laboratoriolibero.com/corsi/jobselect/11/Lezione_11_camera.pdf
    $('#bottoneFoto').click(function(){
        var app = {
            initialize: function(){
                this.bindEvents();
            },
            bindEvents: function(){
                document.addEventListener('deviceready', this.onDeviceReady, false);
            },
            onDeviceReady: function(){
                  $("#bottoneFoto").click(function(){
                      navigator.camera.getPicture(app.onCameraSuccess, app.onCameraError, {
                            sourceType: Camera.PictureSourceType.CAMERA, //acquisizione immagine con fotocamera di default
                            correctOrientation: true,
                            quality: 50,
                            destinationType: navigator.camera.DestinationType.FILE_URI //restituisce il file URI dell’immagine
                       });
                  });
            },
            onCameraSuccess: function(imageURI){
                document.getElementById('fotoAnteprima').width("40em");
                document.getElementById('fotoAnteprima').src = imageURI;
             },
            onCameraError: function(errorMessage){
                  alert("Errore");
            }
            
        };
        app.initialize();
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
            cambioAttivita();
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#risposta2').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta2').value){ //metodo js che prende il valore contenuto nel bottone
            cambioAttivita();
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#risposta3').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta3').value){ //metodo js che prende il valore contenuto nel bottone
            cambioAttivita();
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#risposta4').click(function(){
        document.getElementById('campoMessaggio').innerHTML = "";
        document.getElementById('campoMessaggio').hidden = true;
        if(storia.missioni[i].attivita[j].rispostebottoni.giusta == document.getElementById('risposta4').value){ //metodo js che prende il valore contenuto nel bottone
            cambioAttivita();
        }
        else{
            //messaggio di incitamento nel caso di risposta sbagliata
            document.getElementById('campoMessaggio').hidden = false;
            document.getElementById('campoMessaggio').innerHTML = storia.missioni[i].attivita[j].rispostebottoni.incoraggiamento;
        }
    });
    
    $('#inviaRisposta').click(function(){
        var risposta = document.getElementById('nameTextArea').value;
        socket.emit('risposta testo', risposta, i, j, nomeGiocatore);
        console.log(risposta + " " + nomeGiocatore);
        valutazioni.push({
            missione : i,
            attivita: j,
            rispostaAlunno : risposta,
            valutazione : null
        });
        cambioAttivita();
    });
    
    $('#inviaRispostaFoto').click(function(){
        const reader = new FileReader();
          reader.onload = function() {
            const base64 = this.result.replace(/.*base64,/, '');
              console.log(base64);
            socket.emit('risposta immagine', base64, nomeGiocatore);
          };
          //reader.readAsDataURL(this.files[0]);
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
        contatoreAvanzamento++;
        console.log("contatori: " + contatoreAvanzamento + " " + contatoreAttivita + " " + nomeGiocatore);
        socket.emit('avanzamento', contatoreAvanzamento, contatoreAttivita, nomeGiocatore);
        //document.getElementById('campoMessaggio').hidden = true;
        //caso in cui è presente una domanda nella storia json
        if (storia.missioni[i] && storia.missioni[i].attivita[j].domanda){
            console.log("Entrato nell'if del campo domanda");
            document.getElementById('domanda').innerHTML = storia.missioni[i].attivita[j].domanda;
        }
        else {
            console.log("Entrato nell'else del campo domanda");
            document.getElementById('domanda').innerHTML = "";
            //document.getElementById('domanda').hidden = true;
        }
        if(storia.missioni[i] && storia.missioni[i].attivita[j].immaginedomanda){
            console.log("Entrato nell'if del campo immagine della domanda");
            document.getElementById('domanda').innerHTML += "<img width='4em' src='"+storia.missioni[i].attivita[j].immaginedomanda+"'>"
        }
        else {
            console.log("Entrato nell'else del campo immagine della domanda");
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
        //caso in cui è presente l'imm sfondo
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
            console.log("Entrato nell'if del campo risposta");
            document.getElementById('campoTextArea').hidden = false;
        }
        else{
            console.log("Entrato nell'else del campo risposta");
            document.getElementById('nameTextArea').value = "";
            document.getElementById('campoTextArea').hidden = true;
        }
        if(storia.missioni[i].attivita[j].camporispostafoto != null && storia.missioni[i].attivita[j].camporispostafoto == ""){
            contatoreValutazioni++;
            console.log("Entrato nell'if del campo risposta foto");
            document.getElementById('campoFoto').hidden = false;
        }
        else{
            console.log("Entrato nell'else del campo risposta foto");
            document.getElementById('campoFoto').hidden = true;
        }
        //caso in cui è presente la scelta delle risposte (rispsote bottoni) nella storia json
        if(storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni){
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
            if (storia.missioni[i] && storia.missioni[i].attivita[j].rispostebottoni && storia.missioni[i].attivita[j].rispostebottoni.immagineaiuto){
                
            }
        }
        else{
            console.log("Entrato nell'else dell'aiuto");
            document.getElementById('aiuto').hidden = true;
            document.getElementById('campoMessaggio').innerHTML = "";
        }
    } //chiusura function caricaAttivita
    
    function cambioAttivita(){
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
                document.getElementById('row4').hidden = true;
                document.getElementById('domanda').innerHTML = "Complimenti! Hai terminato con successo la storia. Sotto potrai vedere visualizzate tutte le tue valutazioni che prima erano in attesa di valutazione. Quando tutte le tue risposte saranno state valutate potrai ritornare alla pagina principale cliccando il pulsante in basso a sinistra.";
                visualizzaValutazioni();
                /*while(contatoreValutazioniEffettive < contatoreValutazioni){
                    setInterval(visualizzaValutazioni, 5000);
                }*/
                document.getElementById('footer').hidden = false;
            }
        }
    } //chiusura function cambioAttivita
    
    function visualizzaValutazioni(){
        //le info da visualizzare le prendo dall'array valutazioni[]
        for(z=0; z < valutazioni.length; z++){
            var newDiv = document.createElement("div");
            newDiv.innerHTML = "Domanda: " + storia.missioni[valutazioni[z].missione].attivita[valutazioni[z].attivita].domanda + "<br>" + "Risposta: " + valutazioni[z].rispostaAlunno + "<br>" + "Valutazione: " + valutazioni[z].valutazione;
            newDiv.style.margin = "180px 20px 30px 20px";
            newDiv.style.width = "900px";
            newDiv.style.height = "500px";
            //newDiv.style.top = "50%";
            //newDiv.style.left = "50%";
            newDiv.style.fontFamily = "Baskerville";
            var oldDiv = document.getElementById('row1');
            oldDiv.appendChild(newDiv);
            valutazioni.splice(z,1);
            z--;
        }
    } //chiusura function visualizzaValutazioni

    $(".navbar-toggler").click(function() {
        cambiaPagina('primaPagina.html');
    });
    
}); //chiusura document.ready
