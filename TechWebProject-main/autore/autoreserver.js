var stories, objStory, mission, objMission, activity, objActivity, storyToEdit, storyToEditInActivities, missionToEdit, indexOfMissionToEdit, indexOfStoryToEdit, idStory, listStories, nameStory, idMission, singleStory,objSingleStory;

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
   	stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
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
		var nameStoryToRemove = req.body.nomestoria;
		stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
		objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie	
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
		
		fs.unlink(nameStoryToRemove + '.json', (err) => { //funzione elimina storia dal pc
			if (err) {
				console.log(err);
				res.status(500).send('Non è stato possibile eliminare il file della storia.');
			}
		  	console.log('Il file ' + nameStoryToRemove + '.json è stato eliminato.');
		});
		
		res.status(200).send('OK');
	}
});

//funzione modifica le storie
app.post("/autore/modifiedStory", function(req,res){
	console.log("Ricevuto richiesta modifica storia");
   	stories = fs.readFileSync ("storie.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	objStory = JSON.parse(stories);//trasformo stringa in oggetto JS, sarà lista di storie
	mission = fs.readFileSync ("missioni.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	objMission = JSON.parse(mission);
	activity = fs.readFileSync ("attivita.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	objActivity = JSON.parse(activity);
	var modifiedStory = req.body; //oggetto JS contenente la modifica della storia
	var idOfStory = req.body.id;
	var storyToEdit = objStory.storie.find(story => story.id === idOfStory); //cerco l'oggetto storia nella localstorage che ha l'id della storia che voglio modificare
	var storyToEditInActivities = objActivity.attivita.filter(activity => activity.idstoria === idOfStory); //cerco l'oggetto storia nella localstorage che ha l'id della storia che voglio modificare
	var missionToEdit = objMission.missioni.filter(mission => mission.idstoria === idOfStory);
	var indexOfMissionToEdit = objMission.missioni.findIndex(mission => mission.idstoria === storyToEdit.idstoria);
	var indexOfStoryToEdit = objStory.storie.findIndex(story => story.id === idOfStory); //cerco l'indice dell'oggetto storia nell'array che ha l'id della storia che voglio modificare
	var i;
	if(storyToEdit !== undefined){
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
		if(missionToEdit !== ""){
			
			for(i = 0; i < missionToEdit.length; i++){
				missionToEdit[i].nomestoria = modifiedStory.nome;
				objMission.missioni.splice(indexOfMissionToEdit, missionToEdit);
			}
			fs.writeFileSync("missioni.json", JSON.stringify(objMission), 'utf8',(err) => { //modfico il nome della storia nel file missioni mantenendo l'associazione
				if (err){
					console.log(err);
					res.status(500).send('Non è stato possibile apportare le modifiche della storia nel file missioni.json');
				}
			});
		}
		if(storyToEditInActivities !== ""){
			for(i=0; i<storyToEditInActivities.length; i++){
				storyToEditInActivities[i].nomestoria = modifiedStory.nome;
				idOfStory = req.body.id;
				objActivity.attivita.splice(idOfStory, missionToEdit);
			}

			fs.writeFileSync("attivita.json", JSON.stringify(objActivity), 'utf8',(err) => { //modfico il nome della storia nel file missioni mantenendo l'associazione
				if (err){
					console.log(err);
					res.status(500).send('Non è stato possibile apportare le modifiche della storia nel file attivita.json');
				}
			});
		}
		res.status(200).send('OK');	
	}
	else{
		console.log('Storia/Missione non presente');
	}
});

//funzione archivia storie
app.post("/autore/archiveStory", function(req,res){
	console.log("Ricevuto richiesta archivia storia");
	stories = fs.readFileSync ("storie.json"); //legge file storie
	objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
	idStory = req.body.id; //id della storia archiviata
	var storyToArchive = objStory.storie.find(story => story.id === idStory && story.stato === "pubblicata"); //cerco l'oggetto storia che ha l'id della storia e lo stato "pubblicata" che voglio archiviare
	if(storyToArchive !== undefined){
		listStories = {"storie": objStory.storie.filter(story => story.id !== storyToArchive.id)};//elenco storie diverso da quella che voglio archiviare
		storyToArchive.stato = "archiviata"; //modifico lo stato da pubblicata a archiviata
		listStories.storie.push(storyToArchive); //inserisco la storia archiviata in coda all'array
		
		fs.writeFileSync("storie.json", JSON.stringify(listStories), 'utf8',(err) => { //riscrivo il file storie.json contenente la modifica della storia
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
	stories = fs.readFileSync ("storie.json"); //legge file storie
	objStory = JSON.parse(stories); //trasformo stringa in oggetto JS, sarà lista di storie
	idStory = req.body.id; //id della storia archiviata
	var storyToPublic = objStory.storie.find(story => story.id === idStory && story.stato === "archiviata"); //cerco l'oggetto storia che ha l'id della storia che voglio modificare e che ha stato "archiviata"
	if(storyToPublic !== undefined){
		listStories = {"storie": objStory.storie.filter(story => story.id !== idStory)}; //filtra le storie che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
		storyToPublic.stato = "pubblicata"; //modifico stato da archiviata a pubblicata
		listStories.storie.push(storyToPublic);
		fs.writeFileSync("storie.json", JSON.stringify(listStories), 'utf8',(err) => { //riscrivo il file storie.json contenente la modifica della storia
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
	stories = fs.readFileSync("storie.json");
	objStory = JSON.parse(stories);
	var duplicateStory = req.body; //contiene oggetto JS della storia da clonare
	nameStory = req.body.nome;
	objStory.storie.push(duplicateStory); //inserisco in coda all'array, la storia duplicata
	
	fs.writeFileSync("storie.json", JSON.stringify(objStory), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile duplicare la storia.');
		}
	});
	fs.appendFile(nameStory + '.json', '{"missioni":[]}', (err) => { //creo file 'nomestoria.json'
  		if (err) {
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova storia nel file della singola storia');
		}
  		console.log('Creato nuovo file json: '+ nameStory + '.json');
	});
	res.status(200).send('OK');
});

//funzione crea missione
app.post("/autore/newMission", function(req,res){
	console.log("Ricevuto richiesta crea missione");
	nameStory = req.body.titolostoria;
	idStory = req.body.idstoria;
	idMission = req.body.id;
	nameMission = req.body.nome;
	singleStory = fs.readFileSync(nameStory + ".json"); //leggofile json della storia
	objSingleStory = JSON.parse(singleStory);
	mission = fs.readFileSync("missioni.json"); //leggo il file missioni.json
	objMission = JSON.parse(mission);
	var newMission = {id: idMission, nome: nameMission, idstoria: idStory, nomestoria: nameStory};
	
	objSingleStory.missioni.push({id: idMission, nome: nameMission, attivita:[]});  //aggiungo alla storia il nome della missione
	
	fs.writeFileSync(nameStory + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => { //scrivo all'interno del file "storia".json il titolo della missione
		if (err){
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova missione nel file della singola storia');
		}
	});
	
	objMission.missioni.push(newMission);
	
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
   	mission = fs.readFileSync ("missioni.json"); 
	objMission = JSON.parse(mission); //trasformo stringa in oggetto JS, sarà lista di missioni
	missionToEdit = objMission.missioni.find(mission => mission.id === req.body.id); //cerco l'oggetto missione che ha l'id della missione che voglio modificare nel file missioni.json
	activity = fs.readFileSync ("attivita.json");
	objActivity =  JSON.parse(activity);
	nameStory = missionToEdit.nomestoria; //nome storia
	singleStory = fs.readFileSync(nameStory + ".json"); //leggo file della storia
	objSingleStory = JSON.parse(singleStory);
	var modifiedMission = req.body; //oggetto JS contenente la modifica della missione
	var missionToEditInStory = objSingleStory.missioni.find(mission => mission.id === req.body.id); //cerco l'oggetto missione nel file della storia che ha quel determinato id
	var missionToEditInActivity = objActivity.attivita.filter(mission => mission.idmissione === req.body.id); //filtro le storie prese nel file attività che hanno quel determinato id
	var idOfMissionToEdit = missionToEdit.id;
	
	if(missionToEdit !== undefined && missionToEditInStory !== undefined && missionToEditInActivity!== undefined){
		missionToEdit.nome = modifiedMission.nome;
		idOfMissionToEdit = modifiedMission.id;
		objMission.missioni.splice(idOfMissionToEdit, missionToEdit); //modifico i valori della missione inserendoli nella posizione della missione che voglio modificare
		missionToEditInStory.nome = modifiedMission.nome;
		idOfMissionToEditInStory = modifiedMission.id;
		objSingleStory.missioni.splice(idOfMissionToEditInStory, missionToEdit);
		
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
		
		fs.writeFileSync(nameStory + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
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
	mission = fs.readFileSync ("missioni.json"); 
	objMission = JSON.parse(mission); //trasformo stringa in oggetto JS, sarà lista di missioni
	var nameStory = req.body.nomestoria; //nome storia
	var singleStory = fs.readFileSync(nameStory + ".json"); //leggo file della storia
	var objSingleStory = JSON.parse(singleStory);
	var listMission = objSingleStory.missioni.filter(mission => mission.id === req.body.idlast); //filtro le missioni nel file della singola storia che hanno l'id della missione che voglio duplicare
	var idOfListMission = listMission.findIndex(mission => mission.id === req.body.idlast); //trovo l'id della storia filtrata -> serve per accedere alle attivita della singola storia
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
	if(listMission[idOfListMission].attivita === undefined){//controllo se le attività di quella missione è vuota
		missionClone.attivita = [];
	}
	if(listMission[idOfListMission].attivita !== undefined){
		missionClone.attivita = listMission[idOfListMission].attivita;
	}
	objSingleStory.missioni.push(missionClone);//inserisco in coda all'array, la storia duplicata
	
	fs.writeFileSync(nameStory + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
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
	idMission = req.body.id; //id missione da rimuovere
	mission = fs.readFileSync ("missioni.json"); //leggere file e memorizza contenuto cioè stringa JSON inizialmente vuota []
	objMission = JSON.parse(mission); //trasformo stringa in oggetto JS, sarà lista di missioni	
	var missionToDelete = objMission.missioni.find(mission => mission.id === idMission); //cerco l'oggetto missione nella localstorage che ha l'id della missione che voglio modificare nel file missioni.json
	nameStory = missionToDelete.nomestoria;
	singleStory = fs.readFileSync (nameStory + ".json");
	objSingleStory = JSON.parse(singleStory);
	var listMission = {"missioni": objMission.missioni.filter(mission => mission.id !== idMission)};  //filtra le missioni nel file "missioni.json" che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	var listMissionInStory = {"missioni": objSingleStory.missioni.filter(mission => mission.id !== idMission)}; //filtra le missioni nel file della storia che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	
	//metodo per decrementare gli indici delle missioni
	for (var i=0, id=0; i<listMission.missioni.length; i++, id++){
		listMission.missioni[i].id = "missione" + id;
	}
	
	//metodo per decrementare gli indici delle missioni nelle storie
	for (i=0, id=0; i<listMissionInStory.missioni.length; i++, id++){
		listMissionInStory.missioni[i].id = "missione" + id;
	}
	
	fs.writeFileSync("missioni.json", JSON.stringify(listMission), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile eliminare la missione nel file missioni.json');
		}
	});
	
	fs.writeFileSync(nameStory + ".json", JSON.stringify(listMissionInStory), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile eliminare la missione nel file della singola missione');
		}
	});
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
	var id = newActivity.id;
	var question = newActivity.domanda;;
	nameStory = newActivity.titolostoria;
	var missionTitle = newActivity.titolomissione;	
	idMission = newActivity.idmissione;
	idStory = newActivity.idstoria;
	singleStory = fs.readFileSync(nameStory + ".json"); 
	objSingleStory = JSON.parse(singleStory);
	activity = fs.readFileSync("attivita.json"); 
	objActivity = JSON.parse(activity);
	var missionToEdit = objSingleStory.missioni.find(mission => mission.id === idMission); //individuo la missione alla quale aggiungere la nuova attività
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
	var newActivityObj = {
		id: id,
		checkbox: newActivity.checkbox,
		domanda: question,
		idstoria: idStory,
		nomestoria: nameStory,
		idmissione: idMission,
		nomemissione: missionTitle
	};
	
	var baseImagePath = "./image/";
	if(background!==undefined){
		newActivityInStory.immaginesfondo = baseImagePath+background.filename;
		newActivityObj.immaginesfondo = baseImagePath+background.filename;
	}
	if(activity.hasOwnProperty('avanti')){
		newActivityInStory.avanti = "Avanti";
		newActivityObj.avanti = "Avanti";
	}
	else{
		newActivityInStory.rispostebottoni = {
			sbagliata1 : newActivity.rispostebottoni.sbagliata1,
			giusta : newActivity.rispostebottoni.giusta,
			sbagliata2 : newActivity.rispostebottoni.sbagliata2,
			sbagliata3 : newActivity.rispostebottoni.sbagliata3,
			aiuto: newActivity.rispostebottoni.aiuto,
			incoraggiamento: newActivity.rispostebottoni.incoraggiamento
		};
		newActivityObj.rispostebottoni = {
			sbagliata1 : newActivity.rispostebottoni.sbagliata1,
			giusta : newActivity.rispostebottoni.giusta,
			sbagliata2 : newActivity.rispostebottoni.sbagliata2,
			sbagliata3 : newActivity.rispostebottoni.sbagliata3,
			aiuto: newActivity.rispostebottoni.aiuto,
			incoraggiamento: newActivity.rispostebottoni.incoraggiamento
		};
		if(helpimage!==undefined){
			newActivityInStory.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
			newActivityObj.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
		}
	}
	missionToEdit.attivita.push(newActivityInStory);
	objActivity.attivita.push(newActivityObj);
	
	fs.writeFileSync(nameStory + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => {
		if (err){
			console.log(err);
			res.status(500).send('Non è stata aggiunta la nuova attività nel file della singola storia');
		}
	});
	
	fs.writeFileSync("attivita.json", JSON.stringify(objActivity), 'utf8',(err) => {
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
	activity = fs.readFileSync ("attivita.json"); //leggere file e memorizza contenuto cioè stringa JSON
	objActivity = JSON.parse(activity); //trasformo stringa in oggetto JS, sarà lista di missioni
	var activityToDelete = objActivity.attivita.find(activity => activity.id === idActivityToRemove); //cerco l'oggetto attività che ha l'id dell'attività' che voglio eliminare nel file attivita.json
	nameStory = activityToDelete.nomestoria;
	singleStory = fs.readFileSync (nameStory + ".json");
	objSingleStory = JSON.parse(singleStory);
	var missionInStory = objSingleStory.missioni.find(mission => mission.id === activityToDelete.idmissione); //cerco l'oggetto missione che ha l'id della missione che voglio modificare nel file della singola storia
	var listActivity = {"attivita": objActivity.attivita.filter(activity => activity.id !== idActivityToRemove)}; //filtra le attività nel file "attività.json" che hanno un id diverso da quello selezionato tramite il radiobutton e le memorizza nella variabile --> fatto per evitare il null
	var listActivityInStory = {
		"missioni": [{
			id: missionInStory.id, 
			nome: missionInStory.nome, 
			attivita:missionInStory.attivita.filter(activity => activity.id !== idActivityToRemove) //filtro le attivtà che hanno un'id diverso dall'attività che voglio eliminare
		}]
	};  

	var i,j,id;
	//metodo per decrementare gli indici delle missioni
	for (i=0, id=0; i<listActivity.attivita.length; i++, id++){
		listActivity.attivita[i].id = "attivita" + id;
	}
	
	//metodo per decrementare gli indici delle missioni nelle storie
	for (i=0; i<listActivityInStory.missioni.length; i++){
		for (j=0, id=0; j<listActivityInStory.missioni[i].attivita.length; j++, id++){
			listActivityInStory.missioni[i].attivita[j].id = "attivita" + id;
		}
	}
	
	fs.writeFileSync("attivita.json", JSON.stringify(listActivity), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile eliminare l\'attività nel file missioni.json');
		}
	});
	
	fs.writeFileSync(nameStory + ".json", JSON.stringify(listActivityInStory), 'utf8',(err) => { //scrivo all'interno del file storiaP.json le storie filtrate memorizzate in out
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
	console.log(duplicateActivity);
	activity = fs.readFileSync ("attivita.json"); 
	objActivity = JSON.parse(activity); //trasformo stringa in oggetto JS, sarà lista di missioni
	nameStory = duplicateActivity.nomestoria; //nome storia
	idMission = duplicateActivity.idmissione; 
	singleStory = fs.readFileSync(nameStory + ".json"); //leggo file della storia
	objSingleStory = JSON.parse(singleStory);
	objActivity.attivita.push(duplicateActivity);//inserisco in coda all'array, la storia duplicata
	
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

	var missionToEdit = objSingleStory.missioni.find(mission => mission.id === idMission); //trovo la missione che ha quel determinato id nel file della singola storia
	missionToEdit.attivita.push(attivitaClone); //inserisco in coda all'array, l'attività duplicata
	
	fs.writeFileSync(nameStory + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => { //scrivo all'interno del file storie.json la nuova storia trasformata in stringa
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile duplicare l\'attività nel file della singola missione');
		}
	});
	res.status(200).send('OK');
});

app.post('/autore/modifyActivities', upload.any(), function (req, res) {
	console.log("Ricevuto richiesta modifica attività");
	var formDataString = req.body.data;
	if(formDataString===undefined){
		res.status(500).send("Errore nella richiesta del client");
		return;
	}
	var modifyActivity = JSON.parse(formDataString);
	var id = modifyActivity.id;
	var question = modifyActivity.domanda;
	nameStory = modifyActivity.titolostoria;
	var missionTitle = modifyActivity.titolomissione;	
	idMission = modifyActivity.idmissione;
	singleStory = fs.readFileSync(nameStory + ".json"); 
	objSingleStory = JSON.parse(singleStory);
	activity = fs.readFileSync("attivita.json"); 
	objActivity = JSON.parse(activity);
	var missionToEdit = objSingleStory.missioni.find(mission => mission.id === idMission); //trovo la missione che ha quel id nel file della singola storia
	var activityIdToEditInStory = missionToEdit.attivita.findIndex(activity => activity.id === id); //trovo l'id dell'attività che si trova nel file della singola storia
	var activityIdToEdit = objActivity.attivita.findIndex(activity => activity.id === id); //trovo id dell'attività che si trova nel file delle attività
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

	var modifyActivityInStory = {
		id: id,
		domanda: question
	};
	var modifyActivityObj = {
		id: id,
		checkbox: modifyActivity.checkbox,
		domanda: question,
		nomestoria: nameStory,
		idmissione: idMission,
		nomemissione: missionTitle
	};
	
	var baseImagePath = "./image/";
	if(background!==undefined){
		modifyActivityInStory.immaginesfondo = baseImagePath+background.filename;
		modifyActivityObj.immaginesfondo = baseImagePath+background.filename;
	}
	if(activity.hasOwnProperty('avanti')){
		modifyActivityInStory.avanti = "Avanti";
		modifyActivityObj.avanti = "Avanti";
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
		modifyActivityObj.rispostebottoni = {
			sbagliata1 : modifyActivity.rispostebottoni.sbagliata1,
			giusta : modifyActivity.rispostebottoni.giusta,
			sbagliata2 : modifyActivity.rispostebottoni.sbagliata2,
			sbagliata3 : modifyActivity.rispostebottoni.sbagliata3,
			aiuto: modifyActivity.rispostebottoni.aiuto,
			incoraggiamento: modifyActivity.rispostebottoni.incoraggiamento
		};
		if(helpimage!==undefined){
			modifyActivityInStory.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
			modifyActivityObj.rispostebottoni.immagineaiuto = baseImagePath+helpimage.filename;
		}
	}
	
	objActivity.attivita.splice(activityIdToEdit,1,modifyActivityObj); //modifico i valori dell'attività inserendoli nella posizione dell'attività che voglio modificare nel file delle attivtà
	missionToEdit.attivita.splice(activityIdToEditInStory,1,modifyActivityInStory); //modifico i valori dell'attività inserendoli nella posizione dell'attività che voglio modificare nel file della singola storia
	
	fs.writeFileSync(nameStory + ".json", JSON.stringify(objSingleStory), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile apportare alla missione le modifiche nel file della singola storia');
		}
	});
	
	fs.writeFileSync("attivita.json", JSON.stringify(objActivity), 'utf8',(err) => { //riscrivo il file missioni.json contenente la modifica della storia
		if (err){
			console.log(err);
			res.status(500).send('Non è stato possibile apportare all\'attività le modifiche nel file attività.json');
		}
	});
	res.status(200).send('OK');
});