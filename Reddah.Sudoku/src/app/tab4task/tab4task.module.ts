import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4taskPage } from './tab4task.page';
import { Tab4taskPageRoutingModule } from './tab4task-routing.module'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab4taskPage }]),
    Tab4taskPageRoutingModule,
  ],
  declarations: [Tab4taskPage]
})
export class Tab4taskPageModule {}
