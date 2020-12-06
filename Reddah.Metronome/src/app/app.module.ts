import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReddahService } from './reddah.service';
import { LocalePage } from './locale/locale.page';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { HttpClientModule } from '@angular/common/http';
import { Globalization } from '@ionic-native/globalization/ngx';

@NgModule({
  declarations: [
    AppComponent,
    LocalePage,
  ],
  entryComponents: [
    LocalePage,
  ],
  imports: [
    BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    NgxWebstorageModule.forRoot(),
    HttpClientModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ReddahService,
    Globalization,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
