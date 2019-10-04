'use strict';

const Homey = require('homey');

class WavePlusDevice extends Homey.Device {
	
	onInit() {
		this.log('WavePlusDevice has been inited');

		const settings = this.getSettings();
		const pollInterval = settings.pollInterval;
		this.log(pollInterval);
		const POLL_INTERVAL = 1000 * 60 * pollInterval; // default 30 minutes

        // Run poll at init
        this.poll();

		setInterval(this.poll.bind(this), POLL_INTERVAL);

	}

	poll() {

		this.log('Polling device...');

		const macAddress = this.getData().uuid;
		const settings = this.getSettings();
		const pollTimeout = settings.pollTimeout;

		Homey.app.getValues(macAddress, pollTimeout)
			.then(result => {
				this.log(result)

				this.setCapabilityValue("measure_co2", result.co2);
				this.setCapabilityValue("measure_pressure", result.pressure);
				this.setCapabilityValue("measure_humidity", result.humidity);
				this.setCapabilityValue("measure_temperature", result.temperature);
				this.setCapabilityValue("measure_voc", result.voc);
				this.setCapabilityValue("measure_radon", result.shortTermRadon);

				this.log("Airthings Wave Plus sensor values updated");

				return Promise.resolve();

			})
			.catch(error => {
				new Error('Cannot get value:' + error);
			});
	}

	
}

module.exports = WavePlusDevice;