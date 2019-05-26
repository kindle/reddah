import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
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
    
    ngOnInit(){
        if(this.s==null)
            this.s = "000563";
        this.reddah.getStock(this.s).subscribe(result=>{
            console.log(result);
            let data = result.json()[0].hq;
            if(data!=null){
                // split the data set into ohlc and volume
                var ohlc = [],
                volume = [],
                dataLength = data.length,
                // set the allowed units for data grouping
                groupingUnits = [[
                    'week',                         // unit name
                    [1]                             // allowed multiples
                ], [
                    'month',
                    [1, 2, 3, 4, 6]
                ]],

                i = 0;

                //"2018-07-20","61.22","61.83","0.61","1.00%","61.22","62.69","57637","35856.55","0.53%"
                //分别表示日期，开盘，收盘，涨跌，涨幅，最低，最高，成交量，成交额，换手。

                for (i; i < dataLength; i += 1) {
                    ohlc.push([
                        new Date(data[i][0]).valueOf(), // the date
                        parseFloat(data[i][1]), // open
                        parseFloat(data[i][6]), // close
                        parseFloat(data[i][5]), // low
                        parseFloat(data[i][2]), // high        
                    ]);

                    volume.push([
                        new Date(data[i][0]).valueOf(), // the date
                        parseFloat(data[i][7]) // the volume
                    ]);
                }

                console.log(ohlc);
                console.log(volume);


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
                        //showInNavigator: false,
                        //dataGrouping: {
                        //    units: groupingUnits
                        //},
                    }, 
                    {
                        type: 'column',
                        name: 'Volume',
                        data: volume,
                        yAxis: 1,
                        //dataGrouping: {
                        //    units: groupingUnits
                        //}
                    }
                    ]
                });
            }
        });
    }



}
