var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require("fs");
var utenti = [];//lista dei nomi e dei socket dei players
var messaggi = [];//lista dei messaggi (messaggio, trasmittente, ricevente)
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

app.get("/primaPagina/ottieniStorie", function(req,res){
	fs.readFile("storiaP.json",function(err,storie) {
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

app.get("/player/ottienistoria", function(req,res){
	console.log("nome della storia cliccata : " + storiaDaCaricare + ".json");
	fs.readFile(storiaDaCaricare + ".json",function(err,storia) {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
			res.end(storia); //invio risposta file storia
			console.log("storia spedita al player");
		}
	});	
});

//gestisce la chat tra valutatore e player
io.on('connection', function (socket) {
	console.log('SERVER: user ' + socket.id + ' connected');
	
	socket.on('storia', function (nomeStoria) {//es. storiaDaCaricare = 'interrail'
		storiaDaCaricare = nomeStoria;
	});
	
	socket.on('chat message', function (msg, trasmittente, ricevente) {//'chat message' deve essere uguale nel file ambienteValutatore.js come parametro di socket.emit
		
		//se l'utente non è già connesso, lo inseriamo nella lista degli utenti connessi
		inserisci = true;
		for (i=0;i<utenti.length;i++){
			if(utenti[i].nome == trasmittente){
				/*if(trasmittente == 'valutatore'){
					utenti[i].socket = socket.id;
				}*/
				inserisci = false;
			}
		}
		if (inserisci){
			utenti.push({nome : trasmittente, socket : socket.id});
			//mostra gli utenti connessi
			console.log('SERVER: utenti: ');
			for(i=0;i<utenti.length;i++){
				console.log('nome: ' + utenti[i].nome + ' socket: ' + utenti[i].socket);//mostra gli utenti connessi
			}
		}
		
		console.log('SERVER: message from ' + trasmittente + ' to ' + ricevente + ': ' + msg);
		
		messaggi.push({messaggio : msg, trasmittente : trasmittente, ricevente : ricevente});
		
		//invia il messaggio al destinatario 'ricevente'
		var socketUtente = '';
		inserisci = true;
		for (i=0;i<utenti.length;i++){
			if (utenti[i].nome == ricevente){
				socketUtente = utenti[i].socket;
				socket.to(socketUtente).emit('chat message', msg, trasmittente, ricevente);
			}
		}
		
	});
	
	//se un utente si disconnette
	socket.on('disconnect', function () {
		nomeDisconnesso = '';
		for (i=0;i<utenti.length;i++){
			if (utenti[i].socket == socket.id){
				nomeDisconnesso = utenti[i].nome;
			}
		}
		console.log('SERVER: user ' + socket.id + ' disconnected. (' + nomeDisconnesso + ')');
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