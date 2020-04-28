/* global Module */

/* Magic Mirror
 * Module: MMM-Myvoiceradio
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-Myvoiceradio",{

// Default module config.
	defaults: { text: "<div style='font-size: 20px;'>Affichage Videos MOTION</div>"
	},

notificationReceived: function(notification, payload, sender) {
var self = this;
    if (notification === "einslive"){
        self.sendSocketNotification('einslive', {});
    }
if (notification === "PLAY_MOTION"){
	this.config.text = "1111111111111111";
	this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "motion lecture"});

	self.sendSocketNotification("motionliste", {});
        self.sendSocketNotification("playradio", "/home/pi/motion/motion/01-20191220111030.avi");
	this.updateDom();
    }
if (notification === "radiostop"){
        self.sendSocketNotification('radiostop', {});
    }
		if (notification === "LISTE_MOTION") {
			//this.MotionFile = payload;
			this.config.text = payload;
			this.updateDom();
		}
},

/*	socketNotificationReceived: function(notification, payload) {
		if (notification === "LISTE_MOTION") {
			//this.MotionFile = payload;
			this.config.text = payload[0];
			this.updateDom();
		}

	},*/
	
	
	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	}
});
