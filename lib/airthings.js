
/*!
 *  Collection of helper utilities specific to AirThings devices
 */

const bufferpack = require('/lib/bufferpack.js');

function AirThings() {

    var a = this;

    var services = {
        "Wave":"b42e1f6eade711e489d3123b93f75cba",
        "WavePlus":"b42e1c08ade711e489d3123b93f75cba",
        "WaveMini":"b42e3882ade711e489d3123b93f75cba"
    };

    var characteristics = {
        "Wave":["b42e01aaade711e489d3123b93f75cba","b42e0a4cade711e489d3123b93f75cba","2a6e","2a6f","b42e1096ade711e489d3123b93f75cba"],
        "WavePlus":["b42e2a68ade711e489d3123b93f75cba"],
        "WaveMini":["b42e3b98ade711e489d3123b93f75cba"]
    }

    var longName = {
        "Wave":"AirThings Wave",
        "WavePlus":"AirThings Wave Plus",
        "WaveMini":"AirThings Wave Mini"
    }

    a.decodeLuminosity = function(lx) {

        const lut = [128, 134, 140, 146, 152, 159, 166, 173, 181, 189, 197, 206, 215, 225, 235, 245];
        let ex = (lx >>> 4) & 15;
        let result;

        if(lx == 255)
            return 65535;

        if(lx < 64)
            return lx;

        result = lut[lx & 15];

        if(ex > 5) {
            result = result << (ex - 5);
        } else if(ex < 5) {
            result = result >>> (5 - ex);
        }

        return result;
    }

    a.getServiceUUID = function(deviceType) {
        return services[deviceType];
    }

    a.getCharacteristicsUUID = function(deviceType) {
        return characteristics[deviceType];
    }

    a.getLongName = function(deviceType) {
        return longName[deviceType];
    }

    a.parseSensorData = function(deviceType, data) {

        var sensorValues = {};

        switch(deviceType)
        {
            case "Wave":
                {
                    const format = "<H";
                    const sensorSTA = bufferpack.unpack(format, data[0])[0];
                    const sensorLTA = bufferpack.unpack(format, data[1])[0];
                    const sensorTemperature = bufferpack.unpack("<h", data[2])[0];
                    const sensorHumidity = bufferpack.unpack(format, data[3])[0];
                    const sensorLight = bufferpack.unpack(format, data[4])[0] & 255;
        
                    sensorValues = {
                        humidity: sensorHumidity / 100,
                        light: a.decodeLuminosity(sensorLight),
                        shortTermRadon: sensorSTA,
                        longTermRadon: sensorLTA,
                        temperature: sensorTemperature / 100,
                    }   
                }
                break;

            case "WavePlus":
                {
                    let format = "<xBBxHHHHHHxxxx";
                    let unpacked = bufferpack.unpack(format, data[0]);

                    sensorValues = {
                        humidity: unpacked[0] / 2,
                        light: a.decodeLuminosity(unpacked[1]),
                        shortTermRadon: unpacked[2],
                        longTermRadon: unpacked[3],
                        temperature: unpacked[4] / 100,
                        pressure: unpacked[5] / 50,
                        co2: unpacked[6],
                        voc: unpacked[7]
                    }
                }
                break;

            case "WaveMini":
                {
                    let format = "<HHHHHHxxxx";
                    let unpacked = bufferpack.unpack(format, data[0]);

                    sensorValues = {
                        humidity: unpacked[3] / 100,
                        light: unpacked[0],
                        temperature: (unpacked[1] / 100) - 273.15, //In Kelvin on Mini
                        pressure: unpacked[2] / 50,
                        voc: unpacked[4]
                    }
                }
                break;
        }

        return sensorValues;
    }

}

module.exports = new AirThings();