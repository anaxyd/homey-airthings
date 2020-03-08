'use strict';

const Homey = require('homey');

class WaveDevice extends Homey.Device {
	
	onInit() {
		this.log('WaveDevice has been initialized');

		const settings = this.getSettings();
		const pollInterval = settings.pollInterval;
		this.log(pollInterval);
		const POLL_INTERVAL = 1000 * 60 * pollInterval; // default 30 minutes

		this.per = undefined;

		// migrate from previous version of the driver
		if(!this.hasCapability("measure_luminance")) {
			this.log("Missing luminance. Adding to the current device");
			this.addCapability("measure_luminance");
		}

        // Run poll at init
        this.poll();

		setInterval(this.poll.bind(this), POLL_INTERVAL);
	}
	
	poll() {

		this.log('Polling device');

		const macAddress = this.getData().uuid;
		const settings = this.getSettings();
		const pollTimeout = settings.pollTimeout;

		Homey.app.getSemaphore().wait(async () => {
			try {
				let result = await Homey.app.getValuesFromDevice(this, macAddress, pollTimeout); 
				
				this.setCapabilityValue("measure_humidity", result.humidity);
				this.setCapabilityValue("measure_temperature", result.temperature);
				this.setCapabilityValue("measure_radon", result.shortTermRadon);
				this.setCapabilityValue("measure_luminance", result.light);
	
				Homey.app.getSemaphore().signal();
				this.log(result);
	
			} catch(error) {

				Homey.app.getSemaphore().signal();
				this.log(error);
			}
		})
	}	
}

module.exports = WaveDevice;