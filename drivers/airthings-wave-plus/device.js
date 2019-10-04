'use strict';

const Homey = require('homey');

class MyDevice extends Homey.Device {
	
	onInit() {
		this.log('MyDevice has been inited');

		const settings = this.getSettings();
		const pollInterval = settings.pollInterval;
		console.log(pollInterval);
		const POLL_INTERVAL = 1000 * 60 * pollInterval; // default 30 minutes

        // first run
        this.poll();

		//return;
		//setInterval(this.poll(), POLL_INTERVAL);
		this._pollClimateInterval = setInterval(this.poll.bind(this), POLL_INTERVAL);
		
		return;

		//console.log(this.getData())

		const macAddress = this.getData().uuid;

		Homey.app.getValues(macAddress)
			.then(helvette => {
				console.log(helvette)

				// const capabilities = this.getCapabilities();
				// capabilities.forEach(capability => {
				// 	console.log(capability)
				// 	this.setCapabilityValue(capability, value);
				// });

				this.setCapabilityValue("measure_co2", helvette.co2);
				this.setCapabilityValue("measure_pressure", helvette.pressure);
				this.setCapabilityValue("measure_humidity", helvette.temperature);
				this.setCapabilityValue("measure_temperature", helvette.humidity);
				this.setCapabilityValue("measure_voc", helvette.voc);
				this.setCapabilityValue("measure_radon", helvette.shortTermRadon);

				this.log("Airthings Wave Plus sensor values updated");


				// { humidity: 38.5,
				// 	light: 0,
				// 	shortTermRadon: 10,
				// 	longTermRadon: 0,
				// 	temperature: 23.59,
				// 	pressure: 972.82,
				// 	co2: 362,
				// 	voc: 1 }
				//   measure_co2
				//   measure_humidity
				//   measure_luminance
				//   measure_pm25
				//   measure_pressure
				//   measure_temperature

			})
			.catch(error => {
				new Error('Cannot get value:' + error);
			});

		return;

		const capabilities = this.getCapabilities();

		console.log(capabilities)

		const currentValue = this.getCapabilityValue(capability);

		if (currentValue !== value) {
			this.setCapabilityValue(capability, value);
		}
	}

	poll() {

		this.log('Polling device...');

		const macAddress = this.getData().uuid;
		const settings = this.getSettings();
		const pollTimeout = settings.pollTimeout;

		Homey.app.getValues(macAddress, pollTimeout)
			.then(result => {
				console.log(result)

				// const capabilities = this.getCapabilities();
				// capabilities.forEach(capability => {
				// 	console.log(capability)
				// 	this.setCapabilityValue(capability, value);
				// });

				this.setCapabilityValue("measure_co2", result.co2);
				this.setCapabilityValue("measure_pressure", result.pressure);
				this.setCapabilityValue("measure_humidity", result.humidity);
				this.setCapabilityValue("measure_temperature", result.temperature);
				this.setCapabilityValue("measure_voc", result.voc);
				this.setCapabilityValue("measure_radon", result.shortTermRadon);

				this.log("Airthings Wave Plus sensor values updated");

				return Promise.resolve();

				// { humidity: 38.5,
				// 	light: 0,
				// 	shortTermRadon: 10,
				// 	longTermRadon: 0,
				// 	temperature: 23.59,
				// 	pressure: 972.82,
				// 	co2: 362,
				// 	voc: 1 }
				//   measure_co2
				//   measure_humidity
				//   measure_luminance
				//   measure_pm25
				//   measure_pressure
				//   measure_temperature

			})
			.catch(error => {
				new Error('Cannot get value:' + error);
			});
	}


	
}

module.exports = MyDevice;