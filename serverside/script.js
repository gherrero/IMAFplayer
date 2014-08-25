$(document).ready(function(){

	playButton=document.getElementById("button");
	playButton.addEventListener("click",clickPlay,false);
    getFileButton=document.getElementById("fileInfo");
   

});
var isPlaying=false;

if (window.File && window.FileReader && window.FileList && window.Blob) {
  //All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}


var time= new Date().getTime();
soundManager.newTrack('Guitar.mp3');
soundManager.newTrack('Bass.mp3');
soundManager.newTrack('Drums.mp3');
soundManager.newTrack('Brass.mp3');









var numberOfTracks = 4;             //for this to work unfortunatley i need to know in advance the number of tracks. I assume IMAF has a way of knowing that.
var callbacksVolume=[];
var currentGuidePos=0;
var startPixel=0;


(function() {
    setTimeout(check, 0);
    function check() {
        if (soundManager.tracklist.length != numberOfTracks) {
            setTimeout(check, 250); // Check again in a quarter second or so
            return;
        }

        onTracksLoad();
    }
})();



function onTracksLoad(){

            var thumbnail=document.createElement('img');
            var thumbDiv=document.getElementById('thumbHolder');
        thumbnail.setAttribute('src','thumbnail.jpeg');
        thumbnail.style.height='50px';
        thumbnail.style.width='50px';
        thumbnail.className='thumbClass';
        thumbnail.id='thumbnail';
        thumbHolder.appendChild(thumbnail);



    var volumeSlider =[];
    for (i=0;i<soundManager.tracklist.length;i++){
        var newTrackElement=document.createElement('div');
        var newControlElement=document.createElement('div');
        var newVolumeElement=document.createElement('input');
        var newCanvasElement=document.createElement('canvas');
        var newNameElement=document.createElement('div');
        var newGuideElement=document.createElement('canvas');
        var newCanvasWrap=document.createElement('div');


        newVolumeElement.setAttribute('type','range');
        newVolumeElement.setAttribute('min',0);
        newVolumeElement.setAttribute('max',1);
        newVolumeElement.setAttribute('step',0.1);
        newVolumeElement.setAttribute('value',1);

        newVolumeElement.className='volume';
        newControlElement.className='control';
        newTrackElement.className="track";
        newNameElement.className='nameDiv';
        newCanvasElement.className='canvasClass';
        newGuideElement.className='guideCanvas';
        newCanvasWrap.className='canvasWrap';

        newVolumeElement.id='volume'+soundManager.tracklist[i].name;
        newControlElement.id='control'+soundManager.tracklist[i].name;
        newTrackElement.id='track'+soundManager.tracklist[i].name;
        newNameElement.id='nameDiv'+soundManager.tracklist[i].name;
        newCanvasElement.id='canvas'+soundManager.tracklist[i].name;
        newGuideElement.id='guide'+soundManager.tracklist[i].name;
        newNameElement.innerHTML=soundManager.tracklist[i].name.replace('.mp3',' ');
        newCanvasWrap.id='canvasWrap'+soundManager.tracklist[i].name;


        newCanvasWrap.addEventListener("mousedown", relMouseCoords, false);

        newControlElement.appendChild(newVolumeElement);
        newControlElement.appendChild(newNameElement);
        newTrackElement.appendChild(newControlElement);
        newCanvasWrap.appendChild(newCanvasElement);
        newCanvasWrap.appendChild(newGuideElement);
        newTrackElement.appendChild(newCanvasWrap);



        //newCanvasElement.appendChild(newGuideElement);

        document.getElementById("wrapper").appendChild(newTrackElement);

        volumeSlider[i]=document.getElementById('volume'+soundManager.tracklist[i].name);
        volumeSlider[i].addEventListener('change',
                (function(i){
                return function(e) {
                    //console.log(i);
                    soundManager.changeVolumeOfTrack(i,volumeSlider[i].value);
                };
            })(i),true);



        var numberOfCanvas=document.getElementsByClassName('canvasClass').length;


        (function() {
            setTimeout(check, 0);
            function check() {
                if (numberOfCanvas != numberOfTracks) {
                    setTimeout(check, 250); // Check again in a quarter second or so
                    return;
                }
                    drawAllTracks();
            }
        })();
    }

    currentTime=new Date().getTime()-time;
    //console.log(currentTime/1000);

}

function changeVolume(i){
    console.log(i);
    soundManager.changeVolumeOfTrack(i,volumeSlider[i].value);
}

function drawAllTracks(){
    for (var i=0;i<soundManager.tracklist.length;i++){
        var canvas=document.getElementById('canvas'+soundManager.tracklist[i].name);
        drawWaveform(soundManager.tracklist[i].trackBuffer,canvas);
    }

}

function drawGuide(){

//This system doesn't work quite accurately. It would be better to draw the lines depending on each instant of the track.
//REVISE

var canvas=document.getElementById('guide'+soundManager.tracklist[0].name);

          
    var int=setInterval(function (){
          if(window.startPixel>=canvas.width || soundManager.tracklist[0].trackSource.playbackState!=2){

            clearInterval(int);

        }
        else{
            window.startPixel++;
            for(c=0;c<numberOfTracks;c++){
                canvas=document.getElementById('guide'+soundManager.tracklist[c].name);
                var canvasContext=canvas.getContext('2d');

                canvasContext.beginPath();
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                canvasContext.fillStyle = '#FFFFFF';
                canvasContext.fillRect(window.startPixel,0,1,canvas.height);
                canvasContext.stroke();
            }

        }

    }, Math.floor(soundManager.tracklist[0].trackSource.buffer.duration*1000/canvas.width));

}

function drawGuide2(){

    for(var c=0;c<numberOfTracks;c++){
        for (var i = 0; i < tracklist[i].trackBuffer.length; i++) {




        }
    }


}
function getPosition(event)
{
  var x = event.x;
  var y = event.y;

  var canvas = document.getElementById("canvasGuitar.mp3");

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  alert("x:" + x + " y:" + y);
}

function drawGuideAtPos(pos){
    var coords=relMouseCoords(e);
    window.startPixel=coords.x;

}

function relMouseCoords(event){

    canvas=document.getElementById('canvasGuitar.mp3'); //This needs to be replaced by something that gets the first canvas.
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement == currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    //alert("x:" + canvasX + " y:" + canvasY);
    window.startPixel=canvasX;
    for(i=0;i<numberOfTracks;i++){
        soundManager.pause(i);
        soundManager.tracklist[i].currentTime=(canvasX*soundManager.tracklist[i].trackBuffer.duration/canvas.width);
        soundManager.play(i);
        console.log(soundManager.tracklist[i].currentTime);
    }

    return {x:canvasX, y:canvasY};

}
//HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function drawWaveform(buffer,canvas){
    var canvasContext=canvas.getContext('2d');
	var channels=[buffer.getChannelData(0), buffer.getChannelData(1)]; //If the file is mono this throws a DOM exc. 12
	data=channels[0];
	canvasContext.beginPath();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = '#BCCDFA';
    //canvasContext.lineCap = 'round';
    //canvasContext.fill();
    chunkSize=Math.floor(data.length/canvas.width);
    halfChunkSize=Math.floor(chunkSize/2);
    var ctr=0;
    var tempArrayData=[];
    for (var i=0;i<canvas.width;i++){
        for(var c=0;c<chunkSize;c++){
            tempArrayData[c]=data[c+ctr];
            ctr++;
        }
        min = Math.min.apply(null, tempArrayData);
        max = Math.max.apply(null, tempArrayData);
        canvasContext.fillRect(0,canvas.height/2,canvas.width,2);
        canvasContext.fillRect(i,canvas.height/2,1,max*canvas.height/2);
        canvasContext.fillRect(i,canvas.height/2,1,min*canvas.height/2);
        canvasContext.stroke();
   }
}


function clickPlay(e){

    for (i=0;i<numberOfTracks;i++){
        soundManager.toggle(i);


    }

        drawGuide();
        console.log(window.startPixel);
        document.getElementById('button').innerHTML='PAUSE';



}
