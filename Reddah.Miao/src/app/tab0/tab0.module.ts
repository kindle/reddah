import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab0Page } from './tab0.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab0PageRoutingModule } from './tab0-routing.module'
import { FindActionBarComponent } from './find-action-bar/find-action-bar.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    RouterModule.forChild([{ path: '', component: Tab0Page }]),
    Tab0PageRoutingModule,
  ],
  declarations: [Tab0Page,FindActionBarComponent]
})
export class Tab0PageModule {}
