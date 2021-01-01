var xhr, retrievedObjectStory, objStorageStory, indexOfCheckedRadio,retrievedObjectMission, objStorageMission, idOfCheckedRadio, retrievedObjectActivities, objStorageActivities,radioButtons,checkedRadio, selectedMission,selectedStory,titoloStoria,titoloMissione,selectedActivity;

$(document).ready(function(){
	viewStoryP();
	viewStoryA();
	viewMission();
	viewActivities();
	
	$("#crea").click(function(){
		document.getElementById("formattivita").hidden = false;
		document.getElementById("titolo1").hidden = true;
		document.getElementById('formmodifica').hidden = true;
		document.getElementById("messageerrorfunction").hidden = true;
	});
		
	$("#salva").click(function(){
		xhr = getCreaStoriaHTTPReq();
		titoloStoria = document.getElementById("titolostoriacrea").value;
		var accessibile = document.getElementById('accessibile').checked;
		var eta = document.getElementById("creaetastoria").value;
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		objStorageStory = JSON.parse(retrievedObjectStory); //trasformo stringa JSON in oggetto JS
		if (titoloStoria === "" || titoloStoria === undefined) {
    		document.getElementById("messageerror").innerHTML = ('<i>Titolo storia errato, inserire un nuovo titolo.</i>');
  		} 
		else {
			var storiaP = { //oggetto JS dati nuova storia
				id: objStorageStory.storie.length,
				nome: titoloStoria,
				accessibile: accessibile,
				eta: eta,
				stato: "archiviata"
			};
			var objNewStory = JSON.stringify(storiaP); //trasformo oggetto JS in stringa JSON
			//richiesta post
			xhr.open('POST', '/autore/newStory', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objNewStory); //invio stringa JSON
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
		retrievedObjectStory = localStorage.getItem('storie');
		objStorageStory = JSON.parse(retrievedObjectStory);
		indexOfCheckedRadio = getCheckedRadioId('radioSA'); //cerco l'indice delle radiobutton 'checked' 
		if(indexOfCheckedRadio!==-1){ //se trova il radio button 'checked' fa...
			var story = { 
			id: indexOfCheckedRadio, //id della storia selezionata
			nomestoria: objStorageStory.storie[indexOfCheckedRadio].nome //nome storia necessario per eliminare il file della singola storia dal pc
			};
			var objDeleteStory = JSON.stringify(story);
			xhr.open('POST', '/autore/deleteStory', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDeleteStory);
		}
		else {
			document.getElementById("messageerrorstorydelete").innerHTML=('<i>&nbsp &nbspNon è stata selezionata nessuna storia.</i>');
			return false;
		}
	});
	
	//ottengo i dati dalla local storage inserendoli in 'modifica storia'
	$("#modificastoria").click(function(){
		retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
		if(retrievedObjectStory === null){ //controllo se oggetto storie nella localstorage è nullo
			document.getElementById('messageerrorfunction').innerHTML = ('<i>Impossibile modificare la storia.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
		else{
			objStorageStory = JSON.parse(retrievedObjectStory);
			indexOfCheckedRadio = getCheckedRadioId('radioSA'); //cerco l'indice delle radiobutton 'checked' 
			if(indexOfCheckedRadio!==-1){ //se trova il radio button 'checked' fa..
				document.getElementById("formmodifica").hidden = false;
				document.getElementById("formattivita").hidden = true;
				document.getElementById("titolo1").hidden = true;
				document.getElementById('messageerrorfunction').hidden = true;
				selectedStory = objStorageStory.storie.find(story => story.id === indexOfCheckedRadio);
				//prendo i valori relativi alla storia selezionata e li inserisco nella input text e nel checkbox
				if(selectedStory !== undefined){
					document.getElementById('titolostoriamod').value = selectedStory.nome; 
					document.getElementById('accessibilemodifica').checked = selectedStory.accessibile;
					document.getElementById('modificaetastoria').value = selectedStory.eta; 
				}
			}
			else {
				document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia.</i>');
				document.getElementById("titolo1").hidden = true;
				document.getElementById("formmodifica").hidden = true;
				document.getElementById("formattivita").hidden = true;
			}
		}
	});
	
	//funzione modifica storie
	$("#salvamodifica").click(function(){
		titoloStoria = document.getElementById("titolostoriamod").value;
		if (titoloStoria === "" || titoloStoria === undefined) { //controllo se il titolo è vuoto o undefined
    		document.getElementById("messageerrormod").innerHTML = ('<i>Titolo storia errato, inserire un nuovo titolo.</i>');
  		} 
		else{
			document.getElementById("messageerrormod").innerHTML = ('<i>Modifica accettata.</i>');
			modifyStory();
		}
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
		indexOfCheckedRadio = getCheckedRadioId('radioSP');
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
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia pubblicata.</i>');
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
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
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
			selectedStory = objStorageStory.storie.find(story => story.id === indexOfCheckedRadio);
			if(selectedStory !== undefined){
				var accessibileStory = selectedStory.accessibile;
				var titleStory = selectedStory.nome; 
				var etaStory = selectedStory.eta;
				var statusStory = selectedStory.stato;
				var storiaClone = { //creo oggetto storia da duplicare
					id: objStorageStory.storie.length, //id = lunghezza array storie
					nome: titleStory + " duplicata",
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
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});
	
	//crea missione 
	$("#salvamissione").click(function(){
		indexOfCheckedRadio = getCheckedRadioId('radioSA'); //trovo l'indice del checkbutton della storia selezionata
		if(indexOfCheckedRadio !== -1){
			titoloMissione = document.getElementById('titolomissione').value; //nome missione
			if (titoloMissione === "" || titoloMissione === undefined) {
    			document.getElementById("messageerrormissione").innerHTML = ('<i>Titolo missione errato, inserire un nuovo titolo.</i>');
  			}
			else{
				xhr = getCreaMissioneHTTPReq();
				retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
				objStorageStory = JSON.parse(retrievedObjectStory);
				var titleStory = objStorageStory.storie[indexOfCheckedRadio].nome; //nome storia
				var idStory = objStorageStory.storie[indexOfCheckedRadio].id; //nome storia
				retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco storie dalla local storage
				objStorageMission = JSON.parse(retrievedObjectMission);
				var mission = {
					id: "missione" + objStorageMission.missioni.length,
					titolostoria: titleStory,
					idstoria: idStory,
					nome: titoloMissione
				};
				var objMission = JSON.stringify(mission);
				//richiesta post
				xhr.open('POST', '/autore/newMission', true); //apro connessione tipo POST
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
				xhr.send(objMission); //invio stringa JSON
			}
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
		}
	});
	
	//riempie i campi del form modifica missione 
	$("#modificamissione").click(function(){
		radioButtons = Array.from(document.getElementsByName('elencoMissioni')); //converto ListNode in array
		checkedRadio = radioButtons.find(radio => radio.checked);
		if (checkedRadio !== undefined){
			idOfCheckedRadio = checkedRadio.id;
			retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco missioni dalla local storage
			objStorageMission = JSON.parse(retrievedObjectMission);
			selectedMission = objStorageMission.missioni.find(mission => mission.id === idOfCheckedRadio);//seleziono l'oggetto della missione che ha l'id = indice checkbutton selezionato
			//prendo i valori relativi alla missione selezionata e li inserisco nella input text
			if(selectedMission !== undefined){
				document.getElementById('modtitolomissione').value = selectedMission.nome;
			}
		}
		else{
			document.getElementById("modmessageerrormissione").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
		}
	});
	
	//modifica missione
	$("#salvamodmis").click(function(){
		radioButtons = Array.from(document.getElementsByName('elencoMissioni'));
		checkedRadio = radioButtons.find(radio => radio.checked);
		if (checkedRadio !== undefined){
			titoloMissione = document.getElementById('modtitolomissione').value;
			if (titoloMissione === "" || titoloMissione === undefined) {
    			document.getElementById("modmessageerrormissione").innerHTML = ('<i>Titolo missione errato, inserire un nuovo titolo.</i>');
  			}
			else{
				modifyMission();
				}
		}
		else{
			document.getElementById("modmessageerrormissione").innerHTML = ('<i>&nbspNon è stata selezionata alcuna missione.</i>');
		}
	});
	
	//duplica missione
	$("#duplicamissione").click(function(){
		xhr = getDuplicaMissioneHTTPReq();
		radioButtons = Array.from(document.getElementsByName('elencoMissioni')); //converto ListNode in array
		checkedRadio = radioButtons.find(radio => radio.checked);
		retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco missioni dalla local storage
		objStorageMission = JSON.parse(retrievedObjectMission);
		if (checkedRadio !== undefined){
			idOfCheckedRadio = checkedRadio.id;
			selectedMission = objStorageMission.missioni.find(mission => mission.id === idOfCheckedRadio);
			var missioneClone = {
				id: "missione" + objStorageMission.missioni.length,
				idlast:idOfCheckedRadio,
				nome: selectedMission.nome,
				idstoria: selectedMission.idstoria,
				nomestoria: selectedMission.nomestoria
			};
			var objDuplicateMission = JSON.stringify(missioneClone); //trasformo oggetto JS in stringa JSON
			//richiesta post
			xhr.open('POST', '/autore/duplicateMission', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objDuplicateMission); //invio stringa JSON	
		}
		else {
			document.getElementById("errormission").innerHTML = ('&nbsp<i>Non è stata selezionata alcuna missione.</i>');
		}
	});
	
	//elimina missione
	$("#confermaeliminamis").click(function(){
		xhr = getEliminaMissioneHTTPReq();
		retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco storie dalla local storage
		objStorageMission = JSON.parse(retrievedObjectMission);
		radioButtons = Array.from(document.getElementsByName('elencoMissioni')); 
		checkedRadio = radioButtons.find(radio => radio.checked); //cerco l'indice delle radiobutton 'checked' 
		if (checkedRadio !== undefined){ //se trova il radio button 'checked' fa...
			idOfCheckedRadio = checkedRadio.id;
			var idMission = { 
				id: idOfCheckedRadio //id della storia selezionata
			};
			var objDeleteMission = JSON.stringify(idMission);
			xhr.open('POST', '/autore/deleteMission', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDeleteMission);
		}
		else {
			document.getElementById("messageerrormissiondelete").innerHTML = ('&nbsp&nbsp<i>Non è stata selezionata alcuna missione.</i>');
		}
	});
	
	$("#confermaeliminaatt").click(function(){
		xhr = getEliminaAttivitaHTTPReq();
		retrievedObjectActivities = localStorage.getItem('attivita'); //ottengo elenco storie dalla local storage
		objStorageActivities = JSON.parse(retrievedObjectActivities);
		radioButtons = Array.from(document.getElementsByName('elencoAttivita')); 
		checkedRadio = radioButtons.find(radio => radio.checked); //cerco l'indice delle radiobutton 'checked' 
		if (checkedRadio !== undefined){ //se trova il radio button 'checked' fa...
			idOfCheckedRadio = checkedRadio.id;
			var idAttivita = { 
				id: idOfCheckedRadio
			};
			var objDeleteActivity = JSON.stringify(idAttivita);
			xhr.open('POST', '/autore/deleteActivity', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDeleteActivity);
		}
		else {
			document.getElementById("messageerroractivitydelete").innerHTML = ('&nbsp&nbsp<i>Non è stata selezionata alcuna attività.</i>');
		}
	});
	
	$("#duplicaattivita").click(function(){
		xhr = getDuplicaAttivitaHTTPReq();
		retrievedObjectActivities = localStorage.getItem('attivita');
		objStorageActivities = JSON.parse(retrievedObjectActivities);
		radioButtons = Array.from(document.getElementsByName('elencoAttivita')); 
		checkedRadio = radioButtons.find(radio => radio.checked);
		var attivitaClone;
		if (checkedRadio !== undefined){
			idOfCheckedRadio = checkedRadio.id;
			selectedActivity = objStorageActivities.attivita.find(activity => activity.id === idOfCheckedRadio);
			attivitaClone = {
				id: "attivita" + objStorageActivities.attivita.length,
				checkbox: selectedActivity.checkbox,
				domanda: selectedActivity.domanda,
				nomestoria: selectedActivity.nomestoria,
				idmissione: selectedActivity.idmissione,
				nomemissione: selectedActivity.nomemissione
			};
			if(selectedActivity.hasOwnProperty('immaginesfondo')){
				attivitaClone.immaginesfondo = selectedActivity.immaginesfondo;
			}
			if(selectedActivity.hasOwnProperty('avanti')){
				attivitaClone.avanti = "Avanti";
			}
			else{
				attivitaClone.rispostebottoni = {
					sbagliata1 : selectedActivity.rispostebottoni.sbagliata1,
					giusta : selectedActivity.rispostebottoni.giusta,
					sbagliata2 : selectedActivity.rispostebottoni.sbagliata2,
					sbagliata3 : selectedActivity.rispostebottoni.sbagliata3,
					aiuto: selectedActivity.rispostebottoni.aiuto,
					incoraggiamento: selectedActivity.rispostebottoni.incoraggiamento
				};
				if (selectedActivity.hasOwnProperty('immagineaiuto')){
					attivitaClone.rispostebottoni.immagineaiuto = selectedActivity.rispostebottoni.immaginesfondo;
				}
			}
			var objDuplicateActivity = JSON.stringify(attivitaClone); //trasformo oggetto JS in stringa JSON
			//richiesta post
			xhr.open('POST', '/autore/duplicateActivity', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objDuplicateActivity); //invio stringa JSON
		}
		else {
			document.getElementById("erroreattivita").innerHTML = ('&nbsp<i>Non è stata selezionata alcuna attività.</i>');
		}
	});
	
	$("#modificaattivita").click(function(){
		radioButtons = Array.from(document.getElementsByName('elencoAttivita')); 
		checkedRadio = radioButtons.find(radio => radio.checked);
		if (checkedRadio !== undefined){
			idOfCheckedRadio = checkedRadio.id;
			retrievedObjectActivities = localStorage.getItem('attivita'); //ottengo elenco storie dalla local storage
			objStorageActivities = JSON.parse(retrievedObjectActivities);
			selectedActivity= objStorageActivities.attivita.find(activity => activity.id === idOfCheckedRadio);//seleziono l'oggetto della missione che ha l'id = indice checkbutton selezionato
			//prendo i valori relativi alla missione selezionata e li inserisco nella input text
			if(selectedActivity !== undefined){
				document.getElementById('moddomandaattivita').value = selectedActivity.domanda;
				if(selectedActivity.checkbox === true){
					document.getElementById("modrispostacorretta").disabled = false;
					document.getElementById("modrispostasbagliata1").disabled = false;
					document.getElementById("modrispostasbagliata2").disabled = false;
					document.getElementById("modrispostasbagliata3").disabled = false;
					document.getElementById("modaiutorisposta").disabled = false;
					document.getElementById("modificaaiutoimmagine").disabled = false;
					document.getElementById("modmessaggiorispostasbagliata").disabled = false;
					document.getElementById('modcheckboxrisposte').checked = selectedActivity.checkbox; document.getElementById('modrispostasbagliata1').value = selectedActivity.rispostebottoni.sbagliata1;
					document.getElementById('modrispostacorretta').value = selectedActivity.rispostebottoni.giusta;
					document.getElementById('modrispostasbagliata2').value = selectedActivity.rispostebottoni.sbagliata2;
					document.getElementById('modrispostasbagliata3').value = selectedActivity.rispostebottoni.sbagliata3;
					document.getElementById('modaiutorisposta').value = selectedActivity.rispostebottoni.aiuto;
					document.getElementById('modmessaggiorispostasbagliata').value = selectedActivity.rispostebottoni.incoraggiamento;
					if (selectedActivity.rispostebottoni.hasOwnProperty('immagineaiuto')){
						var newPathHelpImage = selectedActivity.rispostebottoni.immagineaiuto.replace("./image/", "");
						document.getElementById('imgaiutocaricato').innerHTML = "Hai caricato la seguente immagine aiuto: " + "<i>"+ newPathHelpImage + "</i>";
					}
					else{
						document.getElementById('imgaiutocaricato').innerHTML = "Non hai caricato in precedenza nessun immagine aiuto.";
					}
				}
				if(selectedActivity.hasOwnProperty('immaginesfondo')){
					var newPathBackground = selectedActivity.immaginesfondo.replace("./image/", "");
					document.getElementById('sfondocaricato').innerHTML = "Hai caricato il seguente sfondo: " + "<i>"+ newPathBackground + "</i>";
				}
				else{
					document.getElementById('sfondocaricato').innerHTML = "Non hai caricato in precedenza nessun sfondo.";
				}
			}
		}
		else{
			document.getElementById("messageerrmodattivita").innerHTML = ("<i>&nbsp&nbspNon è stata selezionata un'\ attività.</i>");
		}
	});
	
	//appena chiudo finestra di modifica attività aggiorno pagina
	$("#finestramodificaattivita").on('hidden.bs.modal', function(){
		location.reload();
	});
});

function check(){
	if(document.getElementById("checkboxrisposte").checked){
			document.getElementById("rispostacorretta").disabled = false;
			document.getElementById("rispostasbagliata1").disabled = false;
			document.getElementById("rispostasbagliata2").disabled = false;
			document.getElementById("rispostasbagliata3").disabled = false;
			document.getElementById("aiutorisposta").disabled = false;
			document.getElementById("aiutoimmagine").disabled = false;
			document.getElementById("messaggiorispostasbagliata").disabled = false;
		}
	else {
		document.getElementById("rispostacorretta").disabled = true;
			document.getElementById("rispostasbagliata1").disabled = true;
			document.getElementById("rispostasbagliata2").disabled = true;
			document.getElementById("rispostasbagliata3").disabled = true;
			document.getElementById("aiutorisposta").disabled = true;
			document.getElementById("aiutoimmagine").disabled = true;
			document.getElementById("messaggiorispostasbagliata").disabled = true;
	}
	if(document.getElementById("modcheckboxrisposte").checked){
			document.getElementById("modrispostacorretta").disabled = false;
			document.getElementById("modrispostasbagliata1").disabled = false;
			document.getElementById("modrispostasbagliata2").disabled = false;
			document.getElementById("modrispostasbagliata3").disabled = false;
			document.getElementById("modaiutorisposta").disabled = false;
			document.getElementById("modificaaiutoimmagine").disabled = false;
			document.getElementById("modmessaggiorispostasbagliata").disabled = false;
		}
	else {
		document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = true;
			document.getElementById("modificaaiutoimmagine").disabled = true;
			document.getElementById("modmessaggiorispostasbagliata").disabled = true;
	}
}

//crea attività
function validateForm(e){
	e.preventDefault();  //evita il comportamento predefinito del form -> invio dei dati
	var indexOfCheckedRadioSA = getCheckedRadioId('radioSA'); //trovo l'indice del checkbutton della storia selezionata
	radioButtons = Array.from(document.getElementsByName('elencoMissioni')); //converto ListNode in array
	checkedRadio = radioButtons.find(radio => radio.checked);
	var attivita;
	if(indexOfCheckedRadioSA !== -1 && checkedRadio !== undefined){
		var domandaAttivita = document.forms.formAttivita.domandaattivita.value;
		if (domandaAttivita === "" || domandaAttivita === undefined) {
			document.getElementById("messageerrattivita").innerHTML = ('<i>&nbsp &nbsp Titolo attività errato, inserire un nuovo titolo.</i>');
			return false;
		}
		else{
			xhr = getCreaAttivitaHTTPReq();
			retrievedObjectStory = localStorage.getItem('storie'); //ottengo elenco storie dalla local storage
			objStorageStory = JSON.parse(retrievedObjectStory);
			var titleStory = objStorageStory.storie[indexOfCheckedRadioSA].nome; //nome storia
			retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco storie dalla local storage
			objStorageMission = JSON.parse(retrievedObjectMission);
			idOfCheckedRadio = checkedRadio.id;
			var selectedMission = objStorageMission.missioni.find(mission => mission.id === idOfCheckedRadio);
			var titleMission = selectedMission.nome;
			var idMission = selectedMission.id;
			var idStory = selectedMission.idstoria;
			var valueCheckboxForm = document.getElementById("checkboxrisposte").checked;
			retrievedObjectActivities = localStorage.getItem('attivita');
			objStorageActivities = JSON.parse(retrievedObjectActivities);
			if(valueCheckboxForm){
				attivita = {
					id: "attivita" + objStorageActivities.attivita.length,
					checkbox: valueCheckboxForm,
					idstoria: idStory,
					titolostoria: titleStory,
					idmissione: idMission,
					titolomissione: titleMission,
					domanda: document.getElementById("domandaattivita").value, 
					rispostebottoni:{
						sbagliata1 : document.getElementById("rispostasbagliata1").value,
						giusta : document.getElementById("rispostacorretta").value,
						sbagliata2 : document.getElementById("rispostasbagliata2").value,
						sbagliata3 : document.getElementById("rispostasbagliata3").value,
						aiuto:document.getElementById("aiutorisposta").value,
						incoraggiamento: document.getElementById("messaggiorispostasbagliata").value
					}
				};
			}
			else{
				attivita = {
					id: "attivita" + objStorageActivities.attivita.length,
					checkbox: valueCheckboxForm,
					idstoria: idStory,
					titolostoria: titleStory,
					idmissione: idMission,
					titolomissione: titleMission,
					domanda: document.getElementById("domandaattivita").value, 
					avanti: "Avanti"
				};
			}
			var objNewActivity = JSON.stringify(attivita); //trasformo oggetto JS in stringa JSON
			//richiesta post
			var formData = new FormData(document.getElementById("newActivityForm")); //formdata che contiene il form (file immagini)
			formData.append("data", objNewActivity); //aggiungo oggetto objNewActivity nel formdata
			xhr.open('POST', '/autore/newActivities', true); //apro connessione tipo POST
			xhr.send(formData); //invio l'intero formData al server testo + immagini
			return true;
		}
	}
	else{
		document.getElementById("messageerrattivita").innerHTML = ('<i>&nbsp &nbspNon è stata selezionata una storia archiviata ed una missione.</i>');
		return false;
	}			
}

//modifica attività
function validateModifyForm(e){
	e.preventDefault();  //evita il comportamento predefinito del form -> invio dei dati
	radioButtons = Array.from(document.getElementsByName('elencoAttivita')); //converto ListNode in array
	checkedRadio = radioButtons.find(radio => radio.checked);
	var attivita;
	if (checkedRadio !== undefined){
		var domandaAttivita = document.forms.formModificaAttivita.moddomandaattivita.value;
		if (domandaAttivita === "" || domandaAttivita === undefined) {
			document.getElementById("messageerrmodattivita").innerHTML = ('<i>&nbsp&nbspTitolo attività errato, inserire un nuovo titolo.</i>');
			return false;
		}
		else{	
			xhr = getModificaAttivitaHTTPReq();
			retrievedObjectActivities = localStorage.getItem('attivita'); //ottengo elenco storie dalla local storage
			objStorageActivities = JSON.parse(retrievedObjectActivities);
			idOfCheckedRadio = checkedRadio.id;
			var selectedActivity = objStorageActivities.attivita.find(activity => activity.id === idOfCheckedRadio);
			var titleStory = selectedActivity.nomestoria;
			var titleMission = selectedActivity.nomemissione;
			var idMission = selectedActivity.idmissione;
			var valueCheckboxForm = document.getElementById("modcheckboxrisposte").checked;
			if(valueCheckboxForm){
				attivita = {
					id: idOfCheckedRadio,
					checkbox: valueCheckboxForm,
					titolostoria: titleStory,
					idmissione: idMission,
					titolomissione: titleMission,
					domanda: document.getElementById("moddomandaattivita").value, 
					rispostebottoni:{
						sbagliata1 : document.getElementById("modrispostasbagliata1").value,
						giusta : document.getElementById("modrispostacorretta").value,
						sbagliata2 : document.getElementById("modrispostasbagliata2").value,
						sbagliata3 : document.getElementById("modrispostasbagliata3").value,
						aiuto:document.getElementById("modaiutorisposta").value,
						incoraggiamento: document.getElementById("modmessaggiorispostasbagliata").value
					}
				};
			}
			else{
				attivita = {
					id: idOfCheckedRadio,
					checkbox: valueCheckboxForm,
					titolostoria: titleStory,
					idmissione: idMission,
					titolomissione: titleMission,
					domanda: document.getElementById("moddomandaattivita").value, 
					avanti: "Avanti"
				};
			}
			var objModifyActivity = JSON.stringify(attivita); //trasformo oggetto JS in stringa JSON
			//richiesta post
			var formData = new FormData(document.getElementById("modifyActivityForm")); //formdata che contiene il form (file immagini)
			formData.append("data", objModifyActivity); //aggiungo oggetto objNewActivity nel formdata
			xhr.open('POST', '/autore/modifyActivities', true); //apro connessione tipo POST
			xhr.send(formData); //invio
			return true;
		}
	}
	else{
		document.getElementById("messageerrmodattivita").innerHTML = ("&nbspNon è stata selezionata un'\attività.");
		return false;
	}			
}

function cambiaPagina(url) {
		window.location.replace(url);
}

function getCreaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState===4 && xhr.status===200){
			document.getElementById("messageerrattivita").innerHTML = ('&nbspL\'attività è stata creata.');
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrattivita").innerHTML = ('&nbspL\'attività non è stata creata, riprova.');
			return;
		}
	};
	return xhr;
}

function getDuplicaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("erroreattivita").innerHTML = ('&nbspL\'attività è stata duplicata.');
			location.reload();
			return;
		}
		else{
			document.getElementById("erroreattivita").innerHTML = ('&nbspL\'attività non è stata duplicata.');
			return;
		}
	};
	return xhr;
}

function getModificaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload(); //aggiorno la pagina in modo da vedere le modifiche apportate alle storie dopo l'ok dal server
		}
	};
	return xhr;
}	

function getEliminaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    		if (xhr.readyState === 4 && xhr.status === 200) {
				location.reload(); //aggiorno la pagina in modo da vedere le nuove storie dopo l'eliminazione dopo l'ok dal server
			}
		};
	return xhr;
}

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
			document.getElementById("errormission").innerHTML = ('&nbspLa missione è stata duplicata.');
			location.reload();
			return;
		}
		else{
			document.getElementById("errormission").innerHTML = ('&nbspLa missione non è stata duplicata.');
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
	radioButtons = Array.from(document.getElementsByName(radioButtonClass)); //converto ListNode in array
	checkedRadio = radioButtons.find(radio => radio.checked);//cerco il radiobutton checked
	return(checkedRadio === undefined ? -1: parseInt(checkedRadio.id)); //ritorno l'indice del radiobutton checked se != da undefined
}

function modifyMission(){
	xhr = getModificaMissioneHTTPReq();
	radioButtons = Array.from(document.getElementsByName('elencoMissioni'));
	checkedRadio = radioButtons.find(radio => radio.checked);
	retrievedObjectMission = localStorage.getItem('missioni'); //ottengo elenco missioni dalla local storage
	objStorageMission = JSON.parse(retrievedObjectMission);
	if (checkedRadio !== undefined){
		var titoloMissione = document.getElementById('modtitolomissione').value;
		var idOfCheckedRadio = checkedRadio.id;
		var missione = {
			id: idOfCheckedRadio,
			nome: titoloMissione
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
	xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newStory', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strPublicStory = xhr.responseText; //ottengo elenco storie in formato stringa
			localStorage.setItem('storie', strPublicStory); // Inserisco nella storage l'oggetto
			var objPubblicStory = JSON.parse(strPublicStory); //ottengo oggetto JS
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
	xhr = new XMLHttpRequest();
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
	xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newMission', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strMission = xhr.responseText; //ottengo elenco missioni in formato stringa
			localStorage.setItem('missioni', strMission); // Inserisco nella storage l'oggetto
			var objMission = JSON.parse(strMission); //ottengo oggetto JS
			for (var i = 0; i < objMission.missioni.length; i++){
			//crea tutti i radio button delle missioni
				document.getElementById('elencomissioni').innerHTML += "<div class='form-check elencoMissioni'><input name='elencoMissioni' type='radio' id= " + objMission.missioni[i].id + " value= "+ objMission.missioni[i].nome + ">&nbsp<label class='labelMissioni' for= " + objMission.missioni[i].id + ">" + objMission.missioni[i].nome + "</label></div>";
			}
		}
	};
	xhr.send();
}

function viewActivities(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newActivities', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strActivity = xhr.responseText; //ottengo elenco attività in formato stringa
			localStorage.setItem('attivita', strActivity); // Inserisco nella storage l'oggetto
			var objActivity = JSON.parse(strActivity); //ottengo oggetto JS
			for (var i = 0; i < objActivity.attivita.length; i++){
			//crea tutti i radio button delle attività
				document.getElementById('elencoattivita').innerHTML += "<div class='form-check elencoAttivita'><input name='elencoAttivita' type='radio' id= " + objActivity.attivita[i].id + " value= "+ objActivity.attivita[i].domanda + ">&nbsp<label class='labelAttivita' for= " + objActivity.attivita[i].id + ">" + objActivity.attivita[i].domanda + "</label></div>";
			}
		}
	};
	xhr.send();
}

$(document).ready(function(){
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});
});