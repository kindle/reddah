import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { ArticleActionBarComponent } from './article-action-bar/article-action-bar.component';
import { HeaderModule } from '../common/header/header.module';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    HeaderModule,
  ],
  declarations: [Tab1Page, ArticleActionBarComponent]
})
export class Tab1PageModule {}
