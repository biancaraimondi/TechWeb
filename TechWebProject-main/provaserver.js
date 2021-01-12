var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require("fs");
var utenti = [];//lista dei nomi e dei socket dei players {nome : valore, socket : socket.id, avanzamento : num, attivita : num}
var messaggi = [];//lista dei messaggi {messaggio : val, trasmittente : val, ricevente : val}
var risposteDaValutare = [];//lista delle risposte da valutare {missione : num, attivita: num, risposta : val, immagine : val, player : val}
var nomeDisconnesso = '';
var inserisci = true;
var storiaDaCaricare = "";

app.use(express.static(__dirname));//utilizzato per includere css e js

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/primaPagina.html');
});

app.get('/valutatore', function (req, res) {
    res.sendFile(__dirname + '/ambienteValutatore.html');
});

app.get('/autore', function (req, res) {
    res.sendFile(__dirname + '/autore.html');
});

app.get('/player', function (req, res) {
    res.sendFile(__dirname + '/player.html');
});

app.get("/valutatore/utenti", function(req,res){
    var loadUtenti = JSON.stringify(utenti);
    res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
    res.end(loadUtenti); //invio risposta array utenti
});

app.get("/valutatore/messaggi", function(req,res){
    var loadMessaggi = JSON.stringify(messaggi);
    res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
    res.end(loadMessaggi); //invio risposta array messaggi
});

app.get("/valutatore/risposte", function(req,res){
    var loadRisposte = JSON.stringify(risposteDaValutare);
    res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
    res.end(loadRisposte); //invio risposta array messaggi
});

app.get("/primaPagina/ottieniStorie", function(req,res){
    fs.readFile("storie.json",function(err,storie) {
        if (err){
            console.log(err);
            res.status(500).send('Internal server error');
        }
        else {
            res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
            res.end(storie);
        }
    });
});

//TODO gestire solo una storia finchè non ci sono più player
app.get("/player/ottienistoria", function(req,res){
    fs.readFile(storiaDaCaricare + ".json",function(err,storia) {
        if (err){
            console.log(err);
            res.status(500).send('Internal server error');
        }
        else {
            res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
            res.end(storia); //invio risposta file storia
        }
    });
});

//gestisce lo scambio di informazioni tra valutatore e player (connessi)
io.on('connection', function (socket) {
    console.log('SERVER: user ' + socket.id + ' connected');

    //inserisce nella variabile storiaDaCaricare la storia scelta dal valutatore nella prima pagina
    socket.on('storia', function (nomeStoria) {//es. storiaDaCaricare = 'interrail'
        storiaDaCaricare = nomeStoria;
    });

    //gestisce la chat tra valutatore e player
    socket.on('chat message', function (msg, trasmittente, ricevente) {
        console.log('SERVER: message from ' + trasmittente + ' to ' + ricevente + ': ' + msg);
        //se l'utente non è già connesso, lo inseriamo nella lista degli utenti connessi
        inserisci = true;
        var nomeCorretto = true;
        for (i=0;i<utenti.length;i++){
            if(utenti[i].nome == trasmittente){
            	//se l'utente ha inserito un nome che è già nella lista allora gli spediamo un messaggio con scritto di cambiare nome
                if(utenti[i].socket !== socket.id){
                	nomeCorretto = false;
                    io.to(socket.id).emit('nomeErrato');
                    console.log("SERVER: spedito al player un messaggio per cambiare nome");
                }
                inserisci = false;
            }
        }
        if (inserisci){
            console.log(trasmittente);
            utenti.push({nome : trasmittente, socket : socket.id, avanzamento : null, attivita : null});
        }
        
        console.log("SERVER: utenti: " + JSON.stringify(utenti));
        
        //invia il messaggio al destinatario 'ricevente'
        var socketUtente = '';
        console.log("nome corretto: " + nomeCorretto);
        if(nomeCorretto){
	        messaggi.push({messaggio : msg, trasmittente : trasmittente, ricevente : ricevente});
	        for (i=0;i<utenti.length;i++){
	            if (utenti[i].nome == ricevente){
	                socketUtente = utenti[i].socket;
	                socket.to(socketUtente).emit('chat message', msg, trasmittente, ricevente);
	                console.log("MESSAGGIO SPEDITO");
	            }
	        }
        }
        
    });
    
    //gestisce l'avanzamento della storia da parte del player e lo spedisce al valutatore
    socket.on('avanzamento', function (contatoreAvanzamento, contatoreAttivita, player) {
        console.log("SERVER: avanzamento: " + contatoreAvanzamento + " " + contatoreAttivita + " " + player);
        var z = 0;
        var socketUtente = "";
        for(z=0; z<utenti.length; z++){
            if(utenti[z].nome == 'valutatore'){
                socketUtente = utenti[z].socket;
            }
            if(utenti[z].nome == player){
                utenti[z].avanzamento = contatoreAvanzamento;
                utenti[z].attivita = contatoreAttivita;
            }
        }
        socket.to(socketUtente).emit('avanzamento', contatoreAvanzamento, contatoreAttivita, player);
        console.log("SERVER: avanzamento spedito al valutatore");
    });
    
    //gestisce le risposte date dal player
    socket.on('risposta testo', function (risposta, missione, attivita, player) {
        console.log("SERVER: risposta testo: " + risposta + " inviata da " + player + ", missione: " + missione + ", attivita: " + attivita);
        risposteDaValutare.push({missione : missione, attivita: attivita, risposta : risposta, immagine : null, player : player});
        var z = 0;
        var socketUtente = "";
        for(z=0; z<utenti.length; z++){
            if(utenti[z].nome == 'valutatore'){
                socketUtente = utenti[z].socket;
            }
        }
        socket.to(socketUtente).emit('risposta testo', risposta, missione, attivita, player);
        console.log("SERVER: inviata risposta testuale al valutatore");
    });
    
    socket.on('valutazione', function (missione, attivita, valutazione, commentoValutazione, player) {
        console.log("SERVER: valutazione: " + valutazione + ", missione: " + missione + ", attivita: " + attivita + ", player: " + player);
        var z = 0;
        var socketUtente = "";
        for(z=0; z<utenti.length; z++){
            if(utenti[z].nome == player){
                socketUtente = utenti[z].socket;
            }
        }
        socket.to(socketUtente).emit('valutazione', missione, attivita, valutazione, commentoValutazione, player);
        console.log("SERVER: inviata vautazione al player");
    });
    
    //se un utente si disconnette
    socket.on('disconnect', function () {
        nomeDisconnesso = '';
        for (i=0;i<utenti.length;i++){
            if (utenti[i].socket == socket.id){
                nomeDisconnesso = utenti[i].nome;
                utenti.splice(i, 1);
                i--;
            }
        }
        console.log('SERVER: user ' + socket.id + ' disconnected. (' + nomeDisconnesso + ')');
        console.log('SERVER: utenti: ' + JSON.stringify(utenti));
        var msg='Mi sono disconnesso, non riuscirò più a ricevere i tuoi messaggi';
        //invia un messaggio al valutatore se il disconnesso è un player
        if (nomeDisconnesso != 'valutatore'){
            var socketValutatore='';
            for (i=0;i<utenti.length;i++){
                if (utenti[i].nome == 'valutatore'){
                    socketValutatore = utenti[i].socket;
                }
            }
            socket.to(socketValutatore).emit('chat message', msg, nomeDisconnesso, 'valutatore');
        } else {//invia un messaggio ai players se il disconnesso è il valutatore
            socket.broadcast.emit('chat message', msg, nomeDisconnesso, '');
        }
    });
    
});

http.listen(3000, function () {
  console.log('SERVER: listening on *:3000');
});
