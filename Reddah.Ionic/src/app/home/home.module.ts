import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
      IonicModule,
      CommonModule,
      HeaderModule,
      FormsModule,
      RouterModule.forChild([{ path: '', component: HomePage }]),
      TranslateModule.forChild(),
  ],
  declarations: [
      HomePage,
  ]
})
export class HomePageModule {}
