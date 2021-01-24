var xhr, retrievedObjectStory, objStorageStory, indexOfCheckedRadio, retrievedObjectMission, objStorageMission, retrievedObjectActivities, objStorageActivities,radioButtons, selectedMission,selectedStory,titoloMissione,selectedActivity;

$(document).ready(function(){
	
	viewStories();
	
	//-- Funzioni relative alle storie
	
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
	
	$("#eliminastoria").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			document.getElementById("messageerrorfunction").innerHTML = "";
			document.getElementById("titolo1").hidden = false;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
			$("#finestraeliminaS").modal("show");
		}
		else{
			document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
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

	//-- Funzioni relative alle missioni
	
	$("#nuovamissione").click(function(){
		indexOfCheckedRadio = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadio !== -1){
			document.getElementById("errormission").innerHTML = "";
			$("#finestramissione").modal("show");
		}
		else{
			document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});

	
	$("#salvamissione").click(function(){
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
	});
	
	 $("#modificamissione").click(function(){
			var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
			if(indexOfCheckedRadioSA !== -1){
				indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
				if (indexOfCheckedRadio !== -1){
					document.getElementById("errormission").innerHTML = "";
					$("#finestramodificamissione").modal("show");
					retrievedObjectMission = localStorage.getItem('missioni');
					objStorageMission = JSON.parse(retrievedObjectMission);
					selectedMission = objStorageMission.missioni.find(mission => mission.id === indexOfCheckedRadio);
					if(selectedMission !== undefined){
						document.getElementById('modtitolomissione').value = selectedMission.nome;
					}
					else{
						document.getElementById("modmessageerrormissione").innerHTML = ('<i>Missione non trovata.</i>');
					}
				}
				else{
					document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
					return false;
				}
			}
			else{
				document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
				return false;
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
			return false;
		}
	});
	
	$("#copiamissione").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadio !== -1){
				document.getElementById("errormission").innerHTML = "";
				$("#finestracopiamissione").modal("show");
			}
			else{
				document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermacopia").click(function(){
		xhr = getCopiaMissioneHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
		var indexOfSelectStory = document.getElementById('listastoriedisponibili').value;
		if (indexOfCheckedRadio !== -1){
			if(indexOfSelectStory !== ""){
				var missioneClone = {
					id: indexOfCheckedRadio,
					idstoria: parseInt(indexOfSelectStory)
				};
				var objDuplicateMission = JSON.stringify(missioneClone);


				xhr.open('POST', '/autore/copyMission', true);
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
				xhr.send(objDuplicateMission);
			}
			else {
				document.getElementById("errormissioncopy").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna storia disponibile.</i>');
				return false;			
			}
		}
		else {
			document.getElementById("errormissioncopy").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna missione.</i>');
			return false;
		}
	});
	
	$("#spostamissione").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadio !== -1){
				document.getElementById("errormission").innerHTML = "";
				$("#finestraspostamissione").modal("show");
			}
			else{
				document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermasposta").click(function(){
		xhr = getSpostaMissioneHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
		var indexOfSelectStory = document.getElementById('storiedisponibili').value;
		if (indexOfCheckedRadio !== -1){
			if(indexOfSelectStory !== ""){
				var missionMove = {
					id: indexOfCheckedRadio,
					idstoria: parseInt(indexOfSelectStory)
				};
				var objMoveMission = JSON.stringify(missionMove);

				xhr.open('POST', '/autore/moveMission', true);
				xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
				xhr.send(objMoveMission);
			}
			else {
				document.getElementById("errormissionmove").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna storia disponibile.</i>');
				return false;			
			}
		}
		else {
			document.getElementById("errormissionmove").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna missione.</i>');
			return false;
		}
	});
	
	$("#eliminamissione").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadio !== -1){
				document.getElementById("errormission").innerHTML = "";
				$("#finestraeliminamis").modal("show");
			}
			else{
				document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
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
			return false;
		}
	});
	
	$("#disattivamissione").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			document.getElementById("errormission").innerHTML = "";
			$("#finestradisattivamissione").modal("show");
		}
		else{
			document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermadisattiva").click(function(){
		xhr = getDisattivaMissioneHTTPReq();
		var indexOfSelectMission = document.getElementById('listamissionidisattivare').value;
		if(indexOfSelectMission !== ""){
			var idMission = { 
				id: parseInt(indexOfSelectMission)
			}; 
			
			var objDisableMission = JSON.stringify(idMission);
			xhr.open('POST', '/autore/disableMission', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objDisableMission);
		}
		else {
			document.getElementById("errormissiondisactivity").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna missione attiva.</i>');
			return false;			
		}
	});
	
	$("#attivamissione").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			document.getElementById("errormission").innerHTML = "";
			$("#finestraattivamissione").modal("show");
		}
		else{
			document.getElementById("errormission").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermaattivamissione").click(function(){
		xhr = getAttivaMissioneHTTPReq();
		var indexOfSelectMission = document.getElementById('listamissioniattivare').value;
		if(indexOfSelectMission !== ""){
			var idMission = { 
				id: parseInt(indexOfSelectMission)
			}; 
			
			var objActiveMission = JSON.stringify(idMission);
			xhr.open('POST', '/autore/activeMission', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objActiveMission);
		}
		else {
			document.getElementById("errormissiondisactivity").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna missione disattiva.</i>');
			return false;			
		}
	});
	
	
	//-- Funzioni relative alle attività
	
	$("#eliminaattivita").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadioMission !== -1){
				indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
				if(indexOfCheckedRadio !== -1){
					document.getElementById("errorattivita").innerHTML = "";
					$("#finestraeliminaatt").modal("show");
				}
				else{
					document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna attività.</i>');
					return false;
				}
			}
			else{
				document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	
	$("#confermaeliminaatt").click(function(){
		xhr = getEliminaAttivitaHTTPReq();
		indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
		var idAttivita = { 
			id: indexOfCheckedRadio
		};
		var objDeleteActivity = JSON.stringify(idAttivita);

		xhr.open('POST', '/autore/deleteActivity', true); 
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(objDeleteActivity);
		
	});
	
	$("#attivaattivita").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadioMission !== -1){
				document.getElementById("errorattivita").innerHTML = "";
				$("#finestraattivaattivita").modal("show");
			}
			else{
				document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermaattivaattivita").click(function(){
		xhr = getAttivaAttivitaHTTPReq();
		var indexOfSelectActivity = document.getElementById('listaattivitaattivare').value;
		if(indexOfSelectActivity !== ""){
			var idActivity = { 
				id: parseInt(indexOfSelectActivity)
			}; 
			
			var objActiveActivity = JSON.stringify(idActivity);
			xhr.open('POST', '/autore/activeActivity', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objActiveActivity);
		}
		else {
			document.getElementById("erroractiveactivity").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna attività disattiva.</i>');
			return false;			
		}
	});
	
	$("#disattivaattivita").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadioMission !== -1){
				document.getElementById("errorattivita").innerHTML = "";
				$("#finestradisattivaattivita").modal("show");
			}
			else{
				document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermadisattivaatt").click(function(){
		xhr = getDisattivaAttivitaHTTPReq();
		var indexOfSelectActivity = document.getElementById('listaattivitadisattivare').value;
		if(indexOfSelectActivity !== ""){
			var idActivity = { 
				id: parseInt(indexOfSelectActivity)
			}; 
			
			var objActiveActivity = JSON.stringify(idActivity);
			xhr.open('POST', '/autore/disableActivity', true); 
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objActiveActivity);
		}
		else {
			document.getElementById("erroractivitydisable").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna attività attiva.</i>');
			return false;			
		}
	});
	
	$("#copiaattivita").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadioMission !== -1){
				indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
				if(indexOfCheckedRadio !== -1){
					document.getElementById("errorattivita").innerHTML = "";
					$("#finestracopiattivita").modal("show");
				}
				else{
					document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna attività.</i>');
					return false;
				}
			}
			else{
				document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermacopiaattivita").click(function(){
		xhr = getCopiaAttivitaHTTPReq();
		var indexOfSelectMission = document.getElementById('listamissionidisponibili').value;
		var indexOfSelectStory = document.getElementById('elencostorie').value;
		var attivitaClone;
		if(indexOfSelectMission !== "" && indexOfSelectStory !== ""){
			indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
			attivitaClone = {
				id: indexOfCheckedRadio,
				idmissione: parseInt(indexOfSelectMission)
			};

			var objCopyActivity = JSON.stringify(attivitaClone);

			xhr.open('POST', '/autore/copyActivity', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objCopyActivity);
		}
		else {
			document.getElementById("erroreattivitacopy").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna storia disponibile/missione disponibile.</i>');
			return false;			
		}
	});
	
	$("#spostaattivita").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadioMission !== -1){
				indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
				if(indexOfCheckedRadio !== -1){
					document.getElementById("errorattivita").innerHTML = "";
					$("#finestraspostaattivita").modal("show");
				}
				else{
					document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna attività.</i>');
					return false;
				}
			}
			else{
				document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#confermaspostaatt").click(function(){
		xhr = getSpostaAttivitaHTTPReq();
		var indexOfSelectMission = document.getElementById('listamissionidisp').value;
		var indexOfSelectStory = document.getElementById('elencostoriedisp').value;
		if(indexOfSelectMission !== "" && indexOfSelectStory !== ""){
			indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
			var activityMove = {
				id: indexOfCheckedRadio,
				idmissione: parseInt(indexOfSelectMission)
			};
			var objMoveActivity = JSON.stringify(activityMove);

			xhr.open('POST', '/autore/moveActivity', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(objMoveActivity);
		}
		else {
			document.getElementById("erroreattivitamove").innerHTML = ('&nbsp<i>Non è stata selezionata nessuna storia disponibile/missione disponibile.</i>');
			return false;			
		}
	});
	
	$("#modificaattivita").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadioMission !== -1){
				indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
				if(indexOfCheckedRadio !== -1){
					document.getElementById("errorattivita").innerHTML = "";
					$("#finestramodificaattivita").modal("show");
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
							document.getElementById('modpunteggio').disabled = false;
							document.getElementById('modcheckboxrisposte').checked = selectedActivity.checkboxbottoni; document.getElementById('modrispostasbagliata1').value = selectedActivity.rispostebottoni.sbagliata1;
							document.getElementById('modrispostacorretta').value = selectedActivity.rispostebottoni.giusta;
							document.getElementById('modrispostasbagliata2').value = selectedActivity.rispostebottoni.sbagliata2;
							document.getElementById('modrispostasbagliata3').value = selectedActivity.rispostebottoni.sbagliata3;
							document.getElementById('modaiutorisposta').value = selectedActivity.rispostebottoni.aiuto;
							document.getElementById('modmessaggiorispostasbagliata').value = selectedActivity.rispostebottoni.incoraggiamento;
							document.getElementById('modpunteggio').value = selectedActivity.rispostebottoni.punteggio;
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
							document.getElementById("modaiutorisposta").disabled = true;
							document.getElementById("modificaaiutoimmagine").disabled = true;
							document.getElementById("modmessaggiorispostasbagliata").disabled = true;
							document.getElementById("modpunteggio").disabled = true;
							document.getElementById("modrispostamanuale").disabled = true;
							document.getElementById('modcheckboxcampo').checked = selectedActivity.checkboxcampo;
							if(selectedActivity.hasOwnProperty('immaginesfondo')){
								newPathBackground = selectedActivity.immaginesfondo.replace("./image/", "");
								document.getElementById('sfondocaricato').innerHTML = "Hai caricato il seguente sfondo: " + "<i>"+ newPathBackground + "</i><br> Ricarica lo sfondo se lo vuoi riutilizzare.";
							}
							else{
									document.getElementById('sfondocaricato').innerHTML = "Non hai caricato in precedenza nessun sfondo.";
							}
						}
						else if(selectedActivity.hasOwnProperty('checkboxcampoauto')){
							document.getElementById("modrispostacorretta").disabled = true;
							document.getElementById("modrispostasbagliata1").disabled = true;
							document.getElementById("modrispostasbagliata2").disabled = true;
							document.getElementById("modrispostasbagliata3").disabled = true;
							document.getElementById("modaiutorisposta").disabled = true;
							document.getElementById("modificaaiutoimmagine").disabled = true;
							document.getElementById("modmessaggiorispostasbagliata").disabled = true;
							document.getElementById("modpunteggio").disabled = true;
							document.getElementById("modrispostamanuale").disabled = false;
							document.getElementById('modcheckboxcampoauto').checked = selectedActivity.checkboxcampoauto;
							document.getElementById('modrispostamanuale').value = selectedActivity.camporisposta;

							if(selectedActivity.hasOwnProperty('immaginesfondo')){
								newPathBackground = selectedActivity.immaginesfondo.replace("./image/", "");
								document.getElementById('sfondocaricato').innerHTML = "Hai caricato il seguente sfondo: " + "<i>"+ newPathBackground + "</i><br> Ricarica lo sfondo se lo vuoi riutilizzare.";
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
							document.getElementById("modaiutorisposta").disabled = true;
							document.getElementById("modificaaiutoimmagine").disabled = true;
							document.getElementById("modmessaggiorispostasbagliata").disabled = true;
							document.getElementById("modpunteggio").disabled = true;
							document.getElementById("modrispostamanuale").disabled = true;
							document.getElementById('modcheckboxfoto').checked = selectedActivity.checkboxfoto;
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
							document.getElementById("modpunteggio").disabled = true;
							document.getElementById("modrispostamanuale").disabled = true;
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
					document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna attività.</i>');
					return false;
				}
			}
			else{
				document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	$("#nuovaattivita").click(function(){
		var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
		if(indexOfCheckedRadioSA !== -1){
			var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
			if (indexOfCheckedRadioMission !== -1){
				document.getElementById("errorattivita").innerHTML = "";
				$("#finestraattivita").modal("show");
			}
			else{
				document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna missione.</i>');
				return false;
			}
		}
		else{
			document.getElementById("errorattivita").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
			return false;
		}
	});
	
	
	$("#grafostoria").click(function(){
		viewGraphStory();
	});
	
	
	$("#finestramodificaattivita").on('hidden.bs.modal', function(){ 
		location.reload(); //ricarico la pagina, quando viene chiusa la finestra 'modifica attività', in modo da cancellare i vecchi dati della attività selezionata in precedenza
	});
	
	$("#finestragrafo").on('hidden.bs.modal', function(){ 
		location.reload();
	});
	
	//-- Funzioni relative alla visione delle missioni/attività in base alla storie e missione selezionata
	
	$("#storiearchiviate").click(function(){
		viewMission();
		viewMissionActive();
		viewMissionDisable();
	});
	
	$("#elencomissioni").click(function(){
		viewActivities();
		viewActivitiesActive();
		viewActivitiesDisable();
	});
	
	//-- Funzioni relative alla visione missioni/attività disponibili per la copia e spostamento
	
	$("#elencostorie").click(function(){
		viewMissionInCopy();
	});
	
	$("#elencostoriedisp").click(function(){
		viewMissionMove();
	});

	$("#backhome").click(function() {
		cambiaPagina('primaPagina.html');
	});
});

//-- Funzione Upload Storia

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
	
//-- Funzione relativa ai radiobutton nei form nuova/modifica attività

function check(){
	if(document.getElementById("checkboxrisposte").checked){
			document.getElementById("rispostacorretta").disabled = false;
			document.getElementById("rispostasbagliata1").disabled = false;
			document.getElementById("rispostasbagliata2").disabled = false;
			document.getElementById("rispostasbagliata3").disabled = false;
			document.getElementById("aiutorisposta").disabled = false;
			document.getElementById("aiutoimmagine").disabled = false;
			document.getElementById("messaggiorispostasbagliata").disabled = false;
			document.getElementById("punteggio").disabled = false;
			document.getElementById("rispostamanuale").disabled = true;
		}
	 else if(document.getElementById("checkboxcampo").checked){
			document.getElementById("rispostacorretta").disabled = true;
			document.getElementById("rispostasbagliata1").disabled = true;
			document.getElementById("rispostasbagliata2").disabled = true;
			document.getElementById("rispostasbagliata3").disabled = true;
		 	document.getElementById("punteggio").disabled = true;
			document.getElementById("aiutorisposta").disabled = true;
			document.getElementById("aiutoimmagine").disabled = true;
			document.getElementById("messaggiorispostasbagliata").disabled = true;
		 	document.getElementById("rispostamanuale").disabled = true;
	}
	 else if(document.getElementById("checkboxcampoauto").checked){
			document.getElementById("rispostacorretta").disabled = true;
			document.getElementById("rispostasbagliata1").disabled = true;
			document.getElementById("rispostasbagliata2").disabled = true;
			document.getElementById("rispostasbagliata3").disabled = true;
		 	document.getElementById("punteggio").disabled = true;
			document.getElementById("aiutorisposta").disabled = true;
			document.getElementById("aiutoimmagine").disabled = true;
			document.getElementById("messaggiorispostasbagliata").disabled = true;
			document.getElementById("rispostamanuale").disabled = false;
	}
	 else if(document.getElementById("checkboxfoto").checked){
		document.getElementById("rispostacorretta").disabled = true;
			document.getElementById("rispostasbagliata1").disabled = true;
			document.getElementById("rispostasbagliata2").disabled = true;
			document.getElementById("rispostasbagliata3").disabled = true;
			document.getElementById("aiutorisposta").disabled = true;
			document.getElementById("aiutoimmagine").disabled = true;
			document.getElementById("messaggiorispostasbagliata").disabled = true;
		 	document.getElementById("punteggio").disabled = true;
		 	document.getElementById("rispostamanuale").disabled = true;
	}
	else if(document.getElementById("checkboxniente").checked){
			document.getElementById("rispostacorretta").disabled = true;
			document.getElementById("rispostasbagliata1").disabled = true;
			document.getElementById("rispostasbagliata2").disabled = true;
			document.getElementById("rispostasbagliata3").disabled = true;
			document.getElementById("aiutorisposta").disabled = true;
			document.getElementById("aiutoimmagine").disabled = true;
			document.getElementById("messaggiorispostasbagliata").disabled = true;
			document.getElementById("punteggio").disabled = true;
			document.getElementById("rispostamanuale").disabled = true;
		}
	if(document.getElementById("modcheckboxrisposte").checked){
			document.getElementById("modrispostacorretta").disabled = false;
			document.getElementById("modrispostasbagliata1").disabled = false;
			document.getElementById("modrispostasbagliata2").disabled = false;
			document.getElementById("modrispostasbagliata3").disabled = false;
			document.getElementById("modaiutorisposta").disabled = false;
			document.getElementById("modificaaiutoimmagine").disabled = false;
			document.getElementById("modmessaggiorispostasbagliata").disabled = false;
			document.getElementById("modpunteggio").disabled = false;
			document.getElementById("modrispostamanuale").disabled = true;
		}
	else if(document.getElementById("modcheckboxcampo").checked){
			document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = true;
			document.getElementById("modificaaiutoimmagine").disabled = true;
			document.getElementById("modmessaggiorispostasbagliata").disabled = true;
			document.getElementById("modpunteggio").disabled = true;
			document.getElementById("modrispostamanuale").disabled = true;
	}
	else if(document.getElementById("modcheckboxcampoauto").checked){
			document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = true;
			document.getElementById("modificaaiutoimmagine").disabled = true;
			document.getElementById("modmessaggiorispostasbagliata").disabled = true;
			document.getElementById("modpunteggio").disabled = true;
			document.getElementById("modrispostamanuale").disabled = false;
	}
	else if(document.getElementById("modcheckboxfoto").checked){
			document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = true;
			document.getElementById("modificaaiutoimmagine").disabled = true;
			document.getElementById("modmessaggiorispostasbagliata").disabled = true;
			document.getElementById("modpunteggio").disabled = true;
			document.getElementById("modrispostamanuale").disabled = true;
	}
	else if(document.getElementById("modcheckboxniente").checked){
			document.getElementById("modrispostacorretta").disabled = true;
			document.getElementById("modrispostasbagliata1").disabled = true;
			document.getElementById("modrispostasbagliata2").disabled = true;
			document.getElementById("modrispostasbagliata3").disabled = true;
			document.getElementById("modaiutorisposta").disabled = true;
			document.getElementById("modificaaiutoimmagine").disabled = true;
			document.getElementById("modmessaggiorispostasbagliata").disabled = true;
			document.getElementById("modpunteggio").disabled = true;
			document.getElementById("modrispostamanuale").disabled = true;
	}
}

//-- Funzione form crea nuova attività

function validateForm(e){
	e.preventDefault(); 
	var domandaAttivita = document.forms.formAttivita.domandaattivita.value;
	if (domandaAttivita === "" || domandaAttivita === undefined) {
		document.getElementById("messageerrattivita").innerHTML = ('<i>&nbspTitolo attività vuoto, inserire un nuovo titolo.</i>');
		return false;
	}
	else{
		var attivita;
		var indexOfCheckedRadioMission = getCheckedRadioId('elencoMissioni');
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
		var radioAnswerAuto = document.getElementById("checkboxcampoauto").checked;
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
					incoraggiamento: document.getElementById("messaggiorispostasbagliata").value,
					punteggio: document.getElementById("punteggio").value
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
				domanda: document.getElementById("domandaattivita").value
				};
			}
		else if(radioAnswerAuto){
			attivita = {
				checkboxcampoauto: radioAnswerAuto,
				idstoria: idStory,
				nomestoria: storyTitle,
				idmissione: idMission,
				nomemissione: missionTitle,
				domanda: document.getElementById("domandaattivita").value, 
				camporisposta: document.getElementById("rispostamanuale").value
				};
			}
		else if(radioPhotoAnswer){
			attivita = {
				checkboxfoto: radioPhotoAnswer,
				idstoria: idStory,
				nomestoria: storyTitle,
				idmissione: idMission,
				nomemissione: missionTitle,
				domanda: document.getElementById("domandaattivita").value
				};
			}
		else if (radioNoAnswer){
			attivita = {
				checkboxnorisposta: radioNoAnswer,
				idstoria: idStory,
				nomestoria: storyTitle,
				idmissione: idMission,
				nomemissione: missionTitle,
				domanda: document.getElementById("domandaattivita").value
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

//-- Funzione form modifica attività

function validateModifyForm(e){
	e.preventDefault(); 
	var domandaAttivita = document.forms.formModificaAttivita.moddomandaattivita.value;
	if (domandaAttivita === "" || domandaAttivita === undefined) {
		document.getElementById("messageerrmodattivita").innerHTML = ('<i>&nbsp&nbspTitolo attività vuoto, inserire un nuovo titolo.</i>');
		return false;
	}
	else{	
		var attivita;
		var indexOfCheckedRadio = getCheckedRadioId('elencoAttivita');
		xhr = getModificaAttivitaHTTPReq();
		var radioButtonAnswer = document.getElementById("modcheckboxrisposte").checked;
		var radioAnswer = document.getElementById("modcheckboxcampo").checked;
		var radioAnswerAuto = document.getElementById("modcheckboxcampoauto").checked;
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
					incoraggiamento: document.getElementById("modmessaggiorispostasbagliata").value,
					punteggio: document.getElementById("modpunteggio").value
				}
			};
		}
		else if(radioAnswer){
			attivita = {
				id: indexOfCheckedRadio,
				checkboxcampo: radioAnswer,
				domanda: document.getElementById("moddomandaattivita").value,
				camporisposta: ""
			};
		}
		else if(radioAnswerAuto){
			attivita = {
				id: indexOfCheckedRadio,
				checkboxcampoauto: radioAnswerAuto,
				domanda: document.getElementById("moddomandaattivita").value, 
				camporisposta: document.getElementById("modrispostamanuale").value
			};
		}
		else if(radioPhotoAnswer){
			attivita = {
				id: indexOfCheckedRadio,
				checkboxfoto: radioPhotoAnswer,
				domanda: document.getElementById("moddomandaattivita").value,
				camporispostafoto: ""
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

function cambiaPagina(url) {
	window.location.replace(url);
}

//-- Funzioni relative a XMLHttpRequest

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

function getCopiaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("erroreattivitacopy").innerHTML = ('<i>&nbspL\'attività è stata copiata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("erroreattivitacopy").innerHTML = ('<i>&nbspL\'attività non è stata copiata.</i>');
			return;
		}
	};
	return xhr;
}

function getSpostaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("erroreattivitamove").innerHTML = ('<i>&nbspL\'attività è stata spostata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("erroreattivitamove").innerHTML = ('<i>&nbspL\'attività non è stata spostata.</i>');
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

function getDisattivaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("erroractivitydisable").innerHTML = ('<i>&nbspL\'attività è stata disattivata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("erroractivitydisable").innerHTML = ('<i>&nbspL\'attività non è stata disattivata.</i>');
			return;
		}
	};
	return xhr;
}

function getAttivaAttivitaHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("erroractiveactivity").innerHTML = ('<i>&nbspL\'attività è stata attivata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("erroractiveactivity").innerHTML = ('<i>&nbspL\'attività non è stata attivata.</i>');
			return;
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

function getCopiaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("errormissioncopy").innerHTML = ('<i>&nbspLa missione è stata copiata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("errormissioncopy").innerHTML = ('<i>&nbspLa missione non è stata copiata.</i>');
			return;
		}
	};
	return xhr;
}

function getSpostaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("errormissionmove").innerHTML = ('<i>&nbspLa missione è stata spostata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("errormissionmove").innerHTML = ('<i>&nbspLa missione non è stata spostata.</i>');
			return;
		}
	};
	return xhr;
}

function getDisattivaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("errormissionmove").innerHTML = ('<i>&nbspLa missione è stata disattivata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("errormissionmove").innerHTML = ('<i>&nbspLa missione non è stata disattivata.</i>');
			return;
		}
	};
	return xhr;
}

function getAttivaMissioneHTTPReq(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			document.getElementById("errormissionmove").innerHTML = ('<i>&nbspLa missione è stata attivata.</i>');
			location.reload();
			return;
		}
		else{
			document.getElementById("errormissionmove").innerHTML = ('<i>&nbspLa missione non è stata attivata.</i>');
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

function getGrafoStoriaHTTPReq(){
	xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    		if (xhr.readyState === 4 && xhr.status === 200) {
				
				return;
			}
		};
	return xhr;
}

//-- Funzione che ottiene id radiobutton selezionato

function getCheckedRadioId(radioButtonClass){
	radioButtons = Array.from(document.getElementsByName(radioButtonClass));
	if(radioButtons===undefined || radioButtons.length===0){
		return -1;
	}
	var checkedRadio = radioButtons.find(radio => radio.checked);
	return(checkedRadio === undefined ? -1: parseInt(checkedRadio.id));
}

//-- Funzione modifica missione

function modifyMission(){
	xhr = getModificaMissioneHTTPReq();
	indexOfCheckedRadio = getCheckedRadioId('elencoMissioni');
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

//-- Funzione modifica storia

function modifyStory(){
	var xhr, storia, objModifyStory;
	xhr = getModificaStoriaHTTPReq();
	var titolostoriavalore = document.getElementById("titolostoriamod").value;
	var accessibile = document.getElementById('accessibilemodifica').checked;
	var eta = document.getElementById("modificaetastoria").value;
	indexOfCheckedRadio = getCheckedRadioId('radioSA');
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

//-- Funzioni relative alla visualizzazione delle storie, missioni e attività

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
			
			if(archived.length >= 1){			
				//per lo spostamento missioni 
				document.getElementById('storiedisponibili').innerHTML = "";
				for (i = 0; i < archived.length; i++){
					document.getElementById('storiedisponibili').innerHTML += "<option value=" + archived[i].id + ">" + archived[i].nome + "</option>";
				}
				//per la copia missioni
				document.getElementById('listastoriedisponibili').innerHTML = "";
				document.getElementById('errormissioncopy').innerHTML = "";
				for (i = 0; i < archived.length; i++){
					document.getElementById('listastoriedisponibili').innerHTML += "<option value=" + archived[i].id + ">" + archived[i].nome + "</option>";
				}

				//per la copia attività
				document.getElementById('elencostorie').innerHTML = "";
				document.getElementById('errorestorycopy').innerHTML = "";
				for (i = 0; i < archived.length; i++){
					document.getElementById('elencostorie').innerHTML += "<option value=" + archived[i].id + ">" + archived[i].nome + "</option>";
					}

				//per lo spostamento attività
				document.getElementById('elencostoriedisp').innerHTML = "";
				document.getElementById('errorestorymove').innerHTML = "";
				for (i = 0; i < archived.length; i++){
					document.getElementById('elencostoriedisp').innerHTML += "<option value=" + archived[i].id + ">" + archived[i].nome + "</option>";
					}
			}
			else{
				document.getElementById('listastoriedisponibili').innerHTML = "";
				document.getElementById("errormissioncopy").innerHTML = ("<i>&nbspNon ci sono storie, creane una.</i>");
				document.getElementById('storiedisponibili').innerHTML = "";
				document.getElementById("errormissionmove").innerHTML = ("<i>&nbspNon ci sono storie, creane una.</i>");
				document.getElementById('elencostorie').innerHTML = "";
				document.getElementById("errorestorycopy").innerHTML = ("<i>&nbspNon ci sono storie, creane una.</i>");
				document.getElementById('elencostoriedisp').innerHTML = "";
				document.getElementById("errorestorymove").innerHTML = ("<i>&nbspNon ci sono storie, creane una.</i>");
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
			var i;
			var strMission = xhr.responseText;
			localStorage.setItem('missioni', strMission);
			var objMission = JSON.parse(strMission);
			indexOfCheckedRadio = getCheckedRadioId('radioSA');
			if(indexOfCheckedRadio !== -1){
				var missionActive = objMission.missioni.filter(m => m.idstoria === indexOfCheckedRadio && m.stato === "attiva");
				var missionDisable = objMission.missioni.filter(m => m.idstoria === indexOfCheckedRadio && m.stato === "disattiva");
				document.getElementById('elencomissioni').innerHTML = "";
				for (i = 0; i < missionActive.length; i++){
					document.getElementById('elencomissioni').innerHTML += "<div class='form-check elencoMissioni'><input name='elencoMissioni' type='radio' id= " + missionActive[i].id + " value= "+ missionActive[i].nome + ">&nbsp<label class='labelMissioni' for= " + missionActive[i].id + ">" + missionActive[i].nome + "</label></div>";
				}
				for (i = 0; i < missionDisable.length; i++){
					document.getElementById('elencomissioni').innerHTML += "<div class='form-check elencoMissioni'><input name='elencoMissioni' disabled type='radio' id= " + missionDisable[i].id + " value= "+ missionDisable[i].nome + ">&nbsp<label class='labelMissioni' for= " + missionDisable[i].id + ">" + missionDisable[i].nome + "</label></div>";
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
				var activityActive = objActivity.attivita.filter(a => a.idmissione === indexOfCheckedRadioMission && a.stato === "attiva");
				var activityDisable = objActivity.attivita.filter(a => a.idmissione === indexOfCheckedRadioMission && a.stato === "disattiva");
				document.getElementById('elencoattivita').innerHTML = "";
				for (var i = 0; i < activityActive.length; i++){
					document.getElementById('elencoattivita').innerHTML += "<div class='form-check elencoAttivita'><input name='elencoAttivita' type='radio' id= " + activityActive[i].id + " value= "+ activityActive[i].domanda + ">&nbsp<label class='labelAttivita' for= " + activityActive[i].id + ">" + activityActive[i].domanda + "</label></div>";
				}
				for (i = 0; i < activityDisable.length; i++){
					document.getElementById('elencoattivita').innerHTML += "<div class='form-check elencoAttivita'><input name='elencoAttivita' disabled type='radio' id= " + activityDisable[i].id + " value= "+ activityDisable[i].domanda + ">&nbsp<label class='labelAttivita' for= " + activityDisable[i].id + ">" + activityDisable[i].domanda + "</label></div>";
				}
			}
		}
	};
	xhr.send();
}

function viewMissionInCopy(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newMission', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var mission, i;
			var strMission = xhr.responseText;
			localStorage.setItem('missioni', strMission);
			var objMission = JSON.parse(strMission);
			var indexOfSelectStory = parseInt(document.getElementById('elencostorie').value);
			mission = objMission.missioni.filter(m => m.idstoria === indexOfSelectStory);

			//per la copia, ottengo missioni in base alla storia selezionata
			if(mission.length >= 1){
				document.getElementById('listamissionidisponibili').innerHTML = "";
				document.getElementById('erroreattivitacopy').innerHTML = "";
				for (i = 0; i < mission.length; i++){
					document.getElementById('listamissionidisponibili').innerHTML += "<option value=" + mission[i].id + ">" + mission[i].nome + "</option>";
				}
			}
			else {
				document.getElementById('listamissionidisponibili').innerHTML = "";
				document.getElementById("erroreattivitacopy").innerHTML = ("<i>&nbspNon ci sono missioni, creane una.</i>");
			}
		}
	};
	xhr.send();
}

function viewMissionMove(){
var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newMission', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var mission, i;
			var strMission = xhr.responseText;
			localStorage.setItem('missioni', strMission);
			var objMission = JSON.parse(strMission);
			var indexOfSelectStory = parseInt(document.getElementById('elencostoriedisp').value);
			mission = objMission.missioni.filter(m => m.idstoria === indexOfSelectStory);
			
			// per lo spostamento, ottengo missioni in base alla storia selezionata
			if(mission.length >= 1){
				document.getElementById('listamissionidisp').innerHTML = "";
				document.getElementById('erroreattivitamove').innerHTML = "";
				for (i = 0; i < mission.length; i++){
					document.getElementById('listamissionidisp').innerHTML += "<option value=" + mission[i].id + ">" + mission[i].nome + "</option>";
				}
			}
			else{
				document.getElementById('listamissionidisp').innerHTML = "";
				document.getElementById("erroreattivitamove").innerHTML = ("<i>&nbspNon ci sono missioni, creane una.</i>");
			}
		}
	};
	xhr.send();
}

function viewMissionActive(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newMission', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var mission, i;
			var strMission = xhr.responseText;
			localStorage.setItem('missioni', strMission);
			var objMission = JSON.parse(strMission);
			var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
			if(indexOfCheckedRadioSA !== -1){
				mission = objMission.missioni.filter(m => m.stato === "disattiva" && m.idstoria === indexOfCheckedRadioSA);
				
				if(mission.length >= 1){
					document.getElementById('listamissioniattivare').innerHTML = "";
					document.getElementById('errormissionactivity').innerHTML = "";
					for (i = 0; i < mission.length; i++){
						document.getElementById('listamissioniattivare').innerHTML += "<option value=" + mission[i].id + ">" + mission[i].nome + "</option>";
					}
				}
				else{
					document.getElementById('listamissioniattivare').innerHTML = "";
					document.getElementById('errormissionactivity').innerHTML = ("<i>&nbspNon ci sono missioni disattivate.</i>");
				}
			}
		}
	};
	xhr.send();
}

function viewMissionDisable(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newMission', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var mission, i;
			var strMission = xhr.responseText;
			localStorage.setItem('missioni', strMission);
			var objMission = JSON.parse(strMission);
			var indexOfCheckedRadioSA = getCheckedRadioId('radioSA');
			if(indexOfCheckedRadioSA !== -1){
				mission = objMission.missioni.filter(m => m.stato === "attiva" && m.idstoria === indexOfCheckedRadioSA);
				
				if(mission.length >= 1){
					document.getElementById('listamissionidisattivare').innerHTML = "";
					document.getElementById('errormissiondisactivity').innerHTML = "";
					for (i = 0; i < mission.length; i++){
						document.getElementById('listamissionidisattivare').innerHTML += "<option value=" + mission[i].id + ">" + mission[i].nome + "</option>";
					}
				}
				else{
					document.getElementById('listamissionidisattivare').innerHTML = "";
					document.getElementById('errormissiondisactivity').innerHTML = ("<i>&nbspNon ci sono missioni attive.</i>");
				}
			}
		}
	};
	xhr.send();
}

function viewActivitiesActive(){
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
				var activity = objActivity.attivita.filter(a => a.idmissione === indexOfCheckedRadioMission && a.stato === "disattiva");
				
				if(activity.length >= 1){
					document.getElementById('listaattivitaattivare').innerHTML = "";
					document.getElementById('erroractiveactivity').innerHTML = "";
					for (var i = 0; i < activity.length; i++){
						document.getElementById('listaattivitaattivare').innerHTML += "<option value=" + activity[i].id + ">" + activity[i].domanda + "<br></option>";
					}
				}
				else{
					document.getElementById('listaattivitaattivare').innerHTML = "";
					document.getElementById('erroractiveactivity').innerHTML = ("<i>&nbspNon ci sono attività disattivate.</i>");
				}
			}
		}
	};
	xhr.send();
}

function viewActivitiesDisable(){
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
				var activity = objActivity.attivita.filter(a => a.idmissione === indexOfCheckedRadioMission && a.stato === "attiva");
				
				if(activity.length >= 1){
					document.getElementById('listaattivitadisattivare').innerHTML = "";
					document.getElementById('erroractivitydisable').innerHTML = "";
					for (var i = 0; i < activity.length; i++){
						document.getElementById('listaattivitadisattivare').innerHTML += "<option value=" + activity[i].id + ">" + activity[i].domanda + "<br></option>";
					}
				}
				else{
					document.getElementById('listaattivitadisattivare').innerHTML = "";
					document.getElementById('erroractivitydisable').innerHTML = ("<i>&nbspNon ci sono attività attive.</i>");
				}
			}
		}
	};
	xhr.send();
}

function viewGraphStory(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strGraphStory = xhr.responseText;
			var objGraphStory = JSON.parse(strGraphStory);			
			
			var cy = cytoscape({
        		container: document.getElementById('grafo'),
				elements: objGraphStory,
				zoom: 1,
  				pan: { x: 450, y: 495 },
				zoomingEnabled: false,
				style: [{
					selector: 'node',
					style: {
						'background-color': '#8b0000',
						label: 'data(id)'
					}
				}]
      		});
			
			var layout = cy.layout({
  				'name': 'circle',
				'startAngle': -15 * 1/6,
				'sweep': 3.14 * 2/3
			});
			layout.run();
		}
	};
	
	indexOfCheckedRadio = getCheckedRadioId('radioSA');
	if(indexOfCheckedRadio!==-1){
		document.getElementById("titolo1").hidden = false;
		document.getElementById("formmodifica").hidden = true;
		document.getElementById("formattivita").hidden = true;
		document.getElementById("messageerrorfunction").innerHTML = "";
		
		xhr.open("GET", '/autore/graphStory?id='+indexOfCheckedRadio, true);
		xhr.send();
		$("#finestragrafo").modal("show");
	}
	else {
		document.getElementById("messageerrorfunction").innerHTML = ('<i>&nbspNon è stata selezionata nessuna storia archiviata.</i>');
		document.getElementById("titolo1").hidden = true;
		document.getElementById("formmodifica").hidden = true;
		document.getElementById("formattivita").hidden = true;
	}
}