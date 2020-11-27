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

//funzione post che ottiene i dati dal client e li scrive nel file storiaP.json 
app.post("/autore/newStory", function(req,res){
	console.log("Ricevuto richiesta creazione");
	
   	var storiesP = fs.readFileSync ("storiaP.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStoryP = JSON.parse(storiesP); //trasformo stringa in oggetto JS, sarà lista di storie
	var newStory = req.body; //rappresenta il corpo della richiesta oggetto JS
		objStoryP.storieP.push(newStory); //metto in coda all'array storieP la nuova storia
		fs.writeFileSync("storiaP.json", JSON.stringify(objStoryP), 'utf8',(err) => { //scrivo all'interno del file data.json la nuova storia trasformata in stringa
			if (err){
				console.log(err);
				res.status(500).send('Internal server error');
			}
	
		});
		res.status(200).send('OK');

		//var cid = obj.storieP.length; //calcolo lunghezza lista per ottenere il nuovo id
		//e.id = cid + 1; //inserisco id alla singola storia nella lista e sarà cid + 1
});

app.get("/autore/newStory", function(req,res){
	fs.readFile("storiaP.json",(err,stories) => {
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
	var storiesP = fs.readFileSync ("storiaP.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStoryP = JSON.parse(storiesP); //trasformo stringa in oggetto JS, sarà lista di storie	
	var out = {"storieP": objStoryP.storieP.filter(story => story.id !== idStoryToRemove)}; //filtra le storie che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	
	//metodo per decrementare gli indici delle storie
	for (var i=0, id=0; i<out.storieP.length; i++, id++){
		out.storieP[i].id = id;
	}

	fs.writeFileSync("storiaP.json", JSON.stringify(out), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
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
   	var stories = fs.readFileSync ("storiaP.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStoryP = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
	var modifiedStory = req.body; //rappresenta il corpo della richiesta oggetto JS contenente la modifica della storia
	console.log(modifiedStory);
	var storyToEdit = objStoryP.storieP.find(s => s.id === req.body.id); //cerco l'oggetto storia che ha l'id della storia che voglio modificare
	var indexOfStoryToEdit = objStoryP.storieP.findIndex(s => s.id === req.body.id); //cerco l'indice dell'oggetto storia nell'array che ha l'id della storia che voglio modificare
	if(storyToEdit !== undefined){
		storyToEdit.nome = modifiedStory.nome;
		storyToEdit.accessibile = modifiedStory.accessibile;
		objStoryP.storieP.splice(indexOfStoryToEdit, storyToEdit); //modifico i valori della storia inserendoli nella posizione della storia che voglio modificare
		fs.writeFileSync("storiaP.json", JSON.stringify(objStoryP), 'utf8',(err) => { //riscrivo il file storiaP.json contenente la modifica della storia
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
	var storiesP = fs.readFileSync ("storiaP.json"); //legge file storie pubblicate
	var storiesA = fs.readFileSync ("storiaA.json"); //legge file storie archiviate
	var objStoryP = JSON.parse(storiesP); //trasformo stringa in oggetto JS, sarà lista di storie pubblicate
	var objStoryA = JSON.parse(storiesA); //trasformo stringa in oggetto JS, sarà lista di storie archiviate
	var idlastStory = req.body.idlast; //id della storia pubblicata
	
	//prendo i valori relativi alla storia attraverso l'id della storia pubblicata
	var accessibileStoryP = objStoryP.storieP[idlastStory].accessibile;
	var titleStoryP = objStoryP.storieP[idlastStory].nome;
	var idArchiveStory = objStoryA.storieA.length; //nuovo id della storia archiviata
	var out = {"storieP": objStoryP.storieP.filter(story => story.id !== idlastStory)};//filtro l'elenco delle storie pubblicate non considerando la storia da archiviare
	
	//metodo per decrementare gli indici delle storie
	for (var i=0, id=0; i<out.storieP.length; i++, id++){
		out.storieP[i].id = id;
	}
	fs.writeFileSync("storiaP.json", JSON.stringify(out), 'utf8',(err) => { //scrivo all'interno del file storiaP1.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	
	//fase inserimento storia pubblicata in storia archiviata

	var archiveStory = { //creo nuovo oggetto JS contenente i valori della storia archiviata
		id: idArchiveStory,
		nome: titleStoryP,
		accessibile: accessibileStoryP
	};
	objStoryA.storieA.push(archiveStory); //metto in coda all'array storieA la storia archiviata
	fs.writeFileSync("storiaA.json", JSON.stringify(objStoryA), 'utf8',(err) => { //scrivo all'interno del file storiaA1.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	});
	res.status(200).send('OK');

});

app.get("/autore/archiveStory", function(req,res){
	
	fs.readFile("storiaA.json",(err,stories) => {
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
			res.end(stories); //invio risposta file storiaA1.json
		}
	});
	
	
});

//funzione duplica storie
app.post("/autore/duplicateStory", function(req,res){
	console.log("Ricevuto richiesta duplica");
	var storiesP = fs.readFileSync("storiaP.json");
	var objStoryP = JSON.parse(storiesP);
	var duplicateStoryP = req.body;
	objStoryP.storieP.push(duplicateStoryP); //inserisco in coda all'array delle storie pubblicate, la storia duplicata
	fs.writeFileSync("storiaP.json", JSON.stringify(objStoryP), 'utf8',(err) => { //scrivo all'interno del file data.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Internal server error');
		}
	
	});
	res.status(200).send('OK');
});
