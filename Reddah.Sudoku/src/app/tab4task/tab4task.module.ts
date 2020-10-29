import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4taskPage } from './tab4task.page';
import { Tab5taskPageRoutingModule } from './tab4task-routing.module'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab4taskPage }]),
    Tab5taskPageRoutingModule,
  ],
  declarations: [Tab4taskPage]
})
export class Tab5taskPageModule {}
