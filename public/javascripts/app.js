//$(document).foundation()


var socket = io();
 socket.on('message', function(message) {
        
        console.log(message.yes);
    })
 socket.emit('happy',{left:'false'});