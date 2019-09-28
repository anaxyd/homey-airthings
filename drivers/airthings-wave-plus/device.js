'use strict';

const Homey = require('homey');

class MyDevice extends Homey.Device {
	
	onInit() {
		this.log('MyDevice has been inited');

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
	
}

module.exports = MyDevice;