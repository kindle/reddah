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

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Camera } from '@ionic-native/Camera/ngx'
import { PostviewerPage } from './postviewer/postviewer.page';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { LoginPage } from './login/login.page';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';

import { AddCommentPage } from './add-comment/add-comment.page';
import { Toast } from '@ionic-native/toast/ngx';
import { CommentComponent } from './comment/comment.component';
import { TimeLinePage } from './timeline/timeline.page';
import { ArticlePopPage } from './article-pop/article-pop.page'
import { CommentPopPage } from './article-pop/comment-pop.page'
import { TimelinePopPage } from './article-pop/timeline-pop.page'
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';


@NgModule({
  declarations: [
    AppComponent,
    LocalePage,
    AddCommentPage,
    PostviewerPage,
    SafePipe,
    ImageViewerComponent,
    LoginPage,
    CommentComponent,
    TimeLinePage,
    ArticlePopPage,
    CommentPopPage,
    TimelinePopPage,
  ],
  entryComponents: [
    LocalePage,
    PostviewerPage,
    ImageViewerComponent,
    LoginPage,
    AddCommentPage,
    ArticlePopPage,
    CommentPopPage,
    TimelinePopPage,
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
    QRScanner,
    PhotoLibrary,
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