import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { InfiniteScroll, Content } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Article } from '../model/article';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { PostviewerPage } from '../postviewer/postviewer.page';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

import L from 'leaflet';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-map',
    templateUrl: 'map.page.html',
    styleUrls: ['map.page.scss']
})
export class MapPage implements OnInit {

    @Input() lat: any;
    @Input() lng: any;
    userName: any;

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,

        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private cacheService: CacheService,
        public activeRoute: ActivatedRoute
    ){
        this.userName = this.reddah.getCurrentUser();
        /*this.activeRoute.queryParams.subscribe((params: Params) => {
            this.location.location.lat = params['lat']?params['lat']:0;
            this.location.location.lng = params['lng']?params['lng']:0;
       });*/
        
    }

    async ngOnInit(){
        
    }

    @ViewChild('earth') mapContainer: ElementRef;
    map: any;

    location= { location:{lat:0,lng:52} };;

    ionViewDidEnter() {

        this.loadmap();
        
        if(this.location){
            this.location.location.lat = this.lat;
            this.location.location.lng = this.lng;
            this.setLocation(this.location);
        }
    }

    
    markerGroup; 
    tileUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";  
    tileOptions:any = { maxZoom: 15 };

    loadmap() {

        this.markerGroup = L.featureGroup();
        this.map = L.map("earth").fitWorld();

        L.tileLayer(this.tileUrl, this.tileOptions).addTo(this.map);
        

        /*if(!this.location)
        {
            this.map.locate({ setView: true, maxZoom: 15 }).on('locationfound', (e) => {
                
                let marker = L.marker([e.latitude, e.longitude]).on('click', () => {});

                this.markerGroup.addLayer(marker);
                this.map.addLayer(this.markerGroup);

                //this.reddah.getNearby(e.latitude, e.longitude).subscribe(data=>{
                //    this.locations = data._body.result.pois;
                //});  

            }).on('locationerror', (err) => {
                alert(err.message);
            })
        }*/
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

        //this.map.setView([item.location.lat, item.location.lng], 15);
        this.map.flyTo([item.location.lat, item.location.lng], 4);
    }

    @ViewChild('about') about;
    change(page=null){
        
        this.reddah.getMessageUnread().subscribe(data=>{
            if(data.Success==0){
                this.reddah.unReadMessage = data.Message;
            }
        });
    }

    async goMe(){
        let locationJson = this.reddah.appData('userlocationjson_'+this.userName);
        
        let loc = JSON.parse(locationJson);
        if(loc){
            this.setLocation(loc);
        }else{
            this.map.locate({ setView: true, maxZoom: 15 }).on('locationfound', (e) => {
                loc = {
                    "title": this.userName,
                    "location":{"lat":e.latitude,"lng":e.longitude}
                }
                this.setLocation(loc);

                this.reddah.saveUserLocation(this.userName, loc);
            }).on('locationerror', (err) => {
                alert(err.message);
            })
        }
            
    }

    async refresh(){
        
    }
}
