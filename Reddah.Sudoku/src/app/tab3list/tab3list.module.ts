import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3listPage } from './tab3list.page';
import { Tab3listPageRoutingModule } from './tab3list-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab3listPageRoutingModule
  ],
  declarations: [Tab3listPage]
})
export class Tab3listPageModule {}
