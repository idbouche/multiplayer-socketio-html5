var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server,{});


/* GET home page. */




module.exports = function(io) {
    var app = require('express');
    var router = app.Router();

    router.get('/', function(req, res, next) {
  		res.render('index', { title: 'Express' });
	});
    var ok ;
    io.on('connection', function(socket) { 
        console.log('CONNECTION');
        
        socket.on('happy', function(data) { 
        	console.log(data.left); 
            if(data.left == 'true'){
                ok =  'ok'
                console.log('9',data.left); 
                socket.emit('message',{'yes': ok});
            }else{
                ok = 'ko'
                socket.emit('message',{'yes': ok});
            }

    	});
    	//socket.emit('message',{'yes': ok});
    });



    return router;
}







