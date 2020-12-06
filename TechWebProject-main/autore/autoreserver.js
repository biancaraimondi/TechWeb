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
	console.log("Ricevuto richiesta creazione");
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
	console.log("Ricevuto richiesta elimina");
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
	console.log("Ricevuto richiesta modifica");
   	var stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
	var modifiedStory = req.body; //oggetto JS contenente la modifica della storia
	var storyToEdit = objStory.storie.find(s => s.id === req.body.id); //cerco l'oggetto storia nella localstorage che ha l'id della storia che voglio modificare
	var indexOfStoryToEdit = objStory.storie.findIndex(s => s.id === req.body.id); //cerco l'indice dell'oggetto storia nell'array che ha l'id della storia che voglio modificare
	if(storyToEdit !== undefined){
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
		console.log('Storia non presente');
	}
});

//funzione archivia storie
app.post("/autore/archiveStory", function(req,res){
	console.log("Ricevuto richiesta archivia");
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
	console.log("Ricevuto richiesta pubblica");
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
	console.log("Ricevuto richiesta duplica");
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
