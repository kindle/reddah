import { Component, OnInit, ViewChild, ElementRef, Renderer, Input } from '@angular/core';
import { InfiniteScroll, Platform } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, PopoverController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute, Params } from '@angular/router';
import L from 'leaflet';
//import 'proj4leaflet';
//import { OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-location',
  templateUrl: 'location.page.html',
  styleUrls: ['location.page.scss']
})
export class LocationPage implements OnInit {
    @Input() location;

    inChina = true;

    async close(){
        await this.modalController.dismiss();
    }

    @ViewChild('map') mapContainer: ElementRef;
    map: any;

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
        private platform: Platform,
        ){
        
    }
    
    locations=[];

    ngOnInit(){
        
    }

    ionViewDidEnter() {
        this.loadmap();

        if(this.location){
            this.setLocation(this.location);
        }
        
    }

    extend(){
        L.TileLayer.WebDogTileLayer = L.TileLayer.extend({
            getTileUrl: function (tilePoint) {
                let domain = new Map().set("a",0).set("b",1).set("c",2);
                return L.Util.template(this._url, L.extend({
                    s: domain.get(this._getSubdomain(tilePoint)),
                    z: tilePoint.z,
                    x: tilePoint.x,
                    y: Math.pow(2, tilePoint.z) - 1 - tilePoint.y
                }, this.options));
            }

        });
        
        L.tileLayer.webdogTileLayer = (url, options)=> {
            return new L.TileLayer.WebDogTileLayer(url, options);
        };

        this.tileUrl = "http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0";   
        this.tileOptions = {
            subdomain: '012',
            getUrlArgs: (tilePoint)=> {
                return {
                    z: tilePoint.z,
                    x: tilePoint.x,
                    y: Math.pow(2, tilePoint.z) - 1 - tilePoint.y
                };
            }  
        };
    }
    
    markerGroup; 
    tileUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";  
    tileOptions:any = { maxZoom: 18 };

    loadmap() {

        this.markerGroup = L.featureGroup();
        this.map = L.map("map").fitWorld();

        if(this.inChina){
            //need to adjust location
            this.extend()
            L.tileLayer.webdogTileLayer(this.tileUrl, this.tileOptions).addTo(this.map);
        }
        else{
            L.tileLayer(this.tileUrl, this.tileOptions).addTo(this.map);
        }

        if(!this.location)
        {
            this.map.locate({ setView: true, maxZoom: 15 }).on('locationfound', (e) => {
                if(this.inChina){
                    this.reddah.getQqLocation(e.latitude, e.longitude).subscribe(data=>{
                        if(data._body.status==0){
                            let l = data._body.locations[0];
                            let marker = L.marker([l.lat, l.lng]).on('click', () => {});
    
                            this.markerGroup.addLayer(marker);
                            this.map.addLayer(this.markerGroup);
    
                            this.reddah.getNearby(l.lat, l.lng).subscribe(data=>{
                                this.locations = data._body.result.pois;
                            });
                        }
                        else{
                            alert(data._body.message);
                        }
                        
                    })
                }
                else{
                    let marker = L.marker([e.latitude, e.longitude]).on('click', () => {});

                    this.markerGroup.addLayer(marker);
                    this.map.addLayer(this.markerGroup);

                    this.reddah.getNearby(e.latitude, e.longitude).subscribe(data=>{
                        this.locations = data._body.result.pois;
                    });  
                }

            }).on('locationerror', (err) => {
                alert(err.message);
            })
        }
    }


    flyMaker;
    selectedItem;
    setLocation(item){
        this.selectedItem = item;
        
        this.flyMaker = L.marker([item.location.lat, item.location.lng]);
        this.markerGroup.clearLayers();
        this.markerGroup.addLayer(this.flyMaker);
        if(this.location)
            this.map.addLayer(this.markerGroup);

        this.map.setView([item.location.lat, item.location.lng], 15);
    }

    async confirm(){
        this.modalController.dismiss(this.selectedItem);
    }

}
