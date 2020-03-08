'use strict';

const Homey = require('homey');
const semaphore = require('/lib/Semaphore.js');
const AT = require('/lib/airthings.js');
const bufferpack = require('/lib/bufferpack.js');

/*
	Notes etc


	Node.js modules readme:
	https://apps.developer.athom.com/tutorial-App%20Store.html

	modules in use so far:
	- https://github.com/ryanrolds/bufferpack
	- https://github.com/Wizcorp/locks

*/

class AirthingsApp extends Homey.App {
	
	async onInit() {
		this.log('AirthingsApp is running');
		this.bleAccess = new semaphore(2);
	}

	sleep(ms){
		return new Promise(resolve=>{
			setTimeout(resolve,ms)
		})
	}

	getSemaphore() {
		return this.bleAccess;
	}

	async getValuesFromDevice(device, macAddress, pollTimeout) {

		let timeout = pollTimeout;
		const ble = Homey.ManagerBLE;
		let deviceType = device.getDriver().deviceType;

		try {

			// if no peripheral instance defined, define it
			if(device.per == undefined) {
				this.log('Searching device')
				const adv = await ble.find(macAddress, timeout);
				this.log('Connecting device')
				device.per = await adv.connect();
			}

			await device.per.assertConnected();
			this.log('Connected');

			const srv = await device.per.discoverAllServicesAndCharacteristics();
			this.log('Services discovered');
			
			const dataService = await srv.find(service => service.uuid === AT.getServiceUUID(deviceType));

			if(dataService == undefined) { 
				throw 'Service not found' 
			}

			const characteristics = await dataService.discoverCharacteristics();
			this.log('Characteristics discovered');

			var sensorData = [];
			const uuidList = AT.getCharacteristicsUUID(deviceType);

			for (var uuid in uuidList) {
				const data = await characteristics.find(characteristic => characteristic.uuid === uuidList[uuid]);
				sensorData[uuid] = await data.read();
			}
			this.log('Characteristics read');

			await device.per.disconnect();
			this.log('Disconnected');
			
			let sensorValues = AT.parseSensorData(deviceType, sensorData);

			return sensorValues;

		} catch(error) {
			if(device.per != undefined) {
				device.per.disconnect();
				device.per = undefined;
			}
			
			throw error.message;
		}
	}

	discoverDevices(driver)
	{
		return new Promise(async(resolve, reject) => {

			this.log("Searching for", AT.getLongName(driver.deviceType), "devices for 30 seconds")
			const timeout = 29000;

			const ble = Homey.ManagerBLE;

			try {
				let devices = [];

				const foundDevices = await ble.discover([AT.getServiceUUID(driver.deviceType)], timeout);

				foundDevices.forEach(device => {
					const format = "<xxIxx";
					devices.push({
						name: AT.getLongName(driver.deviceType) + " (" + bufferpack.unpack(format, device.manufacturerData)[0] + ")",
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