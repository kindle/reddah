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
    "id": "cordova-plugin-file.DirectoryEntry",
    "file": "plugins/cordova-plugin-file/www/DirectoryEntry.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.DirectoryEntry"
    ]
  },
  {
    "id": "cordova-plugin-file.DirectoryReader",
    "file": "plugins/cordova-plugin-file/www/DirectoryReader.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.DirectoryReader"
    ]
  },
  {
    "id": "cordova-plugin-file.Entry",
    "file": "plugins/cordova-plugin-file/www/Entry.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.Entry"
    ]
  },
  {
    "id": "cordova-plugin-file.File",
    "file": "plugins/cordova-plugin-file/www/File.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.File"
    ]
  },
  {
    "id": "cordova-plugin-file.FileEntry",
    "file": "plugins/cordova-plugin-file/www/FileEntry.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.FileEntry"
    ]
  },
  {
    "id": "cordova-plugin-file.FileError",
    "file": "plugins/cordova-plugin-file/www/FileError.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.FileError"
    ]
  },
  {
    "id": "cordova-plugin-file.FileReader",
    "file": "plugins/cordova-plugin-file/www/FileReader.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.FileReader"
    ]
  },
  {
    "id": "cordova-plugin-file.FileSystem",
    "file": "plugins/cordova-plugin-file/www/FileSystem.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.FileSystem"
    ]
  },
  {
    "id": "cordova-plugin-file.FileUploadOptions",
    "file": "plugins/cordova-plugin-file/www/FileUploadOptions.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.FileUploadOptions"
    ]
  },
  {
    "id": "cordova-plugin-file.FileUploadResult",
    "file": "plugins/cordova-plugin-file/www/FileUploadResult.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.FileUploadResult"
    ]
  },
  {
    "id": "cordova-plugin-file.FileWriter",
    "file": "plugins/cordova-plugin-file/www/FileWriter.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.FileWriter"
    ]
  },
  {
    "id": "cordova-plugin-file.Flags",
    "file": "plugins/cordova-plugin-file/www/Flags.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.Flags"
    ]
  },
  {
    "id": "cordova-plugin-file.LocalFileSystem",
    "file": "plugins/cordova-plugin-file/www/LocalFileSystem.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.LocalFileSystem"
    ],
    "merges": [
      "window"
    ]
  },
  {
    "id": "cordova-plugin-file.Metadata",
    "file": "plugins/cordova-plugin-file/www/Metadata.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.Metadata"
    ]
  },
  {
    "id": "cordova-plugin-file.ProgressEvent",
    "file": "plugins/cordova-plugin-file/www/ProgressEvent.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.ProgressEvent"
    ]
  },
  {
    "id": "cordova-plugin-file.fileSystems",
    "file": "plugins/cordova-plugin-file/www/fileSystems.js",
    "pluginId": "cordova-plugin-file"
  },
  {
    "id": "cordova-plugin-file.requestFileSystem",
    "file": "plugins/cordova-plugin-file/www/requestFileSystem.js",
    "pluginId": "cordova-plugin-file",
    "clobbers": [
      "window.requestFileSystem"
    ]
  },
  {
    "id": "cordova-plugin-file.resolveLocalFileSystemURI",
    "file": "plugins/cordova-plugin-file/www/resolveLocalFileSystemURI.js",
    "pluginId": "cordova-plugin-file",
    "merges": [
      "window"
    ]
  },
  {
    "id": "cordova-plugin-file.isChrome",
    "file": "plugins/cordova-plugin-file/www/browser/isChrome.js",
    "pluginId": "cordova-plugin-file",
    "runs": true
  },
  {
    "id": "cordova-plugin-file.FileProxy",
    "file": "plugins/cordova-plugin-file/src/windows/FileProxy.js",
    "pluginId": "cordova-plugin-file",
    "runs": true
  },
  {
    "id": "cordova-plugin-file.fileSystemPaths",
    "file": "plugins/cordova-plugin-file/www/fileSystemPaths.js",
    "pluginId": "cordova-plugin-file",
    "merges": [
      "cordova"
    ],
    "runs": true
  },
  {
    "id": "cordova-plugin-photo-library.PhotoLibrary",
    "file": "plugins/cordova-plugin-photo-library/www/PhotoLibrary.js",
    "pluginId": "cordova-plugin-photo-library",
    "clobbers": [
      "cordova.plugins.photoLibrary"
    ]
  },
  {
    "id": "cordova-plugin-photo-library.async",
    "file": "plugins/cordova-plugin-photo-library/www/async/dist/async.min.js",
    "pluginId": "cordova-plugin-photo-library"
  },
  {
    "id": "cordova-plugin-photo-library.async_map",
    "file": "plugins/cordova-plugin-photo-library/www/async/dist/async.min.map",
    "pluginId": "cordova-plugin-photo-library"
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
  },
  {
    "id": "cordova-plugin-crop.CropPlugin",
    "file": "plugins/cordova-plugin-crop/www/crop.js",
    "pluginId": "cordova-plugin-crop",
    "clobbers": [
      "plugins.crop"
    ]
  },
  {
    "id": "cordova-plugin-file-transfer.FileTransferError",
    "file": "plugins/cordova-plugin-file-transfer/www/FileTransferError.js",
    "pluginId": "cordova-plugin-file-transfer",
    "clobbers": [
      "window.FileTransferError"
    ]
  },
  {
    "id": "cordova-plugin-file-transfer.FileTransfer",
    "file": "plugins/cordova-plugin-file-transfer/www/FileTransfer.js",
    "pluginId": "cordova-plugin-file-transfer",
    "clobbers": [
      "window.FileTransfer"
    ]
  },
  {
    "id": "cordova-plugin-file-transfer.FileTransferProxy",
    "file": "plugins/cordova-plugin-file-transfer/src/windows/FileTransferProxy.js",
    "pluginId": "cordova-plugin-file-transfer",
    "runs": true
  },
  {
    "id": "info.protonet.imageresizer.ImageResizer",
    "file": "plugins/info.protonet.imageresizer/www/image_resizer.js",
    "pluginId": "info.protonet.imageresizer",
    "clobbers": [
      "ImageResizer"
    ]
  },
  {
    "id": "info.protonet.imageresizer.ImageResizerProxy",
    "file": "plugins/info.protonet.imageresizer/src/windows/ImageResizerProxy.js",
    "pluginId": "info.protonet.imageresizer",
    "merges": [
      ""
    ]
  },
  {
    "id": "cordova-plugin-media-capture.CaptureAudioOptions",
    "file": "plugins/cordova-plugin-media-capture/www/CaptureAudioOptions.js",
    "pluginId": "cordova-plugin-media-capture",
    "clobbers": [
      "CaptureAudioOptions"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.CaptureImageOptions",
    "file": "plugins/cordova-plugin-media-capture/www/CaptureImageOptions.js",
    "pluginId": "cordova-plugin-media-capture",
    "clobbers": [
      "CaptureImageOptions"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.CaptureVideoOptions",
    "file": "plugins/cordova-plugin-media-capture/www/CaptureVideoOptions.js",
    "pluginId": "cordova-plugin-media-capture",
    "clobbers": [
      "CaptureVideoOptions"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.CaptureError",
    "file": "plugins/cordova-plugin-media-capture/www/CaptureError.js",
    "pluginId": "cordova-plugin-media-capture",
    "clobbers": [
      "CaptureError"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.MediaFileData",
    "file": "plugins/cordova-plugin-media-capture/www/MediaFileData.js",
    "pluginId": "cordova-plugin-media-capture",
    "clobbers": [
      "MediaFileData"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.MediaFile",
    "file": "plugins/cordova-plugin-media-capture/www/MediaFile.js",
    "pluginId": "cordova-plugin-media-capture",
    "clobbers": [
      "MediaFile"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.helpers",
    "file": "plugins/cordova-plugin-media-capture/www/helpers.js",
    "pluginId": "cordova-plugin-media-capture",
    "runs": true
  },
  {
    "id": "cordova-plugin-media-capture.capture",
    "file": "plugins/cordova-plugin-media-capture/www/capture.js",
    "pluginId": "cordova-plugin-media-capture",
    "clobbers": [
      "navigator.device.capture"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.MediaFile2",
    "file": "plugins/cordova-plugin-media-capture/src/windows/MediaFile.js",
    "pluginId": "cordova-plugin-media-capture",
    "merges": [
      "MediaFile"
    ]
  },
  {
    "id": "cordova-plugin-media-capture.CaptureProxy",
    "file": "plugins/cordova-plugin-media-capture/src/windows/CaptureProxy.js",
    "pluginId": "cordova-plugin-media-capture",
    "runs": true
  },
  {
    "id": "cordova-plugin-media.MediaError",
    "file": "plugins/cordova-plugin-media/www/MediaError.js",
    "pluginId": "cordova-plugin-media",
    "clobbers": [
      "window.MediaError"
    ]
  },
  {
    "id": "cordova-plugin-media.Media",
    "file": "plugins/cordova-plugin-media/www/Media.js",
    "pluginId": "cordova-plugin-media",
    "clobbers": [
      "window.Media"
    ]
  },
  {
    "id": "cordova-plugin-media.MediaProxy",
    "file": "plugins/cordova-plugin-media/src/windows/MediaProxy.js",
    "pluginId": "cordova-plugin-media",
    "runs": true
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
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
  "cordova-plugin-file": "6.0.1",
  "cordova-plugin-photo-library": "2.2.1",
  "cordova-plugin-qrscanner": "2.6.0",
  "cordova-plugin-add-swift-support": "1.7.2",
  "cordova-plugin-crop": "0.3.1",
  "cordova-plugin-file-transfer": "1.7.1",
  "info.protonet.imageresizer": "0.1.1",
  "cordova-plugin-media-capture": "3.0.2",
  "cordova-plugin-media": "5.0.2"
};
// BOTTOM OF METADATA
});