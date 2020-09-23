import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { ArticleActionBarComponent } from './article-action-bar/article-action-bar.component';
import { HeaderCatModule } from '../common/headercat/headercat.module';
import { FindActionBarComponent } from './find-action-bar/find-action-bar.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    HeaderCatModule,
  ],
  declarations: [Tab1Page, ArticleActionBarComponent,FindActionBarComponent]
})
export class Tab1PageModule {}
