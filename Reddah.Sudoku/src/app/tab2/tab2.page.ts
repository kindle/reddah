import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  constructor(
    public reddah : ReddahService,
    private router: Router,
    private activeRouter: ActivatedRoute,
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


  @ViewChild(IonSlides) slides1: IonSlides;

  ionViewDidEnter(){
    let level = this.activeRouter.snapshot.queryParams["level"];
    let page = this.activeRouter.snapshot.queryParams["page"];
    if(page!=null){
        this.slides1.slideTo(0, 500);
    }
    
    this.task = this.reddah.getLevelTasks(level);
    this.task.forEach((t,i)=>{
      t["mytime"] = this.reddah.getMyTime(t.id);
      t["mystar"] = this.reddah.getMyStars(t.id);
      
      t["unlock"] = (i==0)||(t["mystar"]>0)||(i>0&&this.task[i-1]["mystar"]>0);

      t["musk"] = this.reddah.musk.get(t.id);
    })

    //slides max 4
    this.slides = this.taskToSlides(this.task, 16);

  }

  goTask(task){
    if(task.unlock){
      this.router.navigate(['/tabs/tab3'], {
          queryParams: {
              task: JSON.stringify(task),
          }
      });
    }
  }

  goLevels(){
    this.router.navigate(['/tabs/tablevel'], {
        queryParams: {}
    });
  }

}
