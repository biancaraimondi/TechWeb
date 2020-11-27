//funzioni inerenti alla storie pubblicate
$(document).ready(function(){
	viewStoryP();
	viewStoryA();
	var xhr, retrievedObjectStoryP, objStorageStoryP, retrievedObjectStoryA, objStorageStoryA, isStoryExist, radiobuttonSP, indexOfCheckedRadio, label;
	
	$("#crea").click(function(){
		document.getElementById("formattivita").hidden = false;
		document.getElementById("titolo1").hidden = true;
		document.getElementById('formmodifica').hidden = true;
		document.getElementById("messageerrorfunction").hidden = true;
	});
		
	$("#salva").click(function(){
		var titolostoriavalore = document.getElementById("titolostoriacrea").value;
		var accessibile = document.getElementById('accessibile').checked;
		retrievedObjectStoryP = localStorage.getItem('storieP'); //ottengo elenco storie dalla local storage
		objStorageStoryP = JSON.parse(retrievedObjectStoryP);
		var lengthStory = objStorageStoryP.storieP.length;
		if (titolostoriavalore === "" || titolostoriavalore === undefined) {
    		document.getElementById("messageerror").innerHTML = ('Titolo storia errato, inserire un nuovo titolo.');
  		} 
		
		else {
			var storiaP = { //oggetto JS dati nuova storia
				id: lengthStory,
				nome: titolostoriavalore,
				accessibile: accessibile	
			};
			var objnewStory = JSON.stringify(storiaP); //trasformo oggetto JS in stringa JSON

			//richiesta post
			xhr = new XMLHttpRequest();
			xhr.open('POST', '/autore/newStory', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.onreadystatechange = () => {
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
		radiobuttonSP = Array.from(document.getElementsByName('radioSP')); //converto NodeList in un array
		retrievedObjectStoryP = localStorage.getItem('storieP'); //ottengo elenco storie dalla local storage
		objStorageStoryP = JSON.parse(retrievedObjectStoryP);
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
    			if (xhr.readyState === 4 && xhr.status === 200) {
				location.reload(); //aggiorno la pagina in modo da vedere le nuove storie dopo l'eliminazione dopo l'ok dal server
			}
		};
		indexOfCheckedRadio = radiobuttonSP.findIndex(radio => radio.checked); //cerco l'indice delle radiobutton 'checked' 
		if(indexOfCheckedRadio!==-1){ //se trova il radio button 'checked' fa...
			var idStory = { 
			id: objStorageStoryP.storieP[indexOfCheckedRadio].id //id della storia selezionata
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
	$("#modificastoriapub").click(function(){
		radiobuttonSP = Array.from(document.getElementsByName('radioSP'));
		retrievedObjectStoryP = localStorage.getItem('storieP'); //ottengo elenco storie dalla local storage
		if(retrievedObjectStoryP === null){
			document.getElementById('messageerrorfunction').innerHTML = ('Impossibile modificare la storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
		else{
			objStorageStoryP = JSON.parse(retrievedObjectStoryP);
			label = document.getElementsByClassName('labelStoriaP');
			indexOfCheckedRadio = radiobuttonSP.findIndex(radio => radio.checked); //cerco l'indice delle radiobutton 'checked' 
				if(indexOfCheckedRadio!==-1){ //se trova il radio button 'checked' fa..
						document.getElementById("formmodifica").hidden = false;
						document.getElementById("formattivita").hidden = true;
						document.getElementById("titolo1").hidden = true;
						document.getElementById('messageerrorfunction').hidden = true;
						//prendo i valori relativi alla storia selezionata e li inserisco nella input text e nel checkbox
						var labelText= label[indexOfCheckedRadio].textContent; 
						var accessibileValue= objStorageStoryP.storieP[indexOfCheckedRadio].accessibile;
						document.getElementById('titolostoriamod').value = labelText; 
						document.getElementById('accessibilemodifica').checked = accessibileValue;
						
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
		label = Array.from(document.getElementsByClassName('labelStoriaP'));
		radiobuttonSP = Array.from(document.getElementsByName('radioSP'));
		var titolostoriavalore = document.getElementById("titolostoriamod").value;
		retrievedObjectStoryP = localStorage.getItem('storieP'); //ottengo elenco storie dalla local storage
		objStorageStoryP = JSON.parse(retrievedObjectStoryP);
		indexOfCheckedRadio = radiobuttonSP.findIndex(radio => radio.checked);
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
		retrievedObjectStoryP = localStorage.getItem('storieP'); //ottengo elenco storie dalla local storage
		objStorageStoryP = JSON.parse(retrievedObjectStoryP);
		radiobuttonSP = Array.from(document.getElementsByName('radioSP'));
		indexOfCheckedRadio = radiobuttonSP.findIndex(radio => radio.checked);//cerco indice del radio button checked
		//memorizzo in un oggetto l'id della storia pubblicata
		if (indexOfCheckedRadio !== -1){
			var idLast = { 
				idlast: objStorageStoryP.storieP[indexOfCheckedRadio].id,
			};
			var objarchiveStory = JSON.stringify(idLast); //trasformo oggetto JS in stringa JSON
			//richiesta post
			xhr = new XMLHttpRequest();
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
			xhr.open('POST', '/autore/archiveStory', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objarchiveStory); //invio stringa JSON
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspNon è stata selezionata nessuna storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
	});
	
	$("#duplicastoriapub").click(function(){
		retrievedObjectStoryP = localStorage.getItem('storieP'); //ottengo elenco storie dalla local storage
		objStorageStoryP = JSON.parse(retrievedObjectStoryP);
		radiobuttonSP = Array.from(document.getElementsByName('radioSP'));
		indexOfCheckedRadio = radiobuttonSP.findIndex(radio => radio.checked);//cerco indice del radio button checked
		if (indexOfCheckedRadio !== -1){
			var accessibileStoryP = objStorageStoryP.storieP[indexOfCheckedRadio].accessibile;
			var titleStoryP = objStorageStoryP.storieP[indexOfCheckedRadio].nome; 
			var lengthStory = objStorageStoryP.storieP.length;
			var storiaClone = { //creo oggetto storia da duplicare
				id: lengthStory, //id = lunghezza array storie pubblicate
				nome: titleStoryP,
				accessibile: accessibileStoryP
			};
			var objduplicateStory = JSON.stringify(storiaClone); //trasformo oggetto JS in stringa JSON
			
			//richiesta post
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
			xhr.open('POST', '/autore/duplicateStory', true); //apro connessione tipo POST
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
			xhr.send(objduplicateStory); //invio stringa JSON
		}
		else {
			document.getElementById("messageerrorfunction").innerHTML = ('&nbspNon è stata selezionata nessuna storia.');
			document.getElementById("titolo1").hidden = true;
			document.getElementById("formmodifica").hidden = true;
			document.getElementById("formattivita").hidden = true;
		}
		
	});
	
	
	
});


//funzioni mostra allegati crea atività
$(document).ready( function(){
	$("#testo").click(function(){
	 
		document.getElementById("areatesto").hidden = false;
		document.getElementById("allegatofoto").hidden = true;
	 	document.getElementById("allegatovideo").hidden = true;	
	});
}); 

$(document).ready( function(){
	$("#immagine").click(function(){
	 
		document.getElementById("allegatofoto").hidden = false;
		document.getElementById("allegatovideo").hidden = true;
	 	document.getElementById("areatesto").hidden = true;
	
	});
}); 

$(document).ready( function(){
	$("#video").click(function(){
	 
		document.getElementById("allegatovideo").hidden = false;
	 	document.getElementById("allegatofoto").hidden = true;
		document.getElementById("areatesto").hidden = true;
	});
});


function cambiaPagina(url) {
		window.location.replace(url);
}

$(document).ready( function(){
	$(".navbar-toggler").click(function() {
		cambiaPagina('primaPagina.html');
	});
});


function modifyStory(){
	var xhr, storiaP, objmodifyStory;
	var titolostoriavalore = document.getElementById("titolostoriamod").value;
	var accessibile = document.getElementById('accessibilemodifica').checked;
	var retrievedObjectStoryP = localStorage.getItem('storieP'); //ottengo elenco storie dalla local storage
	var objStorageStoryP = JSON.parse(retrievedObjectStoryP);
	var radiobuttonSP = Array.from(document.getElementsByName('radioSP'));
	var indexOfCheckedRadio = radiobuttonSP.findIndex(radio => radio.checked);

	storiaP = { //oggetto JS dati storia modificata
		id: objStorageStoryP.storieP[indexOfCheckedRadio].id, //rappresenta id della storia selezionata
		nome: titolostoriavalore, //nuovo nome storia
		accessibile: accessibile //nuovo valore 'accessibile'
	};
	objmodifyStory = JSON.stringify(storiaP); //trasformo oggetto JS in stringa JSON
	
	//richiesta post
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
    	if (xhr.readyState === 4 && xhr.status === 200) {
			location.reload(); //aggiorno la pagina in modo da vedere le modifiche apportate alle storie dopo l'ok dal server
		}
	};
	xhr.open('POST', '/autore/modifiedStory', true); //apro connessione tipo POST
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8'); //header richiesta
	xhr.send(objmodifyStory); //invio stringa JSON
}


//necessario per vedere le storie presenti nel div 'storie pubblicate'
function viewStoryP(){	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/newStory', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strnewStory = xhr.responseText; //ottengo elenco storie in formato stringa
			// Inserisco nella storage l'oggetto
			localStorage.setItem('storieP', strnewStory);
			var objNewStory = JSON.parse(strnewStory); //ottengo oggetto JS
			var objNewStoryLength = objNewStory.storieP.length; //calcolo lunghezza oggetto JS
			var radioStoriaP = document.getElementsByClassName('radioStoriaP');
			for (var i = 0; i < objNewStoryLength; i++){
			//crea tutti i radio button delle storie presenti nel file storiaP.json
				document.getElementById('storiepubblicate').innerHTML += "<div class='form-check radioStoriaP'><input name='radioSP' type='radio' id= "+ 'radioSP'  + radioStoriaP.length + " value= "+ objNewStory.storieP[i].nome + ">&nbsp<label class='labelStoriaP' for= "+ 'radioSP' + radioStoriaP.length + ">" + objNewStory.storieP[i].nome + "</label></div>";
			}
		}
	};
	xhr.send();
}
//necessario per vedere le storie presenti nel div 'storie archiviate'
function viewStoryA(){	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/autore/archiveStory', true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200){
			var strArchiveStory = xhr.responseText; //ottengo elenco storie in formato stringa
			// Inserisco nella storage l'oggetto
			localStorage.setItem('storieA', strArchiveStory);
			var objArchiveStory = JSON.parse(strArchiveStory); //ottengo oggetto JS
			var objArchiveStoryLength = objArchiveStory.storieA.length; //calcolo lunghezza oggetto JS
			var radioStoriaA = document.getElementsByClassName('radioStoriaA');
			for (var i = 0; i < objArchiveStoryLength; i++){
			//crea tutti i radio button delle storie presenti nel file storiaA.json
				document.getElementById('storiearchiviate').innerHTML += "<div class='form-check radioStoriaA'><input name='radioSA' type='radio' id= "+ 'radioSA'  + radioStoriaA.length + " value= "+ objArchiveStory.storieA[i].nome + ">&nbsp<label class='labelStoriaA' for= "+ 'radioSA' + radioStoriaA.length + ">" + objArchiveStory.storieA[i].nome + "</label></div>";
			}
		}
	};
	xhr.send();
}
