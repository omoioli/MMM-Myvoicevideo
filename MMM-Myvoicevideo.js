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
		motiontext: "vidéos",
		pathmotion: "",
		onStart: false,
		limitText: 30
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
			//this.sendSocketNotification("motionliste", {});
			this.sendSocketNotification("motionliste", this.config.pathmotion);
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
					ToPlay = this.config.pathmotion + "/" + this.lsVideo[this.encours][1];
					this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "PLAY MOTION : " + ToPlay});

        			this.sendSocketNotification("playvideo", ToPlay);
				}
				else {
					this.sendNotification("SHOW_ALERT", {type: "notification", title: "ERREUR", message: "ERREUR DE VIDEO ..."});
				}
			}
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
					suivant = this.config.pathmotion + "/" + this.lsVideo[this.encours][1];  //
				}
				else {
					this.encours = 0;
					suivant = this.config.pathmotion + "/" + this.lsVideo[this.encours][1];
				}
      			self.sendSocketNotification("playvideo", suivant);
      		}
    	}
		if (notification === "PREVIOUS_MOTION"){
			if (this.config.onStart) {
				var suivant = null;
				self.sendSocketNotification("stopvideo", {});
				if (this.encours>0) {
					this.encours = this.encours - 1;
					suivant = this.config.pathmotion + "/" + this.lsVideo[this.encours][1];  //
				}
				else {
					this.encours = this.lsVideo.length-1;
					suivant = this.config.pathmotion + "/" + this.lsVideo[this.encours][1];
				}
      			self.sendSocketNotification("playvideo", suivant);
      		}
    	}
		if (notification === "DELETE_MOTION"){
			var ToDelete = null;
			var DeleteFile = null;
			if (this.config.onStart) {
				ToDelete = this.config.pathmotion + "/" + this.lsVideo[this.encours][1];
      			self.sendSocketNotification("stopvideo", {});
				this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "DELETE MOTION : " + ToDelete});

      			self.sendSocketNotification("supvideo", ToDelete);
      			DeleteFile = this.lsVideo.splice(this.encours, 1);
      			this.text.splice(this.encours, 1);
				this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "SUP MOTION : " + DeleteFile[0][0]});

      			this.sendSocketNotification("motionliste", this.config.pathmotion);
      			
			this.updateDom();
      		}
    	}
		if (notification === "SHOW_MOTION"){
      		if (!this.config.onStart) {
				this.config.onStart = true;
				this.sendSocketNotification("motionliste", this.config.pathmotion);
			}
			this.updateDom();
      			
    	}
		if (notification === "HIDE_MOTION"){
      		self.sendSocketNotification("stopvideo", {});
      		if (this.config.onStart) {
				this.config.onStart = false;
			} 
			this.updateDom();
      			
    	}
	},

	TrideVideo: function (a,b) {
			if (a[2] > b[2]) {
				return -1;
			}
			else if (a[2] < b[2]) {
				return 1;
			}
			else {
				return 0;
			}
	},
			
	socketNotificationReceived: function (notification, payload) {
			
		if (notification === "LISTE_MOTION") {
			
			var temp = [];
			
			//this.sendNotification("notifmqtt", "affichage de la liste vidéo");

			for (i=0; i<payload.length; i++) { // 01-20191225111523

	
				var motionannee = payload[i].split("-")[1].substring(0,4);
				var motionmois = payload[i].split("-")[1].substring(4,6);
				var motionjour = payload[i].split("-")[1].substring(6,8);
				var motionheure = payload[i].split("-")[1].substring(8,10);
				var motionminute = payload[i].split("-")[1].substring(10,12);
				var txtmotion = motionjour + "/" + motionmois + "/" + motionannee + " à " + motionheure + ":" + motionminute;
				var txtmotiontri = motionannee + "/" + motionmois + "/" + motionjour + " à " + motionheure + ":" + motionminute;
				this.text[i] = txtmotion;
				this.lsVideo[i] = [[this.text[i]],[payload[i]],[txtmotiontri]];
			}
			this.lsVideo.sort(this.TrideVideo);
			for (i=0; i<this.lsVideo.length; i++) { 
				if ( i<9 ) {
					this.lsVideo[i][0] = "00" + (i+1) + " : " + this.lsVideo[i][0];
				}
				else if (i>=9 && i<99) {
					this.lsVideo[i][0] = "0" + (i+1) + " : " + this.lsVideo[i][0];
				}
				else {
				    this.lsVideo[i][0] = (i+1) + " : " + this.lsVideo[i][0];
				}
			}
			this.updateDom();
		}
		if (notification === "ALERTETOSHOW"){
			
				this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "TOSHOW MOTION : " + payload});
			
		}
	},
	
	// Override dom generator.
	getDom: function() {
		var self = this;
		
	//	var wrapper = document.createElement("div"); 
		var wrapper = document.createElement("table"); 
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
				//var wrapperlist = document.createElement("tr");  //new
				//var motiondate = document.createElement("td");  //new
				//var motionnb = document.createElement("td");  //new
				if (i==0) {
					cptlist = cptlist +1;
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(6,16) + finWrapper;
					//motiondate.innerHTML = this.lsVideo[i][0].substring(6,16);  //new
					//motionnb.innerHTML = finWrapper;  //new
						//wrapperlist.appendChild(motiondate);  //new
						//wrapperlist.appendChild(motionnb);  //new
				}
				else if (i>0 && i<this.text.length-1 && this.lsVideo[i][0].substring(6,16) == this.lsVideo[i-1][0].substring(6,16)) {
					
					cpt += 1;
					indStop = i+1;
					finWrapper = "  ( " + cpt + " : " + indStart + " - " + indStop + " )";
					
					cptlist = cptlist +1;
						
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(6,16) + finWrapper;
					
					//motiondate.innerHTML = this.lsVideo[i][0].substring(6,16);  //new
					//motionnb.innerHTML = finWrapper;  //new
					
					if (this.lsVideo[i][0].substring(6,16) != this.lsVideo[i+1][0].substring(6,16)) {
						wrapper.appendChild(wrapperlist);
					//	wrapperlist.appendChild(motiondate);  //new
					//	wrapperlist.appendChild(motionnb);  //new
					//wrapper.appendChild(wrapperlist);  //new
						stoplist = stoplist + 1;
						cpt = 1;  
						indStop = i+1; 
						indStart = indStop+1;
					}

				}
				else if (i>0 && i<this.text.length-1 && this.lsVideo[i][0].substring(6,16) != this.lsVideo[i-1][0].substring(6,16)) {
					
					indStop = i+1; 
					if (cpt > 1) {
						finWrapper = "  ( " + cpt + " : " + indStart + " - " + indStop + " )";
					} else {
						finWrapper = "  ( " + cpt + " : " + indStart + " )";
					}
					cptlist = cptlist +1;
					
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(6,16) + finWrapper;
					
					//motiondate.innerHTML = this.lsVideo[i][0].substring(6,16);  //new
					//motionnb.innerHTML = finWrapper;  //new
					
					if (this.lsVideo[i][0].substring(6,16) != this.lsVideo[i+1][0].substring(6,16)) {
						
						wrapper.appendChild(wrapperlist);
						//wrapperlist.appendChild(motiondate);  //new
						//wrapperlist.appendChild(motionnb);  //new
					//wrapper.appendChild(wrapperlist);  //new
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
					
					wrapperlist.innerHTML = this.lsVideo[i][0].substring(6,16) + finWrapper;
					
					//motiondate.innerHTML = this.lsVideo[i][0].substring(6,16);  //new
					//motionnb.innerHTML = finWrapper;  //new
					
					wrapper.appendChild(wrapperlist);
					//	wrapperlist.appendChild(motiondate);  //new
					//	wrapperlist.appendChild(motionnb);  //new
					//wrapper.appendChild(wrapperlist);  //new
				}
				//wrapper.appendChild(wrapperlist);  //new
			}
			if (stoplist == this.config.limitText) {
				//motionnb.innerHTML = "+ " + (this.text.length-cptlist) + " vidéos ...";  //new
				//wrapperlist.appendChild(motionnb);  //new
				wrapperlist.innerHTML = "+ " + (this.text.length-cptlist) + " vidéos ...";
				wrapper.appendChild(wrapperlist);
			}
		}
		return wrapper;
	}
});

