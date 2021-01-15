var xhr, retrievedObjectStory, objStorageStory, indexOfCheckedRadio, retrievedObjectMission, objStorageMission, retrievedObjectActivities, objStorageActivities,radioButtons, selectedMission,selectedStory,titoloMissione,selectedActivity;

$(document).ready(function(){
	viewStories();
	
	$("#crea").click(function(){
		document.getElementById("formattivita").hidden = false;
		document.getElementById("titolo1").hidden = true;
		document.getElementById('formmodifica').hidden = true;
		document.getElementById("messageerrorfunction").hidden = true;
	});
		
	$("#salva").click(function(){
		xhr = getCreaStoriaHTTPReq();
		var titoloStoria = document.getElementById("titolostoriacrea").value;
		if (titoloStoria === "" || titoloStoria === undefined) {
    		document.getElementById("messageerror").innerHTML = ('<i>Titolo storia vuoto, inserire un nuovo titolo.</i>');
			return;
  		} 
		var accessibile = document.getElementById('accessibile').checked;
		var eta = document.getElementById("creaetastoria").value;
		var objNewStory = JSON.stringify({ 
			nome: titoloStoria,
			accessibile: accessibile,
			eta: eta,
			stato: "archiviata"
		});
		
		xhr.open('POST', '/autore/newStory', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(objNewStory);
		
		document.getElementById('titolostoriacrea').value = null;
		document.getElementById('accessibile').checked = false;
		document.getElementById("formattivita").hidden = true;
		document.getElementById("titolo1").hidden = false;
		document.getElementById('formmodifica').hidden = true;
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
		indexOfCheckedRadio = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadio!==-1){
			var story = { 
				id: indexOfCheckedRadio
			};
			var objDeleteStory = JSON.stringify(story);
			xhr.open('POST', '/autore/deleteStory', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDeleteStory);
		}
		else {
			document.getElementById("messageerrorstorydelete").innerHTML=('<i>&nbsp &nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#modificastoria").click(function(){
		retrievedObjectStory = localStorage.getItem('storie');
		if(retrievedObjectStory === null){
			document.getElementById('messageerrorfunction').innerHTML = ('<i>Impossibile modificare la storia.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
		else{
			objStorageStory = JSON.parse(retrievedObjectStory);
			indexOfCheckedRadio = getCheckedRadioId('radioSA');
			if(indexOfCheckedRadio!==-1){
				document.getElementById("formmodifica").hidden = false;
				document.getElementById("formattivita").hidden = true;
				document.getElementById("titolo1").hidden = true;
				document.getElementById('messageerrorfunction').hidden = true;
				selectedStory = objStorageStory.storie.find(story => story.id === indexOfCheckedRadio);
				if(selectedStory !== undefined){
					document.getElementById('titolostoriamod').value = selectedStory.nome; 
					document.getElementById('accessibilemodifica').checked = selectedStory.accessibile;
					document.getElementById('modificaetastoria').value = selectedStory.eta; 
				}
			}
			else {
				document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
				document.getElementById("titolo1").hidden = true;
				document.getElementById("formmodifica").hidden = true;
				document.getElementById("formattivita").hidden = true;
			}
		}
	});
	
	//funzione modifica storie
	$("#salvamodifica").click(function(){
		var titoloStoria = document.getElementById("titolostoriamod").value;
		if (titoloStoria === "" || titoloStoria === undefined) {
    		document.getElementById("messageerrormod").innerHTML = ('<i>Titolo storia vuoto, inserire un nuovo titolo.</i>');
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
	
	$("#archiviastoria").click(function(){
		xhr = getArchiviaStoriaHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('radioSP');
		if (indexOfCheckedRadio !== -1){
			var req = { 
				id: indexOfCheckedRadio
			};
			var objArchiveStory = JSON.stringify(req);
			xhr.open('POST', '/autore/archiveStory', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objArchiveStory); 
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia pubblicata.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});
	
	$("#pubblicastoria").click(function(){
		xhr = getPubblicaStoriaHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('radioSA');
		if (indexOfCheckedRadio !== -1){
			var req = { 
				id: indexOfCheckedRadio
			};
			var objPubblicStory = JSON.stringify(req);
			
			xhr.open('POST', '/autore/pubblicStory', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objPubblicStory);
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
		retrievedObjectStory = localStorage.getItem('storie');
		objStorageStory = JSON.parse(retrievedObjectStory);
		indexOfCheckedRadio = getCheckedRadioId('radioSA');
		selectedStory = objStorageStory.storie.find(story => story.id === indexOfCheckedRadio);
			
		if (indexOfCheckedRadio !== -1 && selectedStory){
			var storyToDuplicate = JSON.stringify({id: indexOfCheckedRadio});
			
			xhr.open('POST', '/autore/duplicateStory', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(storyToDuplicate);
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});

	$("#salvamissione").click(function(){
		indexOfCheckedRadio = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadio !== -1){
			titoloMissione = document.getElementById('titolomissione').value;
			if (titoloMissione === "" || titoloMissione === undefined) {
    			document.getElementById("messageerrormissione").innerHTML = ('<i>Titolo missione vuoto, inserire un nuovo titolo.</i>');
  			}
			else{
				xhr = getCreaMissioneHTTPReq();
				retrievedObjectStory = localStorage.getItem('storie');
				objStorageStory = JSON.parse(retrievedObjectStory);
				var story = objStorageStory.storie.find(s => s.id === indexOfCheckedRadio);
				var titleStory = story.nome;
				var idStory = story.id;
				var mission = {
					titolostoria: titleStory,
					idstoria: idStory,
					nome: titoloMissione
				};
				var objMission = JSON.stringify(mission);
				
				xhr.open('POST', '/autore/newMission', true);
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
				xhr.send(objMission);
			}
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
		}
	});
	
 
	$("#modificamissione").click(function(){
		indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
		if (indexOfCheckedRadio !== -1){
			retrievedObjectMission = localStorage.getItem('missioni');
			objStorageMission = JSON.parse(retrievedObjectMission);
			selectedMission = objStorageMission.missioni.find(mission => mission.id === indexOfCheckedRadio);
			if(selectedMission !== undefined){
				document.getElementById('modtitolomissione').value = selectedMission.nome;
			}
		}
		else{
			document.getElementById("modmessageerrormissione").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
		}
	});
	
	$("#salvamodmis").click(function(){
		indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
		if (indexOfCheckedRadio !== -1){
			titoloMissione = document.getElementById('modtitolomissione').value;
			if (titoloMissione === "" || titoloMissione === undefined) {
    			document.getElementById("modmessageerrormissione").innerHTML = ('<i>Titolo missione vuoto, inserire un nuovo titolo.</i>');
  			}
			else{
				modifyMission();
				}
		}
		else{
			document.getElementById("modmessageerrormissione").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
		}
	});
	
	$("#duplicamissione").click(function(){
		xhr = getDuplicaMissioneHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
		if (indexOfCheckedRadio !== -1){
			var missioneClone = {
				id: indexOfCheckedRadio
			};
			var objDuplicateMission = JSON.stringify(missioneClone);
				
			//richiesta post
			xhr.open('POST', '/autore/duplicateMission', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDuplicateMission);
		}
		else {
			document.getElementById("errormission").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna missione.</i>');
		}
	});
	
	$("#confermaeliminamis").click(function(){
		xhr = getEliminaMissioneHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
		if (indexOfCheckedRadio !== -1){
			var idMission = { 
				id: indexOfCheckedRadio
			};
			var objDeleteMission = JSON.stringify(idMission);
			xhr.open('POST', '/autore/deleteMission', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDeleteMission);
		}
		else {
			document.getElementById("messageerrormissiondelete").innerHTML = ('&nbsp&nbsp<i>Non è stata selezionata nessuna missione.</i>');
		}
	});
	
	$("#confermaeliminaatt").click(function(){
		xhr = getEliminaAttivitaHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
		if (indexOfCheckedRadio !== -1){
			var idAttivita = { 
				id: indexOfCheckedRadio
			};
			var objDeleteActivity = JSON.stringify(idAttivita);
			
			xhr.open('POST', '/autore/deleteActivity', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDeleteActivity);
		}
		else {
			document.getElementById("messageerroractivitydelete").innerHTML = ('&nbsp&nbsp<i>Non è stata selezionata nessuna attività.</i>');
		}
	});
	
	$("#duplicaattivita").click(function(){
		xhr = getDuplicaAttivitaHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
		var attivitaClone;
		if (indexOfCheckedRadio !== -1){
			attivitaClone = {
				id: indexOfCheckedRadio
			};
			
			var objDuplicateActivity = JSON.stringify(attivitaClone);

			xhr.open('POST', '/autore/duplicateActivity', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDuplicateActivity);
		}
		else {
			document.getElementById("erroreattivita").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna attività.</i>');
		}
	});
	
	$("#modificaattivita").click(function(){
		indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
		if (indexOfCheckedRadio !== -1){
			retrievedObjectActivities = localStorage.getItem('attivita');
			objStorageActivities = JSON.parse(retrievedObjectActivities);
			selectedActivity = objStorageActivities.attivita.find(activity => activity.id === indexOfCheckedRadio);
			if(selectedActivity !== undefined){
				var newPathHelpImage, newPathBackground;
				document.getElementById('moddomandaattivita').value = selectedActivity.domanda;
				if(selectedActivity.hasOwnProperty('checkboxbottoni')){
					document.getElementById("modrispostacorretta").disabled = false;
					document.getElementById("modrispostasbagliata1").disabled = false;
					document.getElementById("modrispostasbagliata2").disabled = false;
					document.getElementById("modrispostasbagliata3").disabled = false;
					document.getElementById("modaiutorisposta").disabled = false;
					document.getElementById("modificaaiutoimmagine").disabled = false;
					document.getElementById("modmessaggiorispostasbagliata").disabled = false;
					document.getElementById('modcheckboxrisposte').checked = selectedActivity.checkboxbottoni; document.getElementById('modrispostasbagliata1').value = selectedActivity.rispostebottoni.sbagliata1;
					document.getElementById('modrispostacorretta').value = selectedActivity.rispostebottoni.giusta;
					document.getElementById('modrispostasbagliata2').value = selectedActivity.rispostebottoni.sbagliata2;
					document.getElementById('modrispostasbagliata3').value = selectedActivity.rispostebottoni.sbagliata3;
					document.getElementById('modaiutorisposta').value = selectedActivity.rispostebottoni.aiuto;
					document.getElementById('modmessaggiorispostasbagliata').value = selectedActivity.rispostebottoni.incoraggiamento;
					if (selectedActivity.rispostebottoni.hasOwnProperty('immagineaiuto')){
						newPathHelpImage = selectedActivity.rispostebottoni.immagineaiuto.replace("./image/", "");
						document.getElementById('imgaiutocaricato').innerHTML = "Hai caricato la seguente immagine aiuto: " + "<i>"+ newPathHelpImage + "</i><br> Ricarica l'immagine aiuto se la vuoi riutilizzare.";
					}
					else{
						document.getElementById('imgaiutocaricato').innerHTML = "Non hai caricato in precedenza nessun immagine aiuto.";
					}
					if(selectedActivity.hasOwnProperty('immaginesfondo')){
						newPathBackground = selectedActivity.immaginesfondo.replace("./image/", "");
						document.getElementById('sfondocaricato').innerHTML = "Hai caricato il seguente sfondo: " + "<i>"+ newPathBackground + "</i><br> Ricarica lo sfondo se lo vuoi riutilizzare.";
					}
					else{
							document.getElementById('sfondocaricato').innerHTML = "Non hai caricato in precedenza nessun sfondo.";
						}
				}
				else if(selectedActivity.hasOwnProperty('checkboxcampo')){
					document.getElementById("modrispostacorretta").disabled = true;
					document.getElementById("modrispostasbagliata1").disabled = true;
					document.getElementById("modrispostasbagliata2").disabled = true;
					document.getElementById("modrispostasbagliata3").disabled = true;
					document.getElementById("modaiutorisposta").disabled = false;
					document.getElementById("modificaaiutoimmagine").disabled = false;
					document.getElementById("modmessaggiorispostasbagliata").disabled = false;
					document.getElementById('modcheckboxcampo').checked = selectedActivity.checkboxcampo;
					document.getElementById('modaiutorisposta').value = selectedActivity.aiuto;
					document.getElementById('modmessaggiorispostasbagliata').value = selectedActivity.incoraggiamento;
					if (selectedActivity.hasOwnProperty('immagineaiuto')){
						newPathHelpImage = selectedActivity.immagineaiuto.replace("./image/", "");
						document.getElementById('imgaiutocaricato').innerHTML = "Avevi caricato la seguente immagine aiuto: " + "<i>" + newPathHelpImage + "</i><br> Ricarica l'immagine aiuto se la vuoi riutilizzare.";
					}
					else{
						document.getElementById('imgaiutocaricato').innerHTML = "Non hai caricato in precedenza nessun immagine aiuto.";
					}
					if(selectedActivity.hasOwnProperty('immaginesfondo')){
						newPathBackground = selectedActivity.immaginesfondo.replace("./image/", "");
						document.getElementById('sfondocaricato').innerHTML = "Avevi caricato il seguente sfondo: " + "<i>" + newPathBackground + "</i><br> Ricarica lo sfondo se lo vuoi riutilizzare.";
					}
					else{
							document.getElementById('sfondocaricato').innerHTML = "Non hai caricato in precedenza nessun sfondo.";
						}
				}
				else if(selectedActivity.hasOwnProperty('checkboxfoto')){
					document.getElementById("modrispostacorretta").disabled = true;
					document.getElementById("modrispostasbagliata1").disabled = true;
					document.getElementById("modrispostasbagliata2").disabled = true;
					document.getElementById("modrispostasbagliata3").disabled = true;
					document.getElementById("modaiutorisposta").disabled = false;
					document.getElementById("modificaaiutoimmagine").disabled = false;
					document.getElementById("modmessaggiorispostasbagliata").disabled = false;
					document.getElementById('modcheckboxfoto').checked = selectedActivity.checkboxfoto;
					document.getElementById('modaiutorisposta').value = selectedActivity.aiuto;
					document.getElementById('modmessaggiorispostasbagliata').value = selectedActivity.incoraggiamento;
					if (selectedActivity.hasOwnProperty('immagineaiuto')){
						newPathHelpImage = selectedActivity.immagineaiuto.replace("./image/", "");
						document.getElementById('imgaiutocaricato').innerHTML = "Avevi caricato la seguente immagine aiuto: " + "<i>" + newPathHelpImage + "</i><br> Ricarica l'immagine aiuto se la vuoi riutilizzare.";
					}
					else{
						document.getElementById('imgaiutocaricato').innerHTML = "Non hai caricato in precedenza nessun immagine aiuto.";
					}
					if(selectedActivity.hasOwnProperty('immaginesfondo')){
						newPathBackground = selectedActivity.immaginesfondo.replace("./image/", "");
						document.getElementById('sfondocaricato').innerHTML = "Avevi caricato il seguente sfondo: " + "<i>" + newPathBackground + "</i><br> Ricarica lo sfondo se lo vuoi riutilizzare.";
					}
					else{
							document.getElementById('sfondocaricato').innerHTML = "Non hai caricato in precedenza nessun sfondo.";
						}
				}
				else if(selectedActivity.hasOwnProperty('checkboxnorisposta')){
					document.getElementById("modrispostacorretta").disabled = true;
					document.getElementById("modrispostasbagliata1").disabled = true;
					document.getElementById("modrispostasbagliata2").disabled = true;
					document.getElementById("modrispostasbagliata3").disabled = true;
					document.getElementById("modaiutorisposta").disabled = true;
					document.getElementById("modificaaiutoimmagine").disabled = true;
					document.getElementById("modmessaggiorispostasbagliata").disabled = true;
					document.getElementById('modcheckboxniente').checked = selectedActivity.checkboxnorisposta;
					if(selectedActivity.hasOwnProperty('immaginesfondo')){
						newPathBackground = selectedActivity.immaginesfondo.replace("./image/", "");
						document.getElementById('sfondocaricato').innerHTML = "Hai caricato il seguente sfondo: " + "<i>"+ newPathBackground + "</i><br> Ricarica lo sfondo se lo vuoi riutilizzare.";
					}
					else{
							document.getElementById('sfondocaricato').innerHTML = "Non hai caricato in precedenza nessun sfondo.";
						}
				}
			}
		}
		else{
			document.getElementById("messageerrmodattivita").innerHTML = ("<i>&nbsp&nbspNon è stata selezionata nessuna attività.</i>");
		}
	});
	
	$("#finestramodificaattivita").on('hidden.bs.modal', function(){ 
		location.reload(); //ricarico la pagina, quando viene chiusa la finestra 'modifica attività', in modo da cancellare i vecchi dati della attività selezionata in precedenza
	});
	
	$("#storiearchiviate").click(function(){
		viewMission();
	});
	
	$("#elencomissioni").click(function(){
		viewActivities();
	});
	
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});
});

function readFile(input) {

	var file = input.files[0];
	var reader = new FileReader();
	reader.readAsText(file);
	var nameJson = file.name.replace(".json","");
	retrievedObjectStory = localStorage.getItem('storie');
	objStorageStory = JSON.parse(retrievedObjectStory);
	
	var findNameFile = objStorageStory.storie.find(story => story.nome === nameJson);
	
	if(findNameFile !== undefined){ //controllo effettuato per evitare sovrascrittura del file
		document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è possibile caricare la storia. Esiste già una storia con quel nome, rinominare il file.</i>');
		document.getElementById("titolo1").hidden = true;
		document.getElementById("formmodifica").hidden = true;
		document.getElementById("formattivita").hidden = true;
	}
	else{
		reader.onload = function() {
			var json = JSON.parse(reader.result);
			xhr = getUploadStoriaHTTPReq();
			json.nomestoria = nameJson;

			var objUploadStory = JSON.stringify(json);
			xhr.open('POST', '/autore/uploadStory', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objUploadStory);
		};
		reader.onerror = function() {
			console.log(reader.error);
		};
	}
}
	
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
	 else if(document.getElementById("checkboxcampo").checked){
		document.getElementById("rispostacorretta").disabled = true;
			document.getElementById("rispostasbagliata1").disabled = true;
			document.getElementById("rispostasbagliata2").disabled = true;
			document.getElementById("rispostasbagliata3").disabled = true;
			document.getElementById("aiutorisposta").disabled = false;
			document.getElementById("aiutoimmagine").disabled = false;
			document.getElementById("messaggiorispostasbagliata").disabled = false;
	}
	 else if(document.getElementById("checkboxfoto").checked){
		document.getElementById("rispostacorretta").disabled = true;
			document.getElementById("rispostasbagliata1").disabled = true;
			document.getElementById("rispostasbagliata2").disabled = true;
			document.getElementById("rispostasbagliata3").disabled = true;
			document.getElementById("aiutorisposta").disabled = false;
			document.getElementById("aiutoimmagine").disabled = false;
			document.getElementById("messaggiorispostasbagliata").disabled = false;
	}
	else if(document.getElementById("checkboxniente").checked){
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
	else if(document.getElementById("modcheckboxcampo").checked){
		document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = false;
			document.getElementById("modificaaiutoimmagine").disabled = false;
			document.getElementById("modmessaggiorispostasbagliata").disabled = false;
	}
	else if(document.getElementById("modcheckboxfoto").checked){
		document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = false;
			document.getElementById("modificaaiutoimmagine").disabled = false;
			document.getElementById("modmessaggiorispostasbagliata").disabled = false;
	}
	else if(document.getElementById("modcheckboxniente").checked){
		document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = true;
			document.getElementById("modificaaiutoimmagine").disabled = true;
			document.getElementById("modmessaggiorispostasbagliata").disabled = true;
	}
}

function validateForm(e){
	e.preventDefault(); 
	var indexOfCheckedRadioSA = getCheckedRadioId('radioSA'); 
	var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
	if(indexOfCheckedRadioSA !== -1 && indexOfCheckedRadioMission !== -1){
		var domandaAttivita = document.forms.formAttivita.domandaattivita.value;
		if (domandaAttivita === "" || domandaAttivita === undefined) {
			document.getElementById("messageerrattivita").innerHTML = ('<i>&nbspTitolo attività vuoto, inserire un nuovo titolo.</i>');
			return false;
		}
		else{
			var attivita;
			xhr = getCreaAttivitaHTTPReq();
			retrievedObjectMission = localStorage.getItem('missioni');
			objStorageMission = JSON.parse(retrievedObjectMission);
			var selectedMission = objStorageMission.missioni.find(mission => mission.id === indexOfCheckedRadioMission);
			var idMission = selectedMission.id;
			var idStory = selectedMission.idstoria;
			var missionTitle = selectedMission.nome;
			var storyTitle = selectedMission.nomestoria;
			var radioButtonAnswer = document.getElementById("checkboxrisposte").checked;
			var radioAnswer = document.getElementById("checkboxcampo").checked;
			var radioPhotoAnswer = document.getElementById("checkboxfoto").checked;
			var radioNoAnswer = document.getElementById("checkboxniente").checked;
			
			if(radioButtonAnswer){
				attivita = {
					checkboxbottoni: radioButtonAnswer,
					idstoria: idStory,
					nomestoria: storyTitle,
					idmissione: idMission,
					nomemissione: missionTitle,
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
			else if(radioAnswer){
				attivita = {
					checkboxcampo: radioAnswer,
					idstoria: idStory,
					nomestoria: storyTitle,
					idmissione: idMission,
					nomemissione: missionTitle,
					domanda: document.getElementById("domandaattivita").value, 
					camporisposta: "",
					aiuto:document.getElementById("aiutorisposta").value,
					incoraggiamento: document.getElementById("messaggiorispostasbagliata").value
					};
				}
			else if(radioPhotoAnswer){
				attivita = {
					checkboxfoto: radioPhotoAnswer,
					idstoria: idStory,
					nomestoria: storyTitle,
					idmissione: idMission,
					nomemissione: missionTitle,
					domanda: document.getElementById("domandaattivita").value, 
					camporispostafoto: "",
					aiuto:document.getElementById("aiutorisposta").value,
					incoraggiamento: document.getElementById("messaggiorispostasbagliata").value
					};
				}
			else if (radioNoAnswer){
				attivita = {
					checkboxnorisposta: radioNoAnswer,
					idstoria: idStory,
					nomestoria: storyTitle,
					idmissione: idMission,
					nomemissione: missionTitle,
					domanda: document.getElementById("domandaattivita").value, 
					avanti: "Avanti"
				};
			}
			var objNewActivity = JSON.stringify(attivita);

			var formData = new FormData(document.getElementById("newActivityForm")); //formdata che contenente le immagini uploadate dall'utente
			formData.append("data", objNewActivity); //aggiungo al formdata l'oggetto attività con i valore testuali
			xhr.open('POST', '/autore/newActivities', true);
			xhr.send(formData);
			return true;
		}
	}
	else{
		document.getElementById("messageerrattivita").innerHTML = ('<i>&nbsp &nbspNon è stata selezionata una storia archiviata ed una missione.</i>');
		return false;
	}			
}

function validateModifyForm(e){
	e.preventDefault(); 
	var indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
	if (indexOfCheckedRadio !== -1){
		var domandaAttivita = document.forms.formModificaAttivita.moddomandaattivita.value;
		if (domandaAttivita === "" || domandaAttivita === undefined) {
			document.getElementById("messageerrmodattivita").innerHTML = ('<i>&nbsp&nbspTitolo attività vuoto, inserire un nuovo titolo.</i>');
			return false;
		}
		else{	
			var attivita;
			xhr = getModificaAttivitaHTTPReq();
			var radioButtonAnswer = document.getElementById("modcheckboxrisposte").checked;
			var radioAnswer = document.getElementById("modcheckboxcampo").checked;
			var radioPhotoAnswer = document.getElementById("modcheckboxfoto").checked;
			var radioNoAnswer = document.getElementById("modcheckboxniente").checked;
			if(radioButtonAnswer){
				attivita = {
					id: indexOfCheckedRadio,
					checkboxbottoni: radioButtonAnswer,
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
			else if(radioAnswer){
				attivita = {
					id: indexOfCheckedRadio,
					checkboxcampo: radioAnswer,
					domanda: document.getElementById("moddomandaattivita").value, 
					camporisposta: "",
					aiuto:document.getElementById("modaiutorisposta").value,
					incoraggiamento: document.getElementById("modmessaggiorispostasbagliata").value
				};
			}
			else if(radioPhotoAnswer){
				attivita = {
					id: indexOfCheckedRadio,
					checkboxfoto: radioPhotoAnswer,
					domanda: document.getElementById("moddomandaattivita").value, 
					camporispostafoto: "",
					aiuto:document.getElementById("modaiutorisposta").value,
					incoraggiamento: document.getElementById("modmessaggiorispostasbagliata").value
				};
			}
			else if(radioNoAnswer){
				attivita = {
					id: indexOfCheckedRadio,
					checkboxnorisposta: radioNoAnswer,
					domanda: document.getElementById("moddomandaattivita").value, 
					avanti: "Avanti"
				};
			}
			
			var objModifyActivity = JSON.stringify(attivita);
			
			var formData = new FormData(document.getElementById("modifyActivityForm")); //formdata che contenente le immagini uploadate dall'utente
			formData.append("data", objModifyActivity); //aggiungo al formdata l'oggetto attività con i valore testuali
			xhr.open('POST', '/autore/modifyActivities', true);
			xhr.send(formData);
			return true;
		}
	}
	
	else{
		document.getElementById("messageerrmodattivita").innerHTML = ("<i>&nbspNon è stata selezionata nessuna attività.</i>");
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
			document.getElementById("messageerrattivita").innerHTML = ('<i>&nbspL\'attività è stata creata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrattivita").innerHTML = ('<i>&nbspL\'attività non è stata creata, riprova.</i>');
			return;
		}
	};
	return xhr;
}

function getDuplicaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("erroreattivita").innerHTML = ('<i>&nbspL\'attività è stata duplicata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("erroreattivita").innerHTML = ('<i>&nbspL\'attività non è stata duplicata.</i>');
			return;
		}
	};
	return xhr;
}
	
function getModificaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload();
		}
	};
	return xhr;
}	
	
function getEliminaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    		if (xhr.readyState === 4 && xhr.status === 200) {
				location.reload();
			}
		};
	return xhr;
}
	
function getCreaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState===4 && xhr.status===200){
			document.getElementById("messageerrormissione").innerHTML = ('<i>La missione è stata creata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrormissione").innerHTML = ('<i>La missione non è stata creata, riprova.</i>');
			return;
		}
	};
	return xhr;
}

function getModificaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload();
		}
	};
	return xhr;
}

function getDuplicaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("errormission").innerHTML = ('<i>&nbspLa missione è stata duplicata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("errormission").innerHTML = ('<i>&nbspLa missione non è stata duplicata.</i>');
			return;
		}
	};
	return xhr;
}


function getEliminaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    		if (xhr.readyState === 4 && xhr.status === 200) {
				location.reload();
			}
		};
	return xhr;
}

function getCreaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState===4 && xhr.status===200){
			document.getElementById("messageerror").innerHTML = ('<i>La storia è stata creata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerror").innerHTML = ('<i>La storia non è stata creata, riprova.</i>');
			return;
		}
	};
	return xhr;
}

function getUploadStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload();
		}
	};
	return xhr;
}

function getModificaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload();
		}
	};
	return xhr;
}

function getEliminaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    		if (xhr.readyState === 4 && xhr.status === 200) {
				location.reload();
			}
		};
	return xhr;
}

function getPubblicaStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspLa storia è stata pubblicata.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspLa storia non è stata pubblicata.</i>');
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
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspLa storia è stata archiviata.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspLa storia non è stata archiviata.</i>');
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
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspLa storia è stata duplicata.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			location.reload();
			return;
		}
		else{
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspLa storia non è stata duplicata.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			return;
		}
	};
	return xhr;
}

function getCheckedRadioId(radioButtonClass){
	radioButtons = Array.from(document.getElementsByName(radioButtonClass));
	if(radioButtons===undefined || radioButtons.length===0){
		return -1;
	}
	var checkedRadio = radioButtons.find(radio => radio.checked);
	return(checkedRadio === undefined ? -1: parseInt(checkedRadio.id));
}

function modifyMission(){
	xhr = getModificaMissioneHTTPReq();
	indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
	if (indexOfCheckedRadio !== -1){
		var titoloMissione = document.getElementById('modtitolomissione').value;
		var missione = {
			id: indexOfCheckedRadio,
			nome: titoloMissione
		};
		var objModifyMission = JSON.stringify(missione);
		
		xhr.open('POST', '/autore/modifiedMission', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(objModifyMission);
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
		storia = {
			id: indexOfCheckedRadio,
			nome: titolostoriavalore,
			accessibile: accessibile,
			eta: eta
		};
		objModifyStory = JSON.stringify(storia);
		
		xhr.open('POST', '/autore/modifiedStory', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(objModifyStory);
	}
}


function viewStories(){	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/stories', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var jsonStories = xhr.responseText;
			localStorage.setItem('storie', jsonStories); 
			var stories = JSON.parse(jsonStories);
			var published = stories.storie.filter(story => story.stato === "pubblicata");	
			var archived = stories.storie.filter(story => story.stato === "archiviata");
			for (var i = 0; i < published.length; i++){
				document.getElementById('storiepubblicate').innerHTML += "<div class='form-check radioStoriaP'><input name='radioSP' type='radio' id= "+ published[i].id + " value= "+ published[i].nome + ">&nbsp<label class='labelStoriaP' for= "+ published[i].id + ">" + published[i].nome + "</label></div>";
			}
			for (i = 0; i < archived.length; i++){
				document.getElementById('storiearchiviate').innerHTML += "<div class='form-check radioStoriaA'><input name='radioSA' type='radio' id= "+ archived[i].id + " value= "+ archived[i].nome + ">&nbsp<label class='labelStoriaA' for= "+ archived[i].id + ">" + archived[i].nome + "</label></div>";
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
			var strMission = xhr.responseText;
			localStorage.setItem('missioni', strMission);
			var objMission = JSON.parse(strMission);
			indexOfCheckedRadio = getCheckedRadioId('radioSA');
			if(indexOfCheckedRadio !== -1){
				var mission = objMission.missioni.filter(m => m.idstoria === indexOfCheckedRadio);
				document.getElementById('elencomissioni').innerHTML = "";
				for (var i = 0; i < mission.length; i++){
					document.getElementById('elencomissioni').innerHTML += "<div class='form-check elencoMissioni'><input name='elencoMissioni' type='radio' id= " + mission[i].id + " value= "+ mission[i].nome + ">&nbsp<label class='labelMissioni' for= " + mission[i].id + ">" + mission[i].nome + "</label></div>";
				}
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
			var strActivity = xhr.responseText;
			localStorage.setItem('attivita', strActivity);
			var objActivity = JSON.parse(strActivity);
			var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if(indexOfCheckedRadioSA !== -1 && indexOfCheckedRadioMission !== -1){
				var activity = objActivity.attivita.filter(a => a.idmissione === indexOfCheckedRadioMission);
				document.getElementById('elencoattivita').innerHTML = "";
				for (var i = 0; i < activity.length; i++){
					document.getElementById('elencoattivita').innerHTML += "<div class='form-check elencoAttivita'><input name='elencoAttivita' type='radio' id= " + activity[i].id + " value= "+ activity[i].domanda + ">&nbsp<label class='labelAttivita' for= " + activity[i].id + ">" + activity[i].domanda + "</label></div>";
				}
			}
		}
	};
	xhr.send();
}