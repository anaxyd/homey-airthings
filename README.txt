# Airthings

This app adds support for Airthings radon/voc sensors over Bluetooth Low Energy.

### Device support

In this release it will support Airthings Wave and Airthings Wave+ sensor. In future releases it will also support Airthings Mini.

### Nice to know

Airthings and Homey will communicate over Bluetooth, which is limited in range. Make sure that Homey and the device will be max 10 meters in distance to eachother, and if possible no obstacles in between (like fireplaces, brick wall, metal walls etc). When adding the device for the first time it is recommended to move Homey and the device close to eachother to make adding process easier.


### Changelog

v 1.1.0
- Fixed humidity on Wave+ (Showing negative values, when passing 63.5%rH)
- Added serial number in title on discovery of Wave+
- Added First Alpha version of Wave implementation

v 1.0.0
Initial release of app
