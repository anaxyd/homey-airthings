'use strict';

const Homey = require('homey');

class MyDriver extends Homey.Driver {
	
	onInit() {
		this.log('MyDriver has been inited');
	}

	// This method is called when a user is adding a device
  	// and the 'list_devices' view is called
	onPairListDevices(data, callback) {

		//console.log(this)

		// let faen = this.getDevices();
		// console.log(faen)

		//callback(new Error('Faen i helvette:'));

		//return;

		Homey.app.discoverDevices(this)
			.then(devices => {
				console.log(devices)
				callback(null, devices);
			})
			.catch(error => {
				callback(new Error('Cannot find devices:' + error));
			});

		return;

		callback(null, [
			{
				name: 'Foo Device',
				data: {
					id: 'abcd1234'
				}
			}
		]);
		return;

        Homey.app.discoverDevices(this)
            .then(devices => {
                callback(null, devices);
            })
            .catch(error => {
                callback(new Error('Cannot get devices:' + error));
            });
    }
	
}

module.exports = MyDriver;