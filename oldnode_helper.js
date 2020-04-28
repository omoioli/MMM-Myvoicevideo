'use strict';
const NodeHelper = require('node_helper');
const exec = require('child_process').exec;
var fs = require('fs');
const path = require('path');
var timer;
//function initialize() {
//}
//(function(){
//	initialize();
//			autosleep();
//})();
module.exports = NodeHelper.create({
  start: function() {
		this.started = false;
  }, 
 
  socketNotificationReceived: function(notification, payload) {
	if (notification === "playradio") {
		this.sendNotification("LISTE_MOTION", "lecture video de motion");
		exec("omxplayer --no-osd --win 15,640,1180,1500 "+ payload, null);
	}
	if (notification === "motionliste") {
		this.sendNotification("SHOW_ALERT", {type: "notification", title: "VIDEO", message: "motion lecture"});
		
		//files = fs.readdirSync(payload).filter(file => (file.indexOf('.') !== 0 && (file !== basename) && file.slice(-3) === '.avi'));
		this.sendNotification("LISTE_MOTION", "lecture video de motion");
	}
	if (notification === "radiostop") {
		exec("killall omxplayer", null);
	}


   },
  
});

	
