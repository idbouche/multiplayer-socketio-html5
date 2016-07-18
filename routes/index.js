var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server,{});
var db         = require('../modules/db');
var ObjectID   = require('mongodb').ObjectID;

/* GET home page. */

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ATTENT_LIST = {};
var start       =false;
var score1      = 0;
var score2      = 0;
var victoir1      = 0;
var victoir2      = 0;
var disconnect  = false;

var Player = function(id){
    var play = {
        x:20,
        y:10,
        id:id,
        user :'',
        width:10,
        height:100,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10,


    }
       play.updatePosition = function(){
        if(play.pressingUp)
            play.y -= play.maxSpd;
        if(play.pressingDown)
            play.y += play.maxSpd;

        if (play.y + 100 >= 500 ) {
            play.y = 400;
            }
        if ( play.y < 0) {
            play.y = 0;
            }
    }
    return play;
}


var Ball = function(){
    var ball = {
        x:387,
        y:240,
        pressingStart:false,
        vx:4,
        vy:4,
        state:false,
    }

    ball.updatePosition = function(){

        if (ball.state){
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.y < 0 || ball.y  > 500) {
                ball.vy *= -1;
            }
        }
    }

    return ball;
}

var ball = Ball()


module.exports = function(io) {
    var app = require('express');
    var router = app.Router();

    router.get('/', function(req, res, next) {
  		res.render('index', { title: 'Game multiplayers' });
    });

    io.on('connection', function(socket) {

        var arr = Object.keys(PLAYER_LIST).map(function (key) {return PLAYER_LIST[key]});

        socket.id = Math.random();
        SOCKET_LIST[socket.id] = socket;

        var sizeSocket = Object.keys(SOCKET_LIST).length;
        var player = new Player(socket.id);
        var size = Object.keys(PLAYER_LIST).length;
        var n = 0;
        socket.on('start',function(dat){
            if (dat.user !== ''){
                if(size<2){
                    PLAYER_LIST[socket.id] = player;
                    var collection = db.get().collection('user');
                    var date = new Date();
                    collection.insert({
                                       nom      : dat.user,
                                       id       : socket.id,
                                       score    : score1,
                                       victoir  : victoir1,
                                       date     : date.getTime()
                                      },
                                      function(err, result) {
                        if (err){
                            socket.emit('message',{message:"Veuiller ressie"});
                        }else{           collection.find({'nom':dat.user}).toArray(function(err, dat) {
                            socket.emit('message',{message:`vous étes bien inscrer  ${dat[0].nom}`});
                            });
                        }

                    });
                    if (size > 0 ) {
                        socket.emit('state',{state:true});

                    }else {
                        socket.emit('state',{state:false});
                    }
                    n++;
                }else{
                    ATTENT_LIST[socket.id] = player;

                }


            }
            player.user  =  dat.user;
        });

         socket.on('state',function (data) {
             if (data.state){
                 ball.state = true
             }else {
                ball.state = false
             }

         })

        var arrlist = Object.keys(ATTENT_LIST).map(function (key) {return ATTENT_LIST[key]});
        if (arrlist.length > 0){
            socket.emit('listattent',arrlist);
            console.log('list'+arrlist);
        }
        console.log(victoir2 + ', ' + victoir1);


            socket.on('disconnect',function(){
                delete SOCKET_LIST[socket.id];
                delete PLAYER_LIST[socket.id];
                delete ATTENT_LIST[socket.id];
                delete ball
            });


        socket.on('keyPress',function(data){
            if(data.inputId === 'up'){
                player.pressingUp = data.state;}
            else if(data.inputId === 'down'){
                player.pressingDown = data.state;}
        });
        socket.on('keyPres',function(data){

        if(data.inputId === 'espace'){
                score2 = 0;
                score1 = 0;
                ball.state = true;
                socket.emit('state',{state:true});
            }

        if(data.inputId === 'esc'){
                delete SOCKET_LIST[socket.id];
                delete PLAYER_LIST[socket.id];
                delete ATTENT_LIST[socket.id];
            }

        });



    });
    return router;
}

 /* Gestion de collision  ******************************************************/

/*Fin gestion collision  ******************************************************/

setInterval(function(){
    var pack = [];

    for(var i in PLAYER_LIST){
        ball.updatePosition();
        var player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            width:player.width,
            height:player.height,
            User:player.user,
            Bx:ball.x,
            By:ball.y,
            score1:score1,
            score2:score2,
            victoir1:victoir1,
            victoir2:victoir2,
        });

        if (pack[0] !== undefined && pack[1] !== undefined){
            if (i !== 0){
                player.x =760;
            }

            if(ball.x > pack[1].x && ball.x < pack[1].x + pack[1].width && ball.y > pack[1].y && ball.y < pack[1].y + pack[1].height){
                   //console.log('ok');
                   ball.vx *= -1;

            }

            if(ball.x > pack[0].x && ball.x < pack[0].x + pack[1].width && ball.y > pack[0].y && ball.y < pack[0].y + pack[0].height){
                   //console.log('ok1');
                   ball.vx *= -1;

            }

            if (ball.x > 800) {
                score2 ++
                if (score2 >= 11 && (score2 - score1)>= 2 ){
                    disconnect = true;
                    victoir2++ ;
                    ball.state = false;
                }
                ball.x = 400
                ball.y = 250
            }
            if (ball.x < 0) {
                score1 ++
                if (score1 >= 11 && (score1 - score2)>= 2 ){
                    disconnect = true;
                    victoir1++;
                    ball.state = false;
                }
                ball.x = 400
                ball.y = 250
            }



        }
    }


    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
        if (disconnect){
            socket.broadcast.emit('rejeuer' ,{rejeuer: true});
            console.log('list');
            disconnect = false;

        }

    }

},1000/25);
