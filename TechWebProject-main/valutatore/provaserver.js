var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require("fs");
var utenti = [];
var nomeDisconnesso = '';
var inserisci = true;

app.use(express.static(__dirname));//utilizzato per includere css e js

app.get('/valutatore', function (req, res) {
  res.sendFile(__dirname + '/ambienteValutatore.html');
});

app.get('/player', function (req, res) {
	res.sendFile(__dirname + '/NewFile.html');
});

app.get('/utenti', function (req, res) {
	/*fs.readFile( __dirname + "/utenti.json", function (err, data) {
		console.log( data );
		res.end( data );
	});*/
	
	var json = fs.readFileSync("utenti.json");
	obj = JSON.parse(json);
	console.log("nome: ", obj.nome);
	console.log("storia: ", obj.storia);
	
	/*fs.readFile('utenti.json', function (err, data){
		
		var obj2 = {nome : "Mario", storia :"storia2"};
		
		if (err){
			console.log(err);
		} else {
			obj = JSON.parse(data);
			console.log(obj);
			obj.utenti.push(obj2);
			var json = JSON.stringify(obj, null, 2);
			fs.writeFile('utenti.json', json);
		}
	});*/
	
	
	/*{
		"utenti" : [
			{
				"nome" : "Giacomo",
				"storia" : "storia1"
			},
			{
				"nome" : "Sara",
				"storia" : "storia2"
			},
			{
				"nome" : "Marco",
				"storia" : "storia1"
			}
		]
	}*/
});

io.on('connection', function (socket) {
	console.log('SERVER: user ' + socket.id + ' connected');
	socket.on('chat message', function (msg, trasmittente, ricevente) {//'chat message' deve essere uguale nel file ambienteValutatore.js come parametro di socket.emit
		
		//se l'utente non è già connesso, lo inseriamo nella lista degli utenti connessi
		inserisci = true;
		for (i=0;i<utenti.length;i++){
			if(utenti[i].nome == trasmittente){
				if(trasmittente == 'valutatore'){
					utenti[i].socket = socket.id;
				}
				inserisci = false;
			}
		}
		if (inserisci){
			utenti.push({nome : trasmittente, socket : socket.id});
			console.log('SERVER: utenti: ' + utenti);//mostra gli utenti connessi
		}
		console.log('SERVER: message from ' + trasmittente + ' to ' + ricevente + ': ' + msg);
		
		var socketUtente = '';
		inserisci = true;
		for (i=0;i<utenti.length;i++){
			if (utenti[i].nome == ricevente){
				socketUtente = utenti[i].socket;
				socket.to(socketUtente).emit('chat message', msg, trasmittente, ricevente);
			}
		}
		
	});
	socket.on('disconnect', function () {
		nomeDisconnesso = '';
		for (i=0;i<utenti.length;i++){
			if (utenti[i].socket == socket.id){
				nomeDisconnesso = utenti[i].nome;
			}
		}
		//TODO se il valutatore si disconnette mandare un messaggio ai giocatori
		/*if(nomeDisconnesso == 'valutatore'){
			msg='il valutatore si è disconnesso, riprova a mandare i messaggi';
			trasmittente='valutatore';
			socket.broadcast.emit('chat message', msg, trasmittente, '');
		}*/
		console.log('SERVER: user ' + socket.id + ' disconnected. (' + nomeDisconnesso + ')');
	});
	
});

http.listen(3000, function () {
  console.log('SERVER: listening on *:3000');
});