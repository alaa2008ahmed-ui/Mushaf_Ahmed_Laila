
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-local-notification.LocalNotification",
          "file": "plugins/cordova-plugin-local-notification/www/local-notification.js",
          "pluginId": "cordova-plugin-local-notification",
        "clobbers": [
          "cordova.plugins.notification.local"
        ]
        },
      {
          "id": "cordova-plugin-device.device",
          "file": "plugins/cordova-plugin-device/www/device.js",
          "pluginId": "cordova-plugin-device",
        "clobbers": [
          "device"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-device": "3.0.0",
      "cordova-plugin-local-notification": "1.2.3"
    };
    // BOTTOM OF METADATA
    });
    