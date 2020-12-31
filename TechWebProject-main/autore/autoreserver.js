var express = require('express');
var app = express();
var http = require('http').createServer(app);
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var storage = multer.diskStorage({ //settano la destinazione delle immagini e il nome immagine
  destination: __dirname + '/image',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

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
			res.status(500).send('Non è stata aggiunta la nuova storia nel file storie.json');
		}
	});
	fs.appendFile(req.body.nome + '.json', '{"missioni":[]}', (err) => { //creo file 'nomestoria.json'
  		if (err) {
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova storia nel file della singola storia');
		}
  		console.log('Creato nuovo file json: '+ req.body.nome + '.json');
	});
	res.status(200).send('OK');
});

app.get("/autore/newStory", function(req,res){
	fs.readFile("storie.json",(err,stories) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è presente il file storie.json');
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
		res.status(400).send('Errore nel corpo della richiesta');
	}
	else{
		var idStoryToRemove = req.body.id; //id storia da rimuovere
		var stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
		var objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie	
		var storiesWithoutDeleteStory = {"storie": objStory.storie.filter(story => story.id !== idStoryToRemove)}; //filtra le storie che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null

		//metodo per decrementare gli indici delle storie
		for (var i=0, id=0; i<storiesWithoutDeleteStory.storie.length; i++, id++){
			storiesWithoutDeleteStory.storie[i].id = id;
		}
		fs.writeFileSync("storie.json", JSON.stringify(storiesWithoutDeleteStory), 'utf8',(err) => { //scrivo all'interno del file storie le storie filtrate memorizzate in out
			if (err){
				console.log(err);
				res.status(500).send('Non è stato possibile eliminare la storia.');
			}
		});
		res.status(200).send('OK');
	}
});

//funzione modifica le storie
app.post("/autore/modifiedStory", function(req,res){
	console.log("Ricevuto richiesta modifica storia");
   	var stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objStory = JSON.parse(stories);//trasformo stringa in oggetto JS, sarà lista di storie
	var mission = fs.readFileSync ("missioni.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objMission = JSON.parse(mission);
	var activity = fs.readFileSync ("attivita.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objActivity = JSON.parse(activity);
	var modifiedStory = req.body; //oggetto JS contenente la modifica della storia
	var storyToEdit = objStory.storie.find(story => story.id === req.body.id); //cerco l'oggetto storia nella localstorage che ha l'id della storia che voglio modificare
	var storyToEditInActivities = objActivity.attivita.filter(activity => activity.idstoria === req.body.id); //cerco l'oggetto storia nella localstorage che ha l'id della storia che voglio modificare
	var missionToEdit = objMission.missioni.find(mission => mission.idstoria === req.body.id);
	var indexOfMissionToEdit = objMission.missioni.findIndex(mission => mission.idstoria === storyToEdit.idstoria);
	var indexOfStoryToEdit = objStory.storie.findIndex(story => story.id === req.body.id); //cerco l'indice dell'oggetto storia nell'array che ha l'id della storia che voglio modificare
	
	console.log(storyToEditInActivities);
	if(storyToEdit !== undefined && missionToEdit !== undefined){
		
		missionToEdit.nomestoria = modifiedStory.nome;
		objMission.missioni.splice(indexOfMissionToEdit, missionToEdit);
		fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //modfico il nome della storia nel file missioni mantenendo l'associazione
			if (err){
				console.log(err);
				res.status(500).send('Non è stato possibile apportare le modifiche della storia nel file missioni.json');
			}
		});
		
		for(var i =0; i<storyToEditInActivities.length; i++){
			storyToEditInActivities[i].nomestoria = modifiedStory.nome;
			var idOfStoryInActivity = req.body.id;
			objActivity.attivita.splice(idOfStoryInActivity, missionToEdit);
		}
		fs.writeFileSync("attivita.json", JSON.stringify(objActivity), 'utf8',(err) => { //modfico il nome della storia nel file missioni mantenendo l'associazione
			if (err){
				console.log(err);
				res.status(500).send('Non è stato possibile apportare le modifiche della storia nel file attivita.json');
			}
		});
		
		
		fs.rename(storyToEdit.nome + '.json', modifiedStory.nome + '.json', (err) => { //rinomino il file della storia con il nuovo nome
			if (err) {
				console.log(err);
				res.status(500).send('Non è stato possibile rinominare il file della singola storia.');
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
				res.status(500).send('Non è stato possibile apportare le modifiche della storia nel file storie.json');
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
				res.status(500).send('Non è stato possibile apportare le modifiche di archiviazione nel file storie.json');
			}
		});
		res.status(200).send('OK');
	}
});

app.get("/autore/archiveStory", function(req,res){
	fs.readFile("storie.json",(err,stories) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è presente il file storie.json');
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
				res.status(500).send('Non è stato possibile apportare le modifiche di pubblicazione nel file storie.json');
			}
		});
		res.status(200).send('OK');
	}
});

app.get("/autore/pubblicStory", function(req,res){
	fs.readFile("storie.json",(err,stories) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è presente il file storie.json');
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
			res.status(500).send('Non è stato possibile duplicare la storia.');
		}
	});
	res.status(200).send('OK');
});

//funzione crea missione
app.post("/autore/newMission", function(req,res){
	console.log("Ricevuto richiesta crea missione");
	var singleStory = fs.readFileSync(req.body.titolostoria + ".json"); //leggofile json della storia
	var objSingleStory = JSON.parse(singleStory);
	objSingleStory.missioni.push({id:req.body.id, nome: req.body.nome, attivita:[]}); //aggiungo alla storia il nome della missione
	fs.writeFileSync(req.body.titolostoria + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => { //scrivo all'interno del file "storia".json il titolo della missione
		if (err){
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova missione nel file della singola storia');
		}
	});
	
	var missionJson = fs.readFileSync("missioni.json"); //leggo il file missioni.json
	var objMission = JSON.parse(missionJson);
	var mission = {id: req.body.id, nome: req.body.nome, idstoria: req.body.idstoria, nomestoria: req.body.titolostoria};
	objMission.missioni.push(mission);
	fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //scrivo all'interno del file missioni.json gli elementi relativi alla missione
		if (err){
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova missione nel file missioni.json');
		}
	});
	res.status(200).send('OK');	
});

app.get("/autore/newMission", function(req,res){
	fs.readFile("missioni.json",(err,mission) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è presente il file missioni.json');
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
	var activity = fs.readFileSync ("attivita.json");
	var objActivity =  JSON.parse(activity);
	var nomeStoria = missionToEdit.nomestoria; //nome storia
	var storiaJson = fs.readFileSync(nomeStoria + ".json"); //leggo file della storia
	var objStoriaJson = JSON.parse(storiaJson);
	var modifiedMission = req.body; //oggetto JS contenente la modifica della missione
	var missionToEditInStory = objStoriaJson.missioni.find(mission => mission.id === req.body.id); //cerco l'oggetto missione nel file della storia che ha il nome della missione = al nome della missione prima della modifica
	var missionToEditInActivity = objActivity.attivita.filter(mission => mission.idmissione === req.body.id); //cerco l'oggetto missione nel file della storia che ha il nome della missione = al nome della missione prima della modifica
	var idOfMissionToEdit = missionToEdit.id;
	
	if(missionToEdit !== undefined && missionToEditInStory !== undefined && missionToEditInActivity!== undefined){
		missionToEdit.nome = modifiedMission.nome;
		idOfMissionToEdit = modifiedMission.id;
		objMission.missioni.splice(idOfMissionToEdit, missionToEdit); //modifico i valori della missione inserendoli nella posizione della missione che voglio modificare
		missionToEditInStory.nome = modifiedMission.nome;
		idOfMissionToEditInStory = modifiedMission.id;
		objStoriaJson.missioni.splice(idOfMissionToEditInStory, missionToEdit);
		
		for (var i=0; i<missionToEditInActivity.length; i++){
			missionToEditInActivity[i].nomemissione = modifiedMission.nome;
			var idOfMissionToEditInActivity = modifiedMission.id;
			objActivity.attivita.splice(idOfMissionToEditInActivity, missionToEdit);
		}
		
		fs.writeFileSync("attivita.json", JSON.stringify(objActivity), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Non è stato possibile apportare alla missione le modifiche nel file missioni.json');
			}
		});
		fs.writeFileSync(nomeStoria + ".json", JSON.stringify(objStoriaJson), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Non è stato possibile apportare alla missione le modifiche nel file della singola storia');
			}
		});
		fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
			if (err){
				console.log(err);
				res.status(500).send('Non è stato possibile apportare alla missione le modifiche nel file missioni.json');
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
			res.status(500).send('Non è stato possibile duplicare la missione nel file missioni.json');
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
			res.status(500).send('Non è stato possibile duplicare la missione nel file della singola missione');
		}
	});
	res.status(200).send('OK');
});

//elimina missione + elimina missione nel file della storia
app.post("/autore/deleteMission", function(req,res){
	console.log("Ricevuto richiesta elimina missione");
	if(req.body === null || !req.body.hasOwnProperty('id') || req.body.id === ''){ //controllo se il body è null, se il body non ha la proprietà 'id e se l'id è vuoto
		res.status(400).send('Errore nel corpo della richiesta');
	}
	var idMissionToRemove = req.body.id; //id missione da rimuovere
	var missions = fs.readFileSync ("missioni.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objMissioni = JSON.parse(missions); //trasformo stringa in oggetto JS, sarà lista di missioni	
	var missionToDelete = objMissioni.missioni.find(mission => mission.id === idMissionToRemove); //cerco l'oggetto missione nella localstorage che ha l'id della missione che voglio modificare nel file missioni.json
	var titoloStoria = missionToDelete.nomestoria;
	var story = fs.readFileSync (titoloStoria + ".json");
	var objStory = JSON.parse(story);
	
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
			res.status(500).send('Non è stato possibile eliminare la missione nel file missioni.json');
		}
	});
	fs.writeFileSync(titoloStoria + ".json", JSON.stringify(outMissionInStory), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile eliminare la missione nel file della singola missione');
		}
	});
	res.status(200).send('OK');
});

app.post('/autore/newActivities', upload.any(), function (req, res) {
	//console.log("Received POST request '/autore/newActivities'");
	console.log("Ricevuto richiesta crea attività");
	var formDataString = req.body.data;
	if(formDataString===undefined){
		res.status(500).send("Errore nella richiesta del client");
		return;
	}
	var activity = JSON.parse(formDataString);
	var id = activity.id;
	var question = activity.domanda;
	var storyTitle = activity.titolostoria;
	var missionTitle = activity.titolomissione;	
	var idMission = activity.idmissione;
	var idStory = activity.idstoria;
	var storyBinaryFile = fs.readFileSync(storyTitle + ".json"); 
	var story = JSON.parse(storyBinaryFile);
	var activitiesBinaryFile = fs.readFileSync("attivita.json"); 
	var activities = JSON.parse(activitiesBinaryFile);
	var missionToEdit = story.missioni.find(mission => mission.id === idMission);
	var background;
	var helpimage;
	if(req.files.length>0){
		var firstIsBackground = req.files[0].fieldname === 'background';
		var firstIsHelpImage = req.files[0].fieldname === 'helpimage';
		var secondIsPresent = req.files.length===2; //se il 2o elemento è presente allora lunghezza array 2	
		
		background = firstIsBackground ? req.files[0] : (secondIsPresent ? req.files[1] : undefined); //operatore ternario -> se req.files[0].fieldName === 'background' vero  = allora si trova in pos 0.
		//falso: controllo se req.files.length==2 vero = background avrà pos 1 altrimenti background non esiste 
		helpimage = firstIsHelpImage ? req.files[0] : (secondIsPresent ? req.files[1] : undefined);
	}
	
	//verifico se le immagini sono state uploadate
	console.log("Background uploaded? " + (background!==undefined ? "True" : "False"));
	console.log("Helpimage uploaded? " + (helpimage!==undefined ? "True" : "False"));

	var newActivityInStory = {
		id: id,
		domanda: question
	};
	var newActivity = {
		id: id,
		checkbox: activity.checkbox,
		domanda: question,
		idstoria: idStory,
		nomestoria: storyTitle,
		idmissione: idMission,
		nomemissione: missionTitle
	};
	
	var baseImagePath = "./image/";
	if(background!==undefined){
		newActivityInStory.immaginesfondo = baseImagePath+background.filename;
		newActivity.immaginesfondo = baseImagePath+background.filename;
	}
	if(activity.hasOwnProperty('avanti')){
		newActivityInStory.avanti = "Avanti";
		newActivity.avanti = "Avanti";
	}
	else{
		newActivityInStory.rispostebottoni = {
			sbagliata1 : activity.rispostebottoni.sbagliata1,
			giusta : activity.rispostebottoni.giusta,
			sbagliata2 : activity.rispostebottoni.sbagliata2,
			sbagliata3 : activity.rispostebottoni.sbagliata3,
			aiuto: activity.rispostebottoni.aiuto,
			incoraggiamento: activity.rispostebottoni.incoraggiamento
		};
		newActivity.rispostebottoni = {
			sbagliata1 : activity.rispostebottoni.sbagliata1,
			giusta : activity.rispostebottoni.giusta,
			sbagliata2 : activity.rispostebottoni.sbagliata2,
			sbagliata3 : activity.rispostebottoni.sbagliata3,
			aiuto: activity.rispostebottoni.aiuto,
			incoraggiamento: activity.rispostebottoni.incoraggiamento
		};
		if(helpimage!==undefined){
			newActivityInStory.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
			newActivity.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
		}
	}
	missionToEdit.attivita.push(newActivityInStory);
	activities.attivita.push(newActivity);
	
	fs.writeFileSync(storyTitle + ".json", JSON.stringify(story), 'utf8',(err) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova attività nel file della singola storia');
		}
	});
	fs.writeFileSync("attivita.json", JSON.stringify(activities), 'utf8',(err) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova attività nel file attivita.json');
		}
	});
	res.status(200).send('OK');
});

app.get("/autore/newActivities", function(req,res){
	fs.readFile("attivita.json",(err,activities) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è presente il file attivita.json');
		}
		else {
			res.setHeader('Content-Type', 'application/json; charset=UTF-8'); //header risposta
			res.end(activities);
		}
	});
});

app.post("/autore/deleteActivity", function(req,res){
	console.log("Ricevuto richiesta elimina attività");
	if(req.body === null || !req.body.hasOwnProperty('id') || req.body.id === ''){ //controllo se il body è null, se il body non ha la proprietà 'id e se l'id è vuoto
		res.status(400).send('Errore nel corpo della richiesta');
	}
	var idActivityToRemove = req.body.id; //id missione da rimuovere
	var activities = fs.readFileSync ("attivita.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	var objActivities = JSON.parse(activities); //trasformo stringa in oggetto JS, sarà lista di missioni	
	var activityToDelete = objActivities.attivita.find(activity => activity.id === idActivityToRemove); //cerco l'oggetto missione nella localstorage che ha l'id della missione che voglio modificare nel file missioni.json
	var titoloStoria = activityToDelete.nomestoria;
	var story = fs.readFileSync (titoloStoria + ".json");
	var objStory = JSON.parse(story);
	
	
	var missionInStory = objStory.missioni.find(mission => mission.id === activityToDelete.idmissione); //cerco l'oggetto missione nella localstorage che ha l'id della missione che voglio modificare nel file missioni.json
	var outActivity = {"attivita": objActivities.attivita.filter(activity => activity.id !== idActivityToRemove)}; //filtra le missioni nel file "missioni.json" che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	
	var outActivityInStory = {
		"missioni": [{
			id: missionInStory.id, 
			nome: missionInStory.nome, 
			attivita:missionInStory.attivita.filter(activity => activity.id !== idActivityToRemove)
		}]
	}; 
	
	
	//var outActivityInStory = {"missioni": objStory.missioni.filter(mission => mission.id !== idMissionToRemove)}; //filtra le missioni nel file della storia che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	
	var i,j,id;
	//metodo per decrementare gli indici delle missioni
	for (i=0, id=0; i<outActivity.attivita.length; i++, id++){
		outActivity.attivita[i].id = "attivita" + id;
	}
	
	//metodo per decrementare gli indici delle missioni nelle storie
	for (i=0; i<outActivityInStory.missioni.length; i++){
		for (j=0, id=0; j<outActivityInStory.missioni[i].attivita.length; j++, id++){
			outActivityInStory.missioni[i].attivita[j].id = "attivita" + id;
		}
	}
	
	fs.writeFileSync("attivita.json", JSON.stringify(outActivity), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile eliminare l\'attività nel file missioni.json');
		}
	});
	fs.writeFileSync(titoloStoria + ".json", JSON.stringify(outActivityInStory), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile eliminare l\' attività nel file della singola missione');
		}
	});
	res.status(200).send('OK');
});

app.post("/autore/duplicateActivity", function(req,res){
	console.log("Ricevuto richiesta duplica attività");
	var duplicateActivity = req.body;
	var activity = fs.readFileSync ("attivita.json"); 
	var objActivity = JSON.parse(activity); //trasformo stringa in oggetto JS, sarà lista di missioni
	var nomeStoria = duplicateActivity.nomestoria; //nome storia
	var idMission = duplicateActivity.idmissione; 
	var story = fs.readFileSync(nomeStoria + ".json"); //leggo file della storia
	var objStoriaJson = JSON.parse(story);

	objActivity.attivita.push(duplicateActivity); 
	//inserisco in coda all'array, la storia duplicata
	fs.writeFileSync("attivita.json", JSON.stringify(objActivity), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile duplicare l\'attività nel file missioni.json');
		}
	});
	
	var attivitaClone = {
		id:duplicateActivity.id,
		domanda: duplicateActivity.domanda
	};
	if(duplicateActivity.hasOwnProperty('immaginesfondo')){
		attivitaClone.immaginesfondo = duplicateActivity.immaginesfondo;
	}
	if(duplicateActivity.hasOwnProperty('avanti')){
		attivitaClone.avanti = "Avanti";
	}
	else{
		attivitaClone.rispostebottoni = {
			sbagliata1 : duplicateActivity.rispostebottoni.sbagliata1,
			giusta : duplicateActivity.rispostebottoni.giusta,
			sbagliata2 : duplicateActivity.rispostebottoni.sbagliata2,
			sbagliata3 : duplicateActivity.rispostebottoni.sbagliata3,
			aiuto: duplicateActivity.rispostebottoni.aiuto,
			incoraggiamento: duplicateActivity.rispostebottoni.incoraggiamento
		};
		if (duplicateActivity.hasOwnProperty('immagineaiuto')){
			attivitaClone.rispostebottoni.immagineaiuto = duplicateActivity.rispostebottoni.immaginesfondo;
		}
	}

	var missionToEdit = objStoriaJson.missioni.find(mission => mission.id === idMission);
	missionToEdit.attivita.push(attivitaClone); 
	//inserisco in coda all'array, la storia duplicata
	fs.writeFileSync(nomeStoria + ".json", JSON.stringify(objStoriaJson), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile duplicare l\'attività nel file della singola missione');
		}
	});
	res.status(200).send('OK');
});

app.post('/autore/modifyActivities', upload.any(), function (req, res) {
	//console.log("Received POST request '/autore/newActivities'");
	console.log("Ricevuto richiesta modifica attività");
	var formDataString = req.body.data;
	if(formDataString===undefined){
		res.status(500).send("Errore nella richiesta del client");
		return;
	}
	var activity = JSON.parse(formDataString);
	var id = activity.id;
	var question = activity.domanda;
	var storyTitle = activity.titolostoria;
	var missionTitle = activity.titolomissione;	
	var idMission = activity.idmissione;
	var storyBinaryFile = fs.readFileSync(storyTitle + ".json"); 
	var story = JSON.parse(storyBinaryFile);
	var activitiesBinaryFile = fs.readFileSync("attivita.json"); 
	var activities = JSON.parse(activitiesBinaryFile);
	var missionToEdit = story.missioni.find(mission => mission.id === idMission);
	var activityIdToEditInStory = missionToEdit.attivita.findIndex(activity => activity.id === id);
	var activityIdToEdit = activities.attivita.findIndex(activity => activity.id === id);
	var background;
	var helpimage;
	if(req.files.length>0){
		var firstIsBackground = req.files[0].fieldname === 'background';
		var firstIsHelpImage = req.files[0].fieldname === 'helpimage';
		var secondIsPresent = req.files.length===2; //se il 2o elemento è presente allora lunghezza array 2	
		
		background = firstIsBackground ? req.files[0] : (secondIsPresent ? req.files[1] : undefined); //operatore ternario -> se req.files[0].fieldName === 'background' vero  = allora si trova in pos 0.
		//falso: controllo se req.files.length==2 vero = background avrà pos 1 altrimenti background non esiste 
		helpimage = firstIsHelpImage ? req.files[0] : (secondIsPresent ? req.files[1] : undefined);
	}
	//console.log(activityToEditInStory);
	//verifico se le immagini sono state uploadate
	console.log("Background uploaded? " + (background!==undefined ? "True" : "False"));
	console.log("Helpimage uploaded? " + (helpimage!==undefined ? "True" : "False"));

	var modifyActivityInStory = {
		id: id,
		domanda: question
	};
	var modifyActivity = {
		id: id,
		checkbox: activity.checkbox,
		domanda: question,
		nomestoria: storyTitle,
		idmissione: idMission,
		nomemissione: missionTitle
	};
	
	var baseImagePath = "./image/";
	if(background!==undefined){
		modifyActivityInStory.immaginesfondo = baseImagePath+background.filename;
		modifyActivity.immaginesfondo = baseImagePath+background.filename;
	}
	if(activity.hasOwnProperty('avanti')){
		modifyActivityInStory.avanti = "Avanti";
		modifyActivity.avanti = "Avanti";
	}
	else{
		modifyActivityInStory.rispostebottoni = {
			sbagliata1 : activity.rispostebottoni.sbagliata1,
			giusta : activity.rispostebottoni.giusta,
			sbagliata2 : activity.rispostebottoni.sbagliata2,
			sbagliata3 : activity.rispostebottoni.sbagliata3,
			aiuto: activity.rispostebottoni.aiuto,
			incoraggiamento: activity.rispostebottoni.incoraggiamento
		};
		modifyActivity.rispostebottoni = {
			sbagliata1 : activity.rispostebottoni.sbagliata1,
			giusta : activity.rispostebottoni.giusta,
			sbagliata2 : activity.rispostebottoni.sbagliata2,
			sbagliata3 : activity.rispostebottoni.sbagliata3,
			aiuto: activity.rispostebottoni.aiuto,
			incoraggiamento: activity.rispostebottoni.incoraggiamento
		};
		if(helpimage!==undefined){
			modifyActivityInStory.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
			modifyActivity.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
		}
	}
	
	activities.attivita.splice(activityIdToEdit,1,modifyActivity); //modifico i valori della missione inserendoli nella posizione della missione che voglio modificare
	missionToEdit.attivita.splice(activityIdToEditInStory,1,modifyActivityInStory);
	fs.writeFileSync(storyTitle + ".json", JSON.stringify(story), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile apportare alla missione le modifiche nel file della singola storia');
		}
	});
	fs.writeFileSync("attivita.json", JSON.stringify(activities), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile apportare all\'attività le modifiche nel file attività.json');
		}
	});
	res.status(200).send('OK');
});