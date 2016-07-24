var canvas  = document.getElementById('cv');
var cv      = canvas.getContext("2d");
var ctx     = canvas.getContext("2d");
var text    = canvas.getContext("2d");
var form    = document.getElementById('form');
var nom1    = document.getElementById('nom1');
var nom2    = document.getElementById('nom2');
var tIme    = document.getElementById('tImes');
var go      = document.getElementById('go');
var gameOver= document.getElementById('gameOver');
var rel     = document.getElementById('relaod');

var socket = io();

var users = [];
var scores ;

form.addEventListener("submit", function(e){
    e.preventDefault();

    var nom    = document.getElementById('nom').value;
    if(nom !== ''){
        users.push(nom)
        socket.emit('start',{user: nom,  state:true});
        //socket.emit('canvas',{heigth: nom, color: color, state:true});
    }
});

go.addEventListener('click',function () {
   form.style.display = 'none';
   //style.display = "none";

})

rel.addEventListener('click',function () {
   location.reload(true);
})

var loop = function(data){
    for(var i = 0 ; i < data.length; i++){

        if (i === 0 ){

        	cv.fillRect(data[i].x,data[i].y,data[i].width,data[i].height);

            //ctx.fillRect(data[i].Bx,data[i].By+35,25,25)
            ctx.beginPath();
            ctx.arc(data[i].Bx, data[i].By, 10, 0, 2 * Math.PI,false);
            ctx.fill();
            ctx.fillStyle = 'black';

            nom1.innerHTML = 'Nom : '+ data[i].User + " <span>Score : "+ data[i].score2 + '</span>'
            scores=data[i].score2
            //console.log(data[i].victoir2);
        }else {
            cv.fillRect(770,data[i].y,data[i].width,data[i].height);

            nom2.innerHTML = 'Nom : '+ data[i].User + " <span>Score : " + data[i].score1 + '</span>'

            //console.log(data[i].victoir1);
            console.log(data[0].score2 + '' +data[1].score1);
            if (data[i].score2 - data[i].score1 > 0 &&  data[i].score2 == 4 || data[i].score1 - data[i].score2 > 0 &&  data[i].score1 == 4){
               socket.emit('fin',{state:true ,
                  score1: data[i].score2,
                  score2: data[i].score1,
                  user1 : users[0],
                  user2 : data[i].User
               });
               window.location.href = "/scoreParsial";
            }
    	 }
    }
}

socket.on('newPositions',function(data){
    cv.clearRect(0,0,800,500);
    ctx.beginPath();
    ctx.moveTo(400,0);
    ctx.lineTo(400,500);
    ctx.stroke();
    loop(data);



});

// socket.on('Disconnect',function(data){
//    if (data.bool) {
//       gameOver.innerHTML = "<p> " + data.message + "</p>";
//    }else{
//       gameOver.innerHTML =" ";
//    }
// });


socket.on('state',function(data){
   if (data.state) {

      var cont = 3;
      var id = setInterval(function(){
         //console.log(cont);
         tImer.innerHTML = cont;
         cont--;
         if (cont === 0){
            tImer.innerHTML = '';
            socket.emit('state',{state:true});
            clearInterval(id);
         }

      }, 2000);

   }

});

 socket.on('listattent',function(data){
    for(var i = 0 ; i < data.length; i++){
        var list = document.getElementById('list');
        list.innerHTML +='<p>'+data[i].user+'</p>';
        console.log(data[i].user)

    }
 });


document.onkeydown = function(event){
    //event.preventDefault();
    if(event.keyCode === 40)
        socket.emit('keyPress',{inputId:'down',state:true});

    else if(event.keyCode === 38)
        socket.emit('keyPress',{inputId:'up',state:true});

}

    document.onkeyup = function(event){
        //event.preventDefault();
        if(event.keyCode === 40)
            socket.emit('keyPress',{inputId:'down',state:false});
        else if(event.keyCode === 38)
            socket.emit('keyPress',{inputId:'up',state:false});
    }
