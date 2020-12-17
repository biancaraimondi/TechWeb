var express = require('express');
var app = express();
var http = require('http').createServer(app);
var bodyParser = require('body-parser');
var fs = require('fs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); //modo per convertire una stringa in un oggetto JSON
app.use(express.static(__dirname));//utilizzato per includere css e js

http.listen(3000, function () {
  console.log('SERVER: listening on *:3000');
});

app.get('/autore', function (req, res) {
  res.sendFile(__dirname + '/autore.html');
});

//funzione crea nuova storia
app.post("/autore/newStory", function(req,res){
	console.log("Ricevuto richiesta creazione storia");
   	var stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
	var newStory = req.body; //rappresenta oggetto JS storia da aggiungere al JSON
	objStory.storie.push(newStory); //metto in coda all'array JSON storie la nuova storia
	fs.writeFileSync("storie.json", JSON.stringify(objStory), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	fs.appendFile(req.body.nome + '.json', '{"missioni":[]}', (err) => { //creo file 'nomestoria.json'
  		if (err) {
			console.log(err);
			res.status(500).send('Internal server error');
		}
  		console.log('Creato nuovo file json: '+ req.body.nome + '.json');
	});
	res.status(200).send('OK');
});

app.get("/autore/newStory", function(req,res){
	fs.readFile("storie.json",(err,stories) => {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
			res.end(stories); //invio risposta file storiaP.json
		}
	});
});

//funzione elimina una storia
app.post("/autore/deleteStory", function(req,res){
	console.log("Ricevuto richiesta elimina storia");
	if(req.body === null || !req.body.hasOwnProperty('id') || req.body.id === ''){ //controllo se il body è null, se il body non ha la proprietà 'nomestoria' e se l'id è vuoto
		console.log('Invalid request');
		res.status(400).send('Bad Request');
	}
	var idStoryToRemove = req.body.id; //id storia da rimuovere
	var stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie	
	var out = {"storie": objStory.storie.filter(story => story.id !== idStoryToRemove)}; //filtra le storie che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	
	//metodo per decrementare gli indici delle storie
	for (var i=0, id=0; i<out.storie.length; i++, id++){
		out.storie[i].id = id;
	}
	fs.writeFileSync("storie.json", JSON.stringify(out), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	res.status(200).send('OK');
});

//funzione modifica le storie
app.post("/autore/modifiedStory", function(req,res){
	console.log("Ricevuto richiesta modifica storia");
   	var stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStory = JSON.parse(stories);//trasformo stringa in oggetto JS, sarà lista di storie
	var mission = fs.readFileSync ("missioni.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objMission = JSON.parse(mission);
	var modifiedStory = req.body; //oggetto JS contenente la modifica della storia
	var storyToEdit = objStory.storie.find(s => s.id === req.body.id); //cerco l'oggetto storia nella localstorage che ha l'id della storia che voglio modificare
	var missionToEdit = objMission.missioni.find(m => m.nomestoria === storyToEdit.nome);
	var indexOfMissionToEdit = objMission.missioni.findIndex(m => m.nomestoria === storyToEdit.nome);
	var indexOfStoryToEdit = objStory.storie.findIndex(s => s.id === req.body.id); //cerco l'indice dell'oggetto storia nell'array che ha l'id della storia che voglio modificare
	if(storyToEdit !== undefined && missionToEdit !== undefined){
		
		missionToEdit.nomestoria = modifiedStory.nome;
		console.log(missionToEdit);
		objMission.missioni.splice(indexOfMissionToEdit, missionToEdit);
		fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //modfico il nome della storia nel file missioni mantenendo l'associazione
			if (err){
				console.log(err);
				res.status(500).send('Internal server error');
			}
		});
		
		fs.rename(storyToEdit.nome + '.json', modifiedStory.nome + '.json', (err) => { //rinomino il file della storia con il nuovo nome
			if (err) {
				console.log(err);
				res.status(500).send('Internal server error');
			}
			console.log('Creato nuovo file json: '+ req.body.nome + '.json');
		});
		
		storyToEdit.nome = modifiedStory.nome;
		storyToEdit.accessibile = modifiedStory.accessibile;
		storyToEdit.eta = modifiedStory.eta;
		objStory.storie.splice(indexOfStoryToEdit, storyToEdit); //modifico i valori della storia inserendoli nella posizione della storia che voglio modificare
		fs.writeFileSync("storie.json", JSON.stringify(objStory), 'utf8',(err) => { //riscrivo il file storie.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Internal server error');
			}
		});
		res.status(200).send('OK');	
	}
	else{
		console.log('Storia/Missione non presente');
	}
	
});

//funzione archivia storie
app.post("/autore/archiveStory", function(req,res){
	console.log("Ricevuto richiesta archivia storia");
	var stories = fs.readFileSync ("storie.json"); //legge file storie
	var objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
	var idReq = req.body.id; //id della storia archiviata
	var storyToEdit = objStory.storie.find(story => story.id === idReq && story.stato === "pubblicata"); //cerco l'oggetto storia che ha l'id della storia e lo stato "pubblicata" che voglio archiviare
	if(storyToEdit !== undefined){
		var out = {"storie": objStory.storie.filter(story => story.id !== storyToEdit.id)};//elenco storie diverso da quella che voglio archiviare
		storyToEdit.stato = "archiviata"; //modifico lo stato da pubblicata a archiviata
		out.storie.push(storyToEdit); //inserisco la storia archiviata in coda all'array
		fs.writeFileSync("storie.json", JSON.stringify(out), 'utf8',(err) => { //riscrivo il file storie.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Internal server error');
			}
		});
		res.status(200).send('OK');
	}
});

app.get("/autore/archiveStory", function(req,res){
	fs.readFile("storie.json",(err,stories) => {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
			res.end(stories); //invio risposta file storiaA.json
		}
	});
});

//funzione pubblica storie
app.post("/autore/pubblicStory", function(req,res){
	console.log("Ricevuto richiesta pubblica storia");
	var stories = fs.readFileSync ("storie.json"); //legge file storie
	var objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
	var idStory = req.body.id; //id della storia archiviata
	var storyToEdit = objStory.storie.find(story => story.id === idStory && story.stato === "archiviata"); //cerco l'oggetto storia che ha l'id della storia che voglio modificare e che ha stato "archiviata"
	if(storyToEdit !== undefined){
		var out = {"storie": objStory.storie.filter(story => story.id !== idStory)}; //filtra le storie che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
		storyToEdit.stato = "pubblicata"; //modifico stato da archiviata a pubblicata
		out.storie.push(storyToEdit);
		fs.writeFileSync("storie.json", JSON.stringify(out), 'utf8',(err) => { //riscrivo il file storie.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Internal server error');
			}
		});
		res.status(200).send('OK');
	}
});

app.get("/autore/pubblicStory", function(req,res){
	fs.readFile("storie.json",(err,stories) => {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
			res.end(stories); //invio risposta file storiaA.json
		}
	});
});

//funzione duplica storie
app.post("/autore/duplicateStory", function(req,res){
	console.log("Ricevuto richiesta duplica storia");
	var stories = fs.readFileSync("storie.json");
	var objStory = JSON.parse(stories);
	var duplicateStory = req.body; //contiene oggetto JS della storia da clonare
	objStory.storie.push(duplicateStory); //inserisco in coda all'array, la storia duplicata
	fs.writeFileSync("storie.json", JSON.stringify(objStory), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	res.status(200).send('OK');
});

//funzione crea missione
app.post("/autore/newMission", function(req,res){
	console.log("Ricevuto richiesta crea missione");
	var singleStory = fs.readFileSync(req.body.titolostoria + ".json"); //leggofile json della storia
	var objSingleStory = JSON.parse(singleStory);
	objSingleStory.missioni.push({id:req.body.id, nome: req.body.nome}); //aggiungo alla storia il nome della missione
	fs.writeFileSync(req.body.titolostoria + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => { //scrivo all'interno del file "storia".json il titolo della missione
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	
	var missionJson = fs.readFileSync("missioni.json"); //leggo il file missioni.json
	var objMission = JSON.parse(missionJson);
	var mission = {id: req.body.id, nome: req.body.nome, nomestoria: req.body.titolostoria};
	objMission.missioni.push(mission);
	fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //scrivo all'interno del file missioni.json gli elementi relativi alla missione
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	res.status(200).send('OK');	
});

app.get("/autore/newMission", function(req,res){
	fs.readFile("missioni.json",(err,mission) => {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
			res.end(mission); //invio risposta file storiaP.json
		}
	});
});

//modifica missione + modifica missione nel file storia
app.post("/autore/modifiedMission", function(req,res){
	console.log("Ricevuto richiesta modifica missione");
   	var missions = fs.readFileSync ("missioni.json"); 
	var objMission = JSON.parse(missions); //trasformo stringa in oggetto JS, sarà lista di missioni
	var missionToEdit = objMission.missioni.find(mission => mission.id === req.body.id); //cerco l'oggetto missione nella localstorage che ha l'id della missione che voglio modificare nel file missioni.json
	
	var nomeStoria = missionToEdit.nomestoria; //nome storia
	var storiaJson = fs.readFileSync(nomeStoria + ".json"); //leggo file della storia
	var objStoriaJson = JSON.parse(storiaJson);
	var modifiedMission = req.body; //oggetto JS contenente la modifica della missione
	var missionToEditInStory = objStoriaJson.missioni.find(mission => mission.id === req.body.id); //cerco l'oggetto missione nel file della storia che ha il nome della missione = al nome della missione prima della modifica
	var idOfMissionToEdit = missionToEdit.id;
	var idOfMissionToEditInStory = missionToEditInStory.id;
	console.log(idOfMissionToEdit);
	
	if(missionToEdit !== undefined && missionToEditInStory !== undefined){
		missionToEdit.nome = modifiedMission.nome;
		idOfMissionToEdit = modifiedMission.id;
		objMission.missioni.splice(idOfMissionToEdit, missionToEdit); //modifico i valori della missione inserendoli nella posizione della missione che voglio modificare
		missionToEditInStory.nome = modifiedMission.nome;
		idOfMissionToEditInStory = modifiedMission.id;
		objStoriaJson.missioni.splice(idOfMissionToEditInStory, missionToEdit);
		
		fs.writeFileSync(nomeStoria + ".json", JSON.stringify(objStoriaJson), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Internal server error');
			}
		});
		fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Internal server error');
			}
		});
		res.status(200).send('OK');	
	}
	else{
		console.log('Missione non presente');
	}
});

//duplica missione + duplica missione nel file della storia
app.post("/autore/duplicateMission", function(req,res){
	console.log("Ricevuto richiesta duplica missione");
	var mission = fs.readFileSync ("missioni.json"); 
	var objMission = JSON.parse(mission); //trasformo stringa in oggetto JS, sarà lista di missioni
	var nomeStoria = req.body.nomestoria; //nome storia
	var storiaJson = fs.readFileSync(nomeStoria + ".json"); //leggo file della storia
	var objStoriaJson = JSON.parse(storiaJson);
	objMission.missioni.push(req.body); //inserisco in coda all'array, la storia duplicata
	fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	var missionClone = {
		id: req.body.id,
		nome: req.body.nome
	};
	objStoriaJson.missioni.push(missionClone); //inserisco in coda all'array, la storia duplicata
	fs.writeFileSync(nomeStoria + ".json", JSON.stringify(objStoriaJson), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	res.status(200).send('OK');
});

//elimina missione + elimina missione nel file della storia
app.post("/autore/deleteMission", function(req,res){
	console.log("Ricevuto richiesta elimina missione");
	if(req.body === null || !req.body.hasOwnProperty('id') || req.body.id === ''){ //controllo se il body è null, se il body non ha la proprietà 'id e se l'id è vuoto
		console.log('Invalid request');
		res.status(400).send('Bad Request');
	}
	var idMissionToRemove = req.body.id; //id missione da rimuovere
	var missions = fs.readFileSync ("missioni.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objMissioni = JSON.parse(missions); //trasformo stringa in oggetto JS, sarà lista di missioni	
	var missionToDelete = objMissioni.missioni.find(mission => mission.id === idMissionToRemove); //cerco l'oggetto missione nella localstorage che ha l'id della missione che voglio modificare nel file missioni.json
	var titoloStoria = missionToDelete.nomestoria;
	var story = fs.readFileSync (titoloStoria + ".json");
	var objStory = JSON.parse(story);
	var missionToDeleteInStory = objStory.missioni.find(mission => mission.id === idMissionToRemove); //cerco l'oggetto missione nella localstorage che ha l'id della missione che voglio modificare nel file missioni.json
	
	var outMission = {"missioni": objMissioni.missioni.filter(mission => mission.id !== idMissionToRemove)}; //filtra le missioni nel file "missioni.json" che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	var outMissionInStory = {"missioni": objStory.missioni.filter(mission => mission.id !== idMissionToRemove)}; //filtra le missioni nel file della storia che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	
	//metodo per decrementare gli indici delle missioni
	for (var i=0, id=0; i<outMission.missioni.length; i++, id++){
		outMission.missioni[i].id = "missione" + id;
	}
	
	//metodo per decrementare gli indici delle missioni nelle storie
	for (i=0, id=0; i<outMissionInStory.missioni.length; i++, id++){
		outMissionInStory.missioni[i].id = "missione" + id;
	}
	
	fs.writeFileSync("missioni.json", JSON.stringify(outMission), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	fs.writeFileSync(titoloStoria + ".json", JSON.stringify(outMissionInStory), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	res.status(200).send('OK');
});
