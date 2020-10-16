import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2 } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ActionSheetController  } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import L from 'leaflet';
//import 'proj4leaflet';
//import { OpenStreetMapProvider } from 'leaflet-geosearch';

declare var HWMapJsSDK: any;

@Component({
  selector: 'app-locationhw',
  templateUrl: 'locationhw.page.html',
  styleUrls: ['locationhw.page.scss']
})
export class LocationHWPage implements OnInit {
    @Input() location;

    inChina = true;

    async close(){
        await this.modalController.dismiss();
    }

    @ViewChild('map') mapContainer: ElementRef;
    map: any;

    constructor(public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
        public actionSheetController: ActionSheetController,
    ){}
    
    locations=[];

    ngOnInit(){
        
    }

    ionViewDidEnter() {
        this.checkInChina();
        //this.loadmap();

        if(this.location){
            this.setLocation(this.location);
        }
        
    }

    checkInChina(){
        let item = this.location;
        if(item){
            let clat = item.location.lat, clng = item.location.lng;
            if(clat>3.86&&clat<53.55&&
                clng>73.66&&clng<135.05)
            {
                this.inChina = true;
            }
            else{
                this.inChina = false;
            }
            
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

        this.tileUrl = "https://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0";   
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
    tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";  
    tileOptions:any = { maxZoom: 18 };

    loadmap() {

        this.markerGroup = L.featureGroup();
        this.map = L.map("map", {attributionControl: false}).fitWorld();

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
                        if(data.status==0){
                            let l = data.locations[0];
                            let marker = L.marker([l.lat, l.lng]).on('click', () => {});
    
                            this.markerGroup.addLayer(marker);
                            this.map.addLayer(this.markerGroup);
    
                            this.reddah.getNearby(l.lat, l.lng).subscribe(data=>{
                                this.locations = data.result.pois;
                                if(this.locations.length==0){
                                    this.locations = [{"id":0,"title":this.reddah.instant('Article.CurrentLocation'),
                                    "location":{"lat":e.latitude,"lng":e.longitude}}];
                                }
                            });
                        }
                        else{
                            alert(data.message);
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
                //console.log(err.message);
                //this.test(31.273139,121.64594);
            })
        }
    }


    flyMaker;
    selectedItem;

    maphw: any;
    marker: any;

    setLocation(item){
        this.selectedItem = item;
        //console.log(item)
        if(item!=null&&item.location!=null){
            const mapOptions: any = {};
            mapOptions.center = { lat: item.location.lat, lng: item.location.lng };
            mapOptions.zoom = 3;
            mapOptions.language = this.reddah.getCurrentLocale().split('-')[0];
            mapOptions.zoomControl = false; 
            this.maphw = new HWMapJsSDK.HWMap(document.getElementById('map'), mapOptions);

            this.marker = new HWMapJsSDK.HWMarker({
                map: this.maphw,
                position: { lat: item.location.lat, lng: item.location.lng },
                icon: { color: 'green' },
                label: { opacity: 0.5, url: 'assets/maker/marker-icon-2x-green.png' },
            });
            const marker = this.marker;
            let infoWindow = new HWMapJsSDK.HWInfoWindow({
                map: this.maphw,
                position: { lat: item.location.lat, lng: item.location.lng },
                content: "<img style='float:left;margin-right:10px;border-radius:3px;' width=40 height=40 src="
                    +this.reddah.appData('userphoto_'+this.location.title)+">"+
                    this.reddah.appData('usersignature_'+this.location.title),
                offset: [0, -40],
            });
            infoWindow.open(marker);
            
            marker.addListener('click', () => {
                infoWindow.open(marker);
                
            });
/*
            var myIcon = L.icon({
                iconUrl: 'assets/maker/marker-icon-2x-blue.png',
                shadowUrl: 'assets/maker/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            this.flyMaker = L.marker([item.location.lat, item.location.lng], {icon: myIcon});
            //this.flyMaker = L.marker([item.location.lat, item.location.lng]);
            this.markerGroup.clearLayers();
            this.markerGroup.addLayer(this.flyMaker);
            if(this.location)
                this.map.addLayer(this.markerGroup);

            this.map.setView([item.location.lat, item.location.lng], 15);*/
        }
    }

    async confirm(){
        this.modalController.dismiss(this.selectedItem);
    }

}
