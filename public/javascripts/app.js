var canvas  = document.getElementById('cv');
var cv      = canvas.getContext("2d");
var ctx     = canvas.getContext("2d");
var text    = canvas.getContext("2d");
var form    = document.getElementById('form');
var nom1    = document.getElementById('nom1');
var nom2    = document.getElementById('nom2');
var tIme    = document.getElementById('tImes');
var go    = document.getElementById('go');

var socket = io();



form.addEventListener("submit", function(e){
    e.preventDefault();

    var nom    = document.getElementById('nom').value;
    if(nom !== ''){

        socket.emit('start',{user: nom,  state:true});
        //socket.emit('canvas',{heigth: nom, color: color, state:true});
    }
});

go.addEventListener('click',function () {
   form.style.display = 'none';
   //style.display = "none";

})



var loop = function(data){
    for(var i = 0 ; i < data.length; i++){

        if (i === 0 ){

        	cv.fillRect(data[i].x,data[i].y,data[i].width,data[i].height);

            ctx.fillRect(data[i].Bx,data[i].By+35,25,25)
            ctx.fillStyle = 'black';

            nom1.innerHTML = 'Nom : '+ data[i].User + " <span>Score : "+ data[i].score2 + '</span>'
        }else {
            cv.fillRect(770,data[i].y,data[i].width,data[i].height);

            nom2.innerHTML = 'Nom : '+ data[i].User + " <span>Score : " + data[i].score1 + '</span>'
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

socket.on('victoir1',function(data){

    console.log(data.victoir1);


});

socket.on('victoir2',function(data){

   console.log(data.victoir2);

});

socket.on('state',function(data){
   if (data.state) {

      var cont = 3;
      var id = setInterval(function(){
         console.log(cont);
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

socket.on('cont', function(data){
    console.log(data.timer);
    ctx.font = "70px Arial";
    ctx.fillText(data.timer,400,250);
})

document.onkeydown = function(event){
    if(event.keyCode === 40)
        socket.emit('keyPress',{inputId:'down',state:true});
    else if(event.keyCode === 38)
        socket.emit('keyPress',{inputId:'up',state:true});
    else if(event.keyCode === 32)
        socket.emit('keyPress',{inputId:'start',state:true});
}

    document.onkeyup = function(event){
        if(event.keyCode === 40)
            socket.emit('keyPress',{inputId:'down',state:false});
        else if(event.keyCode === 38)
            socket.emit('keyPress',{inputId:'up',state:false});
        // else if(event.keyCode === 32)
        //     socket.emit('keyPress',{inputId:'start',state:false});
    }
