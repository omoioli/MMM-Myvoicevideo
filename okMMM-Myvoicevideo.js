/* global Module */

/* Magic Mirror
 * Module: MMM-Myvoicevideo
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-Myvoicevideo",{

// Default module config.
	defaults: { 
		motiontext: "Liste des vidéos surveillance",
		pathmotion: "/home/pi/motion/motion/",
		onStart: false,
		limitText: 50
	},

	listeVideos: null,	
	encours: null,
	text: [],
	lsVideo: [],
	
	start: function() {
		var self = this;

		//Flag for check if module is loaded
		this.loaded = false;
		if (this.config.onStart) {
			this.sendSocketNotification("motionliste", {});
		}
	},


	notificationReceived: function(notification, payload) {
		var self = this;
		var ToPlay = null;
		if (notification === "PLAY_MOTION"){
			if (this.config.onStart) {
				if (payload>0 && payload<=this.lsVideo.length) {
					self.sendSocketNotification("stopvideo", {});
					this.encours = payload-1;
					ToPlay = this.config.pathmotion + this.lsVideo[this.encours][1];
					this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "PLAY MOTION : " + ToPlay});

        			this.sendSocketNotification("playvideo", ToPlay);
				}
				else {
					this.sendNotification("SHOW_ALERT", {type: "notification", title: "ERREUR", message: "ERREUR DE VIDEO ..."});
				}
			}
		//	this.updateDom();
   		}
		if (notification === "STOP_MOTION"){
      			self.sendSocketNotification("stopvideo", {});
    	}
		if (notification === "NEXT_MOTION"){
			if (this.config.onStart) {
				var suivant = null;
				self.sendSocketNotification("stopvideo", {});
				if (this.encours<this.lsVideo.length-1) {
					this.encours = this.encours + 1;
					suivant = this.config.pathmotion + this.lsVideo[this.encours][1];  //
				}
				else {
					this.encours = 0;
					suivant = this.config.pathmotion + this.lsVideo[this.encours][1];
				}
      			self.sendSocketNotification("playvideo", suivant);
      		}
    	}
		if (notification === "SHOW_MOTION"){
      		self.sendSocketNotification("stopvideo", {});
      		if (this.config.onStart) {
				this.config.onStart = false;
			} 
			else {
				this.config.onStart = true;
				this.sendSocketNotification("motionliste", {});
				
			}
			this.updateDom();
      			
    	}
	},

	TrideVideo: function (a,b) {
			if (a[0] > b[0]) {
				return -1;
			}
			else if (a[0] < b[0]) {
				return 1;
			}
			else {
				return 0;
			}
	},
			
	socketNotificationReceived: function (notification, payload) {
			
		if (notification === "LISTE_MOTION") {
			
			var temp = [];

			for (i=0; i<payload.length; i++) { // 01-20191225111523
				
				var motionannee = payload[i].substring(3,7);
				var motionmois = payload[i].substring(7,9);
				var motionjour = payload[i].substring(9,11);
				var motionheure = payload[i].substring(11,13);
				var motionminute = payload[i].substring(13,15);
				var txtmotion = motionjour + "/" + motionmois + "/" + motionannee + " à " + motionheure + ":" + motionminute;
				
				this.text[i] = txtmotion;
				this.lsVideo[i] = [[this.text[i]],[payload[i]]];
			}
			this.lsVideo.sort(this.TrideVideo);
			for (i=0; i<this.lsVideo.length; i++) { 
				if ( i<9 ) {
					this.lsVideo[i][0] = "0" + (i+1) + " : " + this.lsVideo[i][0];
				}
				else {
					this.lsVideo[i][0] = (i+1) + " : " + this.lsVideo[i][0];
				}
			}
			this.sendNotification("notifmqtt", this.lsVideo.length + " vidéos enregistrées.");
			this.updateDom();
		}
	},
	
	// Override dom generator.
	getDom: function() {
		var self = this;
		
		var wrapper = document.createElement("div"); 
		if (this.config.onStart == true) {
			
			wrapper.innerHTML = this.config.motiontext;
			var cpt = 1;  
			var indStart = 1; 
			var indStop = 1;
			var finWrapper = "  ( " + cpt + " : " + indStart + " )";
			var stoplist = 0;
			var cptlist = 0;
			
			for (i=0; i<this.text.length && stoplist < this.config.limitText; i++){  

				var wrapperlist = document.createElement("div");
				if (i==0) {
					cptlist = cptlist +1;
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(5,15) + finWrapper;
				}
				else if (i>0 && i<this.text.length-1 && this.lsVideo[i][0].substring(5,15) == this.lsVideo[i-1][0].substring(5,15)) {
					
					cpt += 1;
					indStop = i+1;
					finWrapper = "  ( " + cpt + " : " + indStart + " - " + indStop + " )";
					
					cptlist = cptlist +1;
						
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(5,15) + finWrapper;
					if (this.lsVideo[i][0].substring(5,15) != this.lsVideo[i+1][0].substring(5,15)) {
						wrapper.appendChild(wrapperlist);
						stoplist = stoplist + 1;
						cpt = 1;  
						indStop = i+1; 
						indStart = indStop+1;
					}

				}
				else if (i>0 && i<this.text.length-1 && this.lsVideo[i][0].substring(5,15) != this.lsVideo[i-1][0].substring(5,15)) {
					
					indStop = i+1; 
					if (cpt > 1) {
						finWrapper = "  ( " + cpt + " : " + indStart + " - " + indStop + " )";
					} else {
						finWrapper = "  ( " + cpt + " : " + indStart + " )";
					}
					cptlist = cptlist +1;
					
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(5,15) + finWrapper;
					if (this.lsVideo[i][0].substring(5,15) != this.lsVideo[i+1][0].substring(5,15)) {
						
						wrapper.appendChild(wrapperlist);
						stoplist = stoplist + 1;
						cpt = 1; 
						indStop = i+1; 
						indStart = indStop+1;
					}
				}
				else if (i==this.text.length-1) {
					
					if (cpt > 1) {
						finWrapper = "  ( " + cpt + " : " + indStart + " - " + indStop + " )";
					} else {
						finWrapper = "  ( " + cpt + " : " + indStart + " )";
					}
						
					cptlist = cptlist +1;
					
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(5,15) + finWrapper;
					wrapper.appendChild(wrapperlist);
					
				}
					
			}
			if (stoplist == this.config.limitText) {
				wrapperlist.innerHTML = "+ " + (this.text.length-cptlist) + " vidéos ...";
				wrapper.appendChild(wrapperlist);
			}
		}
		return wrapper;
	}
});

