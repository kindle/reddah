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
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
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
//import { AngularFireModule } from 'angularfire2';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { MediaCapture, MediaFile, CaptureError, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx'; 
import { Shake } from '@ionic-native/shake/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { IonicImageLoader } from 'ionic-image-loader';
import { CacheModule } from "ionic-cache";
import { DragulaModule } from 'ng2-dragula';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { Globalization } from '@ionic-native/globalization/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ReddahService } from './reddah.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocalePage } from './common/locale/locale.page';
import { LocationPage } from './common/location/location.page'
import { SafePipe } from './safe.pipe';
import { PostviewerPage } from './postviewer/postviewer.page';
import { ImageViewerComponent } from './common/image-viewer/image-viewer.component';
import { VideoViewerComponent } from './common/video-viewer/video-viewer.component';
import { SurfacePage } from './surface/surface.page';
import { RegisterPage } from './surface/register/register.page';
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
import { AddFeedbackPage } from './mytimeline/add-feedback/add-feedback.page';
import { StockPage } from './common/stock/stock.page';
import { CommentReplyPage } from './postviewer/comment-reply/comment-reply.page';
import { AutoresizeDirective } from './autoresize-textarea.directive';
import { CommentBoxComponent } from './postviewer/comment-box/comment-box.component';
import { ChatBoxComponent } from './chat/chat-box/chat-box.component';
import { SearchPage } from './common/search/search.page';
import { MessagePage } from './mytimeline/message/message.page'
import { SearchUserPage } from './friend/search-user/search-user.page';
import { QrcardPage } from './common/qrcard/qrcard.page';
import { SettingListPage } from './settings/setting-list/setting-list.page';
import { SettingGePage } from './settings/setting-ge/setting-ge.page';
import { SettingAboutPage } from './settings/setting-about/setting-about.page';
import { SettingNoteLabelPage } from './settings/setting-note-label/setting-note-label.page';
import { SettingGroupChatTitlePage } from './settings/setting-group-chat-title/setting-group-chat-title.page';
import { ChangeNoteNamePopPage } from './common/change-notename-pop.page';
import { SettingAccountPage } from './settings/setting-account/setting-account.page';
import { SettingPrivacyPage } from './settings/setting-privacy/setting-privacy.page';
import { ShakePage } from './shake/shake.page';
import { ChatPage } from './chat/chat.page';
import { GroupChatPage } from './chat/group-chat.page';
import { ChatOptPage } from './chat/chat-opt/chat-opt.page';
import { GroupChatOptPage } from './chat/group-chat-opt/group-chat-opt.page';
import { ChatChooseUserPage } from './chat/chat-choose-user/chat-choose-user.page';
import { ChooseUserPage } from './common/choose-user/choose-user.page';
import { ChatChooseGroupPage } from './chat/chat-choose-group/chat-choose-group.page';
import { BookmarkPage } from './bookmark/bookmark.page';
import { BookmarkPopPage } from './common/bookmark-pop.page';
import { SigninPage } from './surface/signin/signin.page';
import { SettingNickNamePage } from './settings/setting-nickname/setting-nickname.page'
import { SettingSignaturePage } from './settings/setting-signature/setting-signature.page'
import { SettingFontPage } from './settings/setting-font/setting-font.page';

var firebaseConfig = {
    apiKey: "AIzaSyBKOOSwSguEIBc--d6QbUSkO4m2G7Au9fY",
    authDomain: "reddah-com.firebaseapp.com",
    databaseURL: "https://reddah-com.firebaseio.com",
    projectId: "reddah-com",
    storageBucket: "reddah-com.appspot.com",
    messagingSenderId: "64237460591",
    appId: "1:64237460591:web:4f2a4411eca1162f"
  };

@NgModule({
    declarations: [
        AppComponent,
        BookmarkPage,
        BookmarkPopPage,
        LocalePage,LocationPage,
        ChooseUserPage,
        AddCommentPage,
        AddFriendPage,
        ApplyFriendPage,
        ChangePhotoPage,
        ChangeNoteNamePopPage,
        ChatPage,
        GroupChatPage,
        ChatOptPage,
        GroupChatOptPage,
        ChatChooseUserPage,
        ChatChooseGroupPage,
        MyInfoPage,MessagePage,
        NewFriendPage,
        PostviewerPage,
        SafePipe,
        ImageViewerComponent,VideoViewerComponent,
        SurfacePage,
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
        SigninPage,
        TsViewerPage,
        AddTimelinePage,
        AddFeedbackPage,
        StockPage,
        CommentReplyPage,
        AutoresizeDirective,
        CommentBoxComponent,
        ChatBoxComponent,
        SearchPage,
        ShakePage,
        SearchUserPage,
        SettingAboutPage,
        SettingGePage,
        SettingListPage,
        SettingNoteLabelPage,
        SettingGroupChatTitlePage,SettingFontPage,
        QrcardPage,
        SettingAccountPage,
        SettingPrivacyPage,
        RegisterPage,
        SettingNickNamePage,SettingSignaturePage,
    ],
    entryComponents: [
        BookmarkPage,
        BookmarkPopPage,
        LocalePage,LocationPage,
        ChooseUserPage,
        PostviewerPage,
        ImageViewerComponent,VideoViewerComponent,
        SurfacePage,
        AddCommentPage,
        AddFriendPage,
        ApplyFriendPage,
        ChangePhotoPage,
        ChangeNoteNamePopPage,
        ChatPage,
        GroupChatPage,
        ChatOptPage,
        GroupChatOptPage,
        ChatChooseUserPage,
        ChatChooseGroupPage,
        MyInfoPage,MessagePage,
        NewFriendPage,
        ArticlePopPage,
        HeaderAddPage,
        ChangeCoverPopPage,
        ArticleTextPopPage,
        CommentPopPage,
        TimelinePopPage,
        TimelineCommentPopPage,
        ScanPage,
        SigninPage,
        UserPage,
        TimeLinePage,
        TsViewerPage,
        AddTimelinePage,
        AddFeedbackPage,
        StockPage,
        CommentReplyPage,
        SearchPage,
        ShakePage,
        SearchUserPage,
        SettingAboutPage,
        SettingGePage,
        SettingListPage,
        SettingNoteLabelPage,
        SettingGroupChatTitlePage,SettingFontPage,
        QrcardPage,
        SettingAccountPage,
        SettingPrivacyPage,
        RegisterPage,
        SettingNickNamePage,SettingSignaturePage,
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
        //AngularFireModule.initializeApp(firebaseConfig),
        //AngularFireDatabaseModule,
    ],
    exports:[
    ],
    providers: [
        ActionSheetController,
        AppVersion,
        AppUpdate,
        AlertController,
        AuthService,
        AndroidPermissions,
        Camera,
        Shake,
        Crop,
        InAppBrowser,
        IonicImageLoader,
        IonRouterOutlet,
        File,
        FileTransfer,
        FileTransferObject,
        Globalization,
        Geolocation,
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
        MediaCapture,
        Media,
        NativeAudio,
        VideoEditor,
        //Firebase,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}