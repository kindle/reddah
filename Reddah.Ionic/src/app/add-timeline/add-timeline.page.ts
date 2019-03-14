import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular'
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'app-add-timeline',
  templateUrl: './add-timeline.page.html',
  styleUrls: ['./add-timeline.page.scss'],
})
export class AddTimelinePage implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

  photos: Array<string>;
  commentContent: string;

  submit(){
    
  }

  async addNewPhoto(ev: any) {
    const popover = await this.popoverController.create({
        component: TimelinePopPage,
        event: ev,
        translucent: true
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if(data==1)//photo
    {
        await this.takePhoto();
    }
    else//from library
    {

    }
  }

  async takePhoto(){
      const options: CameraOptions = {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE
        }
        
        Camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64 (DATA_URL):
        //alert(imageData)
        this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
        }, (err) => {
        // Handle error
        alert("error "+JSON.stringify(err))
        });
      
  }

  async fromLib(){
    const options: CameraOptions = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE
      }
      
      Camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      //alert(imageData)
      this.photos.push((<any>window).Ionic.WebView.convertFileSrc(imageData));
      }, (err) => {
      // Handle error
      alert("error "+JSON.stringify(err))
      });
    
}


}
