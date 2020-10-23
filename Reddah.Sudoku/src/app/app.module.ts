import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReddahService } from './reddah.service';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { HttpClientModule } from '@angular/common/http';
import { Globalization } from '@ionic-native/globalization/ngx';
import { LocalePage } from './locale/locale.page';
import { PassPage } from './pass/pass.page';

@NgModule({
  declarations: [
    AppComponent,
    LocalePage,
    PassPage,
  ],
  entryComponents: [
    LocalePage,
    PassPage,
  ],
  imports: [
    BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    NgxWebstorageModule.forRoot(),
    HttpClientModule,
  ],
  providers: [
    //StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ReddahService,
    Globalization,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
