import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderModule } from '../../common/header/header.module';
import { LazyLoadImageModule, intersectionObserverPreset, LoadImageProps, SetLoadedImageProps } from 'ng-lazyload-image';
import { ArticleActionBarComponent } from './article-action-bar/article-action-bar.component';


@NgModule({
  imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      HeaderModule,
      RouterModule.forChild([{ path: '', component: HomePage }]),
      TranslateModule.forChild(),
      LazyLoadImageModule.forRoot({
        preset: intersectionObserverPreset
      })
  ],
  declarations: [
      HomePage,
      ArticleActionBarComponent,
  ]
})
export class HomePageModule {}
