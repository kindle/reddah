import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-punch-clock',
    templateUrl: 'punch-clock.page.html',
    styleUrls: ['punch-clock.page.scss']
})
export class PunchClockPage implements OnInit {

    async close(){
        this.modalController.dismiss(this.flag);
    }

    userName;
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
    ){
        this.userName = this.reddah.getCurrentUser();
        let cachedPunchedDays = this.localStorageService.retrieve("Reddah_PunchClock_"+this.userName);
        if(cachedPunchedDays!=null){
            this.punchedDays = cachedPunchedDays;
        }
        let cachedPointPunchToday = this.localStorageService.retrieve("Reddah_PunchClock_PointToday_"+this.userName);
        if(cachedPointPunchToday!=null){
            this.pointPunchToday = cachedPointPunchToday;
        }
    }

    punchClockLoading = true;
    pointPunchToday = 0;
    punchedDays = [];
    flag = false;
    async ngOnInit(){
        this.reddah.punchClock().subscribe(data=>{
            if(data.Success==0||data.Success==3){
                this.pointPunchToday = data.Message.GotPoint;
                
                this.punchedDays = [];
                for(let history of data.Message.History){
                    let localDateTime = this.reddah.utcToLocal(history.CreatedOn, 'YYYY-MM-DD');
                    let historyMonth = new Date(localDateTime).getMonth() + 1;
                    let historyDay = new Date(localDateTime).getDate()+"";
                    if(this.select_month == historyMonth){
                        this.punchedDays.push(historyDay);
                    }
                }
                //console.log(this.punchedDays);
                this.punchClockLoading = false;
                this.localStorageService.store("Reddah_PunchClock_"+this.userName, this.punchedDays);
                this.reddah.setPoint("PunchClock",data.Message.GotPoint)

                if(data.Success==0){
                    this.flag = true;
                }
            }
            
        });
        this.showTime();
    }
  
    all_year = [];
    all_month = [];
    // 当前年月日
    active_day:any;
    select_year: any;
    select_month: any;
    // 指定的年和月的所有日期
    days = [];
    //  创建日历
    showTime(){
        //在select中填入年份
        for(var year = 2016; year < 2050; year++) {
            var obj_1 = {'value': year, 'id': year}
            this.all_year.push(obj_1);
        }
        //在select中填入月份
        for(var month = 1; month < 13; month++) {
        var obj_2 = {'value': month, 'id': month}
            this.all_month.push(obj_2);
        }
        //初始化显示 当前年和月
        this.show_now();
    }

    //初始化显示 当前年和月
    show_now(){
        var now = new Date();
        this.active_day = now.getDate();
        this.select_year = now.getFullYear();
        this.select_month = now.getMonth() + 1;
        this.showDays(this.select_year, this.select_month)
    }

    //展示指定的年和月的所有日期
    showDays(year, month){
        this.days = [];
        //得到表示指定年和月的1日的那个时间对象
        var date = new Date(year, month - 1, 1);
        //1.先添加响应的空白的div:这个月1号是星期几，就添加几个空白的div
        var dayOfWeek = date.getDay(); //得到1日是星期几
        for(var i = 1; i < dayOfWeek; i++) {
            this.days.push({day:''});
        }
        //计算一个月有多少天
        var daysOfMonth = this.calDays(year, month);
        //2. 从1号开始添加li
        let day={day:'',choosed:false}
        for(var j = 1; j <= daysOfMonth; j++) {
            day.day=String(j);
            if(j==this.active_day){
                day.choosed=true  ////////修改日期选中状态
            };
            this.days.push(day);
            
            day={day:'',choosed:false}
        }
    }

    //返回指定的月份的天数 月份1-12
    calDays(year, month){
        return new Date(year, month, 0).getDate();
    }


    //  下一个月
    nextMonth(){
        var date = new Date(this.select_year, this.select_month, 1);
        this.showDays(date.getFullYear(), date.getMonth() + 1)
        this.select_month = date.getMonth() + 1;
        this.select_year = date.getFullYear();
    }

    //  上一个月
    preMonth(){
        var date = new Date(this.select_year, this.select_month-1);
        
            if(this.select_month>1){
                this.showDays(date.getFullYear(), date.getMonth() - 1 + 1)
                this.select_year = date.getFullYear();
                this.select_month = date.getMonth()-1 + 1;
            }else {
                this.showDays(date.getFullYear()-1, 12)
                this.select_month = 12;
                this.select_year = this.select_year -1;
            }
    }

    change_day(day){
        this.active_day = day;
    }
}
