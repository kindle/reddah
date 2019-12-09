import { IonicModule } from '@ionic/angular';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs.router.module';

import { TabsPage } from './tabs.page';
import { ContactPageModule } from './contact/contact.module';
import { AboutPageModule } from './about/about.module';
import { FindPageModule } from './find/find.module';
import { HomePageModule } from './home/home.module';
//import { MessagePageModule } from './message/message.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { PublisherPageModule } from './publisher/publisher.module';
import { DirectivesModule } from '../directives.module';
import { HttpLoaderFactory } from '../app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
    
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      TabsPageRoutingModule,
      HomePageModule,
      //MessagePageModule,
      AboutPageModule,
      FindPageModule,
      ContactPageModule,
      PublisherPageModule,
      TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
          }
      }),
      DirectivesModule,
  ],
  declarations: [
      TabsPage
  ],
  exports:[
  ],
})
export class TabsPageModule {}
