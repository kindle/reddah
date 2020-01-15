import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { JsonpModule } from '@angular/http';
import { AlertController, ActionSheetController, 
         IonicModule, IonicRouteStrategy, IonRouterOutlet,
         Platform, PopoverController,
         ModalController, MenuController, NavController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera } from '@ionic-native/Camera/ngx'
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Gyroscope } from '@ionic-native/gyroscope/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
//import { QRScanner } from '@ionic-native/qr-scanner/ngx';
//import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
//import { AngularFireModule } from '@angular/fire';
//import { AngularFireDatabaseModule } from '@angular/fire/database';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { MediaCapture, MediaFile, CaptureError, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx'; 
import { Shake } from '@ionic-native/shake/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { Device } from '@ionic-native/device/ngx';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { LazyLoadImageModule, intersectionObserverPreset, LoadImageProps, SetLoadedImageProps } from 'ng-lazyload-image';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';

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
import { MapPage } from './map/map.page'
import { StoryPage } from './story/story.page'
import { SafePipe } from './safe.pipe';
import { EarthPage } from './tabs/earth/earth.page'
import { PostviewerPage } from './postviewer/postviewer.page';
import { ImageViewerComponent } from './common/image-viewer/image-viewer.component';
import { VideoViewerComponent } from './common/video-viewer/video-viewer.component';
import { MiniViewerComponent } from './common/mini-viewer/mini-viewer.component';
import { SurfacePage } from './surface/surface.page';
import { RegisterPage } from './surface/register/register.page';
import { ScanPage } from './common/scan/scan.page';
import { AuthService } from './auth.service';
import { AddCommentPage } from './postviewer/add-comment/add-comment.page';
import { AddFriendPage } from './friend/add-friend/add-friend.page';
import { ApplyFriendPage } from './friend/apply-friend/apply-friend.page';
import { ChangePhotoPage } from './common/change-photo/change-photo.page';
import { ChangeChatBgPage } from './common/change-chat-bg/change-chat-bg.page';
import { MyInfoPage } from './common/my-info/my-info.page';
import { NewFriendPage } from './friend/new-friend/new-friend.page';
import { CommentComponent } from './postviewer/comment/comment.component';
import { CommentTimelineComponent } from './mytimeline/commentts/comment.component';
import { TimeLinePage } from './mytimeline/timeline/timeline.page';
import { MaterialPage } from './mytimeline/material/material.page';
import { ReportPage } from './mytimeline/report/report.page';
import { MyReportPage } from './mytimeline/myreport/myreport.page';
import { MyTimeLinePage } from './mytimeline/mytimeline.page';
import { MessageListPage } from './tabs/message/message.page';
import { UserPage } from './common/user/user.page';
import { ArticlePopPage } from './common/article-pop.page'
import { HeaderAddPage } from './common/header-add-pop.page'
import { ChangeCoverPopPage } from './common/change-cover-pop.page'
import { ArticleDislikePopPage } from './common/article-dislike-pop.page'
import { ArticleTextPopPage } from './common/article-text-pop.page'
import { CommentPopPage } from './common/comment-pop.page'
import { TimelinePopPage } from './common/timeline-pop.page'
import { TimelineCommentPopPage } from './common/timeline-comment-pop.page';
import { ReportCommentPopPage } from './common/report-comment-pop.page';
import { TsViewerPage } from './mytimeline/tsviewer/tsviewer.page'
import { AddTimelinePage } from './mytimeline/add-timeline/add-timeline.page';
import { AddFeedbackPage } from './mytimeline/add-feedback/add-feedback.page';
import { AddMaterialPage } from './mytimeline/add-material/add-material.page';
import { StockPage } from './common/stock/stock.page';
import { CommentReplyPage } from './postviewer/comment-reply/comment-reply.page';
import { AbsoluteDragDirective } from './absolute-drag.directive';
import { AutoresizeDirective } from './autoresize-textarea.directive';
import { ImageLazyLoadDirective } from './image-lazy-load.directive';
import { CommentBoxComponent } from './postviewer/comment-box/comment-box.component';
import { ChatBoxComponent } from './chat/chat-box/chat-box.component';
import { ChatFireBoxComponent } from './chatfire/chat-fire-box/chat-fire-box.component';
import { EarthBoxComponent } from './common/earth-box/earth-box.component';
import { ChatMysticBoxComponent } from './common/mystic/chat-mystic-box/chat-mystic-box.component';
import { SearchPage } from './common/search/search.page';
import { MessagePage } from './mytimeline/message/message.page'
import { SearchUserPage } from './friend/search-user/search-user.page';
import { QrcardPage } from './common/qrcard/qrcard.page';
import { SettingListPage } from './settings/setting-list/setting-list.page';
import { SettingGePage } from './settings/setting-ge/setting-ge.page';
import { SettingAboutPage } from './settings/setting-about/setting-about.page';
import { SettingChangePasswordPage } from './settings/setting-change-password/setting-change-password.page';
import { SettingNoteLabelPage } from './settings/setting-note-label/setting-note-label.page';
import { SettingGroupChatTitlePage } from './settings/setting-group-chat-title/setting-group-chat-title.page';
import { ChangeNoteNamePopPage } from './common/change-notename-pop.page';
import { SettingAccountPage } from './settings/setting-account/setting-account.page';
import { SettingPrivacyPage } from './settings/setting-privacy/setting-privacy.page';
import { ShakePage } from './shake/shake.page';
import { ChatPage } from './chat/chat.page';
import { ChatFirePage } from './chatfire/chat-fire.page';
import { GroupChatPage } from './chat/group-chat.page';
import { GroupChatFirePage } from './chatfire/group-chat-fire.page';
import { ChatOptPage } from './chat/chat-opt/chat-opt.page';
import { GroupChatOptPage } from './chat/group-chat-opt/group-chat-opt.page';
import { ChatChooseUserPage } from './chat/chat-choose-user/chat-choose-user.page';
import { ChooseUserPage } from './common/choose-user/choose-user.page';
import { ChatChooseGroupPage } from './chat/chat-choose-group/chat-choose-group.page';
import { BookmarkPage } from './bookmark/bookmark.page';
import { BookmarkPopPage } from './common/bookmark-pop.page';
import { PointPage } from './common/point/point.page';
import { HistoryPage } from './common/point/history/history.page';
import { PunchPage } from './common/punch/punch.page';
import { PunchClockPage } from './common/point/punch-clock/punch-clock.page';
import { BlackHolePage } from './common/black-hole/black-hole.page';
import { WormHolePage } from './common/worm-hole/worm-hole.page';
import { MagicMirrorPage } from './common/magic-mirror/magic-mirror.page';
import { MysticPage } from './common/mystic/mystic.page';
import { RankPage } from './common/rank/rank.page';
import { ChatPopPage } from './common/chat-pop.page';
import { SigninPage } from './surface/signin/signin.page';
import { ForgotPage } from './surface/forgot/forgot.page';
import { SettingNickNamePage } from './settings/setting-nickname/setting-nickname.page'
import { SettingSignaturePage } from './settings/setting-signature/setting-signature.page'
import { SettingSexPage } from './settings/setting-sex/setting-sex.page'
import { SettingFontPage } from './settings/setting-font/setting-font.page';
import { ShareArticleComponent } from './common/share-article/share-article.component';
import { ShareFaceComponent } from './common/share-face/share-face.component';
import { CategoryPage } from './tabs/publisher/category/category.page';
import { RegisterSubPage } from './tabs/publisher/register-sub/register-sub.page';
import { ManagePage } from './tabs/publisher/manage/manage.page';
import { SubInfoPage } from './tabs/publisher/sub-info/sub-info.page';
import { PubPage } from './tabs/publisher/pub/pub.page';
import { AddArticlePage } from './tabs/publisher/add-article/add-article.page';
import { MorePage } from './common/more/more.page';
import { AddMiniPage } from './tabs/publisher/add-mini/add-mini.page';
//import { SwipeTabDirective } from './swipe-tab.directive';
import { PlatformPage } from './tabs/publisher/platform/platform.page';
import { ShareChooseChatPage } from './chat/share-choose-chat/share-choose-chat.page';
import { ShareChooseUserPage } from './chat/share-choose-user/share-choose-user.page';
import { ShareChooseGroupPage } from './chat/share-choose-group/share-choose-group.page';
import { ShareArticleChatComponent } from './common/share-article-chat/share-article-chat.component';

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
        ShareArticleComponent,ShareArticleChatComponent,ShareFaceComponent,
        AppComponent,
        BookmarkPage,
        BookmarkPopPage,ChatPopPage,
        PointPage,HistoryPage,PunchPage,PunchClockPage,BlackHolePage,MagicMirrorPage,WormHolePage,MysticPage,
        RankPage,
        LocalePage,LocationPage,MapPage,StoryPage,EarthPage,
        ChooseUserPage,ShareChooseChatPage,
        AddCommentPage,
        AddFriendPage,
        ApplyFriendPage,
        ChangePhotoPage,ChangeChatBgPage,
        ChangeNoteNamePopPage,
        ChatPage,ChatFirePage,
        GroupChatPage,GroupChatFirePage,
        ChatOptPage,
        GroupChatOptPage,
        ChatChooseUserPage,ShareChooseUserPage,ShareChooseGroupPage,
        ChatChooseGroupPage,
        MyInfoPage,MessagePage,
        NewFriendPage,
        PostviewerPage,
        SafePipe,
        ImageViewerComponent,VideoViewerComponent,MiniViewerComponent,
        SurfacePage,
        CommentComponent,
        CommentTimelineComponent,
        TimeLinePage,MaterialPage,ReportPage,MyReportPage,
        MyTimeLinePage,MessageListPage,
        UserPage,
        ArticlePopPage,
        HeaderAddPage,
        ChangeCoverPopPage,ArticleDislikePopPage,
        ArticleTextPopPage,
        CommentPopPage,
        TimelinePopPage,
        TimelineCommentPopPage,ReportCommentPopPage,
        ScanPage,
        SigninPage,ForgotPage,
        TsViewerPage,
        AddTimelinePage,
        AddFeedbackPage,AddMaterialPage,
        StockPage,
        CommentReplyPage,
        AutoresizeDirective,
        AbsoluteDragDirective,
        //SwipeTabDirective,
        ImageLazyLoadDirective,
        CommentBoxComponent,
        ChatBoxComponent,ChatFireBoxComponent,ChatMysticBoxComponent,EarthBoxComponent,
        SearchPage,
        ShakePage,
        SearchUserPage,
        SettingAboutPage,SettingChangePasswordPage,
        SettingGePage,
        SettingListPage,
        SettingNoteLabelPage,
        SettingGroupChatTitlePage,SettingFontPage,
        QrcardPage,
        SettingAccountPage,
        SettingPrivacyPage,
        RegisterPage,
        SettingNickNamePage,SettingSignaturePage,SettingSexPage,
        PlatformPage,
        CategoryPage,RegisterSubPage,ManagePage,SubInfoPage,PubPage,AddArticlePage,MorePage,AddMiniPage,
    ],
    entryComponents: [
        BookmarkPage,
        BookmarkPopPage,ChatPopPage,
        PointPage,HistoryPage,PunchPage,PunchClockPage,BlackHolePage,MagicMirrorPage,WormHolePage,MysticPage,
        RankPage,
        LocalePage,LocationPage,MapPage,StoryPage,EarthPage,
        ChooseUserPage,ShareChooseChatPage,
        PostviewerPage,
        ImageViewerComponent,VideoViewerComponent,MiniViewerComponent,
        SurfacePage,
        AddCommentPage,
        AddFriendPage,
        ApplyFriendPage,
        ChangePhotoPage,ChangeChatBgPage,
        ChangeNoteNamePopPage,
        ChatPage,ChatFirePage,
        GroupChatPage,GroupChatFirePage,
        ChatOptPage,
        GroupChatOptPage,
        ChatChooseUserPage,ShareChooseUserPage,ShareChooseGroupPage,
        ChatChooseGroupPage,
        MyInfoPage,MessagePage,
        NewFriendPage,
        ArticlePopPage,
        HeaderAddPage,
        ChangeCoverPopPage,ArticleDislikePopPage,
        ArticleTextPopPage,
        CommentPopPage,
        TimelinePopPage,
        TimelineCommentPopPage,ReportCommentPopPage,
        ScanPage,
        SigninPage, ForgotPage,
        UserPage, MessageListPage,
        TimeLinePage,MaterialPage,ReportPage,MyReportPage,
        TsViewerPage,
        AddTimelinePage,
        AddFeedbackPage,AddMaterialPage,
        StockPage,
        CommentReplyPage,
        SearchPage,
        ShakePage,
        SearchUserPage,
        SettingAboutPage,SettingChangePasswordPage,
        SettingGePage,
        SettingListPage,
        SettingNoteLabelPage,
        SettingGroupChatTitlePage,SettingFontPage,
        QrcardPage,
        SettingAccountPage,
        SettingPrivacyPage,
        RegisterPage,
        SettingNickNamePage,SettingSignaturePage,SettingSexPage,
        PlatformPage,
        CategoryPage,RegisterSubPage,ManagePage,SubInfoPage,PubPage,AddArticlePage,MorePage,AddMiniPage,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        BrowserModule, 
        FormsModule,
        IonicModule.forRoot(), 
        AppRoutingModule,
        HttpClientModule,
        JsonpModule,
        CKEditorModule,
        LazyLoadImageModule.forRoot({
            preset: intersectionObserverPreset
        }),
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
        NavController,
        AppVersion,
        AppUpdate,
        AlertController,
        AuthService,
        AndroidPermissions,
        Camera,Clipboard,
        Keyboard,
        Network,
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
        Gyroscope,
        MenuController,
        ModalController,
        PhotoLibrary,
        Platform,
        PopoverController,DatePipe,
        //QRScanner,
        //BarcodeScanner,
        ReddahService,
        StatusBar,
        SplashScreen,
        StreamingMedia,
        Toast,
        WebView,
        MediaCapture,
        Media,
        NativeAudio,
        LocalNotifications,
        VideoEditor,
        Vibration,DeviceMotion,Device,
        //Firebase,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}