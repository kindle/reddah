import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabLevelPage } from './tablevel.page';
import { TabLevelPageRoutingModule } from './tablevel-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabLevelPageRoutingModule
  ],
  declarations: [TabLevelPage]
})
export class TabLevelPageModule {}
