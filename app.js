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

	getWaveValues(macAddress, pollTimeout) {
		return new Promise(async(resolve, reject) => {

			this.log(macAddress)
			this.log(pollTimeout)

			let timeout = pollTimeout;

			const ble = Homey.ManagerBLE;

			try {
				this.log('Searching for: !',macAddress);
				const advertisement = await ble.find(macAddress, timeout);
				this.log('Found: !',macAddress);
				await this.sleep(1000);
				
				const peripheral = await advertisement.connect();
				await this.sleep(1000);
				this.log('Connected !',macAddress);
				const services = await peripheral.discoverAllServicesAndCharacteristics();
				this.log('Services Discovered !',macAddress);
				const dataService = await services.find(service => service.uuid === "b42e1f6eade711e489d3123b93f75cba");
				const characteristics = await dataService.discoverCharacteristics();
				
				//Radon Short Term Average
				const staDataChar = await characteristics.find(characteristic => characteristic.uuid === "b42e01aaade711e489d3123b93f75cba");
				const staData = await staDataChar.read();
				
				//Radon Long Term Average
				const ltaDataChar = await characteristics.find(characteristic => characteristic.uuid === "b42e0a4cade711e489d3123b93f75cba"); 
				const ltaData = await ltaDataChar.read();

				//Temperature
				const tempDataChar = await characteristics.find(characteristic => characteristic.uuid === "2a6e");
				const tempData = await tempDataChar.read();

				//Humidity
				const humDataChar = await characteristics.find(characteristic => characteristic.uuid === "2a6f");
				const humData = await humDataChar.read();

				//ALS + Light
				const alsDataChar = await characteristics.find(characteristic => characteristic.uuid == "b42e1096ade711e489d3123b93f75cba")
				const alsData = await alsDataChar.read();

				await peripheral.disconnect();

				const format = "<h";
				const sensorSTA = bufferpack.unpack(format, staData)[0];
				const sensorLTA = bufferpack.unpack(format, ltaData)[0];
				const sensorTemperature = bufferpack.unpack(format, tempData)[0];
				const sensorHumidity = bufferpack.unpack(format, humData)[0];
				const formatTwo = "<B";
				const sensorLight = bufferpack.unpack(formatTwo, alsData)[0] & 0xf0;


				// This is the matching format for the binary data for unpacking.
				//const format = "<xbxbHHHHHHxxxx";
				//const unpacked = bufferpack.unpack(format, sensorData);

				// Sensordata unpacked looks like this:
				// (humidity, light, sh_rad, lo_rad, temp, pressure, co2, voc)
				// Example:
				// [ 81, 0, 10, 0, 2387, 48689, 366, 116 ]
				// Some of the values requires minor math to get correct values
				
				let sensorValues = {
					humidity: sensorHumidity / 100,
					light: sensorLight,
					shortTermRadon: sensorSTA,
					longTermRadon: sensorLTA,
					temperature: sensorTemperature / 100,
				}
				
				resolve(sensorValues)

			} catch (error) {
				reject(error)
			}
			
		})
	}
	getWavePlusValues(macAddress, pollTimeout) {
		return new Promise(async(resolve, reject) => {

			this.log(macAddress)
			this.log(pollTimeout)

			let timeout = pollTimeout;

			const ble = Homey.ManagerBLE;

			try {
				await this.sleep(10000);
				const advertisement = await ble.find(macAddress, timeout);
				const peripheral = await advertisement.connect();
				this.log('Connected !',macAddress);
				const services = await peripheral.discoverAllServicesAndCharacteristics();
				this.log('services', services);
				this.log('Services Discovered !',macAddress);
				const dataService = await services.find(service => service.uuid === "b42e1c08ade711e489d3123b93f75cba");
				const characteristics = await dataService.discoverCharacteristics();
				const data = await characteristics.find(characteristic => characteristic.uuid === "b42e2a68ade711e489d3123b93f75cba");
				const sensorData = await data.read();
				await peripheral.disconnect();

				// This is the matching format for the binary data for unpacking.
				const format = "<xBBxHHHHHHxxxx";
				const unpacked = bufferpack.unpack(format, sensorData);

				// Sensordata unpacked looks like this:
				// (humidity, light, sh_rad, lo_rad, temp, pressure, co2, voc)
				// Example:
				// [ 81, 0, 10, 0, 2387, 48689, 366, 116 ]
				// Some of the values requires minor math to get correct values

				this.log('unpacked', unpacked);

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
	getWaveMiniValues(macAddress, pollTimeout) {
		return new Promise(async(resolve, reject) => {

			this.log(macAddress)
			this.log(pollTimeout)

			let timeout = pollTimeout;

			const ble = Homey.ManagerBLE;

			try {
				await this.sleep(5000);
				const advertisement = await ble.find(macAddress, timeout);
				const peripheral = await advertisement.connect();
				this.log('Connected To Mini !',macAddress);
				const services = await peripheral.discoverAllServicesAndCharacteristics();
				this.log('Services Discovered Mini !',macAddress);
				const dataService = await services.find(service => service.uuid === "b42e3882ade711e489d3123b93f75cba");
				const characteristics = await dataService.discoverCharacteristics();
				const data = await characteristics.find(characteristic => characteristic.uuid === "b42e3b98ade711e489d3123b93f75cba");
				const sensorData = await data.read();
				await peripheral.disconnect();
				this.log('Disconnected from Mini, parsing data');
				// This is the matching format for the binary data for unpacking.
				const format = "<HHHHHHxxxx";
				const unpacked = bufferpack.unpack(format, sensorData);

				// Sensordata unpacked looks like this:
				// (humidity, light, sh_rad, lo_rad, temp, pressure, co2, voc)
				// Example:
				// [ 81, 0, 10, 0, 2387, 48689, 366, 116 ]
				// Some of the values requires minor math to get correct values

				let sensorValues = {
					humidity: unpacked[3] / 100,
					light: unpacked[0],
					temperature: (unpacked[1] / 100) - 273.15, //In Kelvin on Mini
					pressure: unpacked[2] / 50,
					voc: unpacked[4]
				}
				resolve(sensorValues)

			} catch (error) {
				reject(error)
			}
			
		})
	}
	sleep(ms){
		return new Promise(resolve=>{
			setTimeout(resolve,ms)
		})
	}
	discoverWaveDevices(driver) {
		return new Promise(async(resolve, reject) => {

			this.log("Searching for Airthings Wave devices...")
			const timeout = 29000;

			const ble = Homey.ManagerBLE;

			try {
				let devices = [];
				// Wave : b42e1f6eade711e489d3123b93f75cba
				const foundDevices = await ble.discover(['b42e1f6eade711e489d3123b93f75cba'], timeout);

				foundDevices.forEach(device => {
					const format = "<xxIxx";
					devices.push({
						name: "Airthings Wave (" + bufferpack.unpack(format, device.manufacturerData)[0] + ")",
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
	discoverWavePlusDevices(driver) {
		return new Promise(async(resolve, reject) => {

			this.log("Searching for Airthings Wave Plus devices...")
			const timeout = 29000;

			const ble = Homey.ManagerBLE;

			try {
				let devices = [];
				// Wave + : b42e1c08ade711e489d3123b93f75cba
				const foundDevices = await ble.discover(['b42e1c08ade711e489d3123b93f75cba'], timeout);

				foundDevices.forEach(device => {
					const format = "<xxIxx";
					devices.push({
						name: "Airthings Wave + (" + bufferpack.unpack(format, device.manufacturerData)[0] + ")",
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
	discoverWaveMiniDevices(driver) {
		return new Promise(async(resolve, reject) => {

			this.log("Searching for Airthings Wave Mini devices...")
			const timeout = 29000;

			const ble = Homey.ManagerBLE;

			try {
				let devices = [];
				// Wave + : b42e3882ade711e489d3123b93f75cba
				const foundDevices = await ble.discover(['b42e3882ade711e489d3123b93f75cba'], timeout);

				foundDevices.forEach(device => {
					const format = "<xxIxx";
					devices.push({
						name: "Airthings Wave Mini (" + bufferpack.unpack(format, device.manufacturerData)[0] + ")",
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