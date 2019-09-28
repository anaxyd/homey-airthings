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

class MyApp extends Homey.App {
	
	async onInit() {
		this.log('MyApp is running...!');

		return;

		let timeout = 30000;
		const UUID = "b42e1c08ade711e489d3123b93f75cba";

		const ble = Homey.ManagerBLE;
		const list = await ble.discover(['b42e1c08ade711e489d3123b93f75cba'], timeout)
		const peripheral = await list[0].connect();
		const services = await peripheral.discoverServices();
		const dataService = await services.find(service => service.uuid === "b42e1c08ade711e489d3123b93f75cba");
		const characteristics = await dataService.discoverCharacteristics();
		const data = await characteristics.find(characteristic => characteristic.uuid === "b42e2a68ade711e489d3123b93f75cba");
		const sensorData = await data.read();

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

		console.log(sensorValues)

		
	}

	getValues(macAddress) {
		return new Promise(async(resolve, reject) => {

			console.log(macAddress)

			let timeout = 20000;

			const ble = Homey.ManagerBLE;

			try {
				const advertisement = await ble.find(macAddress, timeout);
				const peripheral = await advertisement.connect();
				const services = await peripheral.discoverServices();
				const dataService = await services.find(service => service.uuid === "b42e1c08ade711e489d3123b93f75cba");
				const characteristics = await dataService.discoverCharacteristics();
				const data = await characteristics.find(characteristic => characteristic.uuid === "b42e2a68ade711e489d3123b93f75cba");
				const sensorData = await data.read();

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

				//console.log(sensorValues)

				resolve(sensorValues)

			} catch (error) {
				reject(error)
			}
			
		})
	}

	discoverDevices(driver) {
		return new Promise(async(resolve, reject) => {

			console.log("Searching for Airthings devices...")
			let timeout = 25000;

			const ble = Homey.ManagerBLE;

			try {
				let devices = [];
				const foundDevices = await ble.discover(['b42e1c08ade711e489d3123b93f75cba'], timeout);
				//console.log(foundDevices)

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

module.exports = MyApp;


/*
	Probable mac addresses:

	c4:64:e3:f0:5b:5d <<< correct
	e7:e7:41:88:24:c9

*/