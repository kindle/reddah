import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1homePage } from './tab1home.page';
import { Tab1homePageRoutingModule } from './tab1home-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1homePageRoutingModule
  ],
  declarations: [Tab1homePage]
})
export class Tab1homePageModule {}
