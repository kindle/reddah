import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CachedImageComponent } from './cached-image/cached-image.component';
import { TabsPageModule } from '../tabs/tabs.module';
import { IonicModule, ToastController } from '@ionic/angular';
import { TabsPage } from '../tabs/tabs.page';

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
  declarations: [CachedImageComponent],
  imports: [
    CommonModule,
    IonicModule,
    LazyLoadImageModule,
  ],
  exports: [CachedImageComponent],
  providers:[
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: LazyLoadImageHooks}
  ],
})
export class SharedComponentsModule { }
