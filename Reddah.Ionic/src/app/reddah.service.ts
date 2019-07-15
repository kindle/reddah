import { Injectable } from '@angular/core';
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
import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';

import { PostviewerPage } from './postviewer/postviewer.page';
import { LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';
import { CacheService } from 'ionic-cache';
import { TranslateService } from '@ngx-translate/core';
import { TsViewerPage } from './mytimeline/tsviewer/tsviewer.page';

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
        private modalController: ModalController,
        private toastController: ToastController,
        private platform: Platform,
        private cacheService: CacheService,
        private translate: TranslateService,
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

    addComments(articleId: number, parentId: number, content: string): Observable<any> {

        return this.http.post<any>(this.addCommentsUrl, new NewCommentModel(this.getCurrentJwt(), articleId, parentId, content))
        .pipe(
            tap(data => this.log('add comment')),
            catchError(this.handleError('add comment', []))
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
    private changeNickNameUrl = 'https://login.reddah.com/api/article/changenickname'; 

    changeNickName(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.changeNickNameUrl, formData)
        .pipe(
            tap(data => this.log('change nick name')),
            catchError(this.handleError('change nick name', []))
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

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.bookmarkUrl, formData)
        .pipe(
            tap(data => this.log('set bookmark')),
            catchError(this.handleError('set bookmark', []))
        );
    }
    //******************************** */
    private deleteBookmarkUrl = 'https://login.reddah.com/api/article/deletebookmark'; 

    deleteBookmark(formData: FormData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.deleteBookmarkUrl, formData)
        .pipe(
            tap(data => this.log('delete bookmark')),
            catchError(this.handleError('delete bookmark', []))
        );
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



    private log(message: string) {
      console.log(message);
    }

    public Locales = [
        new Locale("zh-CN", "简体中文(China)"),
        new Locale("fr-FR", "France"),
        new Locale("ja-JP", "日本(Japan)"),
        new Locale("ko-KR", "대한민국(Korea)"),
        new Locale("en-US", "English(US)"),
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

    getArticles(loadedIds: Number[], locale: String, menu: String, keyword="", status=1, userName="", type=0): Observable<Article[]> {
        this.userProfileModel = new UserProfileModel();
        this.userProfileModel.LoadedIds = loadedIds;
        this.userProfileModel.Locale = locale;
        this.userProfileModel.Menu = menu;
        this.userProfileModel.Token = "";
        this.userProfileModel.Sub = "";
        this.userProfileModel.User = userName;
        this.userProfileModel.Keyword = keyword;
        this.userProfileModel.Type = type;
        this.userProfileModel.Status = status;

        /*const httpOptions = {
          headers: new HttpHeaders({ 
            'Content-Type':'application/json',
            'Access-Control-Allow-Origin*':'*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST, PUT',
            'Access-Control-Allow-Headers':'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
          }),
          body: this.userProfileModel
          
        };*/

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



    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
   */
    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
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
          console.log(sohuStockApi);

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
        console.log(imgData.data)
console.log(`r:${imgData.data[0]},g:${imgData.data[1]},b:${imgData.data[2]}`);
        
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
        return output;
    }

    subpost(str: string, n: number) {
        var r = /[^\u4e00-\u9fa5]/g;
        if (str.replace(r, "mm").length <= n) { return str; }
        var m = Math.floor(n/2);
        for (var i = m; i < str.length; i++) {
            if (str.substr(0, i).replace(r, "mm").length >= n) {
                return str.substr(0, i) + "...";
            }
        }
        return str;
    }

    summary(str: string, n: number, locale='en-US') {
        if(locale==null)
            locale='zh-cn';
        locale = locale.toLowerCase();
        if(locale=='en-us'||locale=='fr-fr')
            n = 2*n;
        str = this.htmlDecode(this.htmlDecode(str)).replace(/<[^>]+>/g, "");
        return this.subpost(str, n);
    }

    playVideo(id: string) {
        let v = document.querySelector('#video_' + id)[0];
        if (v.paused) {
            v.play();
        } else {
            v.pause();
        }
    }
    
    /*trustAsResourceUrl = function (url) {
      return $sce.trustAsResourceUrl(url);
    }*/

    QrUserKey = 'https://reddah.com/apk/reddah.apk?username=';
    
    emojis = [
        ['😀','😃','😄','😁','😆','😅'],
        ['❤️','⚽️','🏀','🍎','🍉','☕️'],
        ['🌈','☀️','🌧','🐶','🐱','🐷'],
        ['😎','😱','😴','👍','👎','💪'],
        ['🙏','😜','😡','😍','👻','💩']
    ];

    //appPhoto = {};
    appCacheToOrg = {};
    
    appDataPub(cacheKey){
        let result = this.localStorageService.retrieve(cacheKey);
        
        if(cacheKey.indexOf('userphoto_')>-1){
            if(result&&this.platform.is('cordova')){
                return (<any>window).Ionic.WebView.convertFileSrc(result);
            }
            else{
                return "assets/icon/photo.svg";
            }
        }
        else if(cacheKey.indexOf('cover_')>-1){
            if(result&&this.platform.is('cordova')){
                return (<any>window).Ionic.WebView.convertFileSrc(result);
            }
            else{
                return "assets/icon/timg.jpg";
            }
        }
        else{//pure text
            return result==null ? "": result;
        }
    }

    appData(cacheKey){
        let result = this.localStorageService.retrieve(cacheKey);
        
        if(cacheKey.indexOf('userphoto_')>-1){
            if(result&&this.platform.is('cordova')){
                return (<any>window).Ionic.WebView.convertFileSrc(result);
            }
            else{
                return "assets/icon/anonymous.png";
            }
        }
        else if(cacheKey.indexOf('cover_')>-1){
            if(result&&this.platform.is('cordova')){
                return (<any>window).Ionic.WebView.convertFileSrc(result);
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
        let preview = this.localStorageService.retrieve(cacheKey);
        let org = this.localStorageService.retrieve(cacheKey.replace("_reddah_preview",""))
        
        if(org)
            return (<any>window).Ionic.WebView.convertFileSrc(org);
        else if(preview)
            return (<any>window).Ionic.WebView.convertFileSrc(preview);
        else
            return cacheKey;
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
        let cachedFilePath = this.localStorageService.retrieve(webUrl);
        if(cachedFilePath==null){
            webUrl = webUrl.replace("///","https://");
            let webFileName = this.getFileName(webUrl);
            let targetUrl = this.file.externalRootDirectory+"reddah/" + webFileName;

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
            }, 
            _ => { console.log(JSON.stringify(_)) });
        }
    } 

    toImageCache(webUrl, cacheKey){
        let cachedImagePath = this.localStorageService.retrieve(cacheKey);

        let cacheImageName = "";
        if(cachedImagePath!=null){
            cacheImageName = cachedImagePath.replace(this.file.externalRootDirectory+"reddah/","");
        }

        webUrl = webUrl.replace("///","https://");
        let webImageName = this.getFileName(webUrl);

        if(cachedImagePath==null||cacheImageName!=webImageName){
            this.fileTransfer = this.transfer.create();
            let targetUrl = this.file.externalRootDirectory+"reddah/" + webImageName;
            this.fileTransfer.download(webUrl, targetUrl).then(
            _ => {
                this.localStorageService.store(cacheKey, targetUrl);
                this.appCacheToOrg[(<any>window).Ionic.WebView.convertFileSrc(targetUrl)] = webUrl;
            }, 
            _ => { console.log(JSON.stringify(_)); });
        }
    } 

    toTextCache(text, cacheKey){
        if(text){
            let cachedText = this.localStorageService.retrieve(cacheKey);
            
            if(cachedText!=text){
                this.localStorageService.store(cacheKey, text);
            }
        }
    } 

    verifyImageFile(key){
        let cachedPath = this.localStorageService.retrieve(key);
        if(cachedPath&&this.platform.is('cordova')){
            let fileName = this.getFileName(cachedPath);
            let filePath = cachedPath.replace(fileName, "");
            
            this.file.checkFile(filePath, fileName).catch(_=>{
                this.localStorageService.clear(key);
            });
        }
    }

    getUserPhotos(userName, isTimeline=false){
        if(userName==null)
            return;
        try{
            
            this.verifyImageFile(`cover_${userName}`);
            this.verifyImageFile(`userphoto_${userName}`);

            //check from web
            let formData = new FormData();
            formData.append("targetUser", userName);

            this.getUserInfo(formData)
            .subscribe(userInfo => 
            {
                console.log(userInfo);
                if(userInfo.Cover!=null)
                    this.toImageCache(userInfo.Cover, `cover_${userName}`);
                if(userInfo.Photo!=null)
                    this.toImageCache(userInfo.Photo, `userphoto_${userName}`);
                          
                if(userInfo.NickName!=null)
                    this.toTextCache(userInfo.NickName, `usernickname_${userName}`);
                if(userInfo.Sex!=null)
                    this.toTextCache(userInfo.Sex, `usersex_${userName}`);
                if(userInfo.Location!=null)
                    this.toTextCache(userInfo.Location, `userlocation_${userName}`);
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

    getDisplayName(userName){
        let currentUserName = this.getCurrentUser();
        let name = this.appData('usernotename_'+userName+"_"+currentUserName) ? this.appData('usernotename_'+userName+"_"+currentUserName) :
            (this.appData('usernickname_'+userName) ? this.appData('usernickname_'+userName) : userName);
        return this.summary(name, 15, this.getCurrentLocale());    
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
        if(yearC>=1){
            result=parseInt(yearC+"") + " " +this.translate.instant("Time.YearsAgo");
        }
        else if(monthC>=1){
            result=parseInt(monthC+"") + " " + this.translate.instant("Time.MonthsAgo");
        }
        else if(weekC>=1){
            result=parseInt(weekC+"") + " " + this.translate.instant("Time.WeeksAgo");
        }
        else if(dayC>=1){
            result=(parseInt(dayC+"")==1?this.translate.instant("Time.Yesterday"):parseInt(dayC+"") + " " +this.translate.instant("Time.DaysAgo"));
        }
        else if(hourC>=1){
            result=parseInt(hourC+"") + " " +this.translate.instant("Time.HoursAgo");
        }
        else if(minC>=1){
            result=parseInt(minC+"") + " " +this.translate.instant("Time.MinutesAgo");
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

    getAllMessage(){
        return [
            {userName:'wind', type:0},{userName:'duck6686', type:0},
            {userName:'wind', type:0},{userName:'duck6686', type:0},
            {userName:'wind', type:0},{userName:'duck6686', type:0}
        ];
    }

    fontSizeMap = new Map()
    .set(1,'16px')
    .set(2,'18px')
    .set(3,'20px')
    .set(4,'22px')
    .set(5,'24px')
    .set(6,'26px')
    .set(7,'28px')
    .set(8,'30px')
    .set(9,'32px')
    .set(10,'34px');

    async toast(message: string, color="dark") {
        const toast = await this.toastController.create({
            message: message,
            showCloseButton: true,
            position: 'top',
            closeButtonText: this.translate.instant("Button.Close"),
            duration: 3000,
            color: color
        });
        toast.present();
    }

    async addBookmark(articleId){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(articleId));
        
        this.addBookmarkFormData(formData);
    }

    async addBookmarkFormData(formData){
        this.bookmark(formData).subscribe(result=>{
            if(result.Success==0)
            {
                this.toast(`已收藏，请到到"我/收藏"查看`, "primary");
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
    }

    async ClearPub(){
        this.localStorageService.clear("Reddah_GroupedSubs");
        this.localStorageService.clear("Reddah_Subs");
        this.cacheService.clearGroup("ManageSubsPage");
    }

    getJSON(text){
        return JSON.parse(text);
    }


}
