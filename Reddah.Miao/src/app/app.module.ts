import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
//import { JsonpModule } from '@angular/http';
import { AlertController, ActionSheetController, 
         IonRouterOutlet,
         Platform, PopoverController,
         ModalController, MenuController, NavController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Crop } from '@ionic-native/crop/ngx';
//import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Gyroscope } from '@ionic-native/gyroscope/ngx';
//import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { Toast } from '@ionic-native/toast/ngx';
//import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
//import { AngularFireModule } from '@angular/fire';
//import { AngularFireDatabaseModule } from '@angular/fire/database';
//import { Firebase } from '@ionic-native/firebase/ngx';
import { MediaCapture, MediaFile, CaptureError, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx'; 
import { Shake } from '@ionic-native/shake/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
//import { Device } from '@ionic-native/device/ngx';
//import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
//import { LazyLoadImageModule, intersectionObserverPreset, LoadImageProps, SetLoadedImageProps } from 'ng-lazyload-image';
import { Keyboard } from '@ionic-native/keyboard/ngx';
//import { Network } from '@ionic-native/network/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';

//import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxWebstorageModule } from 'ngx-webstorage';
//import { IonicImageLoader } from 'ionic-image-loader';
import { CacheModule } from "ionic-cache";
import { DragulaModule } from 'ng2-dragula';
//import { NgxQRCodeModule } from 'ngx-qrcode2';
import { QrCodeModule } from 'ng-qrcode';
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
import { TopicPage } from './topic/topic.page';
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
import { ChatMysticBoxComponent } from './common/mystic/chat-mystic-box/chat-mystic-box.component';
import { SearchPage } from './common/search/search.page';
import { MessagePage } from './mytimeline/message/message.page'
import { SearchUserPage } from './friend/search-user/search-user.page';
import { QrcardPage } from './common/qrcard/qrcard.page';
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
import { AtChooseUserPage } from './chat/at-choose-user/at-choose-user.page';
import { SettingNetworkPage } from './settings/setting-network/setting-network.page';
//import { IonicGestureConfig } from './IonicGestureConfig';
import { TopicActionBarComponent } from './topic/topic-action-bar/topic-action-bar.component';
import { TopicChoosePage } from './chat/topic-choose/topic-choose.page';
import { ActiveUsersPage } from './activeusers/activeusers.page';
import { PublisherPage } from './tabs/publisher/publisher.page';
import { VideosPage } from './videos/videos.page';
import { ReadPage } from './common/read/read.page';
import { LocationHWPage } from './common/locationhw/locationhw.page';
import { MapHWPage } from './maphw/maphw.page';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { StartComponent } from './start/start.component';
import { GameCubePage } from './games/cube/cube.page';
import { GameRememberPage } from './games/remember/remember.page';
import { GameConnectPage } from './games/connect/connect.page';
import { GameSnakePage } from './games/snake/snake.page';
import { GameTrainPage } from './games/train/train.page';
import { GameSudo2Page } from './games/sudo2/sudo2.page';


@NgModule({
  declarations: [
    TopicActionBarComponent,
    TopicPage,ReadPage,
    ShareArticleComponent,ShareArticleChatComponent,ShareFaceComponent,
    AppComponent,
    BookmarkPage,ActiveUsersPage,
    BookmarkPopPage,ChatPopPage,
    PointPage,HistoryPage,PunchPage,PunchClockPage,BlackHolePage,MagicMirrorPage,WormHolePage,MysticPage,
    RankPage,
    LocalePage,LocationPage,LocationHWPage,MapPage,MapHWPage,StoryPage,VideosPage,
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
    ChatChooseUserPage,TopicChoosePage,ShareChooseUserPage,ShareChooseGroupPage,AtChooseUserPage,
    ChatChooseGroupPage,
    MyInfoPage,MessagePage,
    NewFriendPage,
    PostviewerPage,
    PublisherPage,
    SafePipe,
    ImageViewerComponent,VideoViewerComponent,MiniViewerComponent,StartComponent,
    SurfacePage,
    CommentComponent,
    CommentTimelineComponent,
    TimeLinePage,MaterialPage,ReportPage,MyReportPage,
    MyTimeLinePage,
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
    ChatBoxComponent,ChatFireBoxComponent,ChatMysticBoxComponent,
    SearchPage,
    ShakePage,
    SearchUserPage,
    SettingAboutPage,SettingChangePasswordPage,
    SettingGePage,
    SettingNoteLabelPage,
    SettingGroupChatTitlePage,SettingFontPage,
    QrcardPage,
    SettingAccountPage,SettingNetworkPage,
    SettingPrivacyPage,
    RegisterPage,
    SettingNickNamePage,SettingSignaturePage,SettingSexPage,
    PlatformPage,
    CategoryPage,RegisterSubPage,ManagePage,SubInfoPage,PubPage,AddArticlePage,MorePage,AddMiniPage,
    GameCubePage,GameRememberPage,GameConnectPage,GameSnakePage,GameTrainPage,
    GameSudo2Page,
],
entryComponents: [
    TopicPage,ReadPage,
    BookmarkPage,ActiveUsersPage,
    BookmarkPopPage,ChatPopPage,
    PointPage,HistoryPage,PunchPage,PunchClockPage,BlackHolePage,MagicMirrorPage,WormHolePage,MysticPage,
    RankPage,
    LocalePage,LocationPage,LocationHWPage,MapPage,MapHWPage,StoryPage,VideosPage,
    ChooseUserPage,ShareChooseChatPage,
    PostviewerPage,
    ImageViewerComponent,VideoViewerComponent,MiniViewerComponent,StartComponent,
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
    ChatChooseUserPage,TopicChoosePage,ShareChooseUserPage,ShareChooseGroupPage,AtChooseUserPage,
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
    UserPage,
    TimeLinePage,MaterialPage,ReportPage,MyReportPage,
    TsViewerPage,
    AddTimelinePage,
    AddFeedbackPage,AddMaterialPage,
    StockPage,
    CommentReplyPage,
    PublisherPage,
    //SearchPage,
    ShakePage,
    SearchUserPage,
    SettingAboutPage,SettingChangePasswordPage,
    SettingGePage,
    SettingNoteLabelPage,
    SettingGroupChatTitlePage,SettingFontPage,
    QrcardPage,
    SettingAccountPage,SettingNetworkPage,
    SettingPrivacyPage,
    RegisterPage,
    SettingNickNamePage,SettingSignaturePage,SettingSexPage,
    PlatformPage,
    CategoryPage,RegisterSubPage,ManagePage,SubInfoPage,PubPage,AddArticlePage,MorePage,AddMiniPage,
    GameCubePage,GameRememberPage,GameConnectPage,GameSnakePage,GameTrainPage,
    GameSudo2Page,
],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
imports: [
    BrowserModule, HammerModule,
    BrowserAnimationsModule,
    FormsModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    //JsonpModule,
    CKEditorModule,
    //LazyLoadImageModule.forRoot({
    //    preset: intersectionObserverPreset
    //}),
    HttpClientJsonpModule,
    //IonicImageLoader.forRoot(),
    CacheModule.forRoot(),
    NgxWebstorageModule.forRoot(),
    DragulaModule.forRoot(),
    /*TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),*/
    QrCodeModule,
    //NgxQRCodeModule,
    //AngularFireModule.initializeApp(firebaseConfig),
    //AngularFireDatabaseModule,
],
exports:[
],
providers: [
    ActionSheetController,
    NavController,
    AppRate,
    AppVersion,
    AlertController,
    AuthService,
    AndroidPermissions,
    //Camera,
    Clipboard,
    Keyboard,
    //Network,
    Shake,
    Crop,
    //IonicImageLoader,
    //IonRouterOutlet,
    File,
    FileTransfer,
    FileTransferObject,
    Globalization,
    Geolocation,
    Gyroscope,
    MenuController,
    ModalController,
    //PhotoLibrary,
    Platform,
    PopoverController,DatePipe,
    ReddahService,
    StreamingMedia,
    Toast,
    //WebView,
    MediaCapture,
    Media,
    LocalNotifications,
    VideoEditor,
    Vibration,//DeviceMotion,Device,
    //ReactiveFormsModule,
    //Firebase,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    //{ provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig }
],
bootstrap: [AppComponent]
  
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}
