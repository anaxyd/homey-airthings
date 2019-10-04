'use strict';

const Homey = require('homey');
const bufferpack = require('/lib/bufferpack.js');

/*
	Notes etc


	Node.js modules readme:
	https://apps.developer.athom.com/tutorial-App%20Store.html

	modules in use so far:
	- https://github.com/ryanrolds/bufferpack



*/

class AirthingsApp extends Homey.App {
	
	async onInit() {
		this.log('AirthingsApp is running...!');
		
	}

	getValues(macAddress, pollTimeout) {
		return new Promise(async(resolve, reject) => {

			this.log(macAddress)
			this.log(pollTimeout)

			let timeout = pollTimeout;

			const ble = Homey.ManagerBLE;

			try {
				const advertisement = await ble.find(macAddress, timeout);
				const peripheral = await advertisement.connect();
				const services = await peripheral.discoverServices();
				const dataService = await services.find(service => service.uuid === "b42e1c08ade711e489d3123b93f75cba");
				const characteristics = await dataService.discoverCharacteristics();
				const data = await characteristics.find(characteristic => characteristic.uuid === "b42e2a68ade711e489d3123b93f75cba");
				const sensorData = await data.read();
				await peripheral.disconnect();

				// This is the matching format for the binary data for unpacking.
				const format = "<xbxbHHHHHHxxxx";
				const unpacked = bufferpack.unpack(format, sensorData);

				// Sensordata unpacked looks like this:
				// (humidity, light, sh_rad, lo_rad, temp, pressure, co2, voc)
				// Example:
				// [ 81, 0, 10, 0, 2387, 48689, 366, 116 ]
				// Some of the values requires minor math to get correct values

				let sensorValues = {
					humidity: unpacked[0] / 2,
					light: unpacked[1],
					shortTermRadon: unpacked[2],
					longTermRadon: unpacked[3],
					temperature: unpacked[4] / 100,
					pressure: unpacked[5] / 50,
					co2: unpacked[6],
					voc: unpacked[7]
				}

				resolve(sensorValues)

			} catch (error) {
				reject(error)
			}
			
		})
	}

	discoverDevices(driver) {
		return new Promise(async(resolve, reject) => {

			let timeout = 25000;
			this.log("Searching for Airthings devices...")

			const ble = Homey.ManagerBLE;

			try {
				let devices = [];
				const foundDevices = await ble.discover(['b42e1c08ade711e489d3123b93f75cba'], timeout);

				foundDevices.forEach(device => {
					devices.push({
						name: "Airthings Wave Plus",
						data: {
							id: device.id,
							uuid: device.uuid,
							address: device.address
						}
					})
				});

				resolve(devices)
			} catch (error) {
				reject(error)
			}

		});
	}
	
}

module.exports = AirthingsApp;