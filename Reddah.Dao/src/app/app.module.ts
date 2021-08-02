import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReddahService } from './reddah.service';
import { VideosPage } from './videos/videos.page';

@NgModule({
  declarations: [
    AppComponent,
    VideosPage,
  ],
  entryComponents: [
    VideosPage,
  ],
  imports: [
    HttpClientModule,
    BrowserModule, 
    IonicModule.forRoot(), 
    NgxWebstorageModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    ReddahService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
