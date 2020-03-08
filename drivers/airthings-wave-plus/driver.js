'use strict';

const Homey = require('homey');

class WavePlusDriver extends Homey.Driver {
	
	onInit() {
		this.deviceType = 'WavePlus';
	}

	// This method is called when a user is adding a device
  	// and the 'list_devices' view is called
	onPairListDevices(data, callback) {

		Homey.app.discoverDevices(this)
			.then(devices => {
				this.log(devices)
				callback(null, devices);
			})
			.catch(error => {
				callback(new Error('Cannot find devices:' + error));
			});

    }
	
}

module.exports = WavePlusDriver;