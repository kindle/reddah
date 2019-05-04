import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { LocalePage } from '../locale/locale.page';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TimelinePopPage } from '../article-pop/timeline-pop.page';
import { AddFriendPage } from '../add-friend/add-friend.page';
import { TimeLinePage } from '../timeline/timeline.page';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { TimelineCommentPopPage } from '../article-pop/timeline-comment-pop.page'
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { IonicImageLoader } from 'ionic-image-loader';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as HighCharts from 'highcharts';
var Highcharts = require('highcharts/highstock');

@Component({
  selector: 'app-stock',
  templateUrl: 'stock.page.html',
  styleUrls: ['stock.page.scss']
})
export class StockPage implements OnInit {
    async close(){
        await this.modalController.dismiss();
    }

    @Input() s: string;

    constructor(private reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private renderer: Renderer,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private photoLibrary: PhotoLibrary,
        private cacheService: CacheService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public actionSheetController: ActionSheetController,
        ){
        
    }

    data : [];
    historySearchHandler(data){
        alert(data);
    }
    ngOnInit(){
        this.s = "sz000563";
        this.reddah.foo().subscribe(data=>{console.log(data)});
return;

        this.reddah.getStock(this.s).subscribe(data=>{
            this.data = data.json();
        

          // split the data set into ohlc and volume
          var ohlc = [],
          volume = [],
          dataLength = this.data.length,
          // set the allowed units for data grouping
          groupingUnits = [[
              'week',                         // unit name
              [1]                             // allowed multiples
          ], [
              'month',
              [1, 2, 3, 4, 6]
          ]],

          i = 0;

          for (i; i < dataLength; i += 1) {
              ohlc.push([
                this.data[i][0], // the date
                this.data[i][1], // open
                this.data[i][2], // high
                this.data[i][3], // low
                this.data[i][4] // close
              ]);

              volume.push([
                this.data[i][0], // the date
                this.data[i][5] // the volume
              ]);
          }


          Highcharts.stockChart('container', {
              title: {
                  text: this.s + ' Historical'
              },
              yAxis: [
                  {
                      labels: {
                          align: 'right',
                          x: -3
                      },
                      title: {
                          text: 'OHLC'
                      },
                      height: '60%',
                      lineWidth: 2,
                      resize: {
                          enabled: true
                      }
                  }, 
                  {
                      labels: {
                          align: 'right',
                          x: -3
                      },
                      title: {
                          text: 'Volume'
                      },
                      top: '65%',
                      height: '35%',
                      offset: 0,
                      lineWidth: 2
                  }
              ],
              tooltip: {
                  split: true
              },
              plotOptions: {
                  series: {
                      // general options for all series
                  },
                  candlestick: {
                      // shared options for all candlestick series
                  }
              },
              series: [
                {
                    name: this.s,
                    type: 'candlestick',
                    data: ohlc,
                    showInNavigator: false,
                    dataGrouping: {
                        units: groupingUnits
                    },
                }, 
                {
                    type: 'column',
                    name: 'Volume',
                    data: volume,
                    yAxis: 1,
                    dataGrouping: {
                        units: groupingUnits
                    }
                }
              ]
          });

        })

    }



}
