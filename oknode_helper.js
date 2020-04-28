'use strict';
var NodeHelper = require("node_helper");
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
var timer;

module.exports = NodeHelper.create({
//  	start: function() {
//		this.started = false;
// 	}, 
 
	socketNotificationReceived: function(notification, payload) {
		if (notification === "playradio") {
			exec("omxplayer --no-osd --win 15,640,1180,1500 "+ payload, null);
		}
		if (notification === "motionliste") {
			var dir = "../motion/motion";
			var fich = "01-20191220111030.avi";
			var liste = [];
			liste = fs.readdirSync(dir); //.filter(file => (file.indexOf('.') !== 0 && (file !== basename) && file.slice(-3) === '.avi'));

			this.sendNotification(liste);
		}
		if (notification === "radiostop") {
			exec("pkill omxplayer", null);
		}
  	},
   
	sendNotification: function(payload) {
		this.sendSocketNotification("LISTE_MOTION", payload);
	},
   
  
});

	
