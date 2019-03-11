import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';

@Component({
  template: `
    <ion-list>
      <ion-item button (click)="takePhoto()">
          <ion-label>拍摄</ion-label>
      </ion-item>
      <ion-item button (click)="selectFrom()">
          <ion-label>从相册选择</ion-label>
      </ion-item>
    </ion-list>{{debug}}
  `
})
export class TimelinePopPage {
  constructor(
    public popoverCtrl: PopoverController,
    private photoLibrary: PhotoLibrary,
    ) {}

  takePhoto(){
    
  }

  debug="";

  selectFrom(){
    this.photoLibrary.requestAuthorization().then(() => {
      this.photoLibrary.getLibrary().subscribe({
        next: library => {
          library.forEach(function(libraryItem) {
            this.debug += libraryItem.photoURL;
            console.log(libraryItem.id);          // ID of the photo
            console.log(libraryItem.photoURL);    // Cross-platform access to photo
            console.log(libraryItem.thumbnailURL);// Cross-platform access to thumbnail
            console.log(libraryItem.fileName);
            console.log(libraryItem.width);
            console.log(libraryItem.height);
            console.log(libraryItem.creationDate);
            console.log(libraryItem.latitude);
            console.log(libraryItem.longitude);
            console.log(libraryItem.albumIds);    // array of ids of appropriate AlbumItem, only of includeAlbumsData was used
          });
        },
        error: err => { console.log('could not get photos'); },
        complete: () => { console.log('done getting photos'); }
      });
    })
    .catch(err => console.log('permissions weren\'t granted'));
  }
}
