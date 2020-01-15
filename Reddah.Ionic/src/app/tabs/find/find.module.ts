import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FindPage } from './find.page';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderModule } from '../../common/header/header.module';
import { LazyLoadImageModule, intersectionObserverPreset, LoadImageProps, SetLoadedImageProps } from 'ng-lazyload-image';

import { EarthBoxComponent } from '../../common/earth-box/earth-box.component';


@NgModule({
  //schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderModule,
    RouterModule.forChild([{ path: '', component: FindPage }]),
    TranslateModule.forChild(),
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    })
  ],
  declarations: [
    FindPage,EarthBoxComponent,
  ]
})
export class FindPageModule {
  
}
