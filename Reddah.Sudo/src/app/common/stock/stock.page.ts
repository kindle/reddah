import { Component, OnInit, Input } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import * as Highcharts from 'highcharts/highstock';

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

    constructor(public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
        public actionSheetController: ActionSheetController,
        ){
        
    }
    
    ngOnInit(){
        if(this.s==null)
            this.s = "000563";
        this.reddah.getStock(this.s).subscribe(result=>{
            //console.log(result);
            let data = result[0].hq;
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

                //console.log(ohlc);
                //console.log(volume);

                //this.view1(ohlc, volume);
                //this.view2(ohlc, volume);
                this.view3(ohlc, volume);
                //this.view4(ohlc, volume);
                
            }
        });
    }

    view1(ohlc, volume){
        Highcharts.stockChart('container', {
            title: {
                text: this.s //+ ' Historical'
            },
            //colors: ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce',
            //        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
            //colors: ['red', '#0d233a', '#8bbc21', '#910000', '#1aadce',
            //        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
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
                color: 'green',
                lineColor: 'green',
                upColor: 'red',
                upLineColor: 'red',
                data: ohlc,
                showInNavigator: false,
                //dataGrouping: {
                //   units: groupingUnits
                //},
            }, 
            {
                type: 'column',
                name: 'Volume',
                showInNavigator: false,
                //color: 'green',
                //lineColor: 'green',
                //upColor: 'red',
                //upLineColor: 'red',
                data: volume,
                yAxis: 1,
                //dataGrouping: {
                //    units: groupingUnits
                //}
            }
            ]
        });
    }

    view2(ohlc, volume){
        Highcharts.stockChart('container', {
            yAxis: [{
                labels: {
                    align: 'left'
                },
                height: '80%',
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'left'
                },
                top: '80%',
                height: '20%',
                offset: 0
            }],
            tooltip: {
                shape: 'square',
                headerShape: 'callout',
                borderWidth: 0,
                shadow: false,
                /*positioner: function(width, height, point) {
                    let chart = this.chart,
                        position;
                    if (point.isHeader) {
                        position = {
                            x: Math.max(
                                // Left side limit
                                chart.plotLeft,
                                Math.min(
                                    point.plotX + chart.plotLeft - width / 2,
                                    // Right side limit
                                    chart.chartWidth - width - chart.marginRight
                                )
                            ),
                            y: point.plotY
                        };
                    } else {
                        position = {
                            x: point.series.chart.plotLeft,
                            y: point.series.yAxis.top - chart.plotTop
                        };
                    }
                    return position;
                }*/
            },
            series: [{
                type: 'ohlc',
                id: this.s+'-ohlc',
                name: this.s+' Stock Price',
                data: ohlc,
                showInNavigator: false,
            }, {
                type: 'column',
                id: this.s+'-volume',
                name: this.s+' Volume',
                data: volume,
                yAxis: 1,
                showInNavigator: false,
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 800
                    },
                    chartOptions: {
                        rangeSelector: {
                            inputEnabled: false
                        }
                    }
                }]
            }
        });
    }

    view3(ohlc, volume){
        Highcharts.stockChart('container', {
            yAxis: [{
                labels: {
                    align: 'left'
                },
                height: '80%',
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'left'
                },
                top: '80%',
                height: '20%',
                offset: 0
            }],
            tooltip: {
                shape: 'square',
                headerShape: 'callout',
                borderWidth: 0,
                shadow: false,
            },
            plotOptions: {
                series: {
                    showInLegend: true
                }
            },
            series: [{
                type: 'spline',
                id: this.s+'-ohlc',
                name: this.s+' Stock Price',
                data: ohlc,
                showInNavigator: false,
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 800
                    },
                    chartOptions: {
                        rangeSelector: {
                            inputEnabled: false
                        }
                    }
                }]
            }
        });
    }
/*
    view4(ohlc, volume){
        Highcharts.stockChart('container', {
            rangeSelector : {
                selected : 1
            },
            title : {
                text : this.s
            },
            series: [{
                name : this.s+' Stock Price',
                data : ohlc,
                type : 'areaspline',
                threshold : null,
                tooltip : {
                    valueDecimals : 2
                },
                fillColor : {
                    linearGradient : {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops : [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, new Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                }
            }]
        });
        
    }
    */

    data = {
        type: "line",
        data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
            {
            label: "Price",
            data: [37.4, 36.6, 40.48, 41.13, 42.05, 40.42, 43.09]
            }
        ]
        },
        options: {
        title: {
            text: "Line chart"
        },
        legend: {
            display: false
        },
        scales: {
            yAxes: [
            {
                scaleLabel: {
                display: true,
                labelString: "Price ($)"
                }
            }
            ]
        },
        tooltips: {
            callbacks: {
            label: function(tooltipItem, data) {
                return tooltipItem.yLabel + " $";
            }
            }
        }
        }
    };
}
