import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShareBoxComponent } from './share-box.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule.forChild()
  ],
  declarations: [ShareBoxComponent],
  exports: [ShareBoxComponent]
})
export class ShareBoxModule { }
