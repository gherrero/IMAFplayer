$(document).ready(function(){

    //Known issues: when the window loses focus, the guide and time start to drag.

	playButton=document.getElementById("button");
	playButton.addEventListener("click",clickPlay,false);
    getFileButton=document.getElementById("fileInfo");
    
});

if (window.File && window.FileReader && window.FileList && window.Blob) {
  //All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

var isPlaying=false;
var numberOfTracks = 0;
var currentGuidePos=0;
var startPixel=0;


//Manually selecting the file right now
Parser.newFile('logan3.ima');

(function() {
    setTimeout(check, 0);
    function check() {
        if (Parser.container===null) {
            setTimeout(check, 250);
            return;
        }
        Parser.parseContainer();
        onFileLoaded();
    }
})();

function onFileLoaded(){
    (function() {
        setTimeout(check, 0);
        function check() {
            if (Parser.parsed===false) {
                setTimeout(check, 250);
                return;
            }
            numberOfTracks=Parser.numberOfTracks; //I have to do it like this otherwise it won't work (WHY)
            for (var i = 0; i < numberOfTracks; i++) {
                soundManager.newTrack(i);
            }
            onFileParsed();
            if (Parser.hasLyrics) {Parser.parseLyrics();}
            insertMetaData();
        }
    })();
}

function onFileParsed(){
    (function() {
            setTimeout(check, 0);
            function check() {
                if (soundManager.tracklist.length!=numberOfTracks) {
                    setTimeout(check, 250);
                    return;
                }
                onTracksLoad();
                var fileInfo=document.getElementById('fileInfo');
            var timeInfo=document.getElementById('timeInfo');
            
            var seconds=Parser.mvhd.duration/1000;
           
            timeInfo.innerHTML='0.00/'+Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)+'.'+Math.floor(((seconds % 31536000) % 86400) % 3600) % 60;
            }
        })();
}

function insertMetaData(){
    Parser.parseMetadata();
    var metadata=Parser.metaString;
    if (metadata!==null) {
        metadata = metadata.substring(metadata.indexOf(">") + 1); //Removes the encoding node from the xml file.
        domParser=new DOMParser();
        xmlDoc=domParser.parseFromString(metadata,"text/xml");
        var tags=xmlDoc.getElementsByTagName('Title');
        var name=xmlDoc.getElementsByTagName('Name'); //This may need to be replaced by something more accurate
        var metaField=document.getElementById('metaField');
        var titleTag='';
        var albumTag='';
        var authorTag=name.item(0).textContent;

        for (var i = 0; i < tags.length; i++) {
            if (tags.item(i).getAttribute('type')=='songTitle'){
                titleTag=xmlDoc.getElementsByTagName('Title').item(i).textContent;

            }else if (tags.item(i).getAttribute('type')=='albumTitle'){
                albumTag=xmlDoc.getElementsByTagName('Title').item(i).textContent;
            }
        }
        metaField.innerHTML='Track: <b>'+titleTag+'</b><br>Artist: <b>'+authorTag+'</b><br> Album: <b>'+albumTag+'</b>';
    }
}

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++){
        binary += String.fromCharCode(bytes[ i ]);
    }
    return window.btoa( binary );
}

function onTracksLoad(){
    var string_with_bas64_image = _arrayBufferToBase64(Parser.imagesBuffers[0]);
    var thumbnail=document.createElement('img');
    thumbnail.src="data:image/png;base64," + string_with_bas64_image;
    thumbnail.setAttribute('href',"data:image/png;base64," + string_with_bas64_image);
    thumbnail.setAttribute('style','border-radius: 4px');
    var thumbDiv=document.getElementById('thumbHolder');
    thumbnail.style.height='48px';
    thumbnail.style.width='48px';
    thumbnail.className='thumbClass';
    thumbnail.id='thumbnail';
    thumbHolder.appendChild(thumbnail);

    $("#thumbHolder").mouseover(function(){
        $("#thumbnail").animate({height:200,width:200},"fast");
    });

     $("#thumbHolder").mouseout(function(){
        $("#thumbnail").animate({height:48,width:48},"fast");
    });

    var volumeSlider =[];

    if (Parser.hasLyrics){
        var lyricsTrack=document.createElement('div');
        lyricsTrack.className='canvasWrap';
        lyricsTrack.id='lyricsTrack';
        document.getElementById("wrapper").appendChild(lyricsTrack);
    }

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
        newCanvasWrap.id='canvasWrap'+soundManager.tracklist[i].name;
        newControlElement.appendChild(newVolumeElement);
        newControlElement.appendChild(newNameElement);
        newTrackElement.appendChild(newControlElement);
        newCanvasWrap.appendChild(newCanvasElement);
        newCanvasWrap.appendChild(newGuideElement);
        newTrackElement.appendChild(newCanvasWrap);

        document.getElementById("wrapper").appendChild(newTrackElement);

        volumeSlider[i]=document.getElementById('volume'+soundManager.tracklist[i].name);
        volumeSlider[i].addEventListener('change',
                (function(i){
                return function(e) {
                    soundManager.changeVolumeOfTrack(i,volumeSlider[i].value);
                };
            })(i),true);
        var numberOfCanvas=document.getElementsByClassName('canvasClass').length;
        (function() {
            setTimeout(check, 0);
            function check() {
                if (numberOfCanvas != numberOfTracks) {
                    setTimeout(check, 250);
                    return;
                }
                drawAllTracks();
            }
        })();
    }
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

function setTimer(){
    var duration=Parser.mvhd.duration/1000;
    var total='';
    total=Math.floor((((duration % 31536000) % 86400) % 3600) / 60)+'.'+Math.floor(((duration % 31536000) % 86400) % 3600) % 60;
    var time=0;
    var int=setInterval(function (){
        if(time>=duration){
            clearInterval(int);
        }
        else{
            timeInfo.innerHTML=Math.floor((((time % 31536000) % 86400) % 3600) / 60)+'.'+Math.floor(((time % 31536000) % 86400) % 3600) % 60+'/'+total;
            time++;
        }
    }, 1000);
}

// COMMENTED BELOW FUNCTIONS TO CLICK ON WAVEFORMS (NOT REALLY WORKING)

// function getPosition(event){
//     var x = event.x;
//     var y = event.y;
//     var canvas = document.getElementById("canvasGuitar.mp3");

//     x -= canvas.offsetLeft;
//     y -= canvas.offsetTop;

//     alert("x:" + x + " y:" + y);
// }

// function drawGuideAtPos(pos){
//     var coords=relMouseCoords(e);
//     window.startPixel=coords.x;
// }

// function relMouseCoords(event){
//     canvas=document.getElementById('canvasGuitar.mp3'); //This needs to be replaced by something that gets the first canvas.
//     var totalOffsetX = 0;
//     var totalOffsetY = 0;
//     var canvasX = 0;
//     var canvasY = 0;
//     var currentElement = this;

//     do{
//         totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
//         totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
//     }
//     while(currentElement == currentElement.offsetParent);

//     canvasX = event.pageX - totalOffsetX;
//     canvasY = event.pageY - totalOffsetY;
//     //alert("x:" + canvasX + " y:" + canvasY);
//     window.startPixel=canvasX;
//     for(i=0;i<numberOfTracks;i++){
//         soundManager.pause(i);
//         soundManager.tracklist[i].currentTime=(canvasX*soundManager.tracklist[i].trackBuffer.duration/canvas.width);
//         soundManager.play(i);
//         console.log(soundManager.tracklist[i].currentTime);
//     }

//     return {x:canvasX, y:canvasY};

// }
//HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function drawWaveform(buffer,canvas){
    var canvasContext=canvas.getContext('2d');
    var data=buffer.getChannelData(0);
	canvasContext.beginPath();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = '#BCCDFA';
    chunkSize=Math.floor(data.length/canvas.width);
    halfChunkSize=Math.floor(chunkSize/2);
    var ctr=0;
    var tempArrayData=[];
    for (var i=0;i<canvas.width;i++){
        for(var c=0;c<chunkSize;c++){
            tempArrayData[c]=data[c+ctr];
            ctr++;
        }
        var min = Math.min.apply(null, tempArrayData);
        var max = Math.max.apply(null, tempArrayData);
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
    if (Parser.hasLyrics) {showLyrics();}
    setTimer();
    document.getElementById('button').setAttribute('style','background: url(img/pause.png) no-repeat center; ');
}

function showLyrics () {
    var time=0;
    document.getElementById('lyricsTrack').innerHTML = Parser.lyricsArray[0];
    for (var i = 0; i<Parser.lyricsArray.length; i++) {
        interval= setTimeout((function(i) {
            time+=Parser.stts[Parser.textTrackNumber].entries[i].sampleDelta;

            return function() {
                if (Parser.lyricsArray[i+1]!==undefined) { //Waiting for a more elegant solution than this.
                    document.getElementById('lyricsTrack').innerHTML = Parser.lyricsArray[i+1];
                }
            };
            })(i), time);
    }
}