'use strict';

const Homey = require('homey');

class WavePlusDevice extends Homey.Device {
	
	onInit() {
		this.log('WavePlusDevice has been inited');

		// needed if the device was created with app version <=1.2.1
		this.addCapability("measure_radon_longterm");
		this.addCapability("measure_luminance");

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

		Homey.app.getWavePlusValues(macAddress, pollTimeout)
			.then(result => {
				this.log(result);

				this.setCapabilityValue("measure_co2", result.co2);
				this.setCapabilityValue("measure_pressure", result.pressure);
				this.setCapabilityValue("measure_humidity", result.humidity);
				this.setCapabilityValue("measure_temperature", result.temperature);
				this.setCapabilityValue("measure_voc", result.voc);
				this.setCapabilityValue("measure_radon", result.shortTermRadon);
				this.setCapabilityValue("measure_radon_longterm", result.longTermRadon);
				this.setCapabilityValue("measure_luminance", result.light);

				this.setSettings({ rssi: result.rssi + ' db' });

				this.log("Airthings Wave Plus sensor values updated");

				this.setAvailable();

				return Promise.resolve();

			})
			.catch(error => {
				this.setUnavailable('Cannot get value:' + error);
				new Error('Cannot get value:' + error);
			});
	}

	
}

module.exports = WavePlusDevice;