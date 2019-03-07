import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { IonicModule, IonicRouteStrategy, Platform, AlertController, IonRouterOutlet } from '@ionic/angular';
import { ModalController, ActionSheetController, PopoverController, MenuController } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ReddahService } from './reddah.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LocalePage } from './locale/locale.page';
import { SafePipe } from './safe.pipe';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { Camera } from '@ionic-native/Camera/ngx'
import { PostviewerPage } from './postviewer/postviewer.page';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { LoginPage } from './login/login.page';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';

import { Toast } from '@ionic-native/toast/ngx';
import { CommentComponent } from './comment/comment.component';

@NgModule({
  declarations: [
    AppComponent,
    LocalePage,
    PostviewerPage,
    SafePipe,
    ImageViewerComponent,
    LoginPage,
    CommentComponent,
  ],
  entryComponents: [
    LocalePage,
    PostviewerPage,
    ImageViewerComponent,
    LoginPage,
  ],
  imports: [
    BrowserModule, 
    FormsModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  })
  ],
  exports:[
    
  ],
  providers: [
    AppVersion,
    AppUpdate,
    InAppBrowser,
    StatusBar,
    SplashScreen,
    AuthService,
    Camera,
    Toast,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    ReddahService,
    Platform,
    IonRouterOutlet,
    AlertController,
    AuthService,
    ModalController,
    ActionSheetController,
    PopoverController,
    MenuController,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}