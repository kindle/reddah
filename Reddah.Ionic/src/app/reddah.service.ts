import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {
  Headers, Http, JsonpModule, XHRBackend, RequestOptions, RequestOptionsArgs, Jsonp,
  JSONPBackend, URLSearchParams, QueryEncoder, ResponseContentType
} from '@angular/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Article } from "./model/article";
import { UserProfileModel } from './model/UserProfileModel';
import { UserModel, QueryCommentModel, NewCommentModel, NewTimelineModel } from './model/UserModel';
import { Locale } from './model/locale';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';
import { CacheService } from 'ionic-cache';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import * as moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { Router } from '@angular/router';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Injectable({
    providedIn: 'root'
})
export class ReddahService {

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private jsonp: Jsonp,
        private transfer: FileTransfer,
        private file: File,
        private toastController: ToastController,
        private modalController: ModalController,
        private alertController: AlertController,
        private platform: Platform,
        private cacheService: CacheService,
        private translate: TranslateService,
        private iab: InAppBrowser,
        private router: Router,
        private ngZone: NgZone,
        private localNotifications: LocalNotifications,
    ) { }

    //******************************** */
    private registersubUrl = 'https://login.reddah.com/api/pub/registersub'; 
    
    registerSub(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.registersubUrl, formData)
        .pipe(
            tap(data => this.log('register sub')),
            catchError(this.handleError('register sub', []))
        );
    }
    //******************************** */
    private registerUrl = 'https://login.reddah.com/api/auth/register'; 
    
    register(formData): Observable<any> {
        return this.http.post<any>(this.registerUrl, formData)
        .pipe(
            tap(data => this.log('register')),
            catchError(this.handleError('register', []))
        );
    }
    //******************************** */
    private loginUrl = 'https://login.reddah.com/api/auth/sign'; 

    login(userName: string, password: string): Observable<any> {

        return this.http.post<any>(this.loginUrl, new UserModel(userName, password))
        .pipe(
            tap(data => this.log('login')),
            catchError(this.handleError('login', []))
        );
    }
    //******************************** */
    private getCommentsUrl = 'https://login.reddah.com/api/article/getcomments'; 

    getComments(articleId: number): Observable<any> {

        return this.http.post<any>(this.getCommentsUrl, new QueryCommentModel("", articleId))
        .pipe(
            tap(data => this.log('get comments')),
            catchError(this.handleError('get comments', []))
        );
    }
    //******************************** */
    private addCommentsUrl = 'https://login.reddah.com/api/article/addcomments'; 

    addComments(articleId: number, parentId: number, content: string, uid : string): Observable<any> {
        return this.http.post<any>(this.addCommentsUrl, new NewCommentModel(this.getCurrentJwt(), articleId, parentId, content, uid))
        .pipe(
            tap(data => this.log('add comment')),
            catchError(this.handleError('add comment', []))
        );
    }
    //******************************** */
    private shareToFriendUrl = 'https://login.reddah.com/api/chat/sharetofriend'; 

    shareToFriend(formData: FormData): Observable<any> {

      formData.append('jwt', this.getCurrentJwt());
      
      return this.http.post<any>(this.shareToFriendUrl, formData)
      .pipe(
          tap(data => this.log('share to friend')),
          catchError(this.handleError('share to friend', []))
      );
    }
    //******************************** */
    private addPhotoCommentsUrl = 'https://login.reddah.com/api/chat/addphotocomments'; 
    addPhotoComments(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.addPhotoCommentsUrl, formData)
        .pipe(
            tap(data => this.log('add photo comment')),
            catchError(this.handleError('add photo comment', []))
        );
    }
    private commentLikeUrl = 'https://login.reddah.com/api/article/commentlike'; 

    commentLike(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.commentLikeUrl, formData)
        .pipe(
            tap(data => this.log('comment like')),
            catchError(this.handleError('comment like', []))
        );
    }
    //******************************** */
    //******************************** */
    private addTimelineUrl = 'https://login.reddah.com/api/article/addtimeline'; 

    addTimeline(formData: FormData): Observable<any> {

      formData.append('jwt', this.getCurrentJwt());
      const httpOptions = {
          headers: new HttpHeaders({
              //'enctype': 'multipart/form-data; boundary=----WebKitFormBoundaryuL67FWkv1CA',
              'Content-Type': 'multipart/form-data', 
              'Accept': 'application/json',
          })
      };
      return this.http.post<any>(this.addTimelineUrl, formData)
      .pipe(
          tap(data => this.log('add timeline')),
          catchError(this.handleError('add timeline', []))
      );
    }
    //******************************** */
    private getMyTimelineUrl = 'https://login.reddah.com/api/article/getmytimeline'; 

    getMyTimeline(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getMyTimelineUrl, formData)
        .pipe(
            tap(data => this.log('get my timeline')),
            catchError(this.handleError('get my timeline', []))
        );
    }
    //******************************** */
    private getTimelineUrl = 'https://login.reddah.com/api/article/gettimeline'; 

    getTimeline(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getTimelineUrl, formData)
        .pipe(
            tap(data => this.log('get timeline')),
            catchError(this.handleError('get timeline', []))
        );
    }
    //******************************** */
    private getUsedMiniUrl = 'https://login.reddah.com/api/pub/getusedmini'; 

    getUsedMini(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getUsedMiniUrl, formData)
        .pipe(
            tap(data => this.log('get used mini')),
            catchError(this.handleError('get used mini', []))
        );
    }
    //******************************** */
    private getMaterialUrl = 'https://login.reddah.com/api/pub/getmaterial'; 

    getMyMaterial(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getMaterialUrl, formData)
        .pipe(
            tap(data => this.log('get my material')),
            catchError(this.handleError('get my material', []))
        );
    }
    //******************************** */
    private getReportUrl = 'https://login.reddah.com/api/admin/getreport'; 

    getReport(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getReportUrl, formData)
        .pipe(
            tap(data => this.log('get report')),
            catchError(this.handleError('get report', []))
        );
    }
    //******************************** */
    private getMyReportUrl = 'https://login.reddah.com/api/admin/getmyreport'; 

    getMyReport(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getMyReportUrl, formData)
        .pipe(
            tap(data => this.log('get my report')),
            catchError(this.handleError('get my report', []))
        );
    }
    //******************************** */
    private getUserInfoUrl = 'https://login.reddah.com/api/article/getuser'; 

    getUserInfo(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getUserInfoUrl, formData)
        .pipe(
            tap(data => this.log('get user info')),
            catchError(this.handleError('get user info', []))
        );
    }
    //******************************** */
    private timelineLikeUrl = 'https://login.reddah.com/api/article/like'; 

    like(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.timelineLikeUrl, formData)
        .pipe(
            tap(data => this.log('set like')),
            catchError(this.handleError('set like', []))
        );
    }
    //******************************** */
    private searchUserUrl = 'https://login.reddah.com/api/article/searchuser'; 

    searchUser(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.searchUserUrl, formData)
        .pipe(
            tap(data => this.log('search user')),
            catchError(this.handleError('search user', []))
        );
    }
    //******************************** */
    private addFriendUrl = 'https://login.reddah.com/api/article/addfriend'; 

    addFriend(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.addFriendUrl, formData)
        .pipe(
            tap(data => this.log('add friend')),
            catchError(this.handleError('add friend', []))
        );
    }
    //******************************** */
    private changeNoteNameUrl = 'https://login.reddah.com/api/article/changenotename'; 

    changeNoteName(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.changeNoteNameUrl, formData)
        .pipe(
            tap(data => this.log('change note name')),
            catchError(this.handleError('change note name', []))
        );
    }
    //******************************** */
    private changeSignatureUrl = 'https://login.reddah.com/api/article/changesignature'; 

    changeSignature(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.changeSignatureUrl, formData)
        .pipe(
            tap(data => this.log('change signature')),
            catchError(this.handleError('change signature', []))
        );
    }
    //******************************** */
    private changePrivacyUrl = 'https://login.reddah.com/api/article/changeprivacy'; 

    changePrivacy(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.changePrivacyUrl, formData)
        .pipe(
            tap(data => this.log('change privacy')),
            catchError(this.handleError('change privacy', []))
        );
    }
    //******************************** */
    private changeLocationUrl = 'https://login.reddah.com/api/article/changelocation'; 

    changeLocation(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.changeLocationUrl, formData)
        .pipe(
            tap(data => this.log('change location')),
            catchError(this.handleError('change location', []))
        );
    }
    saveUserLocation(userName, location, lat, lng, tag=""){
        let formData = new FormData();
        formData.append("location", JSON.stringify(location));
        formData.append("lat", JSON.stringify(lat));
        formData.append("lng", JSON.stringify(lng));
        formData.append("tag", tag);
        
        this.changeLocation(formData)
        .subscribe(result => 
        {
            if(result.Success==0){
                this.localStorageService.store('userlocation_'+userName, location.title);
                this.localStorageService.store('userlocationjson_'+userName, JSON.stringify(location));
            }
            else
                alert(result.Message);
        });
    }

    //******************************** */
    //type 0:girl, 1:boy
    private getusersbylocation = 'https://login.reddah.com/api/article/getusersbylocation'; 
    getUsersByLocation(type, latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, min=0){
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append("type", JSON.stringify(type));
        formData.append("latCenter", JSON.stringify(latCenter));
        formData.append("lngCenter", JSON.stringify(lngCenter));
        formData.append("latLow", JSON.stringify(latLow));
        formData.append("latHigh", JSON.stringify(latHigh));
        formData.append("lngLow", JSON.stringify(lngLow));
        formData.append("lngHigh", JSON.stringify(lngHigh));
        formData.append("min", JSON.stringify(min));
        
        return this.http.post<any>(this.getusersbylocation, formData)
        .pipe(
            tap(data => this.log('get users by location')),
            catchError(this.handleError('get users by location', []))
        );
    }
    //******************************** */
    private changeNickNameUrl = 'https://login.reddah.com/api/article/changenickname'; 

    changeNickName(formData: FormData): Observable<any> {
        return this.service(formData, this.changeNickNameUrl, 'change nick name');
    }
    //******************************** */
    private changeSexUrl = 'https://login.reddah.com/api/article/changesex'; 

    changeSex(formData: FormData): Observable<any> {
        return this.service(formData, this.changeSexUrl, 'change sex');
    }
    //******************************** */
    private changePasswordUrl = 'https://login.reddah.com/api/auth/changepassword'; 

    changePassword(formData: FormData): Observable<any> {

        return this.service(formData, this.changePasswordUrl, 'change password');
    }
    //******************************** */
    service(formData: FormData, url, text): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(url, formData)
        .pipe(
            tap(data => this.log(text)),
            catchError(this.handleError(text, []))
        );
    }
    //******************************** */
    private changeGroupChatTitleUrl = 'https://login.reddah.com/api/chat/changegroupchattitle'; 

    changeGroupChatTitle(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.changeGroupChatTitleUrl, formData)
        .pipe(
            tap(data => this.log('change group chat title')),
            catchError(this.handleError('change group chat title', []))
        );
    }
    //******************************** */
    private removeFriendUrl = 'https://login.reddah.com/api/article/removefriend'; 

    removeFriend(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.removeFriendUrl, formData)
        .pipe(
            tap(data => this.log('remove friend')),
            catchError(this.handleError('remove friend', []))
        );
    }
    //******************************** */
    private approveFriendUrl = 'https://login.reddah.com/api/article/approvefriend'; 

    approveFriend(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.approveFriendUrl, formData)
        .pipe(
            tap(data => this.log('approve friend')),
            catchError(this.handleError('approve friend', []))
        );
    }
    //******************************** */
    private friendRequestsUrl = 'https://login.reddah.com/api/article/friendrequests'; 

    friendRequests(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.friendRequestsUrl, formData)
        .pipe(
            tap(data => this.log('get friend requests')),
            catchError(this.handleError('get friend requests', []))
        );
    }
    //******************************** */
    private friendsUrl = 'https://login.reddah.com/api/article/friends'; 

    getFriends(): Observable<any> {

        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.friendsUrl, formData)
        .pipe(
            tap(data => this.log('get friends')),
            catchError(this.handleError('get friends', []))
        );
    }
    //******************************** */
    private focusPubsUrl = 'https://login.reddah.com/api/pub/focuspubs'; 

    getFocusPubs(): Observable<any> {

        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.focusPubsUrl, formData)
        .pipe(
            tap(data => this.log('get focus pubs')),
            catchError(this.handleError('get focus pubs', []))
        );
    }
    //******************************** */
    private subsUrl = 'https://login.reddah.com/api/pub/subs'; 

    getSubs(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.subsUrl, formData)
        .pipe(
            tap(data => this.log('get subs')),
            catchError(this.handleError('get subs', []))
        );
    }
    //******************************** */
    private updateUserPhotoUrl = 'https://login.reddah.com/api/article/updateuserphoto'; 

    updateUserPhoto(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'multipart/form-data', 
                'Accept': 'application/json',
            })
        };
        return this.http.post<any>(this.updateUserPhotoUrl, formData)
        .pipe(
            tap(data => this.log('update user photo')),
            catchError(this.handleError('update user photo', []))
        );
    }
    //******************************** */
    private bookmarkUrl = 'https://login.reddah.com/api/article/bookmark'; 

    bookmark(formData: FormData): Observable<any> {        
        return this.service(formData, this.bookmarkUrl, "set bookmark");
    }
    //******************************** */
    private deleteBookmarkUrl = 'https://login.reddah.com/api/article/deletebookmark'; 

    deleteBookmark(formData: FormData): Observable<any> {
        return this.service(formData, this.deleteBookmarkUrl, "delete bookmark");
    }
    //******************************** */
    private deleteArticleUrl = 'https://login.reddah.com/api/article/deletearticle'; 

    deleteArticle(formData: FormData): Observable<any> {
        return this.service(formData, this.deleteArticleUrl, "delete article");
    }
    //******************************** */
    private deleteCommentUrl = 'https://login.reddah.com/api/article/deletecomment'; 

    deleteComment(formData: FormData): Observable<any> {
        return this.service(formData, this.deleteCommentUrl, "delete comment");
    }
    //******************************** */
    private addPubArticleUrl = 'https://login.reddah.com/api/pub/addpubarticle'; 

    addPubArticle(formData: FormData): Observable<any> {

      formData.append('jwt', this.getCurrentJwt());
      
      return this.http.post<any>(this.addPubArticleUrl, formData)
      .pipe(
          tap(data => this.log('add pub article')),
          catchError(this.handleError('add pub article', []))
      );
    }
    //******************************** */
    private addPubMiniUrl = 'https://login.reddah.com/api/pub/addpubmini'; 

    addPubMini(formData: FormData): Observable<any> {

      formData.append('jwt', this.getCurrentJwt());
      
      return this.http.post<any>(this.addPubMiniUrl, formData)
      .pipe(
          tap(data => this.log('add pub article')),
          catchError(this.handleError('add pub article', []))
      );
    }
    //******************************** */
    private publishArticleUrl = 'https://login.reddah.com/api/pub/publisharticle'; 

    publishArticle(formData: FormData): Observable<any> {

      formData.append('jwt', this.getCurrentJwt());
      
      return this.http.post<any>(this.publishArticleUrl, formData)
      .pipe(
          tap(data => this.log('pub article')),
          catchError(this.handleError('pub article', []))
      );
    }
    //******************************** */
    private publishMiniUrl = 'https://login.reddah.com/api/pub/publishprogram'; 

    publishMini(formData: FormData): Observable<any> {

      formData.append('jwt', this.getCurrentJwt());
      
      return this.http.post<any>(this.publishMiniUrl, formData)
      .pipe(
          tap(data => this.log('pub mini')),
          catchError(this.handleError('pub mini', []))
      );
    }
    //******************************** */






    //******************************** */
    private getChatUrl = 'https://login.reddah.com/api/chat/getchat'; 

    getChat(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getChatUrl, formData)
        .pipe(
            tap(data => this.log('create chat')),
            catchError(this.handleError('create chat', []))
        );
    }
    //******************************** */
    private createGroupChatUrl = 'https://login.reddah.com/api/chat/creategroupchat'; 

    createGroupChat(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());

        formData.append("title", this.translate.instant("Pop.GroupChatTitle"));
        formData.append("annouce", this.translate.instant("Pop.GroupChatAnnouce"));
        formData.append("update", this.translate.instant("Pop.GroupChatUpdate"));

        return this.http.post<any>(this.createGroupChatUrl, formData)
        .pipe(
            tap(data => this.log('create group chat')),
            catchError(this.handleError('create group chat', []))
        );
    }
    //******************************** */
    private getGroupChatUrl = 'https://login.reddah.com/api/chat/getgroupchat'; 

    getGroupChat(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getGroupChatUrl, formData)
        .pipe(
            tap(data => this.log('get group chat')),
            catchError(this.handleError('get group chat', []))
        );
    }
    //******************************** */
    private getGroupListUrl = 'https://login.reddah.com/api/chat/getgrouplist'; 

    getGroupList(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getGroupListUrl, formData)
        .pipe(
            tap(data => this.log('get group chat list')),
            catchError(this.handleError('get group chat list', []))
        );
    }
    //******************************** */
    private deleteGroupChatUrl = 'https://login.reddah.com/api/chat/deletegroupchat'; 

    deleteGroupChat(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.deleteGroupChatUrl, formData)
        .pipe(
            tap(data => this.log('delete group chat')),
            catchError(this.handleError('delete group chat', []))
        );
    }
    //******************************** */
    private addToGroupChatUrl = 'https://login.reddah.com/api/chat/addtogroupchat'; 

    addToGroupChat(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        formData.append('add', this.translate.instant('Pop.AddToGrp'));
        formData.append('kick', this.translate.instant('Pop.KickGrp'));
        return this.http.post<any>(this.addToGroupChatUrl, formData)
        .pipe(
            tap(data => this.log('add to group chat')),
            catchError(this.handleError('add to group chat', []))
        );
    }
    //******************************** */

    private addAudioChatUrl = 'https://login.reddah.com/api/chat/addaudiochat'; 

    addAudioChat(formData: FormData): Observable<any> {

      formData.append('jwt', this.getCurrentJwt());
      
      return this.http.post<any>(this.addAudioChatUrl, formData)
      .pipe(
          tap(data => this.log('add audio chat')),
          catchError(this.handleError('add audio chat', []))
      );
    }
    //******************************** */
    private messageunreadUrl = 'https://login.reddah.com/api/article/messageunread'; 

    getMessageUnread(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.messageunreadUrl, formData)
        .pipe(
            tap(data => this.log('get msg unread')),
            catchError(this.handleError('get msg unread', []))
        );
    }
    //******************************** */
    private messagesetreadUrl = 'https://login.reddah.com/api/article/messagesetread'; 

    setMessageRead(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.messagesetreadUrl, formData)
        .pipe(
            tap(data => this.log('set msg as read')),
            catchError(this.handleError('set msg as read', []))
        );
    }
    //******************************** */
    private getarticlebyidUrl = 'https://login.reddah.com/api/article/getarticlebyid'; 

    getArticleById(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getarticlebyidUrl, formData)
        .pipe(
            tap(data => this.log('get article by id')),
            catchError(this.handleError('get article by id', []))
        );
    }
    //******************************** */
    private getuserbyidUrl = 'https://login.reddah.com/api/pub/getuserbyid'; 

    getUserById(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getuserbyidUrl, formData)
        .pipe(
            tap(data => this.log('get user by id')),
            catchError(this.handleError('get user by id', []))
        );
    }
    //******************************** */
    private getContactMessages = 'https://login.reddah.com/api/chat/getmessages'; 

    getMessages(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.getContactMessages, formData)
        .pipe(
            tap(data => this.log('get messages')),
            catchError(this.handleError('get messages', []))
        );
    }
    //******************************** */

    private log(message: string) {
        //console.log(message);
    }

    public Locales = [
        new Locale("zh-CN", "简体中文 (zh-CN)"),
        new Locale("en-US", "English (en-US)"),
        new Locale("es-ES", "Español (es-ES)"),
        new Locale("ar-AE", " عربي ، (ar-AE)"),
        new Locale("ru-RU", "Pусский язык (ru-RU)"),
        new Locale("pt-PT", "Português (pt-PT)"),
        new Locale("ja-JP", "日本語 (ja-JP)"),
        new Locale("de-DE", "Deutsch (de-DE)"),
        new Locale("fr-FR", "Français (fr-FR)"),
        new Locale("ko-KR", "한국어 (ko-KR)"),
        new Locale("it-IT", "Italiano (it-IT)"),
        new Locale("el-GR", "Ελληνικά (el-GR)"),
        new Locale("nl-NL", "Nederlands (nl-NL)"),
        new Locale("th-TH", "ภาษาไทย (th-TH)"),
        new Locale("zh-TW", "繁體中文 (zh-TW)"),
    ];

    private publisherUrl = 'https://login.reddah.com/api/pub/getpublisher'; 
    
    getPublishers(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.publisherUrl, formData)
        .pipe(
            tap(data => this.log('fetched publishers')),
            catchError(this.handleError('getReddah publishers', []))
        );
    }
    //******************************** */
    private setFocusUrl = 'https://login.reddah.com/api/pub/setfocus'; 

    setFocus(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.setFocusUrl, formData)
        .pipe(
            tap(data => this.log('set focus pub')),
            catchError(this.handleError('set focus pub', []))
        );
    }
    //******************************** */
    private unFocusUrl = 'https://login.reddah.com/api/pub/unfocus'; 

    unFocus(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.unFocusUrl, formData)
        .pipe(
            tap(data => this.log('unfocus pub')),
            catchError(this.handleError('unfocus pub', []))
        );
    }
    //******************************** */

  
    private articlesUrl = 'https://reddah.com/api/webapi/getarticles'; 
    private userProfileModel: UserProfileModel;

    getArticles(
        loadedIds: Number[],
        dislikeGroups: string[]=[],
        dislikeUserNames: string[]=[], 
        locale: String, menu: String, keyword="", status=1, userName="", type=0): Observable<Article[]> {
        
        this.userProfileModel = new UserProfileModel();
        this.userProfileModel.LoadedIds = loadedIds;
        this.userProfileModel.DislikeGroups = dislikeGroups;
        this.userProfileModel.DislikeUserNames = dislikeUserNames;
        this.userProfileModel.Locale = locale;
        this.userProfileModel.Menu = menu;
        this.userProfileModel.Token = "";
        this.userProfileModel.Sub = "";
        this.userProfileModel.User = userName;
        this.userProfileModel.Keyword = keyword;
        this.userProfileModel.Type = type;
        this.userProfileModel.Status = status;

        return this.http.post<Article[]>(this.articlesUrl, this.userProfileModel)//httpOptions)
        .pipe(
            tap(data => this.log('fetched subs')),
            catchError(this.handleError('getReddahSubs', []))
        );
    }
    //******************************** */
    private bookmarksUrl = 'https://login.reddah.com/api/article/getbookmarks'; 
    
    getBookmarks(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.bookmarksUrl, formData)
        .pipe(
            tap(data => this.log('fetched bookmarks')),
            catchError(this.handleError('getReddahBookmarks', []))
        );
    }
    //******************************** */
    private pointsUrl = 'https://login.reddah.com/api/point/getpointlist'; 
    
    getPoints(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.pointsUrl, formData)
        .pipe(
            tap(data => this.log('fetched points')),
            catchError(this.handleError('getReddahPoints', []))
        );
    }
    //******************************** */
    private rankUrl = 'https://login.reddah.com/api/game/globalrank'; 
    
    getGlobalRank(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.rankUrl, formData)
        .pipe(
            tap(data => this.log('fetched rank')),
            catchError(this.handleError('getReddahRank', []))
        );
    }
    //******************************** */
    private rankUpdateGameScoreUrl = 'https://login.reddah.com/api/game/updatemyrank'; 
    
    uploadGameScore(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.rankUpdateGameScoreUrl, formData)
        .pipe(
            tap(data => this.log('fetched rank')),
            catchError(this.handleError('getReddahRank', []))
        );
    }
    //******************************** */
    reloadLocaleSettings(){
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        this.translate.setDefaultLang(currentLocale);
        this.translate.use(currentLocale);
    }

    setCurrentUser(userName: string){
        this.localStorageService.store("Reddah_CurrentUser",userName);
    }

    getCurrentUser(){
        return this.localStorageService.retrieve("Reddah_CurrentUser");
    }

    clearCurrentUser(){
        this.localStorageService.clear("Reddah_CurrentUser");
        this.localStorageService.clear("Reddah_CurrentJwt");
    }

    logoutClear(){
        this.clearCurrentUser();
        this.cacheService.clearAll();
    }

    setCurrentJwt(jwt: string){
        this.localStorageService.store("Reddah_CurrentJwt",jwt);
    }

    getCurrentJwt(){
        return this.localStorageService.retrieve("Reddah_CurrentJwt");
    }

    clearCurrentJwt(){
        this.localStorageService.clear("Reddah_CurrentJwt");
    }

    getCurrentLocale(){
        let locale = this.localStorageService.retrieve("Reddah_Locale");
        if(locale==undefined||locale==null)
            locale = "en-US";
        return locale;
    }

    setLoginUserName(userName){
        this.localStorageService.store("Reddah_lastlogin_username", userName);
    }
    
    getLoginUserName(){
        return this.localStorageService.retrieve("Reddah_lastlogin_username");
    }

    getLastLoginUserEmail(){
        let lastLoginUser = this.getLoginUserName();
        return "";
    }

    private getSecurityTokenUrl = 'https://login.reddah.com/api/auth/generatetoken'; 
    getSecurityToken(formData){
        return this.http.post<any>(this.getSecurityTokenUrl, formData)
        .pipe(
            tap(data => this.log('get security token')),
            catchError(this.handleError('get security token', []))
        );        
    }
    private resetPasswordUrl = 'https://login.reddah.com/api/auth/resetpassword'; 
    resetPassword(formData){
        return this.http.post<any>(this.resetPasswordUrl, formData)
        .pipe(
            tap(data => this.log('reset password')),
            catchError(this.handleError('reset password', []))
        );        
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
   */
    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            //alert(JSON.stringify(error));
            let msg = error.message;
            if(msg.indexOf("failure response")>0){
                if(this.translate.instant("Input.Error.NetworkError")!="Input.Error.NetworkError")
                    this.toast(this.translate.instant("Input.Error.NetworkError"), "danger")
            }
                
            if(msg.indexOf("ERR_TIMED_OUT")>0)
                this.toast(this.translate.instant("Input.Error.ServiceError"), "danger")
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }


    
    //******************************** */
    
    options: any;
    //d表示日线，m表示月线，w表示周线
    getStock(stock:string, period='d'): Observable<any> {
        let sohuStockApi = `https://q.stock.sohu.com/hisHq?code=cn_${stock}&start=19900716&end=20200720&stat=1&order=A&period=${period}&rt=jsonp`; 
        //  console.log(sohuStockApi);

        const searchParams = new URLSearchParams();
        searchParams.append('callback', 'JSONP_CALLBACK');
        if (!this.options) {
          this.options = {headers: new Headers()};
        }
        this.options.headers.set('Content-Type', 'application/json:charset=UTF-8');
        this.options.params = searchParams;

        return this.jsonp.get(sohuStockApi, this.options).pipe(
            tap(data => this.log('get stock')),
            catchError(this.handleError('get stock', []))
        );
    } 
    
    //******************************** */
    getNearby(lat, lon): Observable<any> {
        
        let policy = 1;
        let qqMapApi = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lon}&output=jsonp&key=ARIBZ-BSK6D-2IL4Y-POZPV-ANU32-CIF56&poi_options=address_format=short;radius=5000;page_size=100;page_index=1;policy=${policy}&get_poi=1`;

        const searchParams = new URLSearchParams();
        searchParams.append('callback', 'JSONP_CALLBACK');
        if (!this.options) {
          this.options = {headers: new Headers()};
        }
        this.options.headers.set('Content-Type', 'application/json:charset=UTF-8');
        this.options.params = searchParams;

        return this.jsonp.get(qqMapApi, this.options).pipe(
            tap(data => this.log('get nearby')),
            catchError(this.handleError('get nearby', []))
        );
    } 

    getQqLocation(lat, lng): Observable<any> {
        
        let qqTranslateApi = `https://apis.map.qq.com/ws/coord/v1/translate?locations=${lat},${lng}&output=jsonp&type=1&key=ARIBZ-BSK6D-2IL4Y-POZPV-ANU32-CIF56`;

        const searchParams = new URLSearchParams();
        searchParams.append('callback', 'JSONP_CALLBACK');
        if (!this.options) {
          this.options = {headers: new Headers()};
        }
        this.options.headers.set('Content-Type', 'application/json:charset=UTF-8');
        this.options.params = searchParams;

        return this.jsonp.get(qqTranslateApi, this.options).pipe(
            tap(data => this.log('get qq location')),
            catchError(this.handleError('get qq location', []))
        );
    } 



    //util functions
    //share with my timeline & user timeline
    drawCanvasBackground(src){

        src="assets/icon/timg.jpg";
        //src= (<any>window).Ionic.WebView.convertFileSrc(src);

        //cavas use local path, web url has cors issue.
        var p = document.getElementById("mycontent");
        
        var canvas = document.createElement('canvas');
        var context = canvas.getContext("2d");
        var img = new Image(3000,3);
        img.src = src;
        context.drawImage(img, 0, 0);
        var imgData = context.getImageData(1, 1, img.width, 3);
        //console.log(imgData.data)
        //console.log(`r:${imgData.data[0]},g:${imgData.data[1]},b:${imgData.data[2]}`);
        
        var canvas1 = document.createElement('canvas');
        canvas1.style.position = "absolute";
        canvas1.style.width = "100%";
        canvas1.style.zIndex = "-100";
        p.parentElement.appendChild(canvas1);
        var ctx = canvas1.getContext("2d");
        for(let i=0;i<90;i++){
            ctx.putImageData(imgData, 0, 3*i);
        }
      
    } 

    htmlDecode(text: string) {
        var temp = document.createElement("div");
        temp.innerHTML = text;
        var output = temp.innerText || temp.textContent;
        temp = null;
        
        output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
        output = output.replace(/\"\/\/\/reddah.com\/uploadPhoto/g, "\"https:\/\/reddah.com\/uploadPhoto");
        output = output.replace(/\"\/\/\/login.reddah.com\/uploadPhoto/g, "\"https:\/\/login.reddah.com\/uploadPhoto");
        
        return output;
    }

    subpost(str: string, n: number, sufix="...") {
        var r = /[^\u4e00-\u9fa5]/g;
        if (str.replace(r, "mm").length <= n) { return str; }
        var m = Math.floor(n/2);
        for (var i = m; i < str.length; i++) {
            if (str.substr(0, i).replace(r, "mm").length >= n) {
                return str.substr(0, i) + sufix;
            }
        }
        return str;
    }
    
    doubleByteLocale = ["zh-cn","zh-tw","ja-jp","ko-kr"];

    summary(str: string, n: number, locale='en-US') {
        if(locale==null)
            locale='en-US';
        locale = locale.toLowerCase();
        if(!this.doubleByteLocale.includes(locale))
            n = 2*n;
        str = this.htmlDecode(this.htmlDecode(str))
            .replace(/<br>/g,"\n")
            .replace(/<[^>]+>/g, "")
            .replace(/\n\n/g,"<br>");
        if(str.startsWith("<br>"))
            str = str.replace("<br>", "");
        return this.subpost(str, n);
    }

    summaryShort(str: string, n: number, fix: string,  locale='en-US') {
        if(locale==null)
            locale='en-US';
        locale = locale.toLowerCase();
        if(!this.doubleByteLocale.includes(locale))
            n = 2*n;
        str = this.htmlDecode(str)
            
        if(str.startsWith("<br>"))
            str = str.replace("<br>", "");
        return this.subpost(str, n, fix);
    }

    summaryMsg(str: string, n: number=100, locale='en-US') {
        return this.summary(str, n, locale).replace(/<[^>]+>/g, "");
    }

    playVideo(id: string) {
        let v = document.querySelector('#video_' + id)[0];
        if(v){
            if (v.paused) {
                v.play();
            } else {
                v.pause();
            }
        }
    }
    
    /*trustAsResourceUrl = function (url) {
      return $sce.trustAsResourceUrl(url);
    }*/

    QrUserKey = 'https://reddah.com/apk/reddah.apk?username=';
    

    //appPhoto = {};
    appCacheToOrg = {};

    appData(cacheKey, userPhotoName="anonymous.png"){    
        let storedKey = cacheKey.replace("///","https://")
        let result = this.localStorageService.retrieve(storedKey);
        
        if(cacheKey.indexOf('userphoto_')>-1){
            if(this.platform.is('android')){
                if(result)
                    return (<any>window).Ionic.WebView.convertFileSrc(result);
                else
                    return "assets/icon/"+userPhotoName;
            }
            else{
                let url = this.localStorageService.retrieve(cacheKey+"_url");
                if(url)
                    return url
                return "assets/icon/"+userPhotoName;
            }
        }
        else if(cacheKey.indexOf('cover_')>-1){
            if(this.platform.is('android')){
                if(result)
                    return (<any>window).Ionic.WebView.convertFileSrc(result);
                else
                    return "assets/icon/timg.jpg";
            }
            else{
                let url = this.localStorageService.retrieve(cacheKey+"_url");
                if(url)
                    return url
                return "assets/icon/timg.jpg";
            }
        }
        else{//pure text
            return result==null ? "": result;
        }
    }

    appDataUserPhoto(cacheKey){  
        let result = this.localStorageService.retrieve(cacheKey); 
        if(result&&this.platform.is('cordova')){
            return (<any>window).Ionic.WebView.convertFileSrc(result);
        }

        let url = this.localStorageService.retrieve(cacheKey+"_url"); 
        if(url)
            return url.replace("///","https://");
        return "assets/icon/anonymous.png";
    }

    appDataMap(cacheKey, url){
        let result = this.localStorageService.retrieve(cacheKey); 
        if(result&&this.platform.is('cordova')){
            return (<any>window).Ionic.WebView.convertFileSrc(result);
        }

        if(url)
            return url.replace("///","https://");
        return "assets/icon/anonymous.png";
    }

    async appData2(cacheKey){     
        let result = this.localStorageService.retrieve(cacheKey);
        return await (<any>window).Ionic.WebView.convertFileSrc(result);
    }

    async appData1(cacheKey){        
        let result = this.localStorageService.retrieve(cacheKey);
        
        if(cacheKey.indexOf('userphoto_')>-1){
            if(result&&this.platform.is('cordova')){
                return await (<any>window).Ionic.WebView.convertFileSrc(result);
            }
            else{
                return "assets/icon/anonymous.png";
            }
        }
        else if(cacheKey.indexOf('cover_')>-1){
            if(result&&this.platform.is('cordova')){
                return await (<any>window).Ionic.WebView.convertFileSrc(result);
            }
            else{
                return "assets/icon/timg.jpg";
            }
        }
        else{//pure text
            return result==null ? "": result;
        }
    }

    level2Cache(cacheKey){
        if(this.platform.is('android')){
            let storekey = cacheKey.replace("///","https://")
            let preview = this.localStorageService.retrieve(storekey);
            let org = this.localStorageService.retrieve(storekey.replace("_reddah_preview",""))
    
            if(org){
                return (<any>window).Ionic.WebView.convertFileSrc(org);
            }
            else if(preview)
            {
                return (<any>window).Ionic.WebView.convertFileSrc(preview);
            }
            else
            {
                return cacheKey.replace("///","https://");
            }
        }
        else{
            return cacheKey.replace("///","https://");
        }
        
    }

    chatImageCache(cacheKey){
        let preview = this.localStorageService.retrieve(cacheKey);
        let org = this.localStorageService.retrieve(cacheKey.replace("_reddah_preview",""))
        
        if(org)
            return (<any>window).Ionic.WebView.convertFileSrc(org);
        else if(preview)
            return (<any>window).Ionic.WebView.convertFileSrc(preview);
        else
        {
            if(this.platform.is('cordova'))
                this.toFileCache(cacheKey);
            return cacheKey;
        }
    }

    getFileName(url){
        let start = url.lastIndexOf('/')+1;
        let end = url.indexOf('?');
        end = (end==-1)?url.length:end;
        return url.substring(start, end);
    }

    private fileTransfer: FileTransferObject; 
    toFileCache(webUrl, isVideo=false){
        let deviceDirectory = this.getDeviceDirectory();
        
        let cachedFilePath = this.localStorageService.retrieve(webUrl);
        //alert("webUrl:"+webUrl+cachedFilePath);
        if(cachedFilePath==null){
            webUrl = webUrl.replace("///","https://");
            let webFileName = this.getFileName(webUrl);
            let targetUrl = deviceDirectory+"reddah/" + webFileName;
            //alert(webFileName+"____"+targetUrl)
            this.fileTransfer = this.transfer.create();  
            this.fileTransfer.download(webUrl, targetUrl).then(
            _ => {
                if(isVideo)
                {
                    //this.localStorageService.store(webUrl,(<any>window).Ionic.WebView.convertFileSrc(targetUrl));
                    this.localStorageService.store(webUrl, targetUrl);
                }
                else{
                    this.localStorageService.store(webUrl, targetUrl);
                    
                    this.appCacheToOrg[(<any>window).Ionic.WebView.convertFileSrc(targetUrl)] = webUrl;
                }
                //alert(webUrl)
            }, 
            _ => { 
                //alert(JSON.stringify(_))
                console.log(JSON.stringify(_)) });
        }
    } 

    getDeviceDirectory(){
        let dir = this.file.externalRootDirectory;
        if(this.platform.is('android'))
        {
            dir = this.file.externalRootDirectory;
        }
        else if(this.platform.is('ipad')||this.platform.is('iphone')||this.platform.is('ios')){
            dir = this.file.cacheDirectory;
        }
        else {
            
        }
        return dir;
    }

    toImageCache(webUrl, cacheKey){
        if(webUrl!=null){
            let deviceDirectory = this.getDeviceDirectory();
            
            let cachedImagePath = this.localStorageService.retrieve(cacheKey);

            let cacheImageName = "";
            if(cachedImagePath!=null){
                cacheImageName = cachedImagePath.replace(deviceDirectory+"reddah/","");
            }

            
            webUrl = webUrl.replace("///","https://");
            let webImageName = this.getFileName(webUrl);

            if(cachedImagePath==null||cacheImageName!=webImageName){
                this.fileTransfer = this.transfer.create();
                let targetUrl = deviceDirectory+"reddah/" + webImageName;
                this.fileTransfer.download(webUrl, targetUrl).then(
                _ => {
                    this.localStorageService.store(cacheKey, targetUrl);
                    this.appCacheToOrg[(<any>window).Ionic.WebView.convertFileSrc(targetUrl)] = webUrl;
                }, 
                _ => { console.log(JSON.stringify(_)); });
            }
        }
    } 

    toTextCache(text, cacheKey){
        if(text!=null){
            let cachedText = this.localStorageService.retrieve(cacheKey);
            
            if(cachedText!=text){
                this.localStorageService.store(cacheKey, text);
            }
        }
    } 

    verifyImageFile(key){
        let cachedPath = this.localStorageService.retrieve(key);
        if(cachedPath&&this.platform.is('android')){
            let fileName = this.getFileName(cachedPath);
            let filePath = cachedPath.replace(fileName, "");
            
            this.file.checkFile(filePath, fileName).then(
                (files) => {
                    console.log("files found" + files)
                }
                ).catch(
                (err) => {
                    this.localStorageService.clear(key);
                }
            );
        }
    }

    async getUserPhotos(userName, isTimeline=false){
        if(userName==null)
            return;
        try{
            
            this.verifyImageFile(`cover_${userName}`);
            this.verifyImageFile(`userphoto_${userName}`);

            //check from web
            let formData = new FormData();
            formData.append("targetUser", userName);

            await this.getUserInfo(formData)
            .subscribe(userInfo => 
            {
                if(userInfo.Cover!=null){
                    this.toImageCache(userInfo.Cover, `cover_${userName}`);
                    this.localStorageService.store(`cover_${userName}_url`,userInfo.Cover);
                }
                if(userInfo.Photo!=null){
                    this.toImageCache(userInfo.Photo, `userphoto_${userName}`);
                    this.localStorageService.store(`userphoto_${userName}_url`,userInfo.Photo)
                }
                          
                if(userInfo.NickName!=null)
                    this.toTextCache(userInfo.NickName, `usernickname_${userName}`);
                if(userInfo.Sex!=null)
                    this.toTextCache(userInfo.Sex, `usersex_${userName}`);
                if(userInfo.Location!=null){
                    let locationTitle = JSON.parse(userInfo.Location).title;
                    this.toTextCache(locationTitle, `userlocation_${userName}`);
                    this.toTextCache(userInfo.Location, `userlocationjson_${userName}`);
                }
                if(userInfo.Admins!=null)
                    this.toTextCache(userInfo.Admins, `useradmins_${userName}`);
                if(userInfo.Point!=null)
                    this.toTextCache(userInfo.Point, `userpoint_${userName}`);
                if(userInfo.Signature!=null)
                    this.toTextCache(userInfo.Signature, `usersignature_${userName}`);
                if(userInfo.Email!=null)
                    this.toTextCache(userInfo.Email, `useremail_${userName}`);
                if(userInfo.Type!=null)
                    this.toTextCache(userInfo.Type, `usertype_${userName}`);
                if(userInfo.NoteName!=null)
                    this.toTextCache(userInfo.NoteName, `usernotename_${userName}_${this.getCurrentUser()}`);
                if(userInfo.UserName!=this.getCurrentUser()){
                    this.toTextCache(userInfo.IsFriend?1:0, `userisfriend_${userName}_${this.getCurrentUser()}`);
                }
                if(userInfo.HideLocation!=null){
                    //alert(userInfo.HideLocation);
                    this.toTextCache(userInfo.HideLocation?1:0, `userhidelocation_${userName}`);
                    //alert(this.appData(`userhidelocation_${userName}`));
                }
                if(userInfo.AllowTenTimeline!=null)
                {
                    //alert(userInfo.AllowTenTimeline);
                    this.toTextCache(userInfo.AllowTenTimeline?1:0, `userallowtentimeline_${userName}`);
                    //alert(this.appData(`userallowtentimeline_${userName}`));
                }
            
            });
        }
        catch(error){
            alert(error)
        }
    }
    

    GetCache(url){
        if(this.platform.is('cordova')){
            let org = this.localStorageService.retrieve(url);
            if(org){
                return (<any>window).Ionic.WebView.convertFileSrc(org);
            }
        }
        else
        {
            return url;
        }
    }

    getSortLetter(text, locale){
        if(!String.prototype.localeCompare)
            return null;
    
        let letters = "*abcdefghjklmnopqrstwxyz".split('');
        let zh = "阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀".split('');
    
        let result = '#';
        letters.forEach((letter, i) => {
            if((!zh[i-1] || zh[i-1].localeCompare(text, locale) <= 0) && text.localeCompare(zh[i], locale) == -1) {
                result = letter;
            }
        });

        return result;
    }

    complement(n) { return n < 10 ? '0' + n : n }

    generateFileName() {
        var date = new Date();
        return date.getFullYear().toString() + this.complement(date.getMonth() + 1) + this.complement(date.getDate()) + this.complement(date.getHours()) + this.complement(date.getMinutes()) + this.complement(date.getSeconds());
    }

    getDisplayName(userName, count=15){
        let currentUserName = this.getCurrentUser();
        let name = this.appData('usernotename_'+userName+"_"+currentUserName) ? this.appData('usernotename_'+userName+"_"+currentUserName) :
            (this.appData('usernickname_'+userName) ? this.appData('usernickname_'+userName) : userName);
        return this.summary(name, count, this.getCurrentLocale());    
    }
    
    getArray(n){
        if(n==null||n<0)
            n=0;
        return new Array(n);
    }

    getSendTime(dateStr){
        
        if(!dateStr)
            return "";
        let dateTimeStamp = Date.parse(dateStr.replace(/-/gi,"/"));
        let result = "";
        let second = 1000;
        let minute = 1000 * 60;
        let hour = minute * 60;
        let day = hour * 24;
        let halfamonth = day * 15;
        let month = day * 30;
        let year = day *365;
        let localnow = new Date().getTime();
        //to utc now
        let offset = new Date().getTimezoneOffset()*60*1000;
        let now = new Date(localnow+offset).getTime(); 
        
        let diffValue = now - dateTimeStamp;
        if(diffValue < 0){
            if(diffValue>-1000*60)
                return this.translate.instant("Time.JustNow");
            else 
                return result;
        }
        let yearC =diffValue/year;
        let monthC =diffValue/month;
        let weekC =diffValue/(7*day);
        let dayC =diffValue/day;
        let hourC =diffValue/hour;
        let minC =diffValue/minute;
        let secC =diffValue/second;

        let split = "";
        if(!this.doubleByteLocale.includes(this.getCurrentLocale().toLowerCase())){
            split=" ";
        }

        if(yearC>=1){
            result=parseInt(yearC+"") + split +this.translate.instant("Time.YearsAgo");
        }
        else if(monthC>=1){
            result=parseInt(monthC+"") + split + this.translate.instant("Time.MonthsAgo");
        }
        else if(weekC>=1){
            result=parseInt(weekC+"") + split + this.translate.instant("Time.WeeksAgo");
        }
        else if(dayC>=1){
            result=(parseInt(dayC+"")==1?this.translate.instant("Time.Yesterday"):parseInt(dayC+"") + split +this.translate.instant("Time.DaysAgo"));
        }
        else if(hourC>=1){
            result=parseInt(hourC+"") + split +this.translate.instant("Time.HoursAgo");
        }
        else if(minC>=1){
            result=parseInt(minC+"") + split +this.translate.instant("Time.MinutesAgo");
        }
        else if(secC>=1){
            result=this.translate.instant("Time.JustNow");
        }
        
        return result;
    }

    getSendTimeShort(dateStr){
        if(!dateStr)
            return "";
        let dateTimeStamp = Date.parse(dateStr.replace(/-/gi,"/"));
        let result = "";
        let second = 1000;
        let minute = 1000 * 60;
        let hour = minute * 60;
        let day = hour * 24;
        let halfamonth = day * 15;
        let month = day * 30;
        let year = day *365;
        let localnow = new Date().getTime();
        //to utc now
        let offset = new Date().getTimezoneOffset()*60*1000;
        let now = new Date(localnow+offset).getTime(); 
        
        let diffValue = now - dateTimeStamp;
        if(diffValue < 0){
            if(diffValue>-1000*60)
                return this.translate.instant("Time.Today");
            else 
                return dateStr;
        }
        let yearC =diffValue/year;
        let monthC =diffValue/month;
        let weekC =diffValue/(7*day);
        let dayC =diffValue/day;
        let hourC =diffValue/hour;
        let minC =diffValue/minute;
        let secC =diffValue/second;
        if(yearC>=1){
            return dateStr;
        }
        else if(monthC>=1){
            return dateStr;
        }
        else if(weekC>=1){
            return dateStr;
        }
        else if(dayC>=1){
            result=(parseInt(dayC+"")==1?this.translate.instant("Time.Yesterday"):dateStr);
        }
        else if(hourC>=1){
            return this.translate.instant("Time.Today");
        }
        else if(minC>=1){
            return this.translate.instant("Time.Today");
        }
        else if(secC>=1){
            return this.translate.instant("Time.Today");
        }
        
        return dateStr;
    }

    getSendTimeChat(dateStr){
        if(!dateStr)
            return "";
        let dateTimeStamp = Date.parse(dateStr.replace(/-/gi,"/"));
        let result = "";
        let second = 1000;
        let minute = 1000 * 60;
        let hour = minute * 60;
        let day = hour * 24;
        let halfamonth = day * 15;
        let month = day * 30;
        let year = day *365;
        let localnow = new Date().getTime();
        //to utc now
        let offset = new Date().getTimezoneOffset()*60*1000;
        let now = new Date(localnow+offset).getTime(); 
        
        let diffValue = now - dateTimeStamp;
        if(diffValue < 0){
            if(diffValue>-1000*60)
                return this.utcToLocal(dateStr,'HH:mm');
            else 
                return result;
        }
        let yearC =diffValue/year;
        let monthC =diffValue/month;
        let weekC =diffValue/(7*day);
        let dayC =diffValue/day;
        let hourC =diffValue/hour;
        let minC =diffValue/minute;
        let secC =diffValue/second;
        if(yearC>=1){
            result=parseInt(yearC+"") + "" +this.translate.instant("Time.YearsAgo");
        }
        else if(monthC>=1){
            result=parseInt(monthC+"") + "" + this.translate.instant("Time.MonthsAgo");
        }
        else if(weekC>=1){
            result=parseInt(weekC+"") + "" + this.translate.instant("Time.WeeksAgo");
        }
        else if(dayC>=1){
            result=(parseInt(dayC+"")==1?this.translate.instant("Time.Yesterday"):parseInt(dayC+"") + "" +this.translate.instant("Time.DaysAgo"));
        }
        else if(hourC>=1){
            result=this.utcToLocal(dateStr,'HH:mm');
        }
        else if(minC>=1){
            result=this.utcToLocal(dateStr,'HH:mm');
        }
        else if(secC>=1){
            result=this.utcToLocal(dateStr,'HH:mm');
        }
        
        return result;
    }

    async loadFriends(){
        let cachedContact = this.localStorageService.retrieve("Reddah_Contacts");
        if(!cachedContact){
            let cacheKey = "this.reddah.getFriends";
            let request = this.getFriends();
    
            this.cacheService.loadFromObservable(cacheKey, request, "ContactPage")
            .subscribe(contacts => 
            {
                this.localStorageService.store("Reddah_Contacts", JSON.stringify(contacts));
            }); 
        }
    }

    getAllowedNames(groupName){
        let result = [];
        let cachedContact = this.localStorageService.retrieve("Reddah_Contacts");
        if(cachedContact){
            let friends = JSON.parse(cachedContact).map(x=>x.Watch);
            let groupNames = groupName.split(',')
            groupNames.forEach((name)=>{
                if(friends.includes(name)||name==this.getCurrentUser())
                    result.push({userName: name, displayName: this.getDisplayName(name)});
            });
        }

        return result;
    }

    getAllowedComments(data){
        let cachedContact = this.localStorageService.retrieve("Reddah_Contacts");
        if(cachedContact){
            let friends = JSON.parse(cachedContact).map(x=>x.Watch);
            return data.Comments.filter(c=>(friends.includes(c.UserName)||c.UserName==this.getCurrentUser())&&data.Seed==c.ParentId);
        }
        return [];
    }


    unReadMessage = [];
    //unReadMessage(){
    //    return [{userName:'wind', type:0},{userName:'duck6686', type:0}];
    //}

    storeReadMessage(){
        let readMessages = this.localStorageService.retrieve("Reddah_ReadMessages");
        if(!readMessages)
            readMessages = []
        readMessages = readMessages.concat(this.unReadMessage);
        this.localStorageService.store("Reddah_ReadMessages", readMessages);   
        this.unReadMessage = [];
    }

    getStoredMessage(){
        let readMessages = this.localStorageService.retrieve("Reddah_ReadMessages");
        if(!readMessages)
            readMessages = [];
        
        return readMessages;
    }

    clearStoredMessage(){
        this.localStorageService.clear("Reddah_ReadMessages");
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    getRandomArray(m, n){
        let a = [];
        for(let i=0;i<n;i++)
        {
            a.push(i);
        }
        
        let r=[];
        for (let j=1; j<=m; ++j)
        {
            var k = Math.floor((Math.random() * (n-j)) + 1);
            r.push(a[k]);
            a[k] = a[n-j];
        }

        return r;
    }

    fontSizeMap = new Map()
    .set(1,'12px')
    .set(2,'13px')
    .set(3,'14px')
    .set(4,'15px')
    .set(5,'16px')
    .set(6,'17px')
    .set(7,'18px')
    .set(8,'19px')
    .set(9,'20px')
    .set(10,'21px');

    
    async toast(message: string, color="dark") {
        const toast = await this.toastController.create({
            message: message,
            showCloseButton: true,
            position: "top",
            closeButtonText: this.translate.instant("Button.Close"),
            duration: 3000,
            color: color,
            cssClass: "toast-style"
        });
        toast.present();
    }

    async addBookmark(articleId){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(articleId));
        
        this.addBookmarkFormData(formData);
    }

    async addBookmarkFormData(formData){
        let text = `${this.translate.instant("Pop.Marked")}:${this.translate.instant("Menu.About")}/${this.translate.instant("Menu.Mark")}`;
        this.bookmark(formData).subscribe(result=>{
            if(result.Success==0)
            {
                this.toast(text, "primary");
                this.cacheService.clearGroup("BookmarkPage");
            }
            else{
                alert(JSON.stringify(result.Message));
            }
        })
        
    }

    isLocal(videoUrl){
        let key = videoUrl.toString().toLowerCase();
        let localPath = this.localStorageService.retrieve(key);
        return localPath!=null;
    }

    clearLocaleCache(){
        this.localStorageService.clear("reddah_articles");
        this.localStorageService.clear("reddah_article_ids");
        this.localStorageService.clear("reddah_article_groups");
        this.localStorageService.clear("reddah_article_usernames");
        this.cacheService.clearGroup("HomePage");
    }

    async ClearPub(){
        this.localStorageService.clear("Reddah_GroupedSubs");
        this.localStorageService.clear("Reddah_Subs");
        this.cacheService.clearGroup("ManageSubsPage");
    }

    getJSON(text){
        if(text==null||text=='undefined')
            return "";
        return JSON.parse(text);
    }

    openMini(webUrl, miniName){
        let deviceDirectory = this.getDeviceDirectory();

        this.fileTransfer = this.transfer.create();  
        let targetUrl = deviceDirectory+"reddah/mini/" + miniName;
        this.fileTransfer.download(webUrl, targetUrl).then(
        _ => {
            let localUrl = (<any>window).Ionic.WebView.convertFileSrc(targetUrl);

            const browser = this.iab.create(localUrl, 'location=no');
            browser.show();
        }, 
        _ => { console.log(JSON.stringify(_)) });
    }

    utcToLocal(str, format="YYYY-MM-DD HH:mm:ss"){
        let localTime = moment.utc(str).toDate();
        return moment(localTime).format(format).toString();
    }

    setRecent(user, type){
        let recent = this.localStorageService.retrieve(`Reddah_Recent_${type}`);
        
        if(!recent||recent.length==0){
            recent = [];
            recent.push(user);
        }
        else{
            recent.forEach((item,index)=>{
                if(item.UserId==user.UserId){
                    recent.splice(index, 1);
                }
            });
            recent.unshift(user);
        }
        this.localStorageService.store(`Reddah_Recent_${type}`, recent);
            
    }

    loadRecent(type){
        let recent = this.localStorageService.retrieve(`Reddah_Recent_${type}`);
        if(!recent)
            recent = [];
        return recent;
    }

    //setUserRecentUseMini
    //******************************** */
    private setUserRecentUseMini = 'https://login.reddah.com/api/pub/setrecentmini'; 

    setRecentUseMini(miniUserName): Observable<any> {
        let formData = new FormData();
        formData.append('id', miniUserName);
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.setUserRecentUseMini, formData)
        .pipe(
            tap(data => this.log('set user recent used mini')),
            catchError(this.handleError('set user recent used mini', []))
        );
    }
    //******************************** */


    private suggestMiniUrl = 'https://login.reddah.com/api/pub/getsuggestmini'; 
    getSuggestMinis(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.suggestMiniUrl, formData)
        .pipe(
            tap(data => this.log('get suggest minis')),
            catchError(this.handleError('get suggest minis', []))
        );
    }

    hasClass(el: Element, name: string): any {
        return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }

    addClass(el: Element, name: string): void {
        if (!this.hasClass(el, name)) {
            el.className = el.className ? [el.className, name].join(" ") : name;
        }
    }
    removeClass(el: Element, name: string): void {
        if (this.hasClass(el, name)) {
            el.className = el.className.replace(
            new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"),
            ""
            );
        }
    }

    getHourString(){
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours();
        return date + " " + time;
    }

    getTimeString(){
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes();// + ":" + today.getSeconds();
        return date + " " + time;
    }

    getRuffDistanceByDegree(degree){
        if(degree<0)
            degree=degree*-1;
        let meters = parseInt(111*1000*degree+"");
        if(meters>1000){
            return parseInt(meters/1000+"") + this.translate.instant("Pop.KM")
        }
        return meters + this.translate.instant("Pop.M");
    }

    async adjustImage(url, flag){
        let imgId = this.makeItId(url+flag);
        let image = document.getElementById(imgId);

        if(image){
            if(image.offsetHeight<image.offsetWidth)
            {
                image.style.height = "100%";
                this.localStorageService.store(imgId+"adjusth", true);
            }
            else{
                if(flag=="home"){
                    let result = this.localStorageService.retrieve(imgId+"adjusth");
                    if(result)
                    {
                        image.style.height = "100%";
                    }
                    else
                    {
                        image.style.height = "";
                    }
                }
                else{
                    image.style.height = "";
                }
            }
        }
    }

    makeItId(text){
        return text.replace(/[\/:,.%-]/g,'_');
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async takePhoto(photos, formData){
        const options: CameraOptions = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true
        }
          
        Camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: imageData, webUrl: (<any>window).Ionic.WebView.convertFileSrc(imageData)};
            photos.push(data);
            this.addPhotoToFormData(data, formData);
        }, (err) => {
            //alert(JSON.stringify(err));
        });
        
    }

    async fromLibPhoto(photos, formData)
    {
        const options: CameraOptions = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        }
          
        Camera.getPicture(options).then((imageData) => {
            let data = {fileUrl: imageData, webUrl: (<any>window).Ionic.WebView.convertFileSrc(imageData)};
            photos.push(data);
            this.addPhotoToFormData(data, formData);
        }, (err) => {
            //alert(JSON.stringify(err));
        });
        
    }

    addPhotoToFormData(photo, formData){
        //append org photo form data
        this.prepareData(photo.fileUrl, photo.fileUrl, formData);

        //append preview photo form data
        let orgFileName = photo.fileUrl.substring(photo.fileUrl.lastIndexOf('/')+1);
        let fileExtention = orgFileName.substring(orgFileName.lastIndexOf('.'));
        //remove ?****
        let removdQFileExtention = fileExtention.lastIndexOf('?')==-1 ? 
            fileExtention : fileExtention.replace(fileExtention.substring(fileExtention.lastIndexOf('?')),"");
        
        let previewFileName = orgFileName.replace(fileExtention,"") + "_reddah_preview" + removdQFileExtention;
        //alert(photo.fileUrl+"_"+previewFileName);
        let options = {
            uri: photo.fileUrl,
            folderName: 'reddah',
            fileName: previewFileName,
            quality: 40,
            width: 800,
            height: 800
        } as ImageResizerOptions;
        ImageResizer
            .resize(options)
            .then((filePath: string) => this.prepareData(filePath, photo.fileUrl+"_reddah_preview", formData))
            .catch(e => alert(e));
    }

    prepareData(filePath, formKey, formData) {
        this.file.resolveLocalFilesystemUrl(filePath)
        .then(entry => {
            ( <FileEntry> entry).file(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    //org image data
                    const imgBlob = new Blob([reader.result], {
                        type: file.type
                    });
                    formData.append(formKey, imgBlob, file.name);
                };
                reader.readAsArrayBuffer(file);
            })
        })
        .catch(err => {
            console.error(JSON.stringify(err));
        });
    }

    checkPermission(permissionId){
        let jwt  = this.getCurrentJwt();
        let parts = jwt.split('.');
        let bodyEnc = parts[1];
        if(!bodyEnc){
            return false;
        }
        let bodyStr = atob(bodyEnc)
            , body;

        try{
            body = JSON.parse(bodyStr);
        }
        catch(e){
            body = {};
        }

        let exp = body.exp
            , user= body.aud
        ;

        if(this.isExpired(exp)){
            return false;
        }
        //console.log(body)
        if(body[permissionId]!=null)
            return true;
        return false;
        
    }

    isExpired(exp:number): boolean {
        if(!exp) return true;
        let now = Date.now();
        return now >= exp*1000;
    }

    preImageArray(imageSrcArray){
        return imageSrcArray.map(item=>{
            return {
                webPreviewUrl: this.parseImage(item)
            }
        });
    }

    parseImage(url){
        url = url.replace("///", "https://");
        return url;
    }
    
    publishers = new Set<string>();

    async checkIsToday(date){
        let cur = new Date(date);
        return cur.getDate()==new Date().getDate();
    }

    windowReload(){
        if(this.platform.is('android')){
            window.location.reload();
        }
        else{
            //this.modalController.dismiss();
            
            //this.router.navigate([''])
            
        }
    }  

    notify(title, text){
        this.localNotifications.schedule({
            id: 1,
            title: title,
            text: text,
            sound: null,
            data: { secret: "key" }
            //sound: isAndroid? 'file://sound.mp3': 'file://beep.caf',
            //data: { secret: key }
        });
    }

}
