var xhr, retrievedObjectStory, objStorageStory, indexOfCheckedRadio, labels, retrievedObjectMission, objStorageMission, idOfCheckedRadio;

//funzioni inerenti alla storie archiviate
$(document).ready(function(){
	viewStoryP();
	viewStoryA();
	$("#crea").click(function(){
		document.getElementById("formattivita").hidden = false;
		document.getElementById("titolo1").hidden = true;
		document.getElementById('formmodifica').hidden = true;
		document.getElementById("messageerrorfunction").hidden = true;
	});
		
	$("#salva").click(function(){
		xhr = getCreaStoriaHTTPReq();
		var titolostoriavalore = document.getElementById("titolostoriacrea").value;
		var accessibile = document.getElementById('accessibile').checked;
		var eta = document.getElementById("creaetastoria").value;
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		objStorageStory = JSON.parse(retrievedObjectStory);
		//var lengthStory = objStorageStory.storie.length;
		if (titolostoriavalore === "" || titolostoriavalore === undefined) {
    		document.getElementById("messageerror").innerHTML = ('Titolo storia errato, inserire un nuovo titolo.');
  		} 
		else {
			var storiaP = { //oggetto JS dati nuova storia
				id: objStorageStory.storie.length,
				nome: titolostoriavalore,
				accessibile: accessibile,
				eta: eta,
				stato: "archiviata"
			};
			var objnewStory = JSON.stringify(storiaP); //trasformo oggetto JS in stringa JSON

			//richiesta post
			xhr.open('POST', '/autore/newStory', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objnewStory); //invio stringa JSON
		}
	});	
	
	$("#annullacrea").click(function(){
		document.getElementById('titolostoriacrea').value = null;
		document.getElementById('accessibile').checked = false;
		document.getElementById("formattivita").hidden = true;
		document.getElementById("titolo1").hidden = false;
		document.getElementById('formmodifica').hidden = true;
	});

	$("#confermaelimina").click(function(){
		xhr = getEliminaStoriaHTTPReq();
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		objStorageStory = JSON.parse(retrievedObjectStory);
		indexOfCheckedRadio = getCheckedRadioId('radioSA'); //cerco l'indice delle radiobutton 'checked' 
		if(indexOfCheckedRadio!==-1){ //se trova il radio button 'checked' fa...
			var idStory = { 
			id: indexOfCheckedRadio //id della storia selezionata
			};
			var objdeleteStory = JSON.stringify(idStory);
			xhr.open('POST', '/autore/deleteStory', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objdeleteStory);
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspNon è stata selezionata nessuna storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});
	
	//ottengo i dati dalla local storage inserendoli in 'modifica storia'
	$("#modificastoria").click(function(){
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		if(retrievedObjectStory === null){
			document.getElementById('messageerrorfunction').innerHTML = ('Impossibile modificare la storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
		else{
			objStorageStory = JSON.parse(retrievedObjectStory);
			labels = Array.from(document.getElementsByClassName('labelStoriaA'));
			indexOfCheckedRadio = getCheckedRadioId('radioSA'); //cerco l'indice delle radiobutton 'checked' 
			if(indexOfCheckedRadio!==-1){ //se trova il radio button 'checked' fa..
				document.getElementById("formmodifica").hidden = false;
				document.getElementById("formattivita").hidden = true;
				document.getElementById("titolo1").hidden = true;
				document.getElementById('messageerrorfunction').hidden = true;
				var selectedStory= objStorageStory.storie.find(story => story.id === indexOfCheckedRadio);
				//prendo i valori relativi alla storia selezionata e li inserisco nella input text e nel checkbox
				if(selectedStory !== undefined){
					document.getElementById('titolostoriamod').value = selectedStory.nome; 
					document.getElementById('accessibilemodifica').checked = selectedStory.accessibile;
					document.getElementById('modificaetastoria').value = selectedStory.eta; 
				}
			}
			else {
				document.getElementById("messageerrorfunction").innerHTML = ('&nbspNon è stata selezionata nessuna storia.');
				document.getElementById("titolo1").hidden = true;
				document.getElementById("formmodifica").hidden = true;
				document.getElementById("formattivita").hidden = true;
			}
		}
	});
	
	//funzione modifica storie
	$("#salvamodifica").click(function(){
		var titolostoriavalore = document.getElementById("titolostoriamod").value;
		if (titolostoriavalore === "" || titolostoriavalore === undefined) { //controllo se il titolo è vuoto o undefined
    		document.getElementById("messageerrormod").innerHTML = ('Titolo storia errato, inserire un nuovo titolo.');
  		} 
		document.getElementById("messageerrormod").innerHTML = ('Modifica accettata.');
		modifyStory();
	});
	
	$("#annullamod").click(function(){
		document.getElementById("formattivita").hidden = true;
		document.getElementById("titolo1").hidden = false;
		document.getElementById('formmodifica').hidden = true;
	});
	
	//funzione archivia storia
	$("#archiviastoria").click(function(){
		xhr = getArchiviaStoriaHTTPReq();
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		objStorageStory = JSON.parse(retrievedObjectStory);
		var indexOfCheckedRadio = getCheckedRadioId('radioSP');
		if (indexOfCheckedRadio !== -1){ //memorizzo in un oggetto l'id della storia pubblicata
			var req = { 
				id: indexOfCheckedRadio
			};
			var objArchiveStory = JSON.stringify(req); //trasformo oggetto JS in stringa JSON
			
			//richiesta post
			xhr.open('POST', '/autore/archiveStory', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objArchiveStory); //invio stringa JSON
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspNon è stata selezionata nessuna storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});
	
	//funzione pubblica storia
	$("#pubblicastoria").click(function(){
		xhr = getPubblicaStoriaHTTPReq();
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		objStorageStory = JSON.parse(retrievedObjectStory);
		indexOfCheckedRadio = getCheckedRadioId('radioSA');//cerco indice del radio button checked
		if (indexOfCheckedRadio !== -1){//memorizzo in un oggetto l'id della storia archiviata
			var req = { 
				id: indexOfCheckedRadio
			};
			var objPubblicStory = JSON.stringify(req); //trasformo oggetto JS in stringa JSON
			
			//richiesta post
			xhr.open('POST', '/autore/pubblicStory', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objPubblicStory); //invio stringa JSON
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspNon è stata selezionata nessuna storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});
	
	$("#duplicastoria").click(function(){
		xhr = getDuplicaStoriaHTTPReq();
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		objStorageStory = JSON.parse(retrievedObjectStory);
		indexOfCheckedRadio = getCheckedRadioId('radioSA');
		if (indexOfCheckedRadio !== -1){
			var selectedStory = objStorageStory.storie.find(story => story.id === indexOfCheckedRadio);
			if(selectedStory !== undefined){
				var accessibileStory = selectedStory.accessibile;
				var titleStory = selectedStory.nome; 
				var etaStory = selectedStory.eta;
				var statusStory = selectedStory.stato;
				var storiaClone = { //creo oggetto storia da duplicare
					id: objStorageStory.storie.length, //id = lunghezza array storie
					nome: titleStory,
					accessibile: accessibileStory,
					eta: etaStory,
					stato: statusStory
				};
				var objDuplicateStory = JSON.stringify(storiaClone); //trasformo oggetto JS in stringa JSON
				
				//richiesta post
				xhr.open('POST', '/autore/duplicateStory', true); //apro connessione tipo POST
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
				xhr.send(objDuplicateStory); //invio stringa JSON
			}
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspNon è stata selezionata nessuna storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});
});


//funzioni relative alle missioni e attività
$(document).ready(function(){
	viewMission();
	
	//crea missione 
	$("#salvamissione").click(function(){
		indexOfCheckedRadio = getCheckedRadioId('radioSA'); //trovo l'indice del checkbutton della storia selezionata
		if(indexOfCheckedRadio !== -1){
			var titoloMissione = document.getElementById('titolomissione').value; //nome missione
			if (titoloMissione === "" || titoloMissione === undefined) {
    			document.getElementById("messageerrormissione").innerHTML = ('Titolo missione errato, inserire un nuovo titolo.');
  			}
			else{
				xhr = getCreaMissioneHTTPReq();
				retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
				objStorageStory = JSON.parse(retrievedObjectStory);
				var titleStory = objStorageStory.storie[indexOfCheckedRadio].nome; //nome storia
				retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco storie dalla local storage
				objStorageMission = JSON.parse(retrievedObjectMission);
				var missione = {
					id: "missione" + objStorageMission.missioni.length,
					titolostoria: titleStory,
					nome: titoloMissione
				};
				var objMissione = JSON.stringify(missione);
				
				//richiesta post
				xhr.open('POST', '/autore/newMission', true); //apro connessione tipo POST
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
				xhr.send(objMissione); //invio stringa JSON
			}
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('&nbspNon è stata selezionata alcuna storia archiviata.');
		}
	});
	
	//riempie i campi del form modifica missione 
	$("#modificamissione").click(function(){
		var radioButtons = Array.from(document.getElementsByName('elencoMissioni')); //converto ListNode in array
		var checkedRadio = radioButtons.find(radio => radio.checked);
		if (checkedRadio !== undefined){
			var idOfCheckedRadio = checkedRadio.id;
			retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco missioni dalla local storage
			objStorageMission = JSON.parse(retrievedObjectMission);
			var selectedMission= objStorageMission.missioni.find(mission => mission.id === idOfCheckedRadio);//seleziono l'oggetto della missione che ha l'id = indice checkbutton selezionato
				
				//prendo i valori relativi alla missione selezionata e li inserisco nella input text
			if(selectedMission !== undefined){
				document.getElementById('titolomissione').value = selectedMission.nome;
			}
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('&nbspNon è stata selezionata alcuna missione.');
		}
	});
	
	//modifica missione
	$("#salvamissione").click(function(){
		var radioButtons = Array.from(document.getElementsByName('elencoMissioni'));
		var checkedRadio = radioButtons.find(radio => radio.checked);
		if (checkedRadio !== undefined){
			var titoloMissione = document.getElementById('titolomissione').value;
			if (titoloMissione === "" || titoloMissione === undefined) {
    			document.getElementById("messageerrormissione").innerHTML = ('Titolo missione errato, inserire un nuovo titolo.');
  			}
			else{
				modifyMission();
				}
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('&nbspNon è stata selezionata alcuna missione.');
		}
	});
	
	//duplica missione
	$("#duplicamissione").click(function(){
		xhr = getDuplicaMissioneHTTPReq();
		var radioButtons = Array.from(document.getElementsByName('elencoMissioni')); //converto ListNode in array
		var checkedRadio = radioButtons.find(radio => radio.checked);
		retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco missioni dalla local storage
		objStorageMission = JSON.parse(retrievedObjectMission);
		if (checkedRadio !== undefined){
			idOfCheckedRadio = checkedRadio.id;
			var selectedMission = objStorageMission.missioni.find(mission => mission.id === idOfCheckedRadio);
			var missioneClone = {
				id: "missione" + objStorageMission.missioni.length,
				nome: selectedMission.nome,
				nomestoria: selectedMission.nomestoria
			};
			var objDuplicateMission = JSON.stringify(missioneClone); //trasformo oggetto JS in stringa JSON
				
			//richiesta post
			xhr.open('POST', '/autore/duplicateMission', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objDuplicateMission); //invio stringa JSON	
		}
		else {
			document.getElementById("messageerrormissione").innerHTML = ('&nbspNon è stata selezionata alcuna missione.');
		}
	});
	
	//elimina missione
	$("#confermaeliminamis").click(function(){
		xhr = getEliminaMissioneHTTPReq();
		retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco storie dalla local storage
		objStorageMission = JSON.parse(retrievedObjectMission);
		var radioButtons = Array.from(document.getElementsByName('elencoMissioni')); 
		var checkedRadio = radioButtons.find(radio => radio.checked); //cerco l'indice delle radiobutton 'checked' 
		if (checkedRadio !== undefined){ //se trova il radio button 'checked' fa...
			idOfCheckedRadio = checkedRadio.id;
			var idMission = { 
				id: idOfCheckedRadio //id della storia selezionata
			};
			var objdeleteMission = JSON.stringify(idMission);
			xhr.open('POST', '/autore/deleteMission', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objdeleteMission);
		}
		else {
			document.getElementById("messageerrormissione").innerHTML = ('&nbspNon è stata selezionata alcuna missione.');
		}
	});
	
	//crea attività
	$("#salvaat").click(function(){
		
	});
	
	
});


function cambiaPagina(url) {
		window.location.replace(url);
}

$(document).ready(function(){
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});
});

function getCreaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState===4 && xhr.status===200){ //se il server risponde con ok, ricarico la pagina per visualizzare tutte le missioni comprese quelle nuove
			document.getElementById("messageerrormissione").innerHTML = ('La missione è stata creata.');
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('La missione non è stata creata, riprova.');
			return;
		}
	};
	return xhr;
}

function getModificaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload(); //aggiorno la pagina in modo da vedere le modifiche apportate alle storie dopo l'ok dal server
		}
	};
	return xhr;
}

function getDuplicaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("messageerrormissione").innerHTML = ('&nbspLa missione è stata duplicata.');
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('&nbspLa missione non è stata duplicata.');
			return;
		}
	};
	return xhr;
}

function getEliminaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    		if (xhr.readyState === 4 && xhr.status === 200) {
				location.reload(); //aggiorno la pagina in modo da vedere le nuove storie dopo l'eliminazione dopo l'ok dal server
			}
		};
	return xhr;
}

function getCreaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState===4 && xhr.status===200){ //se il server risponde con ok, ricarico la pagina per visualizzare tutte le storie comprese quelle nuove
			document.getElementById("messageerror").innerHTML = ('La storia è stata creata.');
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerror").innerHTML = ('La storia non è stata creata, riprova.');
			return;
		}
	};
	return xhr;
}

function getModificaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload(); //aggiorno la pagina in modo da vedere le modifiche apportate alle storie dopo l'ok dal server
		}
	};
	return xhr;
}

function getEliminaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    		if (xhr.readyState === 4 && xhr.status === 200) {
				location.reload(); //aggiorno la pagina in modo da vedere le nuove storie dopo l'eliminazione dopo l'ok dal server
			}
		};
	return xhr;
}

function getPubblicaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspLa storia è stata pubblicata.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspLa storia non è stata pubblicata.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			return;
		}
	};
	return xhr;
}

function getArchiviaStoriaHTTPReq(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspLa storia è stata archiviata.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspLa storia non è stata archiviata.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			return;
		}
	};
	return xhr;
}

function getDuplicaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspLa storia è stata duplicata.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspLa storia non è stata duplicata.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			return;
		}
	};
	return xhr;
}

function getCheckedRadioId(radioButtonClass){
	var radioButtons = Array.from(document.getElementsByName(radioButtonClass)); //converto ListNode in array
	var checkedRadio = radioButtons.find(radio => radio.checked);//cerco il radiobutton checked
	return(checkedRadio === undefined ? -1: parseInt(checkedRadio.id)); //ritorno l'indice del radiobutton checked se != da undefined
}

function modifyMission(){
	var xhr = getModificaMissioneHTTPReq();
	var radioButtons = Array.from(document.getElementsByName('elencoMissioni'));
	var checkedRadio = radioButtons.find(radio => radio.checked);
	retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco missioni dalla local storage
	objStorageMission = JSON.parse(retrievedObjectMission);
	if (checkedRadio !== undefined){
		var titoloMissione = document.getElementById('titolomissione').value;
		var idOfCheckedRadio = checkedRadio.id;
		var mission = objStorageMission.missioni.find(mission => mission.id === idOfCheckedRadio);
		var missione = {
			id: idOfCheckedRadio,
			nome: titoloMissione,
			oldNome: mission.nome
		};
		var objModifyMission = JSON.stringify(missione); //trasformo oggetto JS in stringa JSON
		//richiesta post
		xhr.open('POST', '/autore/modifiedMission', true); //apro connessione tipo POST
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
		xhr.send(objModifyMission); //invio stringa JSON
	}
}

function modifyStory(){
	var xhr, storia, objModifyStory;
	xhr = getModificaStoriaHTTPReq();
	var titolostoriavalore = document.getElementById("titolostoriamod").value;
	var accessibile = document.getElementById('accessibilemodifica').checked;
	var eta = document.getElementById("modificaetastoria").value;
	indexOfCheckedRadio = getCheckedRadioId('radioSA');
	if(indexOfCheckedRadio !== -1){
		storia = { //oggetto JS dati storia modificata
			id: indexOfCheckedRadio, //rappresenta id della storia selezionata
			nome: titolostoriavalore, //nuovo nome storia
			accessibile: accessibile, //nuovo valore 'accessibile'
			eta: eta
		};
		objModifyStory = JSON.stringify(storia); //trasformo oggetto JS in stringa JSON
		//richiesta post
		xhr.open('POST', '/autore/modifiedStory', true); //apro connessione tipo POST
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
		xhr.send(objModifyStory); //invio stringa JSON
	}
}

//necessario per vedere le storie presenti nel div 'storie pubblicate'
function viewStoryP(){	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newStory', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strnewStory = xhr.responseText; //ottengo elenco storie in formato stringa
			localStorage.setItem('storie', strnewStory); // Inserisco nella storage l'oggetto
			var objPubblicStory = JSON.parse(strnewStory); //ottengo oggetto JS
			var storyPubblic = objPubblicStory.storie.filter(story => story.stato === "pubblicata");//filtro le storie che hanno lo stato "pubblicata"	
			for (var i = 0; i < storyPubblic.length; i++){
				//crea tutti i radio button delle storie pubblicate
				document.getElementById('storiepubblicate').innerHTML += "<div class='form-check radioStoriaP'><input name='radioSP' type='radio' id= "+ storyPubblic[i].id + " value= "+ storyPubblic[i].nome + ">&nbsp<label class='labelStoriaP' for= "+ storyPubblic[i].id + ">" + storyPubblic[i].nome + "</label></div>";
			}
		}
	};
	xhr.send();
}
//necessario per vedere le storie presenti nel div 'storie archiviate'
function viewStoryA(){	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newStory', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strArchiveStory = xhr.responseText; //ottengo elenco storie in formato stringa
			localStorage.setItem('storie', strArchiveStory); // Inserisco nella storage l'oggetto
			var objArchiveStory = JSON.parse(strArchiveStory); //ottengo oggetto JS
			var storyArchive = objArchiveStory.storie.filter(story => story.stato === "archiviata");//filtro le storie che hanno lo stato "archiviata"
			for (var i = 0; i < storyArchive.length; i++){
			//crea tutti i radio button delle storie archiviate
				document.getElementById('storiearchiviate').innerHTML += "<div class='form-check radioStoriaA'><input name='radioSA' type='radio' id= "+ storyArchive[i].id + " value= "+ storyArchive[i].nome + ">&nbsp<label class='labelStoriaA' for= "+ storyArchive[i].id + ">" + storyArchive[i].nome + "</label></div>";
			}
		}
	};
	xhr.send();
}

function viewMission(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newMission', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strMission = xhr.responseText; //ottengo elenco storie in formato stringa
			localStorage.setItem('missioni', strMission); // Inserisco nella storage l'oggetto
			var objMission = JSON.parse(strMission); //ottengo oggetto JS
			
			for (var i = 0; i < objMission.missioni.length; i++){
			//crea tutti i radio button delle storie archiviate
				document.getElementById('elencomissioni').innerHTML += "<div class='form-check elencoMissioni'><input name='elencoMissioni' type='radio' id= " + objMission.missioni[i].id + " value= "+ objMission.missioni[i].nome + ">&nbsp<label class='labelMissioni' for= " + objMission.missioni[i].id + ">" + objMission.missioni[i].nome + "</label></div>";
			}
		}
	};
	xhr.send();
}

/*
function viewActivities(){
	var retrievedObjectActivities = localStorage.getItem('objAttivita'); //ottengo elenco attività dalla local storage
	if (retrievedObjectActivities === null){
		document.getElementById("erroreattivita").innerHTML =('Non è presente alcuna attività, creane una.');
	}
	else{
		var objStorageActivities = JSON.parse(retrievedObjectActivities);
		var objActivitiesLength = objStorageActivities.attività.length; //calcolo lunghezza oggetto JS
		var radioAttività = document.getElementsByClassName('radioAttività');
		for (var i = 0; i < objActivitiesLength; i++){
			//crea tutti i radio button delle storie presenti nel file storiaA.json
			document.getElementById('attivitastoria').innerHTML += "<div class='form-check radioAttività'><input name='radioAttività' type='radio' id= "+ 'radioAttività'  + radioAttività.length + " value= "+ 'Attività '+ radioAttività.length + ">&nbsp<label class='labelAttività' for= "+ 'radioAttività' + radioAttività.length + ">" + 'Attività '+ radioAttività.length + "</label></div>";
		}
	}
}*/