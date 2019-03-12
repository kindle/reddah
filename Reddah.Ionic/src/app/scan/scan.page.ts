import { Component, OnInit } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

  constructor() { }

  debug = "";
  ngOnInit() {
    // Show scanner 

        // Optionally request the permission early
        QRScanner.prepare()
        .then((status: QRScannerStatus) => {
          if (status.authorized) {
            // camera permission was granted
            this.debug+= "authorized"
            
            // start scanning
            let scanSub = QRScanner.scan().subscribe((text: string) => {
              console.log('Scanned something', text);
              alert(text);
              this.debug+= text;
              QRScanner.hide(); // hide camera preview
              scanSub.unsubscribe(); // stop scanning
            });

            QRScanner.resumePreview();

            // show camera preview
            QRScanner.show()
                .then((data: QRScannerStatus) => {
                    console.log('datashowing', data.showing);
                    this.debug+= data.showing
                }, err => {
                    console.log('show error', err);
                    this.debug+= err;
                });


          } else if (status.denied) {
            // camera permission was permanently denied
            // you must use QRScanner.openSettings() method to guide the user to the settings page
            // then they can grant the permission from there
            this.debug+= "denied"
          } else {
            // permission was denied, but not permanently. You can ask for permission again at a later time.
            this.debug+= "else"
          }
        })
        .catch((e: any) => {console.log('Error is', e);this.debug+= e});

        

        (window.document.querySelector('html') as HTMLElement).classList.add('cameraView');
    }

    closeScanner() {
      (window.document.querySelector('html') as HTMLElement).classList.remove('cameraView');
    }

    light=false;
    frontCamera=false;
    
    toggleLight() {
      if (this.light) {
        QRScanner.disableLight();
      } else {
        QRScanner.enableLight();
      }
      this.light = !this.light;
    }
  
    toggleCamera() {
      if (this.frontCamera) {
        QRScanner.useBackCamera();
      } else {
        QRScanner.useFrontCamera();
      }
      this.frontCamera = !this.frontCamera;
    }

}
