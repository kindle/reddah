import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2levelPage } from './tab2level.page';
import { Tab4PageRoutingModule } from './tab2level-routing.module'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab2levelPage }]),
    Tab4PageRoutingModule,
  ],
  declarations: [Tab2levelPage]
})
export class Tab4PageModule {}
