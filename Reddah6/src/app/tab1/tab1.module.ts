import { IonicModule, ToastController } from '@ionic/angular';
import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { Attributes, IntersectionObserverHooks, LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS } from 'ng-lazyload-image';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Injectable()
export class LazyLoadImageHooks extends IntersectionObserverHooks {
  toast: any;

  constructor(private toastCtrl: ToastController){
    super();
  };

  setup(attributes: Attributes){
    attributes.offset = 10;
    attributes.defaultImagePath = './assets/noimage.jpg';
    attributes.errorImagePath = './assets/broken.jpeg';
    return super.setup(attributes);
  }

  loadImage(attributes: Attributes){
    return from(this.toastCtrl.create({message: 'Start loading...', duration: 2000})).pipe(
      switchMap(toast=>toast.present()),
      switchMap(_ =>super.loadImage(attributes))
    );
  }

}

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    LazyLoadImageModule,
  ],
  declarations: [Tab1Page],
  providers:[
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: LazyLoadImageHooks}
  ]
})
export class Tab1PageModule {}

