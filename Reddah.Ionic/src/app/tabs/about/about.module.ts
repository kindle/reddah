import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AboutPage } from './about.page';
import { TranslateModule } from '@ngx-translate/core';
import { LazyLoadImageModule, intersectionObserverPreset, LoadImageProps, SetLoadedImageProps } from 'ng-lazyload-image';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: AboutPage }]),
    TranslateModule.forChild(),
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    })
  ],
  declarations: [AboutPage]
})
export class AboutPageModule {
  
}
