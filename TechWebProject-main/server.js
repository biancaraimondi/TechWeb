//----- Express.js
var express = require('express');
var app = express();

//--- Moduli Principali
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require("fs");
var multer = require('multer');
var bodyParser = require('body-parser');

//--- Setto Storage, definizione nome filename e cartella dove vengono salvate le immagini
var storage = multer.diskStorage({ 
  destination: __dirname + '/image',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

app.use(express.static(__dirname));//utilizzato per includere css e js
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); //modo per convertire una stringa in un oggetto JSON

var utenti = [];//lista dei nomi e dei socket dei players {nome : valore, socket : socket.id, avanzamento : num, attivita : num}
var messaggi = [];//lista dei messaggi {messaggio : val, trasmittente : val, ricevente : val}
var risposteDaValutare = [];//lista delle risposte da valutare {domanda: val, risposta : val, immagine : val, player : val}
var nomeDisconnesso;
var inserisci = true;
var storiaDaCaricare = "";
var datiDaSalvare = [];

app.use(express.static(__dirname));//utilizzato per includere css e js

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/primaPagina.html');
});

app.get('/autore', function (req, res) {
	res.sendFile(__dirname + '/autore.html');
});

app.get("/valutatore/utenti", function(req,res){
	var loadUtenti = JSON.stringify(utenti);
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(loadUtenti); //invio risposta array utenti
});

app.get("/valutatore/messaggi", function(req,res){
	var loadMessaggi = JSON.stringify(messaggi);
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(loadMessaggi); //invio risposta array messaggi
});

app.get("/valutatore/risposte", function(req,res){
	var loadRisposte = JSON.stringify(risposteDaValutare);
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(loadRisposte);
});

app.get("/valutatore/datiDaSalvare", function(req,res){
	var loadRisposte = JSON.stringify(datiDaSalvare);
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(loadRisposte);
});

app.get("/primaPagina/ottieniStorie", function(req,res){
	fs.readFile("storie.json",function(err,storie) {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8');
			res.end(storie);
		}
	});
});

app.get("/player/ottienistoria", function(req,res){
	fs.readFile(storiaDaCaricare + ".json",function(err,storia) {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8');
			res.end(storia);
		}
	});
});

//gestisce lo scambio di informazioni tra valutatore e player (connessi)
io.on('connection', function (socket) {
	console.log('SERVER: user ' + socket.id + ' connected');

	//gestisce la connessione degli utenti (player e valutatore)
	socket.on('connesso', function (nome, pagina) {
		inserisci = true;
		for (i=0;i<utenti.length;i++){
			if(utenti[i].nome == 'valutatore' && pagina=='home'){
				inserisci = false;
			}
		}
		if(inserisci && nome!=""){
			
			var x = nome.substr(0, 11);
			if(x != "Disconnesso" && x != "disconnesso"){
				//se l'utente non è già connesso, lo inseriamo nella lista degli utenti connessi
				inserisci = true;
				var nomeCorretto = true;
				for (i=0;i<utenti.length;i++){
					if(utenti[i].nome == nome){
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
					var d = new Date();
					var secondiConnessione = d.getTime();//millisecondi passati dal 1970
					secondiConnessione = parseInt(secondiConnessione/1000);//trasformo in secondi e tolgo la virgola
					utenti.push({nome : nome, socket : socket.id, avanzamento : null, attivita : null, tempo : secondiConnessione});
					var socketUtente = '';
					for (i=0;i<utenti.length;i++){
						if(utenti[i].nome == 'valutatore'){
							socketUtente = utenti[i].socket;
						}
					}
					if (nome != 'valutatore'){
						socket.to(socketUtente).emit('connesso', nome, pagina);
					}else{
						socket.broadcast.emit('chat message', 'mi sono connesso', nome, '');
					}
					console.log("SERVER: utenti: " + JSON.stringify(utenti));
				}
			}
			
		}else{
			io.to(socket.id).emit('nomeErrato');
		}
		
	});

	//inserisce nella variabile storiaDaCaricare la storia scelta dal valutatore nella prima pagina
	socket.on('storia', function (nomeStoria) {
		/*inserisci = false;
		for (i=0; i<utenti.length; i++){
			if(utenti[i].nome == "valutatore"){
				//socketUtente = utenti[i].socket;
				inserisci = true;
			}
		}
		if (storiaDaCaricare == "" || (storiaDaCaricare != "" && utenti.lenght == 1) || (storiaDaCaricare != "" && utenti.lenght == 2 && inserisci)){
			storiaDaCaricare = nomeStoria;
		}*/
		storiaDaCaricare = nomeStoria;
	});

	//gestisce la chat tra valutatore e player
	socket.on('chat message', function (msg, trasmittente, ricevente) {
		console.log('SERVER: message from ' + trasmittente + ' to ' + ricevente + ': ' + msg);
		
		/*var x = trasmittente.substr(0, 11);
		if(x != "Disconnesso" && x != "disconnesso"){
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
				utenti.push({nome : trasmittente, socket : socket.id, avanzamento : null, attivita : null});
				console.log("SERVER: utenti: " + JSON.stringify(utenti));
			}

			//invia il messaggio al destinatario 'ricevente'
			var socketUtente = '';
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
		} else {
			io.to(socket.id).emit('nomeErrato');
		}*/
		
		var socketUtente = '';
		messaggi.push({messaggio : msg, trasmittente : trasmittente, ricevente : ricevente});
		for (i=0;i<utenti.length;i++){
			if (utenti[i].nome == ricevente){
				socketUtente = utenti[i].socket;
				socket.to(socketUtente).emit('chat message', msg, trasmittente, ricevente);
				i=utenti.length;
			}
		}

	});

	//gestisce l'avanzamento della storia da parte del player e lo spedisce al valutatore
	socket.on('avanzamento', function (contatoreAvanzamento, contatoreAttivita, player) {
		console.log("SERVER: player: " + player + ", avanzamento effettivo: " + contatoreAvanzamento + ", attivita' da completare: " + contatoreAttivita);
		var z = 0;
		var socketUtente = "";
		for(z=0; z<utenti.length; z++){
			if(utenti[z].nome == 'valutatore'){
				socketUtente = utenti[z].socket;
			}
			if(utenti[z].nome == player){
				utenti[z].avanzamento = contatoreAvanzamento;
				utenti[z].attivita = contatoreAttivita;
				var d = new Date();
				var secondiAvanzamento = d.getTime();//millisecondi passati dal 1970
				secondiAvanzamento = parseInt(secondiAvanzamento/1000);//trasformo in secondi e tolgo la virgola
				utenti[z].tempo = secondiAvanzamento;
			}
		}
		if(socketUtente != ""){
			socket.to(socketUtente).emit('avanzamento', contatoreAvanzamento, contatoreAttivita, player);
		}else{
			//console.log("SERVER: Nessun valutatore a cui inviare l'avanzamento");
		}

		console.log("SERVER: avanzamento spedito al valutatore");
	});

	//gestisce le risposte date dal player
	socket.on('risposta testo', function (domanda, risposta, player) {
		console.log("SERVER: risposta testo: " + risposta + " inviata da " + player + ", domanda: " + domanda);
		risposteDaValutare.push({domanda: domanda, risposta : risposta, immagine : null, player : player});
		var z = 0;
		var socketUtente = "";
		for(z=0; z<utenti.length; z++){
			if(utenti[z].nome == 'valutatore'){
				socketUtente = utenti[z].socket;
			}
		}
		socket.to(socketUtente).emit('risposta testo', domanda, risposta, player);
		console.log("SERVER: inviata risposta testuale al valutatore");
	});

	socket.on('risposta immagine', function (domanda, picture, player) {
		console.log("SERVER: risposta immagine: " + picture + " inviata da " + player + ", domanda: " + domanda);
		risposteDaValutare.push({domanda: domanda, risposta : null, immagine : picture, player : player});
		var z = 0;
		var socketUtente = "";
		for(z=0; z<utenti.length; z++){
			if(utenti[z].nome == 'valutatore'){
				socketUtente = utenti[z].socket;
			}
		}
		socket.to(socketUtente).emit('risposta immagine', domanda, picture, player);
		console.log("SERVER: inviata risposta con immagine al valutatore");
	});

	//gestisce le valutazioni fornite dal valutatore
	socket.on('valutazione', function (domanda, valutazione, commentoValutazione, player) {
		console.log("SERVER: valutazione: " + valutazione + ", domanda: " + domanda + ", player: " + player);
		var z = 0;
		var socketUtente = "";
		for(z=0; z<utenti.length; z++){
			if(utenti[z].nome == player){
				socketUtente = utenti[z].socket;
			}
		}
		socket.to(socketUtente).emit('valutazione', domanda, valutazione, commentoValutazione, player);
		console.log("SERVER: inviata vautazione al player");
	});
    
    //gestisce le rispsote con metodo server black-box
    socket.on('black-box', function (domanda, risposta, rispostaCorretta, player) {
        console.log("SERVER: risposta da valutare nel server: " + risposta + ", risposta corretta: " + rispostaCorretta);
        var z = 0;
        var socketUtente = "";
        for(z=0; z<utenti.length; z++){
            if(utenti[z].nome == player){
                socketUtente = utenti[z].socket;
            }
        }
        if(risposta == rispostaCorretta){
            io.to(socketUtente).emit('valutazione', domanda, 1, "Risposta corretta", player);
        }
        else{
            io.to(socketUtente).emit('valutazione', domanda, 0, "Risposta sbagliata", player);
        }
        console.log("SERVER: inviata vautazione del server al player");
    });

	//gestisce i dati riassuntivi inviati dal player
	socket.on('dati riassuntivi', function (datiRiassuntivi, punteggio, player) {
		console.log("SERVER: dati riassuntivi da: " + player + " con punteggio: " + punteggio + " : " + datiRiassuntivi);
		var z = 0;
		var socketUtente = "";
		for(z=0; z<utenti.length; z++){
			if(utenti[z].nome == "valutatore"){
				socketUtente = utenti[z].socket;
			}
		}
		socket.to(socketUtente).emit('dati riassuntivi', datiRiassuntivi, punteggio, player);
		console.log("SERVER: inviati dati riassuntivi al valutatore");
		datiDaSalvare.push({
			player : player,
			datiRiassuntivi : JSON.parse(datiRiassuntivi),
			punteggio : punteggio
		});
	});
    
    socket.on('disconnesso', function(utente){
        var socketUtente = "";
        for(z=0; z<utenti.length; z++){
            if(utenti[z].nome == utente){
                socketUtente = utenti[z].socket;
            }
        }
        socket.to(socketUtente).emit('disconnesso', utente);
    });

	//se un utente si disconnette
	socket.on('disconnect', function () {
		nomeDisconnesso = null;
		for (i=0;i<utenti.length;i++){
			if (utenti[i].socket == socket.id){
				nomeDisconnesso = utenti[i].nome;
				utenti.splice(i, 1);
				i--;
			}
		}
		for (i=0;i<messaggi.length;i++){
			if (messaggi[i].trasmittente == nomeDisconnesso || messaggi[i].ricevente == nomeDisconnesso ){
				messaggi.splice(i, 1);
				i--;
			}
		}
		for (i=0;i<risposteDaValutare.length;i++){
			if (risposteDaValutare[i].player == nomeDisconnesso){
				risposteDaValutare.splice(i, 1);
				i--;
			}
		}
		for (i=0;i<datiDaSalvare.length;i++){
			if (datiDaSalvare[i].player == nomeDisconnesso){
				datiDaSalvare.splice(i, 1);
				i--;
			}
		}

		console.log('SERVER: user ' + socket.id + ' disconnected. (' + nomeDisconnesso + ')');
		console.log('SERVER: utenti: ' + JSON.stringify(utenti));
		var msg='Mi sono disconnesso, non riuscirò più a ricevere i tuoi messaggi';
		//invia un messaggio al valutatore se il disconnesso è un player
		if(nomeDisconnesso != null){
			if (nomeDisconnesso != 'valutatore'){
				var socketValutatore='';
				for (i=0;i<utenti.length;i++){
					if (utenti[i].nome == 'valutatore'){
						socketValutatore = utenti[i].socket;
					}
				}
				socket.to(socketValutatore).emit('chat message', msg, nomeDisconnesso, 'valutatore');
				socket.to(socketValutatore).emit('disconnesso', nomeDisconnesso);
			} else {//invia un messaggio ai players se il disconnesso è il valutatore
				socket.broadcast.emit('chat message', msg, nomeDisconnesso, '');
			}
		}
	});

});



//-- Funzioni
function openAndParseJsonFile(nameOfFile){
	var object = fs.readFileSync(__dirname + "/" + nameOfFile, err => {
		return undefined;
	});
	return object === undefined ? undefined : JSON.parse(object);
}

function writeJsonFile(whichFile, content){
	var result = true;
	fs.writeFileSync(__dirname + "/" + whichFile, JSON.stringify(content,null,4), 'utf8', (err) => { 
			if (err){
				console.log(err);
				result = false;
			}
	});
	return result;
}

function readUtils(){
	return openAndParseJsonFile("_utils.json");
}

function writeUtils(content){
	return writeJsonFile("_utils.json",content);
}

function createAndSaveStory(storyToAdd){
	var x = openAndParseJsonFile("storie.json");
	if(x===undefined){
		return false;
	}
	x.storie.push(storyToAdd);
	return writeJsonFile("storie.json", x);
}

function createAndSaveMission(missionToAdd){
	var x = openAndParseJsonFile("missioni.json");
	if(x===undefined){
		return false;
	}
	x.missioni.push(missionToAdd);
	return writeJsonFile("missioni.json", x);
}

function createAndSaveActivity(activityToAdd){
	var x = openAndParseJsonFile("attivita.json");
	if(x===undefined){
		return false;
	}
	x.attivita.push(activityToAdd);
	return writeJsonFile("attivita.json", x);
}


//-----------------
app.get('/autore', function (req, res) {
	res.sendFile(__dirname + '/autore.html');
});

app.post("/autore/newStory", function(req,res){
	console.log("Ricevuto richiesta creazione storia");
   	
	var _utils = readUtils();
	if(_utils===undefined){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	var newStory = req.body; 
	newStory.id = _utils.stories.lastIndex++;
	var opRes = createAndSaveStory(newStory);
	if(!opRes){
		res.status(500).send(failedToAddStory);
		return;
	}
	
	opRes = writeUtils(_utils);
	if(!opRes){
		res.status(500).send(failedToSaveUtils);
		return;
	}
	
	fs.appendFile(__dirname + "/" + newStory.nome + '.json', JSON.stringify({"accessibile":newStory.accessibile,"eta":newStory.eta,"missioni":[]}, null, 4), (err) => { 
  		if (err) {
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova storia nel file della singola storia');
		}
  		console.log('Creato nuovo file json: '+ newStory.nome + '.json');
	});
	res.status(200).send('OK');
});

app.get("/autore/stories", function(req,res){
	var stories = openAndParseJsonFile("storie.json");
	if(stories===undefined){
		res.status(500).send('Non è presente il file storie.json');
		return;
	}
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(JSON.stringify(stories));
});

app.post("/autore/deleteStory", function(req,res){
	console.log("Ricevuto richiesta elimina storia");
	if(req.body === null || !req.body.hasOwnProperty('id') || req.body.id === ''){
		res.status(400).send('Errore nel corpo della richiesta');
		return;
	}
		
	var stories = openAndParseJsonFile("storie.json");
	var missions = openAndParseJsonFile("missioni.json");
	var activities = openAndParseJsonFile("attivita.json");
	if(stories===undefined || missions===undefined || activities===undefined){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	var idStoryToRemove = req.body.id;
	var resOp = writeJsonFile("storie.json",{"storie": stories.storie.filter(story => story.id !== idStoryToRemove)});
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	resOp = writeJsonFile("missioni.json",{"missioni": missions.missioni.filter(mission => mission.idstoria !== idStoryToRemove)});
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	resOp = writeJsonFile("attivita.json",{"attivita": activities.attivita.filter(activity => activity.idstoria !== idStoryToRemove)});
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	var target = stories.storie.find(storia => storia.id === idStoryToRemove);
	
	fs.unlink(__dirname + "/" + target.nome + '.json', (err) => {
		if (err) {
			console.log(err);
			res.status(500).send('Non è stato possibile eliminare il file della storia.');
		}
		console.log('Il file ' + target.nome + '.json è stato eliminato.');
	});
	res.status(200).send('OK');
});

app.post("/autore/modifiedStory", function(req,res){
	console.log("Ricevuto richiesta modifica storia");

	var stories = openAndParseJsonFile("storie.json");
	var missions = openAndParseJsonFile("missioni.json");
	var activities = openAndParseJsonFile("attivita.json");
	if(stories===undefined || missions===undefined || activities===undefined){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	var requested = req.body;
	
	var idOfStory = requested.id;
	var name = requested.nome;
	var eta = requested.eta;
	var accessible = requested.accessibile;
	
	var storyToEdit = stories.storie.find(story => story.id === idOfStory);
	
	if(storyToEdit === undefined){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	var originalName = storyToEdit.nome;

	storyToEdit.nome = name;
	storyToEdit.eta = eta;
	storyToEdit.accessibile = accessible;
	
	var out = {"storie": stories.storie.filter(story => story.id !== idOfStory)};
	out.storie.push(storyToEdit);
	
	var resOp = writeJsonFile("storie.json",out);
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	out = {"missioni": missions.missioni.map(mission => {
				if(mission.idstoria===idOfStory){
					mission.nomestoria = name;
				}
				return mission;
			})
		  };
	
	resOp = writeJsonFile("missioni.json",out);
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	out = {"attivita": activities.attivita.map(activity => {
				if(activity.idstoria===idOfStory){
					activity.nomestoria = name;
				}
				return activity;
			})
		  };
	
	resOp = writeJsonFile("attivita.json", out);
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	fs.renameSync(__dirname + "/" + originalName + '.json', __dirname + "/" + name + '.json', (err) => {
		if (err) {
			resOp = false;
			console.log(err);
		}
		else{
			console.log('Creato nuovo file json: '+ name + '.json');
		}
	});
	
	if(!resOp){
		res.status(500).send('Non è stato possibile rinominare il file della singola storia.');
		return;
	}
	
	var singleStory = openAndParseJsonFile(name + '.json');
	singleStory.accessibile = storyToEdit.accessibile;
	singleStory.eta = storyToEdit.eta;
	singleStory.nomestoria = name; 
	
	resOp = writeJsonFile(name + ".json",singleStory);
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	res.status(200).send('OK');	
});

app.post("/autore/archiveStory", function(req,res){
	console.log("Ricevuto richiesta archivia storia");
	
	var stories = openAndParseJsonFile("storie.json");
	if(stories === undefined){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	var idStory = req.body.id;
	var out = 
		{"storie": 
		 	stories.storie.map(story => {
				if(story.id===idStory && story.stato === "pubblicata"){
					story.stato = "archiviata";
				}
				return story;
			})
		};
	
	var resOp = writeJsonFile("storie.json",out);
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	res.status(200).send('OK');
});

app.post("/autore/pubblicStory", function(req,res){
	console.log("Ricevuto richiesta pubblica storia");
	
	var stories = openAndParseJsonFile("storie.json");
	if(stories === undefined){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	var idStory = req.body.id;
	var out = 
		{"storie": 
		 	stories.storie.map(story => {
				if(story.id===idStory && story.stato === "archiviata"){
					story.stato = "pubblicata";
				}
				return story;
			})
		};
	
	var resOp = writeJsonFile("storie.json",out);
	if(!resOp){
		res.status(500).send('Internal Server Error');
		return;
	}
	
	res.status(200).send('OK');
});

function duplicaAttivita(singleStory, _utils, storyID, missionID, newStoryID, newStoryName, newMissionID){
	var activities = openAndParseJsonFile("attivita.json");
	
	var activitiesOut = [];
	activities.attivita.forEach(a => {
		activitiesOut.push(JSON.parse(JSON.stringify(a)));
		if(a.idstoria === storyID && a.idmissione === missionID){
			var cloned = JSON.parse(JSON.stringify(a)); //copia della attività
			cloned.id = _utils.activities.lastIndex++;
			cloned.idstoria = newStoryID;
			cloned.nomestoria = newStoryName;
			cloned.idmissione = newMissionID;
			activitiesOut.push(JSON.parse(JSON.stringify(cloned)));

			singleStory.missioni.forEach(m => {
				if(m.id === missionID){
					m.attivita.forEach(activity => {
						if(activity.id === a.id){
							activity.id = cloned.id;
						}
					});
				}
			});
		}
	});
	
	var out = {"attivita": activitiesOut};
	var resOp = writeJsonFile("attivita.json",out);
	if(!resOp){
		return false;
	}
	return true;
}

function spostaAttivita(storyID, missionID, newStoryID, newStoryName){
	var activities = openAndParseJsonFile("attivita.json");
	
	var out = {"attivita": activities.attivita.filter(a => a.idmissione !== missionID)};
	activities.attivita.forEach(a => {
	
		if(a.idstoria === storyID && a.idmissione === missionID){
			var cloned = JSON.parse(JSON.stringify(a)); //copia della attività
			cloned.idstoria = newStoryID;
			cloned.nomestoria = newStoryName;
			out.attivita.push(JSON.parse(JSON.stringify(cloned)));
		}
	});
	
	var resOp = writeJsonFile("attivita.json",out);
	if(!resOp){
		return false;
	}
	return true;
}

app.post("/autore/duplicateStory", function(req,res){
	console.log("Ricevuto richiesta duplica storia");

	var storyToDuplicateID = req.body.id;
	var _utils = readUtils();
	
	var stories = openAndParseJsonFile("storie.json");
	var story = stories.storie.find(s => s.id===storyToDuplicateID);
	if(story===undefined){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	story.id = _utils.stories.lastIndex++;
	var oldName = story.nome;
	story.nome+=('_'+story.id); //utilizzato '_ + numero sequenziale' per evitare sovrascritttura del file
	
	var resOp = writeUtils(_utils);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var resOp = createAndSaveStory(story);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStory = openAndParseJsonFile(oldName+".json");
	var missions = openAndParseJsonFile("missioni.json");
	
	try{
		var missionsOut = [];
		
		missions.missioni.forEach(m => {
			missionsOut.push(JSON.parse(JSON.stringify(m)));
			if(m.idstoria === storyToDuplicateID){
				var cloned = JSON.parse(JSON.stringify(m)); //copia della missione
				cloned.id = _utils.missions.lastIndex++;
				cloned.idstoria = story.id;
				cloned.nomestoria = story.nome;
				missionsOut.push(JSON.parse(JSON.stringify(cloned)));

				var response = duplicaAttivita(singleStory,_utils, storyToDuplicateID,m.id, story.id, story.nome, cloned.id);

				if(!response){
					throw new Exception();
				}

				singleStory.missioni.forEach(mission => {
					if(mission.id === m.id){
						mission.id = cloned.id;
					}
				});
			}
		});

		resOp = writeUtils(_utils);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}

		var out = {"missioni": missionsOut};
		resOp = writeJsonFile("missioni.json",out);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}	
		
		//creo file 'nomestoria_numerosequenziale.json'
		fs.appendFileSync(__dirname + "/" + story.nome + '.json', JSON.stringify(singleStory,null,4), (err) => { 
			if (err) {
				console.log(err);
				res.status(500).send('Non è stata aggiunta la nuova storia nel file della singola storia');
			}
			console.log('Creato nuovo file json: '+ story.nome + '.json');
		});
		
		res.status(200).send('OK');	
	}
	catch(e){
		res.status(500).send("Internal Server Error");
		return;
	}
});

app.post("/autore/newMission", function(req,res){
	console.log("Ricevuto richiesta crea missione");
	
	var nameStory = req.body.titolostoria;
	var idStory = req.body.idstoria;
	var nameMission = req.body.nome;

	var missions = openAndParseJsonFile("missioni.json");
	var _utils = readUtils();
	
	var newMission = {id: _utils.missions.lastIndex++, nome: nameMission, idstoria: idStory, nomestoria: nameStory, stato: "attiva"};
	
	var resOp = writeUtils(_utils);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	resOp = createAndSaveMission(newMission);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStory = openAndParseJsonFile(nameStory + ".json");
	singleStory.missioni.push({id: newMission.id, nome: nameMission, stato: "attiva", attivita:[]});
	
	resOp = writeJsonFile(nameStory + ".json",singleStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	res.status(200).send('OK');	
});

app.get("/autore/newMission", function(req,res){
	var missions = openAndParseJsonFile("missioni.json");
	if(missions===undefined){
		res.status(500).send('Non è presente il file missioni.json');
		return;
	}
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(JSON.stringify(missions));
});

app.post("/autore/modifiedMission", function(req,res){
	console.log("Ricevuto richiesta modifica missione");

	var missionID = req.body.id;
	var newMissionName = req.body.nome;
	
	var missions = openAndParseJsonFile("missioni.json");
	var out = {"missioni": missions.missioni.map(m => {
		if(m.id===missionID){
			m.nome = newMissionName;	
		}
		return m;
	})};
	
	var resOp = writeJsonFile("missioni.json",out);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var activities = openAndParseJsonFile("attivita.json");
	out = {"attivita": activities.attivita.map(a => {
		if(a.idmissione===missionID){
			a.nomemissione = newMissionName;	
		}
		return a;
	})};
	
	var resOp = writeJsonFile("attivita.json",out);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var story = missions.missioni.find(m => m.id===missionID);
	var storyName = story.nomestoria;
	
	if(storyName !== undefined){
		var singleStory = openAndParseJsonFile(storyName+".json");
		out = singleStory.missioni.map(m => {
			if(m.id===missionID){
				m.nome = newMissionName;	
			}
			return m;
		});
		
		singleStory.missioni = out;

		resOp = writeJsonFile(storyName+".json",singleStory);
		if(!resOp){
			res.status(500).send("Internal Server Error");
			return;
		}
	}
	res.status(200).send('OK');	
});

app.post("/autore/copyMission", function(req,res){
	console.log("Ricevuto richiesta copia missione");
	
	var missionID = req.body.id;
	var storyID = req.body.idstoria;
	var missions = openAndParseJsonFile("missioni.json");
	var stories = openAndParseJsonFile("storie.json");
	
	var _utils = readUtils();
	
	var mission = missions.missioni.find(m => m.id === missionID);
	var story = stories.storie.find(s => s.id === storyID);
	
	if(story===undefined || mission===undefined){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var storyNameCopyMission = mission.nomestoria;
	var singleStoryCopyMission = openAndParseJsonFile(storyNameCopyMission+".json"); //storia da dove copia missione
	var storyName = story.nome; //nome storia dove incolla missione
	
	try{
		
		var missionsOut = [];
		var cloneID;
		missions.missioni.forEach(m => {
			missionsOut.push(JSON.parse(JSON.stringify(m)));
			if(m.id === missionID){
				var cloned = JSON.parse(JSON.stringify(m)); //copia della missione
				cloned.id = _utils.missions.lastIndex++;
				cloned.idstoria = storyID;
				cloned.nomestoria = storyName;
				missionsOut.push(JSON.parse(JSON.stringify(cloned)));
				
				var response = duplicaAttivita(singleStoryCopyMission,_utils, m.idstoria,m.id, cloned.idstoria, cloned.nomestoria, cloned.id);

				if(!response){
					throw new Exception();
				}

				singleStoryCopyMission.missioni.forEach(mission => {
					if(mission.id === m.id){
						mission.id = cloned.id;
						cloneID = cloned.id;
					}
				});
			}
		});
		
		var resOp = writeUtils(_utils);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}

		var out = {"missioni": missionsOut};
		resOp = writeJsonFile("missioni.json",out);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}	

		var outSingleStory = openAndParseJsonFile(storyName+".json"); //storia dove incollare missione
		outSingleStory.missioni = outSingleStory.missioni.concat(singleStoryCopyMission.missioni.filter(m => m.id === cloneID));
		
		resOp = writeJsonFile(storyName+".json",outSingleStory);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}
		res.status(200).send('OK');	
	}
	catch(e){
		console.error(e);
		res.status(500).send("Internal Server Error");
		return;
	}
});

app.post("/autore/moveMission", function(req,res){
	console.log("Ricevuto richiesta spostamento missione");
	
	var missionID = req.body.id;
	var storyID = req.body.idstoria;
	var missions = openAndParseJsonFile("missioni.json");
	var stories = openAndParseJsonFile("storie.json");
	
	var mission = missions.missioni.find(m => m.id === missionID);
	var story = stories.storie.find(s => s.id === storyID);
	
	if(story===undefined || mission===undefined){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var storyNameCopyMission = mission.nomestoria;
	var storyName = story.nome; //nome storia dove incollare missione
	
	try{
		
		var out = {"missioni": missions.missioni.filter(m => m.id !== missionID)};
		
		missions.missioni.forEach(m => {
			if(m.id === missionID){
				var cloned = JSON.parse(JSON.stringify(m)); //copia della missione
				cloned.idstoria = storyID;
				cloned.nomestoria = storyName;
				out.missioni.push(JSON.parse(JSON.stringify(cloned)));
				
				var response = spostaAttivita(m.idstoria, m.id, cloned.idstoria, cloned.nomestoria);
				
				if(!response){
					throw new Exception();
				}
			}
		});

		resOp = writeJsonFile("missioni.json",out);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}	

		var singleStoryCopyMission = openAndParseJsonFile(storyNameCopyMission+".json"); //storia da dove copiare missione
		
		var outMove = singleStoryCopyMission.missioni.find(m => m.id === missionID); //intera missione da spostare
		var out = singleStoryCopyMission.missioni.filter(m => m.id !== missionID); //elenco missioni senza quella spostata
		
		singleStoryCopyMission.missioni = out;
		
		var singleStoryToMove = openAndParseJsonFile(storyName+".json"); //storia dove incollare missione
		singleStoryToMove.missioni.push(outMove);
		
		resOp = writeJsonFile(storyName+".json",singleStoryToMove);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}
		
		resOp = writeJsonFile(storyNameCopyMission+".json",singleStoryCopyMission);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}
		res.status(200).send('OK');	
		
	}
	catch(e){
		console.error(e);
		res.status(500).send("Internal Server Error");
		return;
	}
	
});

app.post("/autore/deleteMission", function(req,res){
	console.log("Ricevuto richiesta elimina missione");
	if(req.body === null || !req.body.hasOwnProperty('id') || req.body.id === ''){
		res.status(400).send('Errore nel corpo della richiesta');
	}
	
	var idMission = req.body.id;
	
	var missions = openAndParseJsonFile("missioni.json");
	var out = {"missioni": missions.missioni.filter(m => m.id !== idMission)};
	
	var resOp = writeJsonFile("missioni.json",out);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var activities = openAndParseJsonFile("attivita.json");
	out = {"attivita": activities.attivita.filter(a => a.idmissione !== idMission)};
	
	resOp = writeJsonFile("attivita.json",out);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var story = missions.missioni.find(m => m.id === idMission);
	var storyName = story.nomestoria;
	var singleStory = openAndParseJsonFile(storyName + ".json");
	out = singleStory.missioni.filter(m => m.id !== idMission);
	singleStory.missioni = out;
	
	resOp = writeJsonFile(storyName + ".json",singleStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	res.status(200).send('OK');
});

app.post("/autore/activeMission", function(req,res){
	console.log("Ricevuto richiesta attiva missione");
	
	var missionIDToDisable = req.body.id;
	
	var missions = openAndParseJsonFile("missioni.json");
	var activities = openAndParseJsonFile("attivita.json");
	var mission = missions.missioni.find(m => m.id === missionIDToDisable);
	var nameStory = mission.nomestoria;
	
	missions.missioni.forEach(m =>{
		if (m.id === missionIDToDisable){
			m.stato = "attiva";
		}
	});
	
	var resOp = writeJsonFile("missioni.json",missions);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	activities.attivita.forEach(a =>{
		if (a.idmissione === missionIDToDisable){
			a.stato = "attiva";
		}
	});
	
	var resOp = writeJsonFile("attivita.json",activities);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStory = openAndParseJsonFile(nameStory + ".json");
	
	singleStory.missioni.forEach(m =>{
		if (m.id === missionIDToDisable){
			m.stato = "attiva";
			m.attivita.forEach(a =>{
				a.stato = "attiva";
			});
		}
	});
	
	var resOp = writeJsonFile(nameStory + ".json", singleStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	res.status(200).send('OK');
});

app.post("/autore/disableMission", function(req,res){
	console.log("Ricevuto richiesta disattiva missione");
	
	var missionIDToDisable = req.body.id;
	
	var missions = openAndParseJsonFile("missioni.json");
	var activities = openAndParseJsonFile("attivita.json");
	var mission = missions.missioni.find(m => m.id === missionIDToDisable);
	var nameStory = mission.nomestoria;
	
	missions.missioni.forEach(m =>{
		if (m.id === missionIDToDisable){
			m.stato = "disattiva";
		}
	});
	
	var resOp = writeJsonFile("missioni.json",missions);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	activities.attivita.forEach(a =>{
		if (a.idmissione === missionIDToDisable){
			a.stato = "disattiva";
		}
	});
	
	var resOp = writeJsonFile("attivita.json",activities);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStory = openAndParseJsonFile(nameStory + ".json");
	
	singleStory.missioni.forEach(m =>{
		if (m.id === missionIDToDisable){
			m.stato = "disattiva";
			m.attivita.forEach(a =>{
				a.stato = "disattiva";
			});
		}
	});
	
	var resOp = writeJsonFile(nameStory + ".json", singleStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	res.status(200).send('OK');
});

app.post('/autore/newActivities', upload.any(), function (req, res) {
	console.log("Ricevuto richiesta crea attività");
	
	var formDataString = req.body.data;
	if(formDataString===undefined){
		res.status(500).send("Errore nella richiesta del client");
		return;
	}
	
	var newActivity = JSON.parse(formDataString);
	var _utils = readUtils();
	
	var id = _utils.activities.lastIndex++;
	
	var resOp = writeUtils(_utils);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var question = newActivity.domanda;
	var nameStory = newActivity.nomestoria;
	var missionTitle = newActivity.nomemissione;	
	var idMission = newActivity.idmissione;
	var idStory = newActivity.idstoria;
	
	var singleStory = openAndParseJsonFile(nameStory + ".json");
	var activities = openAndParseJsonFile("attivita.json")
	
	var missionToEdit = singleStory.missioni.find(mission => mission.id === idMission); 
	
	var background;
	var helpimage;
	if(req.files.length>0){
		var firstIsBackground = req.files[0].fieldname === 'background';
		var firstIsHelpImage = req.files[0].fieldname === 'helpimage';
		var secondIsPresent = req.files.length===2;
		
		background = firstIsBackground ? req.files[0] : (secondIsPresent ? req.files[1] : undefined);
		helpimage = firstIsHelpImage ? req.files[0] : (secondIsPresent ? req.files[1] : undefined);
	}
	
	console.log("Background uploaded? " + (background!==undefined ? "True" : "False"));
	console.log("Helpimage uploaded? " + (helpimage!==undefined ? "True" : "False"));

	var newActivityInStory = {
		id: id,
		domanda: question,
		stato: "attiva"
	};
	
	var newActivityObj = {
		id: id,
		domanda: question,
		idstoria: idStory,
		nomestoria: nameStory,
		idmissione: idMission,
		nomemissione: missionTitle,
		stato: "attiva"
	};
	
	var baseImagePath = "./image/";
	
	if(background!==undefined){
		newActivityInStory.immaginesfondo = baseImagePath+background.filename;
		newActivityObj.immaginesfondo = baseImagePath+background.filename;
	}
	if(newActivity.hasOwnProperty('checkboxnorisposta')){
		newActivityInStory.checkboxnorisposta = newActivity.checkboxnorisposta;
		newActivityObj.checkboxnorisposta = newActivity.checkboxnorisposta;
		newActivityInStory.avanti = "Avanti";
		newActivityObj.avanti = "Avanti";
	}
	else if(newActivity.hasOwnProperty('checkboxcampo')){
		newActivityInStory.checkboxcampo = newActivity.checkboxcampo;
		newActivityObj.checkboxcampo = newActivity.checkboxcampo;
		newActivityInStory.camporisposta = "";
		newActivityObj.camporisposta = "";
	}
	else if(newActivity.hasOwnProperty('checkboxcampoauto')){
		newActivityInStory.checkboxcampoauto = newActivity.checkboxcampoauto;
		newActivityObj.checkboxcampoauto = newActivity.checkboxcampoauto;
		newActivityInStory.camporisposta = newActivity.camporisposta;
		newActivityObj.camporisposta = newActivity.camporisposta;
	}
	else if(newActivity.hasOwnProperty('checkboxfoto')){
		newActivityInStory.checkboxfoto = newActivity.checkboxfoto;
		newActivityObj.checkboxfoto = newActivity.checkboxfoto;
		newActivityInStory.camporispostafoto = "";
		newActivityObj.camporispostafoto = "";
	}
	else if(newActivity.hasOwnProperty('checkboxbottoni')){
		newActivityInStory.checkboxbottoni = newActivity.checkboxbottoni;
		newActivityInStory.rispostebottoni = {
			sbagliata1 : newActivity.rispostebottoni.sbagliata1,
			giusta : newActivity.rispostebottoni.giusta,
			sbagliata2 : newActivity.rispostebottoni.sbagliata2,
			sbagliata3 : newActivity.rispostebottoni.sbagliata3,
			aiuto: newActivity.rispostebottoni.aiuto,
			incoraggiamento: newActivity.rispostebottoni.incoraggiamento,
			punteggio: newActivity.rispostebottoni.punteggio
		};
		newActivityObj.checkboxbottoni = newActivity.checkboxbottoni;
		newActivityObj.rispostebottoni = {
			sbagliata1 : newActivity.rispostebottoni.sbagliata1,
			giusta : newActivity.rispostebottoni.giusta,
			sbagliata2 : newActivity.rispostebottoni.sbagliata2,
			sbagliata3 : newActivity.rispostebottoni.sbagliata3,
			aiuto: newActivity.rispostebottoni.aiuto,
			incoraggiamento: newActivity.rispostebottoni.incoraggiamento,
			punteggio: newActivity.rispostebottoni.punteggio
		};
		if(helpimage!==undefined){
			newActivityInStory.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
			newActivityObj.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
		}
	}
	
	missionToEdit.attivita.push(newActivityInStory);
	activities.attivita.push(newActivityObj);
	
	var resOp = writeJsonFile(nameStory + ".json", singleStory);
	if(!resOp){
		res.status(500).send('Non è stata aggiunta la nuova attività nel file della singola storia');
		return;
	}
	
	resOp = writeJsonFile("attivita.json", activities);
	if(!resOp){
		res.status(500).send('Non è stata aggiunta la nuova attività nel file attivita.json');
		return;
	}
	res.status(200).send('OK');
});

app.get("/autore/newActivities", function(req,res){
	var activities = openAndParseJsonFile("attivita.json");
	if(activities===undefined){
		res.status(500).send('Non è presente il file attivita.json');
		return;
	}
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(JSON.stringify(activities));
});

app.post("/autore/deleteActivity", function(req,res){
	console.log("Ricevuto richiesta elimina attività");
	
	if(req.body === null || !req.body.hasOwnProperty('id') || req.body.id === ''){
		res.status(400).send('Errore nel corpo della richiesta');
	}
	var idActivityToRemove = req.body.id;
	
	var activities = openAndParseJsonFile("attivita.json");
	
	var activityToDelete = activities.attivita.find(activity => activity.id === idActivityToRemove);
	var storyName = activityToDelete.nomestoria;
	var missionID = activityToDelete.idmissione;
	
	var out = activities.attivita.filter(activity => activity.id !== idActivityToRemove);
	activities.attivita = out;
	
	var resOp = writeJsonFile("attivita.json",activities);
	if(!resOp){
		res.status(500).send('Non è stata rimossa l\'attività nel file attivita.json');
		return;
	}
	
	var singleStory = openAndParseJsonFile(storyName+".json");
	
	var missionOut = singleStory.missioni.map(m => {
		var tmp = m;
		if(m.id === missionID){
			tmp.attivita = m.attivita.filter(a => a.id !== idActivityToRemove);
		}
		return tmp;
	});
	
	singleStory.missioni = missionOut;
	
	resOp = writeJsonFile(storyName+".json",singleStory);
	if(!resOp){
		res.status(500).send('Non è stata rimossa l\'attività nel file'+storyName+'.json');
		return;
	}
	res.status(200).send("OK");
});

app.post("/autore/copyActivity", function(req,res){
	console.log("Ricevuto richiesta copia attività");

	var activityIDToClone = req.body.id;
	var missionIDToPaste = req.body.idmissione;
	
	var activities = openAndParseJsonFile("attivita.json");
	var mission = openAndParseJsonFile("missioni.json");
	
	var targetActivity = activities.attivita.find(a => a.id === activityIDToClone); //attività da copiare
	var targetMission = mission.missioni.find(m => m.id === missionIDToPaste); //missione dove incollare attività
	
	var nameMissionToPaste = targetMission.nome;
	var nameStoryToPaste = targetMission.nomestoria;
	var idStoryToPaste = targetMission.idstoria;
	
	var idMissionToCopy = targetActivity.idmissione;
	var nameStoryToCopy = targetActivity.nomestoria;
	
	var _utils = readUtils();
	
	var outActivities = [];
	activities.attivita.forEach(a => {
		outActivities.push(a);
		if(a.id === activityIDToClone){
			var tmp = JSON.parse(JSON.stringify(a));
			tmp.id = _utils.activities.lastIndex++;
			tmp.idstoria = idStoryToPaste;
			tmp.idmissione = missionIDToPaste;
			tmp.nomestoria = nameStoryToPaste;
			tmp.nomemissione = nameMissionToPaste;
			outActivities.push(tmp);
		}
	});
	
	activities.attivita = outActivities;
	
	var resOp = writeUtils(_utils);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	resOp = writeJsonFile("attivita.json", activities);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStoryToCopy = openAndParseJsonFile(nameStoryToCopy + ".json"); //storia dove copiare attività
	
	var activitiesOut;
	singleStoryToCopy.missioni.forEach(m =>{
		if(m.id===idMissionToCopy){
			m.attivita.forEach(a => {
				if(a.id === activityIDToClone){
					var cloned = JSON.parse(JSON.stringify(a));
					cloned.id = _utils.activities.lastIndex-1;
					activitiesOut = cloned;
				}
			});
		}
	});
	
	var singleStoryToPaste = openAndParseJsonFile(nameStoryToPaste + ".json"); //storia dove incollare attività
	
	singleStoryToPaste.missioni.forEach(m =>{
		if(m.id===missionIDToPaste){
			m.attivita.push(activitiesOut);
		}
	});
	
	resOp = writeJsonFile(nameStoryToPaste+".json", singleStoryToPaste);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	res.status(200).send("OK");
});

app.post("/autore/moveActivity", function(req,res){
	console.log("Ricevuto richiesta spostamento attività");
	
	var activityIDToMove = req.body.id;
	var missionID = req.body.idmissione;
	
	var missions = openAndParseJsonFile("missioni.json");
	var activities = openAndParseJsonFile("attivita.json");
	
	var mission = missions.missioni.find(m => m.id === missionID); //missione dove incollare attività
	var activity = activities.attivita.find(a => a.id === activityIDToMove); //singola attivita da copiare
	
	if(activity===undefined || mission===undefined){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var storyNameCopyActivity = activity.nomestoria; //nome storia da dove prendere attivita
	var idMissionCopyActivity = activity.idmissione;
	
	var storyName = mission.nomestoria; //nome storia dove incollare attivita
	var storyNameID = mission.idstoria;
	var missionName = mission.nome;
	
	
	try{
		
		var out = {"attivita": activities.attivita.filter(a => a.id !== activityIDToMove)};
		activities.attivita.forEach(a => {
			if(a.id === activityIDToMove){
				var cloned = JSON.parse(JSON.stringify(a)); //copia della attivita
				cloned.idstoria = storyNameID;
				cloned.idmissione = missionID;
				cloned.nomestoria = storyName;
				cloned.nomemissione = missionName;
				
				out.attivita.push(JSON.parse(JSON.stringify(cloned)));
				
			}
		});

		resOp = writeJsonFile("attivita.json",out);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}	

		var singleStoryCopyActivity = openAndParseJsonFile(storyNameCopyActivity + ".json"); //storia da dove copiare attivita
		
		var singleActivity; //singola attività da spostare
		singleStoryCopyActivity.missioni.forEach(m => {
			if(m.id === idMissionCopyActivity){
				m.attivita.forEach(a => {
					if(a.id === activityIDToMove){
						singleActivity = a;
					}
				});
				m.attivita = m.attivita.filter(a => a.id !== activityIDToMove);
			}
		});
		
		
		resOp = writeJsonFile(storyNameCopyActivity+".json",singleStoryCopyActivity);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}
		
		var singleStoryPasteActivity = openAndParseJsonFile(storyName + ".json"); //storia dove incollare attivita
		var missionToPasteActivity = singleStoryPasteActivity.missioni.find(m => m.id === missionID);
		missionToPasteActivity.attivita.push(singleActivity);
		
		resOp = writeJsonFile(storyName+".json",singleStoryPasteActivity);
		if(!resOp){
			res.status(500).send('Internal Server Error');
			return;
		}
		res.status(200).send('OK');	
		
	}
	catch(e){
		console.error(e);
		res.status(500).send("Internal Server Error");
		return;
	}
	
});

app.post('/autore/modifyActivities', upload.any(), function (req, res) {
	console.log("Ricevuto richiesta modifica attività");
	
	var formDataString = req.body.data;
	var baseImagePath = "./image/";
	
	if(formDataString===undefined){
		res.status(500).send("Errore nella richiesta del client");
		return;
	}
	
	var modifyActivity = JSON.parse(formDataString);
	var activityID = modifyActivity.id;
	
	var activities = openAndParseJsonFile("attivita.json");
	
	var out = activities.attivita.find(a => a.id === activityID);
	
	var missionID = out.idmissione;
	var storyName = out.nomestoria;
	var storyID = out.idstoria;
	var missionTitle = out.nomemissione;
	
	var background;
	var helpimage;
	if(req.files.length>0){
		var firstIsBackground = req.files[0].fieldname === 'background';
		var firstIsHelpImage = req.files[0].fieldname === 'helpimage';
		var secondIsPresent = req.files.length===2;
		
		background = firstIsBackground ? req.files[0] : (secondIsPresent ? req.files[1] : undefined); 
		helpimage = firstIsHelpImage ? req.files[0] : (secondIsPresent ? req.files[1] : undefined);
	}

	console.log("Background uploaded? " + (background!==undefined ? "True" : "False"));
	console.log("Helpimage uploaded? " + (helpimage!==undefined ? "True" : "False"));

	modifyActivity.idmissione = missionID;
	modifyActivity.nomestoria = storyName;
	modifyActivity.idstoria = storyID;
	modifyActivity.nomemissione = missionTitle;
	modifyActivity.stato = "attiva";
	
	if(background!==undefined){
		modifyActivity.immaginesfondo = baseImagePath+background.filename;
	}
	
	if(helpimage!==undefined){
		if(modifyActivity.hasOwnProperty('checkboxbottoni')){
			modifyActivity.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
		}
		else{
			modifyActivity.immagineaiuto = baseImagePath+helpimage.filename;
		}
	}
	
	var activitiesOut = [];
	activities.attivita.forEach(a => {
		if(a.id === activityID){
			activitiesOut.push(modifyActivity);
		}
		else{
			activitiesOut.push(a);	
		}
	});
	
	activities.attivita = activitiesOut;
	
	var resOp = writeJsonFile("attivita.json", activities);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStory = openAndParseJsonFile(storyName + ".json");
	var modifyActivity = JSON.parse(formDataString);
	modifyActivity.stato = "attiva";

	if(background!==undefined){
		modifyActivity.immaginesfondo = baseImagePath+background.filename;
	}
	
	if(helpimage!==undefined){
		if(modifyActivity.hasOwnProperty('checkboxbottoni')){
			modifyActivity.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
		}
		else{
			modifyActivity.immagineaiuto = baseImagePath+helpimage.filename;
		}
	}
	
	var missionOut = [];
	singleStory.missioni.forEach(m => {
		var tmp = m;
		if(missionID === m.id){
			var activitiesOut = [];
			m.attivita.forEach(a => {
				if(a.id === activityID){
					a = modifyActivity;
				}
				activitiesOut.push(a);
			});
			tmp.attivita = activitiesOut;
		}
		missionOut.push(tmp);
	});
	
	singleStory.missioni = missionOut;
	
	var resOp = writeJsonFile(storyName+".json", singleStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	res.status(200).send('OK');
});

app.post("/autore/activeActivity", function(req,res){
	console.log("Ricevuto richiesta attiva attività");
	
	var activityIDToActive = req.body.id;
	
	var activities = openAndParseJsonFile("attivita.json");
	var activity = activities.attivita.find(a => a.id === activityIDToActive);
	var nameStory = activity.nomestoria;
	var missionID = activity.idmissione;

	activities.attivita.forEach(a =>{
		if (a.id === activityIDToActive){
			a.stato = "attiva";
		}
	});
	
	var resOp = writeJsonFile("attivita.json",activities);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStory = openAndParseJsonFile(nameStory + ".json");
	
	singleStory.missioni.forEach(m =>{
		if (m.id === missionID){
			m.attivita.forEach(a =>{
				if(a.id === activityIDToActive){
					a.stato = "attiva";
				}
			});
		}
	});
	
	var resOp = writeJsonFile(nameStory + ".json", singleStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	res.status(200).send('OK');
});

app.post("/autore/disableActivity", function(req,res){
	console.log("Ricevuto richiesta disattiva attività");
	
	var activityIDToDisable = req.body.id;
	
	var activities = openAndParseJsonFile("attivita.json");
	var activity = activities.attivita.find(a => a.id === activityIDToDisable);
	var nameStory = activity.nomestoria;
	var missionID = activity.idmissione;

	
	activities.attivita.forEach(a =>{
		if (a.id === activityIDToDisable){
			a.stato = "disattiva";
		}
	});
	
	var resOp = writeJsonFile("attivita.json",activities);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	var singleStory = openAndParseJsonFile(nameStory + ".json");
	
	singleStory.missioni.forEach(m =>{
		if (m.id === missionID){
			m.attivita.forEach(a =>{
				if(a.id === activityIDToDisable){
					a.stato = "disattiva";
				}
			});
		}
	});
	
	var resOp = writeJsonFile(nameStory + ".json", singleStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	res.status(200).send('OK');
});


app.post('/autore/uploadStory', function (req, res) {
	console.log("Ricevuto richiesta caricamento storia");
	
	var bodyUploadStory = req.body;
	
	var _utils = readUtils();
	var stories = openAndParseJsonFile("storie.json");
	
	var storyID	= _utils.stories.lastIndex++;
	var storyName = bodyUploadStory.nomestoria;
	var isAccessible = bodyUploadStory.accessibile;
	var ageRange = bodyUploadStory.eta;	
	
	var resOp = writeUtils(_utils);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}

	var s = {
		id: storyID,
		nome: storyName,
		accessibile: isAccessible,
		eta: ageRange,
		stato: "archiviata"
	};
	
	resOp = createAndSaveStory(s);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	bodyUploadStory.id = storyID;
	
	bodyUploadStory.missioni.forEach(m => {
		var mission = {
			id: _utils.missions.lastIndex++,
			nome: m.nome,
			idstoria: storyID,
			nomestoria: storyName,
			stato: "attiva"
		};
		
		resOp = resOp && createAndSaveMission(mission);
		
		m.id = mission.id;
		m.stato = "attiva";
		
		m.attivita.forEach(a => {
			var activity = JSON.parse(JSON.stringify(a)); //copio attività
			activity.id = _utils.activities.lastIndex++;
			activity.idstoria = storyID;
			activity.idmissione = m.id;
			activity.nomestoria = storyName;
			activity.nomemissione = m.nome;
			activity.stato = "attiva";
			
			resOp = resOp && createAndSaveActivity(activity);	
			a.id = activity.id;
			a.stato = "attiva";
		});
	});
	
	resOp = writeUtils(_utils) && resOp;
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	
	resOp = writeJsonFile(storyName+".json", bodyUploadStory);
	if(!resOp){
		res.status(500).send("Internal Server Error");
		return;
	}
	res.status(200).send("OK");
});


function newEdge(index, u, v){
	return {"data": {"id": index, "source": u ,"target": v}};
}

function newSubGraph(data, source, settings){ //source default = NULL
	var actualNode = "M"+settings.missionId; 
	if(source){
		data.push(newEdge("e"+(++settings.indexEdge),source,actualNode));
	}
	for(var i=0;i<settings.maxActivityId;i++){
		var newNode = "a"+(settings.indexEdgeActivity++);
		data.push(newEdge("e"+(++settings.indexEdge),actualNode,newNode));
		actualNode = newNode;
		if(settings.indexEdgeActivity===settings.lastNode){
			break;
		}
	}
	return actualNode;
}

app.get('/autore/graphStory', function (req, res) {
	console.log("Ricevuto richiesta visualizza grafo storia");
	var storyID = parseInt(req.query.id);
	var stories = openAndParseJsonFile("storie.json");
	var story = stories.storie.find(s => s.id === storyID);
	var storyName = story.nome;
		
	var singleStory = openAndParseJsonFile(storyName + ".json");
	
	var nodes = [];
	var idMission = 0;
	var idActivity = 0;

	singleStory.missioni.forEach(m =>{
		nodes.push({"data":{"id":"M"+ idMission++}});
		 m.attivita.forEach(a =>{
			nodes.push({"data":{"id":"a"+ idActivity++}});
		});
	});

	var edges = [];
	
	var maxIndexMissions = singleStory.missioni.length;
	var maxIndexesActivities = singleStory.missioni.map(m => m.attivita.length);
	
	var node = null;
	var settings = {
		indexEdge: 0, 
		indexEdgeActivity: 0,
		lastNode: idActivity
	};
	
	for(var k=0; k < maxIndexMissions; k++){
		settings.missionId = k;
		settings.maxActivityId = maxIndexesActivities[k];
		node = newSubGraph(edges,node,settings);
	}
	
	var data = {};
	data.nodes = nodes;
	data.edges = edges;
	
	res.setHeader('Content-Type', 'application/json; charset=UTF-8');
	res.end(JSON.stringify(data));
});

// Main server
http.listen(3000, function () {
	console.log("SERVER ROOT: " + __dirname);
	console.log('SERVER: listening on *:3000');
});
