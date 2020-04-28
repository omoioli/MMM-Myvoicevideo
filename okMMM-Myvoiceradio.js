/* global Module */

/* Magic Mirror
 * Module: MMM-Myvoiceradio
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-Myvoiceradio",{

// Default module config.
	defaults: { 
		text: "<div style='font-size: 20px;'>Affichage Videos MOTION\n</div>",
		ficmotion: "/home/pi/motion/motion/01-20191220111030.avi"
	},


	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;
		this.sendSocketNotification("motionliste", {});

		// Schedule update timer.
//		this.getData();
//		setInterval(function() {
//			self.updateDom();
//		}, this.config.updateInterval);
	},


	notificationReceived: function(notification, payload) {
		var self = this;
		if (notification === "PLAY_MOTION"){
			this.config.text += this.config.ficmotion + "\n";
			this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "PLAY_MOTION"});

			this.sendSocketNotification("motionliste", {});
        		this.sendSocketNotification("playradio", this.config.ficmotion);
			this.updateDom();
   		 }
		if (notification === "radiostop"){
      			self.sendSocketNotification('radiostop', {});
    		}
/*		if (notification === "LISTE_MOTION") {
			//this.MotionFile = payload;
			this.config.text = payload;
			this.updateDom();
		}*/
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "LISTE_MOTION") {
			this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "LISTE_MOTION"});
			//this.MotionFile = payload;
			for (i=0; i<payload.length; i++) {
				this.config.text = this.config.text + "<div style='font-size: 20px;'>"+ (i+1) + " : " + payload[i] + "\n</div>";
			}
			this.updateDom();
		}

	},
	
	
	// Override dom generator.
	getDom: function() {
		var self = this;
		
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	}
});
