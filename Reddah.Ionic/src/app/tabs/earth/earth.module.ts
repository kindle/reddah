import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EarthPage } from './earth.page';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderModule } from '../../common/header/header.module';

@NgModule({
  imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      HeaderModule,
      RouterModule.forChild([{ path: 'map', component: EarthPage }]),
      TranslateModule.forChild(),
  ],
  declarations: [
      EarthPage,
  ]
})
export class EarthPageModule {}
