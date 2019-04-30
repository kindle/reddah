import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
  @Input() index = 0;
  @Input() imgSourceArray: any = [];
  @Input() imgTitle = '';
  @Input() imgDescription = '';

  slideOpts = {};

  constructor(private modalController: ModalController) {}

  ngOnInit() {
      this.slideOpts = {
          centeredSlides: 'true',
          initialSlide: this.index,
      };
  }

  org(src){
    return src.replace("_reddah_preview","")
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
