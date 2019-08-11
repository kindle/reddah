import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs.router.module';

import { TabsPage } from './tabs.page';
import { ContactPageModule } from './contact/contact.module';
import { AboutPageModule } from './about/about.module';
import { FindPageModule } from './find/find.module';
import { HomePageModule } from './home/home.module';
import { MessagePageModule } from './message/message.module';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherPageModule } from './publisher/publisher.module';

@NgModule({
  imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      TabsPageRoutingModule,
      HomePageModule,
      MessagePageModule,
      AboutPageModule,
      FindPageModule,
      ContactPageModule,
      PublisherPageModule,
      TranslateModule.forChild(),
  ],
  declarations: [
      TabsPage
  ],
  exports:[
  ]
})
export class TabsPageModule {}
