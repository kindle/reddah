import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { JsonpModule } from '@angular/http';
import { AlertController, ActionSheetController, 
         IonicModule, IonicRouteStrategy, IonRouterOutlet,
         Platform, PopoverController,
         ModalController, MenuController } from '@ionic/angular';


import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera } from '@ionic-native/Camera/ngx'
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';


import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { IonicImageLoader } from 'ionic-image-loader';
import { CacheModule } from "ionic-cache";
import { DragulaModule } from 'ng2-dragula';
import { NgxQRCodeModule } from 'ngx-qrcode2';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReddahService } from './reddah.service';
import { LocalePage } from './common/locale/locale.page';
import { SafePipe } from './safe.pipe';
import { PostviewerPage } from './postviewer/postviewer.page';
import { ImageViewerComponent } from './common/image-viewer/image-viewer.component';
import { LoginPage } from './login/login.page';
import { ScanPage } from './common/scan/scan.page';
import { AuthService } from './auth.service';
import { AddCommentPage } from './postviewer/add-comment/add-comment.page';
import { AddFriendPage } from './friend/add-friend/add-friend.page';
import { ApplyFriendPage } from './friend/apply-friend/apply-friend.page';
import { ChangePhotoPage } from './common/change-photo/change-photo.page';
import { MyInfoPage } from './common/my-info/my-info.page';
import { NewFriendPage } from './friend/new-friend/new-friend.page';
import { CommentComponent } from './postviewer/comment/comment.component';
import { CommentTimelineComponent } from './mytimeline/commentts/comment.component';
import { TimeLinePage } from './mytimeline/timeline/timeline.page';
import { MyTimeLinePage } from './mytimeline/mytimeline.page';
import { UserPage } from './common/user/user.page';
import { ArticlePopPage } from './common/article-pop.page'
import { HeaderAddPage } from './common/header-add-pop.page'
import { ChangeCoverPopPage } from './common/change-cover-pop.page'
import { ArticleTextPopPage } from './common/article-text-pop.page'
import { CommentPopPage } from './common/comment-pop.page'
import { TimelinePopPage } from './common/timeline-pop.page'
import { TimelineCommentPopPage } from './common/timeline-comment-pop.page'
import { TsViewerPage } from './mytimeline/tsviewer/tsviewer.page'
import { AddTimelinePage } from './mytimeline/add-timeline/add-timeline.page';
import { StockPage } from './common/stock/stock.page';
import { CommentReplyPage } from './postviewer/comment-reply/comment-reply.page';
import { AutoresizeDirective } from './autoresize-textarea.directive';
import { CommentBoxComponent } from './postviewer/comment-box/comment-box.component';
import { SearchPage } from './common/search/search.page';
import { SearchUserPage } from './friend/search-user/search-user.page';
import { QrcardPage } from './common/qrcard/qrcard.page';


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
      ActionSheetController,
      AppVersion,
      AppUpdate,
      AlertController,
      AuthService,
      Camera,
      Crop,
      InAppBrowser,
      IonicImageLoader,
      IonRouterOutlet,
      File,
      FileTransfer,
      FileTransferObject,
      MenuController,
      ModalController,
      PhotoLibrary,
      Platform,
      PopoverController,
      QRScanner,
      ReddahService,
      StatusBar,
      SplashScreen,
      Toast,
      WebView,
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}