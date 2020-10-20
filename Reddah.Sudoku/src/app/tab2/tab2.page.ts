import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  constructor(
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

  initTasks(level){
    let taskTemplate = 
    {
        id:1,
        level: 1,
        name: 'Tutorial',
        solution:[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9], 
        display:[8, 9, 1, 5, 6, 7, 0, 3, 4, 2, 3, 0, 0, 9, 1, 5, 6, 0, 5, 6, 7, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 7, 0, 0, 0, 0, 3, 0, 5, 9, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 9, 1, 2, 0, 0, 0, 4, 0, 6, 0, 0, 0, 1, 2, 3, 0, 8, 0, 0, 5, 0, 4, 5, 6, 0, 0, 0, 0, 0, 0],
        maxim: 'Constant dropping wears the stone', 
        author: '',
        secondstopass: 600,
        secondstogood: 300,
        secondstoexpert: 180,
        starstoplay: 5,

        mytime: 99999,
        mystar: 1,
    };

    if(level==1){
      this.task = [];
      
      this.task.push(
      {
        id:1,
        level: 1,
        name: 'Tutorial',
        solution:[3,9,4,1,8,7,2,6,5,5,7,2,3,6,4,8,1,9,1,8,6,9,2,5,3,4,7,9,1,5,8,7,6,4,2,3,7,6,3,4,9,2,1,5,8,2,4,8,5,3,1,9,7,6,8,2,7,6,4,9,5,3,1,6,3,1,2,5,8,7,9,4,4,5,9,7,1,3,6,8,2], 
        display:[3,0,4,1,0,7,2,6,5,5,7,2,3,6,4,8,1,9,1,8,6,9,2,5,3,4,7,9,1,5,8,7,6,4,2,3,7,6,3,4,9,2,1,5,8,2,4,8,5,3,1,9,7,6,8,2,7,6,4,9,5,3,1,6,3,1,2,5,8,7,9,4,4,5,9,7,1,3,6,8,2], 
        maxim: 'Constant dropping wears the stone', 
        author: '',
        secondstopass: 600,
        secondstogood: 300,
        secondstoexpert: 180,
        starstoplay: 5,

        mytime: 99999,
        mystar: 1,
    },
    {
      id:2,
      level: 1,
      name: 'Tutorial',
      solution:[3,9,4,1,8,7,2,6,5,5,7,2,3,6,4,8,1,9,1,8,6,9,2,5,3,4,7,9,1,5,8,7,6,4,2,3,7,6,3,4,9,2,1,5,8,2,4,8,5,3,1,9,7,6,8,2,7,6,4,9,5,3,1,6,3,1,2,5,8,7,9,4,4,5,9,7,1,3,6,8,2], 
      display:[3,0,4,0,8,7,2,0,5,0,7,2,3,6,0,8,1,9,1,8,0,9,0,0,0,4,0,0,1,5,8,7,6,4,0,3,7,6,0,4,0,2,0,0,8,2,0,0,5,3,1,0,7,6,8,2,7,6,0,0,5,3,1,0,3,1,0,0,8,7,9,0,4,5,0,7,1,3,6,0,2], 
      maxim: 'Constant dropping wears the stone', 
      author: '',
      secondstopass: 600,
      secondstogood: 300,
      secondstoexpert: 180,
      starstoplay: 5,

      mytime: 99999,
      mystar: 1,
  },
    );
      
    }
    else if(level==2){
      this.task = [];
      for(let i=1;i<20;i++){
        taskTemplate.id=i;
        this.task.push(JSON.parse(JSON.stringify(taskTemplate)));
      }
    }
    else if(level==3){
      this.task = [];
      for(let i=1;i<54;i++){
        taskTemplate.id=i;
        this.task.push(JSON.parse(JSON.stringify(taskTemplate)));
      }
    }
    else if(level==4){
      this.task = [];
      for(let i=1;i<36;i++){
        taskTemplate.id=i;
        this.task.push(JSON.parse(JSON.stringify(taskTemplate)));
      }
    }
  }

  ionViewDidEnter(){
    let level = this.activeRouter.snapshot.queryParams["level"];
    //alert(level);

    this.initTasks(level);
    

    //slides max 4
    this.slides = this.taskToSlides(this.task, 16);

  }

  goTask(task){
    console.log('start task')
    console.log(task)
    this.router.navigate(['/tabs/tab3'], {
        queryParams: {
            task: JSON.stringify(task),
        }
    });
  }

  goLevels(){
    this.router.navigate(['/tabs/tablevel'], {
        queryParams: {}
    });
  }

}
