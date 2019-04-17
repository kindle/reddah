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
import { ScanPage } from './scan/scan.page';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';

import { AddCommentPage } from './add-comment/add-comment.page';
import { Toast } from '@ionic-native/toast/ngx';
import { CommentComponent } from './comment/comment.component';
import { CommentTimelineComponent } from './commentts/comment.component';
import { TimeLinePage } from './timeline/timeline.page';
import { UserPage } from './user/user.page';
import { ArticlePopPage } from './article-pop/article-pop.page'
import { CommentPopPage } from './article-pop/comment-pop.page'
import { TimelinePopPage } from './article-pop/timeline-pop.page'
import { TimelineCommentPopPage } from './article-pop/timeline-comment-pop.page'
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { IonicImageLoader } from 'ionic-image-loader';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { CacheModule } from "ionic-cache";

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
    CommentTimelineComponent,
    TimeLinePage,
    UserPage,
    ArticlePopPage,
    CommentPopPage,
    TimelinePopPage,
    TimelineCommentPopPage,
    ScanPage,
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
    TimelineCommentPopPage,
    ScanPage,
  ],
  imports: [
    BrowserModule, 
    FormsModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    IonicImageLoader.forRoot(),
    CacheModule.forRoot(),
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
    File,
    WebView,
    FileTransfer,
    Crop,
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
    IonicImageLoader,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}