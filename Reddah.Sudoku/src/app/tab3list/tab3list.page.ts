import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonSlides } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-tab3list',
  templateUrl: 'tab3list.page.html',
  styleUrls: ['tab3list.page.scss']
})
export class Tab3listPage implements OnInit{

  constructor(
    public reddah : ReddahService,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private alertController: AlertController,
    private screenOrientation: ScreenOrientation,
  ) {}


  ngOnInit(){}

  slides = [];
  task = [];

  taskToSlides(arr, size) {
    var objArr = new Array();
    var index = 0;
    var objArrLen = arr.length/size;
    for(var i=0;i<objArrLen;i++){
      var arrTemp = new Array();
      for(var j=0;j<size;j++){
          arrTemp[j] = arr[index++];
          if(index==arr.length){
              break;
          }
      }
      objArr[i] = arrTemp;
    }
    return objArr;
  }


  @ViewChild(IonSlides) slides3: IonSlides;

  mylevelstars = 0;
  levelstars = 0;
  mycoins = 0;

  ionViewDidEnter(){
    this.mylevelstars=0;
    this.levelstars = 0;
    this.mycoins = this.reddah.getMyCoins();
    
    let level = this.activeRouter.snapshot.queryParams["level"];
    let page = this.activeRouter.snapshot.queryParams["page"];
    if(page!=null){
        this.slides3.slideTo(0,500);
    }

    /*
    this.screenOrientation.onChange().subscribe(
        () => {
            this.slides3.slideTo(0,500);
        }
    );*/
    
    this.task = this.reddah.getLevelTasks(level);
    this.task.forEach((t,i)=>{
      t["mytime"] = this.reddah.getMyTime(t.id);
      t["mystar"] = this.reddah.getMyStars(t.id);
      this.mylevelstars += t["mystar"];
      this.levelstars +=3;
      t["unlock"] = (i==0)||(t["mytime"]<=99998)||(i>0&&this.task[i-1]["mytime"]<=99998);

      t["musk"] = this.reddah.musk.get(t.id);
      t["index"] = i;
    })

    //slides max 4
    this.slides = this.taskToSlides(this.task, 16);

  }

  async goTask(task){
    if(task.unlock){
      this.router.navigate(['/tabs/tab4task'], {
          queryParams: {
              task: JSON.stringify(task),
          }
      });
    }
    else{
      if(task.index>0&&task.index<this.task.length){
        if(this.task[task.index-1].unlock==true){
            if(this.reddah.getMyCoins()>=this.reddah.buyPrice()){ 
              const alert = await this.alertController.create({
                  header: this.reddah.instant("ConfirmTitle"),
                  message: this.reddah.buyPrice() + ' ' + this.reddah.instant("Coins"),
                  buttons: [
                  {
                      text: this.reddah.instant("ConfirmCancel"),
                      role: 'cancel',
                      cssClass: 'secondary',
                      handler: () => {}
                  }, 
                  {
                      text: this.reddah.instant("ConfirmYes"),
                      handler: () => {
                          this.reddah.buyTask(task);
                          this.router.navigate(['/tabs/tab4task'], {
                              queryParams: {
                                  task: JSON.stringify(task),
                              }
                          });
                      }
                  }]
              });
    
              await alert.present().then(()=>{});
            }
            else{     
              const alert = await this.alertController.create({
                  header: this.reddah.instant("ConfirmTitle"),
                  message: this.reddah.instant("NotEnoughCoins"),
                  buttons: [
                  {
                      text: 'OK',
                      role: 'ok',
                      cssClass: 'secondary',
                      handler: () => {}
                  }]
              });
    
              await alert.present().then(()=>{});      
            }
          }
      }
    }
  }

  goLevels(){
    this.router.navigate(['/tabs/tab2level'], {
        queryParams: {}
    });
  }

}
