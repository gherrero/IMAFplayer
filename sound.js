var soundManager = {

//*************************************************************//
//Class that manages all the sound processing.
//This pseudo class could be implemented better, 
//	using prototypes instead of literals for example.
//
//
//*************************************************************//

audioContext: new webkitAudioContext(),
currentTime: 0,		//tracks global execution time
tracklist: [],		//array of track objects, with their buffer, filename, and track source

newTrack: function(tracknumber){
	var that=this;
	var arraybuffer=Parser.getArrayBufferTrack(tracknumber);
	that.audioContext.decodeAudioData(arraybuffer,function(buffer){
		var track={};
		track.trackBuffer=buffer;
		track.name=tracknumber; //To be substituted by the name when available.
		track.isLoaded=true;
		track.trackSource=null;
		track.playing=false;
		track.gainNode=that.audioContext.createGainNode(); // createGain() doesn't work on Safari (deprecated?)
		that.tracklist.push(track);
		track.currentTime=0;
		});
},

changeVolumeOfTrack: function (tracknumber,volume){
	this.tracklist[tracknumber].gainNode.gain.value=volume;
},

toggle: function(tracknumber){

	this.tracklist[tracknumber].playing ? this.pause(tracknumber) : this.play(tracknumber);
	this.tracklist[tracknumber].playing=!this.tracklist[tracknumber].playing;
},

play: function(tracknumber){

	audioSource=this.audioContext.createBufferSource();
	audioSource.buffer=this.tracklist[tracknumber].trackBuffer;
	this.tracklist[tracknumber].trackSource=audioSource;
	audioSource.connect(this.tracklist[tracknumber].gainNode);
	this.tracklist[tracknumber].gainNode.connect(this.audioContext.destination);
	this.tracklist[tracknumber].trackSource.noteOn(0,this.tracklist[tracknumber].currentTime);
	this.tracklist[tracknumber].currentTime=this.audioContext.currentTime-this.tracklist[tracknumber].currentTime;
},

pause: function(tracknumber){
	this.tracklist[tracknumber].trackSource.noteOff(0);
	this.tracklist[tracknumber].currentTime=this.audioContext.currentTime-this.tracklist[tracknumber].currentTime;
},
};

