var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server,{});

/* GET home page. */

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ATTENT_LIST = {};
var start       =false;
var score1      = 0;
var score2      = 0;
var victoir1      = 0;
var victoir2      = 0;

var Player = function(id){
    var play = {
        x:10,
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

        if (play.y + 90 >= 495 ) {
            play.y = 410;
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
        width:20,
        height:20,
        pressingStart:false,
        vx:2,
        vy:1,
        state:false,
    }

    ball.updatePosition = function(){

        if (ball.state){
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.y+ ball.vy >= 450 || ball.y + ball.vy < -30) {
                ball.vy = -ball.vy;
            }
            if (ball.x + ball.vx > 780 || ball.x + ball.vx < 0) {
                ball.vx = -ball.vx;
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

        var size = Object.keys(PLAYER_LIST).length;

        var player = Player(socket.id);
        var n = 0;
        socket.on('start',function(dat){
            if (dat.user !== ''){
                if(size<2){
                    PLAYER_LIST[socket.id] = player;
                    if (size === 1) {
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

        console.log(PLAYER_LIST)
        console.log(size)

        var arrlist = Object.keys(ATTENT_LIST).map(function (key) {return ATTENT_LIST[key]});
        if (arrlist.length > 0){
            socket.emit('listattent',arrlist);
            console.log('list'+arrlist);
        }
        socket.on('disconnect',function(){
            delete SOCKET_LIST[socket.id];
            delete PLAYER_LIST[socket.id];
            delete ATTENT_LIST[socket.id];
            delete ball
            });

        socket.on('keyPress',function(data){
            if(data.inputId === 'up')
                player.pressingUp = data.state;
            else if(data.inputId === 'down')
                player.pressingDown = data.state;
            else if(data.inputId === 'start')
                ball.pressingStart = data.state;
        });


    });
    return router;
}

var nouvoEmmit = function(cont,socket){
    socket.emit('cont',{timer:cont} );

}

 /* Gestion de collision  ******************************************************/
var rangeIntersect = function(min0, max0, min1, max1) {
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
        Math.min(min0, max0) <= Math.max(min1, max1);
}

var colision = function(r0, r1) {
    return rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
        rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height);
}
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
        });

        if (pack[0] !== undefined && pack[1] !== undefined){

            if (i !== 0){
                player.x=760;
            }
            if (colision(pack[0],ball)){
                     ball.vx = -ball.vx;
                 }
            if (colision(pack[1],ball)){
                     ball.vx = -ball.vx;
                 }
            if (ball.x > 773) {
                score2 ++
                ball.x = 400
                ball.y = 250
            }
            if (ball.x < 6 ) {
                score1 ++
                ball.x = 400
                ball.y = 250
            }
        }
    }


    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
        if (score1 == 11 && (score1 - score2)>= 2 ){
            victoir1++;
            socket.emit('victoir1',{victoir1:victoir1, gamesOver:true} );
        }

        if (score2 == 11 && (score2 - score1)>= 2 ){
            victoir2++;
            socket.emit('victoir2',{victoir2:victoir2, gamesOver:true} );
        }
    }

},1000/25);
