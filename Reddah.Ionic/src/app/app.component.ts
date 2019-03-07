import { Component, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ModalController, AlertController, ActionSheetController, PopoverController, IonRouterOutlet, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Toast } from '@ionic-native/toast/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private localStorageService: LocalStorageService,
    public modalCtrl: ModalController,
    private menu: MenuController,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private popoverCtrl: PopoverController,
    private toast: Toast,
    private router: Router,
  ) {
    this.initializeApp();
    
    let locale = this.localStorageService.retrieve("Reddah_Locale");
    this.translate.setDefaultLang(locale);

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    
    // Initialize BackButton Eevent.
    this.backButtonEvent();
  }

  // set up hardware back button event.
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;

  
  public alertShown:boolean = false;

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      //header: this.translate.instant("Confirm.Title"),
      message: this.translate.instant("Confirm.Message"),
      buttons: [
        {
          text: this.translate.instant("Confirm.Cancel"),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.alertShown=false;
          }
        }, {
          text: this.translate.instant("Confirm.Yes"),
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });

    await alert.present().then(()=>{
        this.alertShown=true;
    });;
  }



  // active hardware back button
  backButtonEvent() {
      this.platform.backButton.subscribe(async () => {
        /*try {
            const element = await this.actionSheetCtrl.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
        }

        // close popover
        try {
            const element = await this.popoverCtrl.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
        }

        // close modal
        try {
            const element = await this.modalCtrl.getTop();
            if (element) {
                element.dismiss();
                return;
            }
        } catch (error) {
            console.log(error);

        }

        // close side menua
        try {
            const element = await this.menu.getOpen();
            if (element !== null) {
                this.menu.close();
                return;

            }

        } catch (error) {

        }*/

        if( this.router.url.startsWith('/tabs/(home:home)')) 
        {
            if(this.alertShown==false){
                this.presentAlertConfirm();  
            }
        }
        else if(this.routerOutlet && this.routerOutlet.canGoBack())
        {
            this.routerOutlet.pop();
        }  
      });
  }

}
