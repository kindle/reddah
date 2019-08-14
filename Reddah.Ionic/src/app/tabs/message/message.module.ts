import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagePage } from './message.page';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderModule } from '../../common/header/header.module';
import { LazyLoadImageModule, intersectionObserverPreset, LoadImageProps, SetLoadedImageProps } from 'ng-lazyload-image';


@NgModule({
  imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      HeaderModule,
      RouterModule.forChild([{ path: '', component: MessagePage }]),
      TranslateModule.forChild(),
      LazyLoadImageModule.forRoot({
        preset: intersectionObserverPreset
      })
  ],
  declarations: [
      MessagePage,
  ]
})
export class MessagePageModule {}
