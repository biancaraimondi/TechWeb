$(document).ready(function () {
    var nomeGiocatore = "";
    var messaggioPlayer = "";
    var valutatore = "valutatore";
    var socket = io();
    
    //appena il player si connette manda un messaggio al valutatore
    $('#nome').click(function(){
        nomeGiocatore = document.getElementById('nomeGiocatore').value;
        document.getElementById('nomeGiocatore').value = "";
        //document.getElementById("nomeGiocatore").hidden = true;
        //document.getElementById("nome").hidden = true;
        //document.getElementById("chat").hidden = false;
        
        messaggioPlayer = "Sono " + nomeGiocatore + ". Mi sono connesso";
        socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
    });
    
    $('#invia').click(function(/*e*/){
        //e.preventDefault(); //previene il reload della pagina
        messaggioPlayer = document.getElementById('testoDaInviare').value;
        socket.emit('chat message', messaggioPlayer, nomeGiocatore, valutatore);
        document.getElementById('messaggiChat').innerHTML += "<div class='message message-right'> <div class='message-text-wrapper'> <div class='message-text'>" + messaggioPlayer + "</div></div></div>";
        document.getElementById('testoDaInviare').value = "";
        //return false;
    });
    
    socket.on('chat message', function(msg, id){
        document.getElementById('messaggiChat').innerHTML += "<div class='message'><div class='message-text-wrapper'><div class='message-text'>" + msg + "</div></div></div>";
    });
});

