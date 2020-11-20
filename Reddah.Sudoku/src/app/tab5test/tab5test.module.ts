import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab5TestPage } from './tab5test.page';
import { Tab5TestPageRoutingModule } from './tab5test-routing.module'
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    RouterModule.forChild([{ path: '', component: Tab5TestPage }]),
    Tab5TestPageRoutingModule,
  ],
  declarations: [Tab5TestPage]
})
export class Tab5TestPageModule {}
