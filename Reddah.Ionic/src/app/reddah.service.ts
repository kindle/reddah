import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders,
    HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Article } from "./model/article";
import { UserProfileModel } from './model/UserProfileModel';
import { UserModel, QueryCommentModel, NewCommentModel, NewTimelineModel, Queue } from './model/UserModel';
import { Locale } from './model/locale';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'ngx-webstorage';
import { AlertController, LoadingController, NavController, ModalController, ToastController, Platform } from '@ionic/angular';
import { CacheService } from 'ionic-cache';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import * as moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { DatePipe } from '@angular/common';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable({
    providedIn: 'root'
})
export class ReddahService {

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private transfer: FileTransfer,
        private file: File,
        private toastController: ToastController,
        private platform: Platform,
        private cacheService: CacheService,
        private iab: InAppBrowser,
        private localNotifications: LocalNotifications,
        private device: Device,
        private appVersion: AppVersion,
        private datePipe: DatePipe,
        private camera: Camera,
    ) { 

    }

    articles = [];
    loadedIds = [];
    dislikeGroups = [];
    dislikeUserNames = [];

    networkConnected = true;

    async preloadArticles(username){
        let locale = this.getCurrentLocale();
        let cacheKey = "this.reddah.getArticles" + JSON.stringify([])
            + JSON.stringify([]) + JSON.stringify([]) 
            + locale;
        let request = this.getArticles(
            [], 
            [],
            [],
            locale, "promoted");

        this.cacheService.loadFromObservable(cacheKey, request, "HomePage")
        .subscribe(articles => 
        {
            for(let article of articles){
                this.articles.push(article);
                this.loadedIds.push(article.Id);
                if(!this.publishers.has(article.UserName))
                {
                    this.publishers.add(article.UserName);
                    this.getUserPhotos(article.UserName);
                }
            }
            this.localStorageService.store("reddah_articles_"+username, JSON.stringify(this.articles));
            this.localStorageService.store("reddah_article_ids_"+username, JSON.stringify(this.loadedIds));
            this.localStorageService.store("reddah_article_groups_"+username, JSON.stringify([]));
            this.localStorageService.store("reddah_article_usernames_"+username, JSON.stringify([]));
            this.fillCacheArticles();
        });
    }

    async fillCacheArticles() {
        if(this.ArticleCacheQueue.length()<30){
            let locale = this.getCurrentLocale();

            this.getArticles(
                this.loadedIds, 
                this.dislikeGroups,
                this.dislikeUserNames,
                locale, "random")
            .subscribe(articles => 
            {
                for(let article of articles){
                    this.ArticleCacheQueue.push(article);
                    this.loadedIds.push(article.Id);  
                
                    if(!this.publishers.has(article.UserName))
                    {
                        this.publishers.add(article.UserName);
                        this.getUserPhotos(article.UserName);
                    }
                }
                let userName = this.getCurrentUser();
                this.localStorageService.store("reddah_cache_queue_"+userName, JSON.stringify(this.ArticleCacheQueue._store));
                this.localStorageService.store("reddah_article_ids_"+userName, JSON.stringify(this.loadedIds));
                this.localStorageService.store("reddah_article_groups_"+userName, JSON.stringify(this.dislikeGroups));
                this.localStorageService.store("reddah_article_usernames_"+userName, JSON.stringify(this.dislikeUserNames));
                    
            });
        }
    }    

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
    private checkUserNameUrl = 'https://login.reddah.com/api/auth/checkusername'; 
    
    checkUserName(formData): Observable<any> {
        return this.http.post<any>(this.checkUserNameUrl, formData)
        .pipe(
            tap(data => this.log('check user name')),
            catchError(this.handleError('check user name', []))
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
    private verifyEmailUrl = 'https://login.reddah.com/api/auth/verifyemail'; 

    sendVerfiyEmail(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.verifyEmailUrl, formData)
        .pipe(
            tap(data => this.log('verify email')),
            catchError(this.handleError('verify email', []))
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
    private articleLikeUrl = 'https://login.reddah.com/api/article/articlelike'; 

    articleLike(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.articleLikeUrl, formData)
        .pipe(
            tap(data => this.log('article like')),
            catchError(this.handleError('article like', []))
        );
    }
    //******************************** */
    private articleForwardUrl = 'https://login.reddah.com/api/article/articleforward'; 

    articleForward(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.articleForwardUrl, formData)
        .pipe(
            tap(data => this.log('article forward')),
            catchError(this.handleError('article forward', []))
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
    private nplChatUrl = 'https://login.reddah.com/api/ai/nlp'; 

    getNlpChat(formData: FormData): Observable<any> {

        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.nplChatUrl, formData)
        .pipe(
            tap(data => this.log('get nlp chat')),
            catchError(this.handleError('get nlp chat', []))
        );
    }
     
    //******************************** */
    qq_app_id=2127183732;
    qq_app_key="493J0jD8PPeNUHNz";
    //******************************** */
    private qqMuskUrl = 'https://login.reddah.com/api/ai/qqmusk'; 

    async getQqMusk(params, appKey): Promise<any> {
        let muskQqChatUrl = "https://api.ai.qq.com/fcgi-bin/ptu/ptu_facedecoration";

        muskQqChatUrl += "?"
        for (var key of Object.keys(params)) {
            let value = params[key];
            if(value!==""&&key!="image"){
                muskQqChatUrl += key + '=' + encodeURIComponent(value) + '&';
            }
        }
        muskQqChatUrl += 'app_key=' + appKey;

        //console.log(muskQqChatUrl)

        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append("locale", this.getCurrentLocale());
        formData.append("url", muskQqChatUrl);
        formData.append("image", params["image"])

        return this.http.post<any>(this.qqMuskUrl, formData)
        .pipe(
            tap(data => {
                this.log('get qq musk')
                
            }),
            catchError(this.handleError('get qq musk', []))
        ).toPromise();

    }
    //******************************** */
    private qqReadUrl = 'https://login.reddah.com/api/ai/qqread'; 

    async getQqRead(params, appKey): Promise<any> {
        let readQqChatUrl = "https://api.ai.qq.com/fcgi-bin/nlp/nlp_imagetranslate";

        readQqChatUrl += "?"
        for (var key of Object.keys(params)) {
            let value = params[key];
            if(value!==""&&key!=="image"){
                readQqChatUrl += key + '=' + encodeURIComponent(value) + '&';
            }
        }
        readQqChatUrl += 'app_key=' + appKey;

        console.log(readQqChatUrl)

        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append("locale", this.getCurrentLocale());
        formData.append("url", readQqChatUrl);
        formData.append("image", params["image"])

        return this.http.post<any>(this.qqReadUrl, formData)
        .pipe(
            tap(data => {
                this.log('get qq read')
            }),
            catchError(this.handleError('get qq read', []))
        ).toPromise();

    }

    private nplTranslateUrl = 'https://login.reddah.com/api/ai/translate'; 
    getQqTextTranslate(params, appKey): Observable<any> {

        let nlpQqTextUrl = "https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate";

        nlpQqTextUrl += "?"
        for (var key of Object.keys(params)) {
            let value = params[key];
            if(value!=""){
                nlpQqTextUrl += key + '=' + encodeURIComponent(value) + '&';
            }
        }
        nlpQqTextUrl += 'app_key=' + appKey;

        
        console.log(nlpQqTextUrl)

        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append("locale", this.getCurrentLocale());
        formData.append("url", nlpQqTextUrl);
        return this.http.post<any>(this.nplTranslateUrl, formData)
        .pipe(
            tap(data => this.log('get nlp translate')),
            catchError(this.handleError('get nlp translate', []))
        );
    }

    private aaiAudioPlayUrl = 'https://login.reddah.com/api/ai/audio'; 
    getQqAudioPlay(params, appKey): Observable<any> {

        let aaiQqAudioUrl = "https://api.ai.qq.com/fcgi-bin/aai/aai_tts";

        aaiQqAudioUrl += "?"
        for (var key of Object.keys(params)) {
            let value = params[key];
            if(value!==""){
                aaiQqAudioUrl += key + '=' + encodeURIComponent(value) + '&';
            }
        }
        aaiQqAudioUrl += 'app_key=' + appKey;

        
        console.log(aaiQqAudioUrl)

        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append("locale", this.getCurrentLocale());
        formData.append("url", aaiQqAudioUrl);
        return this.http.post<any>(this.aaiAudioPlayUrl, formData)
        .pipe(
            tap(data => this.log('get audio play')),
            catchError(this.handleError('get audio play', []))
        );
    }

    getQqNlpChat(params, appKey): Observable<any> {

        let nplQqChatUrl = "https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat";
        /*return this.http.post<any>(this.nplQqChatUrl, params)
        .pipe(
            tap(data => this.log('get qq nlp chat')),
            catchError(this.handleError('get qq nlp chat', []))
        );*/


            
        nplQqChatUrl += "?"
        for (var key of Object.keys(params)) {
            let value = params[key];
            if(value!=""){
                nplQqChatUrl += key + '=' + encodeURIComponent(value) + '&';
            }
        }
        nplQqChatUrl += 'app_key=' + appKey;

        
        console.log(nplQqChatUrl)

        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append("locale", this.getCurrentLocale());
        formData.append("content", nplQqChatUrl);
        return this.http.post<any>(this.nplChatUrl, formData)
        .pipe(
            tap(data => this.log('get nlp chat')),
            catchError(this.handleError('get nlp chat', []))
        );

/*
        if (!this.options) {
            this.options = {headers: new Headers()};
        }
        this.options.headers.set('Content-Type', 'application/json; charset=utf-8');
        this.http.get<any>(this.nplQqChatUrl,this.options).subscribe(data=>{
            console.log(data);
        })

        this.http.get(this.nplQqChatUrl, {responseType: 'text'})
        .subscribe(res=>{ console.log(res) })
*/
        //return this.http.get(this.nplQqChatUrl)
        //.pipe(
        //    tap(data => this.log('get qq nlp chat')),
        //    catchError(this.handleError('get qq nlp chat', []))
        //);


/*
        if (!this.options) {
            this.options = {headers: new Headers()};
        }
        this.options.headers.set('Content-Type', 'application/x-www-form-urlencoded');

        this.options.params = params;

        //this.jsonp.get(this.nplQqChatUrl, this.options).map()
        this.jsonp.get(this.nplQqChatUrl).subscribe(data => {
            console.log(data)
          });


        return this.jsonp.get(this.nplQqChatUrl, this.options).pipe(
            tap(data => this.log('get qq nlp chat')),
            catchError(this.handleError('get qq nlp chat', []))
        );
        */
    }

    adjustLan(){
        let value = this.getCurrentLocale().split("-")[0];
        
        //due to qq dev missunderstood lan and region...
        value = value.replace("ja","jp");
        value = value.replace("ko","kr");
        
        return value;
    }

    



    getAudioDuration(msg){
        if(msg.Base64){
            let audio = new Audio();
            audio.src = "data:audio/wav;base64," + msg.Content; 
            audio.onloadeddata=()=>{
                console.log(audio.duration);
                msg.Duration = Math.ceil(audio.duration);
            }
        }
    }

    getReqSignImage(o, appkey){
        console.log(o);
        o = this.ksort(o);

        let str = "";
        for (var key of Object.keys(o)) {
            let value = o[key];
            if(value!==""){
                str += key + '=' + this.php_encodeURIComponent(value) + '&';
            }
        }
        str += 'app_key=' + appkey;

        let sign = Md5.hashStr(str)+"";
        return sign.toUpperCase();
    }

    getReqSign(o, appkey){
        console.log(o);
        o = this.ksort(o);

        let str = "";
        for (var key of Object.keys(o)) {
            let value = o[key];
            if(value!==""){
                str += key + '=' + this.php_encodeURIComponent(value) + '&';
            }
        }
        str += 'app_key=' + appkey;

        let sign = Md5.hashStr(str)+"";
        return sign.toUpperCase();
    }

    //qq encode using php
    php_encodeURIComponent(str){
        console.log(str);
        let value = encodeURIComponent(str);
        value = value.split("%20").join("+");
        value = value.split("'").join("%27");
        value = value.split("!").join("%21");
        value = value.split("*").join("%2A");
        value = value.split("(").join("%28");
        value = value.split(")").join("%29");
        value = value.split("~").join("%7E");
        return value;
    }

    ksort(o) {
        let sorted = {},
        keys = Object.keys(o);
        keys.sort();
        keys.forEach((key)=>{
          sorted[key] = o[key];
        })
        return sorted;
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
    //type 0:girl, 1:boy
    private getstorybylocation = 'https://login.reddah.com/api/article/getstorybylocation'; 
    getStoryByLocation(type, latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, min=0){
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
        
        return this.http.post<any>(this.getstorybylocation, formData)
        .pipe(
            tap(data => this.log('get story by location')),
            catchError(this.handleError('get story by location', []))
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
    focusPub(personUserName, pubUserName){
        this.toTextCache(1, `userisfriend_${pubUserName}_${personUserName}`);
        let formData = new FormData();
        formData.append("targetUser", pubUserName);
        this.setFocus(formData).subscribe(_=>{
            this.localStorageService.clear("Reddah_GroupedContacts_Pub_"+pubUserName);
            this.localStorageService.clear("Reddah_Contacts_Pub_"+pubUserName);
            this.cacheService.clearGroup("PubPage");
        });
    }

    unFocusPub(personUserName, pubUserName){
        this.localStorageService.clear(`userisfriend_${pubUserName}_${personUserName}`);
        let formData = new FormData();
        formData.append("targetUser",pubUserName);
        this.unFocus(formData).subscribe(_=>{
            this.localStorageService.clear("Reddah_GroupedContacts_Pub_"+pubUserName);
            this.localStorageService.clear("Reddah_Contacts_Pub_"+pubUserName);
            this.cacheService.clearGroup("PubPage");
        });
    }

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

        formData.append("title", this.instant("Pop.GroupChatTitle"));
        formData.append("annouce", this.instant("Pop.GroupChatAnnouce"));
        formData.append("update", this.instant("Pop.GroupChatUpdate"));

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
        formData.append('add', this.instant('Pop.AddToGrp'));
        formData.append('kick', this.instant('Pop.KickGrp'));
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

    ArticleCacheQueue = new Queue<any>(); 


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
    private pointPunchClockUrl = 'https://login.reddah.com/api/point/punchclock'; 
    punchClock(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append('offset', JSON.stringify((new Date()).getTimezoneOffset()));
        return this.http.post<any>(this.pointPunchClockUrl, formData)
        .pipe(
            tap(data => this.log('punch clock')),
            catchError(this.handleError('punch clock', []))
        );
    }

    private getPointLoginUrl = 'https://login.reddah.com/api/point/login'; 
    getPointLogin(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append('offset', JSON.stringify((new Date()).getTimezoneOffset()));
        return this.http.post<any>(this.getPointLoginUrl, formData)
        .pipe(
            tap(data => this.log('get point login')),
            catchError(this.handleError('get point login', []))
        );
    }

    private renewJwtUrl = 'https://login.reddah.com/api/auth/renewjwt'; 
    renewJwt(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.renewJwtUrl, formData)
        .pipe(
            tap(data => this.log('renew jwt')),
            catchError(this.handleError('renew jwt', []))
        );
    }

    private getPointReadUrl = 'https://login.reddah.com/api/point/read'; 
    getPointRead(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append('offset', JSON.stringify((new Date()).getTimezoneOffset()));
        return this.http.post<any>(this.getPointReadUrl, formData)
        .pipe(
            tap(data => this.log('get point read')),
            catchError(this.handleError('get point read', []))
        );
    }

    private getPointMarkUrl = 'https://login.reddah.com/api/point/mark'; 
    getPointMark(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append('offset', JSON.stringify((new Date()).getTimezoneOffset()));
        return this.http.post<any>(this.getPointMarkUrl, formData)
        .pipe(
            tap(data => this.log('get point mark')),
            catchError(this.handleError('get point mark', []))
        );
    }

    private getPointShareUrl = 'https://login.reddah.com/api/point/share'; 
    getPointShare(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append('offset', JSON.stringify((new Date()).getTimezoneOffset()));
        return this.http.post<any>(this.getPointShareUrl, formData)
        .pipe(
            tap(data => this.log('get point share')),
            catchError(this.handleError('get point share', []))
        );
    }

    private getPointCommentUrl = 'https://login.reddah.com/api/point/comment'; 
    getPointComment(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append('offset', JSON.stringify((new Date()).getTimezoneOffset()));
        return this.http.post<any>(this.getPointCommentUrl, formData)
        .pipe(
            tap(data => this.log('get point comment')),
            catchError(this.handleError('get point comment', []))
        );
    }

    getTodayString(){
        return this.datePipe.transform(new Date(),"yyyy-MM-dd"); 
    }

    pointTasks=[];
    initPointTask(){
        this.pointTasks=[
            {
                id:1, 
                title: this.instant("Point.TaskLoginTitle"),
                description: this.instant("Point.TaskLoginDescp"),
                point: 1, 
                key: "Login",
                max: 1,
                type: 0, //0:daily 1:once
            },
            {
                id:2, 
                title: this.instant("Point.TaskReadTitle"),
                description: this.instant("Point.TaskReadDescp"),
                point: 1, 
                key: "Read",
                max: 6,
                type: 0,
            },
            {
                id:3, 
                title: this.instant("Point.TaskMarkTitle"),
                description: this.instant("Point.TaskMarkDescp"),
                point: 1, 
                key: "Mark",
                max: 2,
                type: 0,
            },
            {
                id:4, 
                title: this.instant("Point.TaskShareTitle"),
                description: this.instant("Point.TaskShareDescp"),
                point: 1, 
                key: "Share",
                max: 2,
                type: 0,
            },
            {
                id:5, 
                title: this.instant("Point.TaskCommentTitle"),
                description: this.instant("Point.TaskCommentDescp"),
                point: 1, 
                key: "Comment",
                max: 3,
                type: 0,
            },
            {
                id:6, 
                title: this.instant("Point.TaskFirstPhotoTitle"),
                description: this.instant("Point.TaskFirstPhotoDescp"),
                point: 10, 
                key: "Photo",
                max: 10,
                type: 1,
            },
            {
                id:7, 
                title: this.instant("Point.TaskFirstSignatureTitle"),
                description: this.instant("Point.TaskFirstSignatureDescp"),
                point: 10, 
                key: "Signature",
                max: 10,
                type: 1,
            },
            {
                id:8, 
                title: this.instant("Point.TaskFirstTimelineTitle"),
                description: this.instant("Point.TaskFirstTimelineDescp"),
                point: 10, 
                key: "Timeline",
                max: 10,
                type: 1,
            },
            {
                id:9, 
                title: this.instant("Point.TaskFirstGameTitle"),
                description: this.instant("Point.TaskFirstGameDescp"),
                point: 10, 
                key: "Mini",
                max: 10,
                type: 1,
            },
            {
                id:10, 
                title: this.instant("Point.TaskFirstFriendTitle"),
                description: this.instant("Point.TaskFirstFriendDescp"),
                point: 10, 
                key: "Friend",
                max: 10,
                type: 1,
            },
            {
                id:11, 
                title: this.instant("Point.TaskFirstShakeTitle"),
                description: this.instant("Point.TaskFirstShakeDescp"),
                point: 10, 
                key: "Shake",
                max: 10,
                type: 1,
            },
            {
                id:12, 
                title: this.instant("Point.TaskFirstEmailTitle"),
                description: this.instant("Point.TaskFirstEmailDescp"),
                point: 10, 
                key: "Email",
                max: 10,
                type: 1,
            },
        ];

        this.pointReason = new Map()
        //use get
        .set('punchclock',this.instant("Point.PunchClock"))
        .set('login',this.instant("Point.TaskLoginTitle"))
        .set('read',this.instant("Point.TaskReadTitle"))
        .set('mark',this.instant("Point.TaskMarkTitle"))
        .set('share',this.instant("Point.TaskShareTitle"))
        .set('comment',this.instant("Point.TaskCommentTitle"))
        .set('photo',this.instant("Point.TaskFirstPhotoTitle"))
        .set('signature',this.instant("Point.TaskFirstSignatureTitle"))
        .set('timeline',this.instant("Point.TaskFirstTimelineTitle"))
        .set('mini',this.instant("Point.TaskFirstGameTitle"))
        .set('friend',this.instant("Point.TaskFirstFriendTitle"))
        .set('shake',this.instant("Point.TaskFirstShakeTitle"))
        .set('email',this.instant("Point.TaskFirstEmailTitle"))

        //admin give
        .set('report',this.instant("Point.TaskReportTitle"));   
    }
    

    userLevel(userName){
        let point = this.appData('userpoint_'+userName);
        if(point<50){
            return this.instant("Point.Level_Illiterate");
        }
        else if(point<150){
            return this.instant("Point.Level_Bronze");
        }
        else if(point<300){
            return this.instant("Point.Level_Silver");
        }
        else if(point<500){
            return this.instant("Point.Level_Gold");
        }
        else if(point<1000){
            return this.instant("Point.Level_Illiterate");
        }
        else if(point<2000){
            return this.instant("Point.Level_Diamond");
        }
        else{
            return this.instant("Point.Level_Erudite");
        }
    }

    userLevelIconNumber(userName){
        let point = this.appData('userpoint_'+userName);
        let returnValue = 1;
        if(point<50){
            if(point<15)
                returnValue = 1;
            else if(point<30)
                returnValue = 2;
            else
                returnValue = 3;
        }
        else if(point<150){
            if(point<80)
                returnValue = 1;
            else if(point<120)
                returnValue = 2;
            else
                returnValue = 3;
        }
        else if(point<300){
            if(point<200)
                returnValue = 1;
            else if(point<250)
                returnValue = 2;
            else
                returnValue = 3;
        }
        else if(point<500){
            if(point<375)
                returnValue = 1;
            else if(point<450)
                returnValue = 2;
            else
                returnValue = 3;
        }
        else if(point<1000){
            if(point<700)
                returnValue = 1;
            else if(point<900)
                returnValue = 2;
            else
                returnValue = 3;
        }
        else if(point<2000){
            if(point<1300)
                returnValue = 1;
            else if(point<1600)
                returnValue = 2;
            else
                returnValue = 3;
        }
        else{
            if(point<2500)
                returnValue = 1;
            else if(point<3000)
                returnValue = 2;
            else
                returnValue = 3;
        }
        return new Array(returnValue);
    }

    userLevelIcon(userName){
        let point = this.appData('userpoint_'+userName);
        if(point<50){
            return "leaf";
        }
        else if(point<150){
            return "ribbon";
        }
        else if(point<300){
            return "star-outline";
        }
        else if(point<500){
            return "star";
        }
        else if(point<1000){
            return "medal";
        }
        else if(point<2000){
            return "trophy";
        }
        else{
            return "school";
        }
    }

    userLevelIconColor(userName){
        let point = this.appData('userpoint_'+userName);
        if(point<50){
            return "primary";
        }
        else if(point<150){
            return "dark";
        }
        else if(point<300){
            return "primary";
        }
        else if(point<500){
            return "gold";
        }
        else if(point<1000){
            return "point";
        }
        else if(point<2000){
            return "diamond";
        }
        else{
            return "dark";
        }
    }

    pointReason = new Map()
    

    getSharePoint(){
        if(!this.isPointDone(this.pointTasks[3])){
            this.getPointShare().subscribe(data=>{
                if(data.Success==0||data.Success==3){ 
                    this.setPoint('Share', data.Message.GotPoint);
                    if(data.Success==0){
                        this.toast(
                            this.instant("Point.TaskShareTitle")+
                            this.lan2(
                                " +"+data.Message.GotPoint+"/"+this.pointTasks[3].max,
                                this.instant("Point.Fen")),
                        "primary");
                    }
                }
            });
        }
    }

    //not completed return false; 
    isPointDone(task){
        //console.log(task);
        if(task["id"]==1){//login
            return this.getPoint(task.key)==task.max;
        }
        else if(task["id"]>=2&&task["id"]<=5){//login,read,mark,share,comment
            
            return this.getPoint(task.key)>=task.max;
        }
        else 
            return this.getPointNoDate(task.key);
    }

    getCurrentPoint(task){
        if(task["id"]>=1&&task["id"]<=5){//login,read,mark,share,comment
            return this.getPoint(task.key);
        }
        else {
            return this.getPointNoDate(task.key);
        }
    }

    getPoint(key){
        let point = this.localStorageService.retrieve(`Reddah_${key}_PointToday_${this.getTodayString()}_${this.getCurrentUser()}`);
        return point?point:0;
    }

    setPoint(key, value){
        this.localStorageService.store(`Reddah_${key}_PointToday_${this.getTodayString()}_${this.getCurrentUser()}`, value);
    }

    getPointNoDate(key){
        let point = this.localStorageService.retrieve(`Reddah_${key}_Point_${this.getCurrentUser()}`);
        return point===true?10:0;
    }

    setPointNoDate(key, value){
        this.localStorageService.store(`Reddah_${key}_Point_${this.getCurrentUser()}`, value);
    }

    private checkOncePointUrl = 'https://login.reddah.com/api/point/checkonce'; 
    checkOncePoint(): Observable<any> {
        let formData = new FormData();
        formData.append('jwt', this.getCurrentJwt());
        formData.append('offset', JSON.stringify((new Date()).getTimezoneOffset()));
        return this.http.post<any>(this.checkOncePointUrl, formData)
        .pipe(
            tap(data => this.log('check once point')),
            catchError(this.handleError('check once point', []))
        );
    }

    //admin award
    private reportAwardUrl = 'https://login.reddah.com/api/point/reportaward'; 
    reportAward(formData): Observable<any> {
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.reportAwardUrl, formData)
        .pipe(
            tap(data => this.log('point report award')),
            catchError(this.handleError('point report award', []))
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
        this.loadTranslate(currentLocale);
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
        return this.appData("useremail_"+lastLoginUser);
    }

    getVersionNumber(): Promise<string> {
        return new Promise((resolve) => {
            this.appVersion.getVersionNumber().then((value: string) => {
                resolve(value);
            }).catch(err => {
                alert(err);
            });
        });
    }

    async updateUserDeviceInfo(){
        if(this.platform.is('cordova')){ 
            this.getVersionNumber().then(appversion => {
                let info = `${this.device.platform}_${this.device.version}_
                    ${this.device.isVirtual?"Virtual":"Device"}_${this.device.uuid}_
                    ${this.getCurrentLocale()}_${appversion}`;
                let data = new FormData();
                data.append("info",info);
                this.updateDeviceInfo(data).subscribe();
            });            
        }
    }

    private updateUserDeviceInfoUrl = 'https://login.reddah.com/api/user/updatedeviceinfo'; 
    updateDeviceInfo(formData){
        formData.append('jwt', this.getCurrentJwt());
        return this.http.post<any>(this.updateUserDeviceInfoUrl, formData)
        .pipe(
            tap(data => this.log('update device info')),
            catchError(this.handleError('update device info', []))
        );        
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
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            let msg = error.message;
            if(msg!=null){
                /*if(msg.indexOf("failure response")>0){
                    if(this.translate.instant("Input.Error.NetworkError")!="Input.Error.NetworkError")
                        this.toast(this.translate.instant("Input.Error.NetworkError"), "danger")
                }*/
                    
                if(msg.indexOf("ERR_TIMED_OUT")>0)
                    this.toast(this.instant("Input.Error.ServiceError"), "danger")
            }

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

        return this.http.jsonp(sohuStockApi, this.options).pipe(
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

        return this.http.jsonp(qqMapApi, this.options).pipe(
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

        return this.http.jsonp(qqTranslateApi, this.options).pipe(
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

    lan2(a,b){
        if(this.doubleByteLocale.includes(this.getCurrentLocale().toLowerCase())) 
        {
            return a+b;
        }
        return a+" "+b;
    }

    lan3(a,b,c){
        if(this.doubleByteLocale.includes(this.getCurrentLocale().toLowerCase())) 
        {
            return a+b+c;
        }
        return a+" "+b+" "+c;
    }

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
                {
                    return (<any>window).Ionic.WebView.convertFileSrc(result);
                }
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
        if(cacheKey){
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
        else{
            return cacheKey;
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

    //for normal image download
    getDeviceDirectory(){
        let dir = this.file.externalRootDirectory;
        if(this.platform.is('android'))
        {
            dir = this.file.externalApplicationStorageDirectory;
        }
        else if(this.platform.is('ipad')||this.platform.is('iphone')||this.platform.is('ios')){
            dir = this.file.cacheDirectory;
        }
        else {
            
        }
        return dir;
    }

    //for copy image
    getOutputDeviceDirectory(){
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
                //console.log(userInfo)
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
                if(userInfo.Lan!=null)
                    this.toTextCache(userInfo.Lan, `userlan_${userName}`);
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

                if(userInfo.EmailVerified!=null){
                    this.toTextCache(userInfo.EmailVerified, `useremailverified_${userName}`);
                }
            
            });

            if(userName==this.getCurrentUser()){
                this.checkOncePoint().subscribe(data=>{
                    if(data.Success==0){
                        this.setPointNoDate("Photo", data.Message.Photo);
                        this.setPointNoDate("Signature", data.Message.Signature);
                        this.setPointNoDate("Timeline", data.Message.Timeline);
                        this.setPointNoDate("Mini", data.Message.Mini);
                        this.setPointNoDate("Friend", data.Message.Friend);
                        this.setPointNoDate("Shake", data.Message.Shake);
                        this.setPointNoDate("Email", data.Message.Email);
                        this.setPoint("TodayTotalPoint", data.Message.TodayTotalPoint)
                        this.setPoint('Read', data.Message.TodayRead);
                        this.setPoint('Mark', data.Message.TodayMark);
                        this.setPoint('Share', data.Message.TodayShare);
                        this.setPoint('Comment', data.Message.TodayComment);
                        this.setPoint("PunchClock",data.Message.PunchToday);
                    }
                });
            }
            
        }
        catch(error){
            alert(error)
        }
    }
    
    getUserLan(targetUserName){
        let locale = this.appData("userlan_"+targetUserName);
        let result = this.Locales.filter(l=>l.Name.toLowerCase()==locale.toLowerCase());
        return result==null||result.length==0?(
            locale==null?"":locale
        ):result[0]["Description"];
    }

    getHistory(id){
        let cache = this.localStorageService.retrieve(`Reddah_Search_${id}`);
        if(cache!=null)
            return cache;
        else return [];
    }

    saveHistory(id, value){
        this.localStorageService.store(`Reddah_Search_${id}`, value)
    }

    clearHistory(id){
        this.localStorageService.clear(`Reddah_Search_${id}`);
    }


    refreshHistoryCache(arr, key, id){
        if(key=="")
            return;

        let hisIndex = arr.indexOf(key);
        if(hisIndex>-1){
            arr.splice(hisIndex, 1);
        }
        
        arr.unshift(key);
        if(arr.length>10){
            arr.splice(10,1);
        }
        this.saveHistory(id, arr);
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
                return this.instant("Time.JustNow");
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
            result=parseInt(yearC+"") + split +this.instant("Time.YearsAgo");
        }
        else if(monthC>=1){
            result=parseInt(monthC+"") + split + this.instant("Time.MonthsAgo");
        }
        else if(weekC>=1){
            result=parseInt(weekC+"") + split + this.instant("Time.WeeksAgo");
        }
        else if(dayC>=1){
            result=(parseInt(dayC+"")==1?this.instant("Time.Yesterday"):parseInt(dayC+"") + split +this.instant("Time.DaysAgo"));
        }
        else if(hourC>=1){
            result=parseInt(hourC+"") + split +this.instant("Time.HoursAgo");
        }
        else if(minC>=1){
            result=parseInt(minC+"") + split +this.instant("Time.MinutesAgo");
        }
        else if(secC>=1){
            result=this.instant("Time.JustNow");
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
                return this.instant("Time.Today");
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
            result=(parseInt(dayC+"")==1?this.instant("Time.Yesterday"):dateStr);
        }
        else if(hourC>=1){
            return this.instant("Time.Today");
        }
        else if(minC>=1){
            return this.instant("Time.Today");
        }
        else if(secC>=1){
            return this.instant("Time.Today");
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
            result=parseInt(yearC+"") + "" +this.instant("Time.YearsAgo");
        }
        else if(monthC>=1){
            result=parseInt(monthC+"") + "" + this.instant("Time.MonthsAgo");
        }
        else if(weekC>=1){
            result=parseInt(weekC+"") + "" + this.instant("Time.WeeksAgo");
        }
        else if(dayC>=1){
            result=(parseInt(dayC+"")==1?this.instant("Time.Yesterday"):parseInt(dayC+"") + "" +this.instant("Time.DaysAgo"));
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
            //showCloseButton: true,
            position: "top",
            //closeButtonText: this.translate.instant("Button.Close"),
            duration: 1000,
            color: color,
            cssClass: "toast-style"
        });
        toast.present();
    }

    async addBookmark(articleId){
        let formData = new FormData();
        formData.append("ArticleId", JSON.stringify(articleId));
        
        this.addBookmarkFormData(formData).then(_=>{
            setTimeout(()=>{
                if(!this.isPointDone(this.pointTasks[3])){
                    this.getPointMark().subscribe(data=>{
                        if(data.Success==0||data.Success==3){ 
                            this.setPoint('Mark', data.Message.GotPoint);
                            if(data.Success==0){
                                this.toast(
                                    this.instant("Point.TaskMarkTitle")+
                                    this.lan2(
                                        " +"+data.Message.GotPoint+"/"+this.pointTasks[3].max,
                                        this.instant("Point.Fen")),
                                "primary");
                            }
                        }
                    });
                }
            },3000)
        });
    }

    async addBookmarkFormData(formData){
        let text = `${this.instant("Pop.Marked")}:${this.instant("Menu.About")}/${this.instant("Menu.Mark")}`;
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
        //this.localStorageService.clear("reddah_articles");
        //this.localStorageService.clear("reddah_article_ids");
        //this.localStorageService.clear("reddah_article_groups");
        //this.localStorageService.clear("reddah_article_usernames");
        //this.cacheService.clearGroup("HomePage");
    }

    async ClearPub(){
        //this.localStorageService.clear("Reddah_GroupedSubs");
        //this.localStorageService.clear("Reddah_Subs");
        //this.cacheService.clearGroup("ManageSubsPage");
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
        let recent = this.localStorageService.retrieve(`Reddah_Recent_${type}_${this.getCurrentUser()}`);
        
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
        this.localStorageService.store(`Reddah_Recent_${type}_${this.getCurrentUser()}`, recent);
            
    }

    loadRecent(type){
        let recent = this.localStorageService.retrieve(`Reddah_Recent_${type}_${this.getCurrentUser()}`);
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
            return parseInt(meters/1000+"") + this.instant("Pop.KM")
        }
        return meters + this.instant("Pop.M");
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

    nonce_str() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 10 | 0, v = r;
            return v.toString(10);
        });
    }

    async takePhoto(photos, formData){
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true
        }
          
        this.camera.getPicture(options).then((imageData) => {
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
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        }
          
        this.camera.getPicture(options).then((imageData) => {
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

    localeData;
    loadTranslate(locale){
        this.http.get<any>(`assets/i18n/${locale}.json`)
        .subscribe(res =>{
            this.localeData=this.flatten(res);
            this.initPointTask();
        }, error =>{
            console.log(error);
        });
    }

    instant(key){
        return this.localeData[key];
    }

    flatten (obj, prefix = [], current = {}) {
        if (typeof (obj) === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            this.flatten(obj[key], prefix.concat(key), current)
          })
        } else {
          current[prefix.join('.')] = obj
        }
      
        return current
    }

    getLikeShake(){
        let cachedLikeShake = this.localStorageService.retrieve("Reddah_Settings_LikeShake");
        return cachedLikeShake==null?true:cachedLikeShake;
    }

    setLikeShake(value){
        this.localStorageService.store("Reddah_Settings_LikeShake", value);
    }

    getNightMode(){
        let cachedNightMode = this.localStorageService.retrieve("Reddah_Settings_NightMode");
        return cachedNightMode==null?true:cachedNightMode;
    }

    setNightMode(value){
        this.localStorageService.store("Reddah_Settings_NightMode", value);
    }

}
