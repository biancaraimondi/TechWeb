$(document).ready(function () {
	var nomeGiocatore = "";
	var messaggioPlayer = "";
	var valutatore = "";
	var socket = io();
	
	//appena il player si connette manda un messaggio al valutatore
	$('#nome').click(function(){
		nomeGiocatore = $('#nomeGiocatore').val();
		$('#nomeGiocatore').val('');
		document.getElementById("nomeGiocatore").hidden = true;
		document.getElementById("nome").hidden = true;
		document.getElementById("chat").hidden = false;
		
		messaggioPlayer = "Sono " + nomeGiocatore + ". Mi sono connesso";
		valutatore = "valutatore";
		socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
	});
	
	$('#invia').click(function(e){
		e.preventDefault();//previene il reload della pagina
		messaggioPlayer = $('#testoDaInviare').val();
		socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
		$('#messaggiChat').append("<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioPlayer + "</div></div></div>");
		$('#testoDaInviare').val('');
		return false;
	});
	
	socket.on('chat message', function(msg, id){
		$('#messaggiChat').append("<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>");
	});
});