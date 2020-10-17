import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabLevelPage } from './tablevel.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabLevelPageRoutingModule } from './tablevel-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TabLevelPageRoutingModule
  ],
  declarations: [TabLevelPage]
})
export class TabLevelPageModule {}
