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
		if (notification === "playvideo") {
			exec("omxplayer --no-osd --win 15,640,1180,1500 "+ payload, null);
		}
		if (notification === "supvideo") {
			//var pathmove = "/home/pi/motion/move";
			//exec("mv " + payload + " " + pathmove, null);
			fs.unlinkSync(payload);
		}
		if (notification === "motionliste") {
			//var dir = "../motion/move";
			var dir = payload;
			var liste = [];
			var sizeTri = [];
			var sizelimit = 400000;
			var sizecpt = 0;
						
			liste = fs.readdirSync(dir); 
			
			for ( var i=0; i<liste.length; i++ ) {
				var long = fs.statSync(dir+"/"+liste[i]).size;
				if (long > sizelimit) {
					var len = sizeTri.push(liste[i]);
				}
				else {
					//this.sendSocketNotification("ALERTETOSHOW", dir + "/" + liste[i]);
					fs.unlinkSync(dir + "/" + liste[i]);
				}
			}
			this.sendNotification(sizeTri);
		}
		if (notification === "stopvideo") {
			exec("pkill omxplayer", null);
		}
  	},
   
	sendNotification: function(payload) {
		this.sendSocketNotification("LISTE_MOTION", payload);
	},
  
});

	
