cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-appversion.RareloopAppVersion",
      "file": "plugins/cordova-plugin-appversion/www/app-version.js",
      "pluginId": "cordova-plugin-appversion",
      "clobbers": [
        "AppVersion"
      ]
    },
    {
      "id": "cordova-plugin-app-update.AppUpdate",
      "file": "plugins/cordova-plugin-app-update/www/AppUpdate.js",
      "pluginId": "cordova-plugin-app-update",
      "clobbers": [
        "AppUpdate"
      ]
    },
    {
      "id": "cordova-plugin-app-version.AppVersionPlugin",
      "file": "plugins/cordova-plugin-app-version/www/AppVersionPlugin.js",
      "pluginId": "cordova-plugin-app-version",
      "clobbers": [
        "cordova.getAppVersion"
      ]
    },
    {
      "id": "cordova-plugin-app-version.AppVersionProxy",
      "file": "plugins/cordova-plugin-app-version/src/windows/AppVersionProxy.js",
      "pluginId": "cordova-plugin-app-version",
      "merges": [
        ""
      ]
    },
    {
      "id": "cordova-plugin-camera.Camera",
      "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "Camera"
      ]
    },
    {
      "id": "cordova-plugin-camera.CameraPopoverOptions",
      "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "CameraPopoverOptions"
      ]
    },
    {
      "id": "cordova-plugin-camera.camera",
      "file": "plugins/cordova-plugin-camera/www/Camera.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "navigator.camera"
      ]
    },
    {
      "id": "cordova-plugin-camera.CameraPopoverHandle",
      "file": "plugins/cordova-plugin-camera/www/CameraPopoverHandle.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "CameraPopoverHandle"
      ]
    },
    {
      "id": "cordova-plugin-camera.CameraProxy",
      "file": "plugins/cordova-plugin-camera/src/windows/CameraProxy.js",
      "pluginId": "cordova-plugin-camera",
      "runs": true
    },
    {
      "id": "cordova-plugin-device.device",
      "file": "plugins/cordova-plugin-device/www/device.js",
      "pluginId": "cordova-plugin-device",
      "clobbers": [
        "device"
      ]
    },
    {
      "id": "cordova-plugin-device.DeviceProxy",
      "file": "plugins/cordova-plugin-device/src/windows/DeviceProxy.js",
      "pluginId": "cordova-plugin-device",
      "runs": true
    },
    {
      "id": "cordova-plugin-inappbrowser.inappbrowser",
      "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
      "pluginId": "cordova-plugin-inappbrowser",
      "clobbers": [
        "cordova.InAppBrowser.open",
        "window.open"
      ]
    },
    {
      "id": "cordova-plugin-inappbrowser.InAppBrowserProxy",
      "file": "plugins/cordova-plugin-inappbrowser/src/windows/InAppBrowserProxy.js",
      "pluginId": "cordova-plugin-inappbrowser",
      "runs": true
    },
    {
      "id": "cordova-plugin-ionic-webview.IonicWebView",
      "file": "plugins/cordova-plugin-ionic-webview/src/www/util.js",
      "pluginId": "cordova-plugin-ionic-webview",
      "clobbers": [
        "Ionic.WebView"
      ]
    },
    {
      "id": "cordova-plugin-splashscreen.SplashScreen",
      "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
      "pluginId": "cordova-plugin-splashscreen",
      "clobbers": [
        "navigator.splashscreen"
      ]
    },
    {
      "id": "cordova-plugin-splashscreen.SplashScreenProxy",
      "file": "plugins/cordova-plugin-splashscreen/www/windows/SplashScreenProxy.js",
      "pluginId": "cordova-plugin-splashscreen",
      "runs": true
    },
    {
      "id": "cordova-plugin-statusbar.statusbar",
      "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
      "pluginId": "cordova-plugin-statusbar",
      "clobbers": [
        "window.StatusBar"
      ]
    },
    {
      "id": "cordova-plugin-statusbar.StatusBarProxy",
      "file": "plugins/cordova-plugin-statusbar/src/windows/StatusBarProxy.js",
      "pluginId": "cordova-plugin-statusbar",
      "runs": true
    },
    {
      "id": "cordova-plugin-qrscanner.QRScanner",
      "file": "plugins/cordova-plugin-qrscanner/www/www.min.js",
      "pluginId": "cordova-plugin-qrscanner",
      "clobbers": [
        "QRScanner"
      ]
    },
    {
      "id": "cordova-plugin-qrscanner.qrScanner",
      "file": "plugins/cordova-plugin-qrscanner/src/windows/lib/qrScanner.js",
      "pluginId": "cordova-plugin-qrscanner",
      "runs": true
    },
    {
      "id": "cordova-plugin-qrscanner.preview",
      "file": "plugins/cordova-plugin-qrscanner/src/windows/lib/preview.js",
      "pluginId": "cordova-plugin-qrscanner",
      "runs": true
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-appversion": "1.0.0",
    "cordova-plugin-app-update": "2.0.2",
    "cordova-plugin-app-version": "0.1.9",
    "cordova-plugin-camera": "4.0.3",
    "cordova-plugin-device": "2.0.2",
    "cordova-plugin-inappbrowser": "3.0.0",
    "cordova-plugin-ionic-keyboard": "2.1.3",
    "cordova-plugin-ionic-webview": "2.3.1",
    "cordova-plugin-splashscreen": "5.0.2",
    "cordova-plugin-statusbar": "2.4.2",
    "cordova-plugin-whitelist": "1.3.3",
    "cordova-plugin-qrscanner": "2.6.0"
  };
});