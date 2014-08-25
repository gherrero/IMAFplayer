var soundManager = {

	//*************************************************************//
	//Class that manages all the sound processing.
	//This pseudo class could be implemented better, 
	//	using prototypes instead of literals for example.
	//
	//
	//*************************************************************//
	
	audioContext: new webkitAudioContext,
	currentTime: 0,		//tracks global execution time
	tracklist: [], 		//array of track objects, with their buffer, filename, and track source
	outputTrack: null, 	//track source of the output (mixed) track
	elapsedTime:0,
	startTime: 0,

	newTrack: function(filename){
		var that=this;
		
		var request =new XMLHttpRequest();
		request.open("GET",filename,true);				
		request.responseType="arraybuffer";
		request.onload=function(){
				that.audioContext.decodeAudioData(request.response,function(buffer){
					var track={};
					track.trackBuffer=buffer;
					track.name=filename;
					track.isLoaded=true;
					track.trackSource=null;
					//track.trackSource.playbackState=null;
					//track.trackSource.buffer=buffer;
					track.playing=false;
					track.gainNode=that.audioContext.createGainNode(); // createGain() doesn't work on Safari (deprecated?)
					that.tracklist.push(track);
					track.currentTime=0;
					

					});

		}
		request.send();	

	},
	
	changeVolumeOfTrack: function (tracknumber,volume){

		var that=this;
		//var volume=element.value;
		that.tracklist[tracknumber].gainNode.gain.value=volume;
		//that.tracklist[tracknumber].track.volume=volume;
	},

	toggle: function(tracknumber){
		var that=this;

		that.tracklist[tracknumber].playing ? that.pause(tracknumber) : that.play(tracknumber);
		that.tracklist[tracknumber].playing=!that.tracklist[tracknumber].playing;


	},

	play: function(tracknumber){
		var that=this; //Cambiar esto porque no hace falta en todas las funciones
		audioSource=that.audioContext.createBufferSource();
		audioSource.buffer=that.tracklist[tracknumber].trackBuffer;
		that.tracklist[tracknumber].trackSource=audioSource;
		audioSource.connect(that.tracklist[tracknumber].gainNode);
		that.tracklist[tracknumber].gainNode.connect(that.audioContext.destination);
		that.tracklist[tracknumber].trackSource.noteOn(0,that.tracklist[tracknumber].currentTime);
		
		that.tracklist[tracknumber].currentTime=that.audioContext.currentTime-that.tracklist[tracknumber].currentTime;

		

	},

	pause: function(tracknumber){
		this.tracklist[tracknumber].trackSource.noteOff(0);
		this.tracklist[tracknumber].currentTime=this.audioContext.currentTime-this.tracklist[tracknumber].currentTime;	

	},
	playAll: function(){

		var that=this;
		that.outputTrack=that.audioContext.createBufferSource();
		that.outputTrack.buffer=that.mixer();
		that.outputTrack.connect(that.audioContext.destination);
		if (that.outputTrack.buffer.playbackState != 2){
				that.outputTrack.start(0);
			}
			else{ that.outputTrack.stop(0); }
		
	},

	mixer: function(){
		var that=this;
		outputBuffer=that.audioContext.createBuffer(2,that.tracklist[0].trackBuffer.getChannelData(0).length,44100);
		mixedLeftCh=outputBuffer.getChannelData(0);
		mixedRightCh=outputBuffer.getChannelData(1);


		for (i=0;i<that.tracklist.length;i++){
			for (j=0;j<that.tracklist[0].trackBuffer.getChannelData(0).length;j++){ // assumes all tracks are same in length
				mixedLeftCh[j]+=that.tracklist[i].trackBuffer.getChannelData(0)[j];
				mixedRightCh[j]+=that.tracklist[i].trackBuffer.getChannelData(1)[j];
			}	

		}
		return outputBuffer;
		
	},

}


//isPlaying=false;


// soundManager.prototype.createSource=function(){
// 	if(this.isLoaded===true){
// 		var source=audioContext.createBufferSource();
// 		source.buffer=this.buffer;
// 		source.connect(this.panner);
// 		this.panner.connect(this.volume);
// 		this.volume.connect(audioContext.destination);
// 	}
// 	return source;
// }
// soundManager.prototype.playToggle=function(tracknumber){

// 	console.log(this.tracklist[tracknumber]);
// 	source=this.audioContext.createBufferSource();
// 	source.buffer=this.tracklist[tracknumber];
// 	source.connect(this.audioContext.destination);
// 	source.start(0);	
// }

// soundManager.prototype.getTrackData = function(tracknumber) {

// 	trackData=this.tracklist[tracknumber];
// 	return trackData;
// };
