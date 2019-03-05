import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Article } from '../article';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import {Location} from '@angular/common';

@Component({
  selector: 'app-postviewer',
  templateUrl: './postviewer.page.html',
  styleUrls: ['./postviewer.page.scss'],
})
export class PostviewerPage implements OnInit {
  @Input() article: Article;
  constructor(public modalController: ModalController,
    private location: Location) { }

  ngOnInit() {
  }

  htmlDecode(text: string) {
    var temp = document.createElement("div");
      temp.innerHTML = text;
      var output = temp.innerText || temp.textContent;
      temp = null;
      //output = output.replace(/src=\"\/uploadPhoto/g, "imageViewer src=\"\/\/\/reddah.com\/uploadPhoto");
      output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
      return output;
  }

  async viewer(event){
    var target = event.target || event.srcElement || event.currentTarget;
    if(target.tagName.toUpperCase()==="IMG"){
      //PhotoViewer.show(target.src, 'view photo', options);
      //PhotoViewer.show(target.src);
      const modal = await this.modalController.create({
        component: ImageViewerComponent,
        componentProps: {
          imgSource: target.src,
          imgTitle: "",
          imgDescription: ""
        },
        cssClass: 'modal-fullscreen',
        keyboardClose: true,
        showBackdrop: true
      });
  
      return await modal.present();
    }
  }

  goback(){
      this.location.back();
  }
}
