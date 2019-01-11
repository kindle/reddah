import { Component } from '@angular/core';
import { Platform } from '@ionic/angular'; 
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss']
})
export class AboutPage {

  version: String;

  //constructor(private wechat: Wechat) { }
  constructor(
    private appVersion: AppVersion,
    private appUpdate: AppUpdate,
    private iab: InAppBrowser,
    private platform: Platform,
    //private alertCtrl: AlertController,
    private http: HttpClient,
  ) {
    this.getVersionNumber().then(version => {
      this.version = version;
    });
  }

  shareFriend(){
    //if(this.wechat.isInstalled())
        alert('friend');
    //else
    //    alert('wechat not installed')

  }

  shareTimeline(){
    alert('detectionUpgrade');
    
  }


  appversion(){
      
      /*this.appVersion.getAppName().then(function(data){
        alert(JSON.stringify(data));
        this.info += JSON.stringify(data);
      });
      this.appVersion.getPackageName().then(function(data){
        alert(JSON.stringify(data));
        this.info += JSON.stringify(data);
      });
      this.appVersion.getVersionCode().then(function(data){
        alert(JSON.stringify(data));
        this.info += JSON.stringify(data);
      });
      this.appVersion.getVersionNumber().then(function(data){
        alert(data);
        this.info += data;
      });*/
      


  }

  /**
      * 检查app是否需要升级
      */
     upgrade() {

      const updateUrl = 'https://reddah.com/apk/update.xml';
      //这里连接后台获取app最新版本号,然后与当前app版本号对比
      //版本号不一样就需要提示更新
      if (this.isMobile()) {
          this.getVersionNumber().then(version => {
              if (this.isAndroid()) {
                  this.appUpdate.checkAppUpdate(updateUrl).then(data => {});
              } else {
                  this.appUpgrade();
              }
                  
          });
              
      }
  }


 /**
   * 提示是否需要下载最新版本
   */
  appUpgrade() {
      alert('appupgrade');
      /*this.alertCtrl.create({
          title: '发现新版本',
          subTitle: '检查到新版本，是否立即下载？',
          buttons: [{ text:'取消' },
          {
              text: '下载'
              handler: () => {
                      //跳转ios 版本下载地址
                      this.iab.create(url, '_system');
              }
          }
          ]
      }).present();*/
  }

/**
 * 获得app版本号,如0.01
 * @description  对应/config.xml中version的值
 * @returns {Promise<string>}
 */
  getVersionNumber(): Promise<string> {
      return new Promise((resolve) => {
          this.appVersion.getVersionNumber().then((value: string) => {
              resolve(value);
          }).catch(err => {
              console.log('getVersionNumber:' + err);
          });
      });
  }

 /**
   * 是否真机环境
   * @return {boolean}
   */
  isMobile(): boolean {
      return this.platform.is('mobile');
  }

 /**
   * 是否android真机环境
   * @return {boolean}
   */
  isAndroid(): boolean {
      return this.isMobile() && this.platform.is('android');
  }

 /**
   * 是否ios真机环境
   * @return {boolean}
   */
  isIos(): boolean {
      return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'));
  }

}
