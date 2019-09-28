'use strict';

const Homey = require('homey');
const bufferpack = require('/bufferpack.js');
//const { ManagerBLE } = require('homey');

class MyApp extends Homey.App {
	
	async onInit() {
		this.log('MyApp is running...!');

		let timeout = 30000;

		let self = this;

		//self.log(Homey.app)

		const ble = Homey.ManagerBLE;
		const list = await ble.discover(['b42e1c08ade711e489d3123b93f75cba'], timeout)
		const peripheral = await list[0].connect();
		//console.log(peripheral);
		//const services = await peripheral.discoverServices();
		//console.log(services)

		//return;
		const sac = await peripheral.discoverAllServicesAndCharacteristics();
		//console.log(sac);

		// sac.forEach(element => {
		// 	self.log(element.characteristics)
		// });

		const services = await peripheral.discoverServices();

		//console.log(services)
		//return;
		// const dataService = await services.find(service => {
		// 	console.log(service.uuid)
		// });
		const dataService = await services.find(service => service.uuid === "b42e1c08ade711e489d3123b93f75cba");

		//console.log(dataService)
		//return;
		const characteristics = await dataService.discoverCharacteristics();

		//console.log(characteristics.length)

		//return
		const data = await characteristics.find(characteristic => {
			console.log(characteristic.uuid)
			return characteristic.uuid === "b42e2a68ade711e489d3123b93f75cba"
		});

		const sensorData = await data.read();

		console.log(sensorData)

		const faen = bufferpack.unpack("BBBBHHHHHHHH", sensorData);
		const faen2 = bufferpack.unpack("<xbxbHHHHHHxxxx", sensorData);
		console.log(faen)
		console.log(faen2)
		console.log("!!!")

		//console.log(sensorData.readUInt16LE(4)) // radon?
		console.log(sensorData.readUInt16LE(0))
		console.log(sensorData.readUInt16LE(1))
		console.log(sensorData.readUInt16LE(2))
		console.log(sensorData.readUInt16LE(3))
		console.log(sensorData.readUInt16LE(4))
		console.log(sensorData.readUInt16LE(5))
		console.log(sensorData.readUInt16LE(6))
		console.log(sensorData.readUInt16LE(7))
		console.log(sensorData.readUInt16LE(8))
		console.log("FAEN")
		console.log(sensorData.readUInt32LE(0))
		console.log(sensorData.readUInt32LE(1))
		console.log(sensorData.readUInt32LE(2))
		console.log(sensorData.readUInt32LE(3))
		console.log(sensorData.readUInt32LE(4))
		console.log(sensorData.readUInt32LE(5))
		console.log(sensorData.readUInt32LE(6))
		console.log(sensorData.readUInt32LE(7))
		console.log(sensorData.readUInt32LE(8))

		return;

		// const data = await characteristics.find(characteristic => characteristic.uuid === DATA_CHARACTERISTIC_UUID);
		// if(!data) {
		// 	throw new Error('Missing data characteristic');
		// }
		// console.log('DATA_CHARACTERISTIC_UUID::read');
		// const sensorData = await data.read();


		//let faen = new Homey.BlePeripheral();

		

		/* new Homey.BleAdvertisement({
			address: "c4:64:e3:f0:5b:5d"
		}).connect().then(function (d) {
			self.log(d)
		}) */

		/* new Homey.BleService().discoverCharacteristics(["b42e2a68-ade7-11e4-89d3-123b93f75cba"]).then((d) => {
			self.log(d)
		}) */

		return;

		/* Homey.ManagerBLE.find("b42e2a68-ade7-11e4-89d3-123b93f75cba", timeout).then(function (advertisement) {
			this.log(advertisement)
            //return advertisement;
		}); */
		
		Homey.ManagerBLE.discover([], timeout).then(function (advertisement) {
			self.log(advertisement)
            //return advertisement;
        });
	}
	
}

module.exports = MyApp;


/*
	Probable mac addresses:

	c4:64:e3:f0:5b:5d <<< correct
	e7:e7:41:88:24:c9

*/