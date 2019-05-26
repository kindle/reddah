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
import { HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { HttpModule,JsonpModule } from '@angular/http';
import { Camera } from '@ionic-native/Camera/ngx'
import { PostviewerPage } from './postviewer/postviewer.page';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { LoginPage } from './login/login.page';
import { ScanPage } from './scan/scan.page';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';

import { AddCommentPage } from './add-comment/add-comment.page';
import { AddFriendPage } from './friend/add-friend/add-friend.page';
import { ApplyFriendPage } from './friend/apply-friend/apply-friend.page';
import { ChangePhotoPage } from './change-photo/change-photo.page';
import { MyInfoPage } from './my-info/my-info.page';
import { NewFriendPage } from './friend/new-friend/new-friend.page';
import { Toast } from '@ionic-native/toast/ngx';
import { CommentComponent } from './comment/comment.component';
import { CommentTimelineComponent } from './commentts/comment.component';
import { TimeLinePage } from './timeline/timeline.page';
import { MyTimeLinePage } from './mytimeline/mytimeline.page';
import { UserPage } from './user/user.page';
import { ArticlePopPage } from './article-pop/article-pop.page'
import { HeaderAddPage } from './article-pop/header-add-pop.page'
import { ChangeCoverPopPage } from './article-pop/change-cover-pop.page'
import { ArticleTextPopPage } from './article-pop/article-text-pop.page'
import { CommentPopPage } from './article-pop/comment-pop.page'
import { TimelinePopPage } from './article-pop/timeline-pop.page'
import { TimelineCommentPopPage } from './article-pop/timeline-comment-pop.page'
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { IonicImageLoader } from 'ionic-image-loader';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { CacheModule } from "ionic-cache";
import { TsViewerPage } from './tsviewer/tsviewer.page'
import { AddTimelinePage } from './add-timeline/add-timeline.page';
import { DragulaModule } from 'ng2-dragula';
import { StockPage } from './stock/stock.page';
import { CommentReplyPage } from './comment-reply/comment-reply.page';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { AutoresizeDirective } from './autoresize-textarea.directive';
import { CommentBoxComponent } from './comment-box/comment-box.component';
import { SearchPage } from './search/search.page';
import { SearchUserPage } from './friend/search-user/search-user.page';
import { QrcardPage } from './qrcard/qrcard.page';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  declarations: [
      AppComponent,
      LocalePage,
      AddCommentPage,
      AddFriendPage,
      ApplyFriendPage,
      ChangePhotoPage,
      MyInfoPage,
      NewFriendPage,
      PostviewerPage,
      SafePipe,
      ImageViewerComponent,
      LoginPage,
      CommentComponent,
      CommentTimelineComponent,
      TimeLinePage,
      MyTimeLinePage,
      UserPage,
      ArticlePopPage,
      HeaderAddPage,
      ChangeCoverPopPage,
      ArticleTextPopPage,
      CommentPopPage,
      TimelinePopPage,
      TimelineCommentPopPage,
      ScanPage,
      TsViewerPage,
      AddTimelinePage,
      StockPage,
      ProgressBarComponent,
      CommentReplyPage,
      AutoresizeDirective,
      CommentBoxComponent,
      SearchPage,
      SearchUserPage,
      QrcardPage,
  ],
  entryComponents: [
      LocalePage,
      PostviewerPage,
      ImageViewerComponent,
      LoginPage,
      AddCommentPage,
      AddFriendPage,
      ApplyFriendPage,
      ChangePhotoPage,
      MyInfoPage,
      NewFriendPage,
      ArticlePopPage,
      HeaderAddPage,
      ChangeCoverPopPage,
      ArticleTextPopPage,
      CommentPopPage,
      TimelinePopPage,
      TimelineCommentPopPage,
      ScanPage,
      UserPage,
      TimeLinePage,
      TsViewerPage,
      AddTimelinePage,
      StockPage,
      CommentReplyPage,
      SearchPage,
      SearchUserPage,
      QrcardPage,
  ],
  imports: [
      BrowserModule, 
      FormsModule,
      IonicModule.forRoot(), 
      AppRoutingModule,
      HttpClientModule,
      JsonpModule,
      HttpClientJsonpModule,
      IonicImageLoader.forRoot(),
      CacheModule.forRoot(),
      NgxWebstorageModule.forRoot(),
      DragulaModule.forRoot(),
      TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
          }
      }),
      NgxQRCodeModule,
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
      IonicImageLoader,
      File,
      FileTransfer,
      FileTransferObject,
      WebView,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}