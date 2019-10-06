import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

import L from 'leaflet';
//import "../../assets/maker/leaflet.awesome-markers";
import { ActivatedRoute, Params } from '@angular/router';
import { UserPage } from '../common/user/user.page';

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
        public activeRoute: ActivatedRoute, 
        private elementRef: ElementRef,
    ){
        this.userName = this.reddah.getCurrentUser();
        /*this.activeRoute.queryParams.subscribe((params: Params) => {
            this.location.location.lat = params['lat']?params['lat']:0;
            this.location.location.lng = params['lng']?params['lng']:0;
       });*/
        
    }

    close(){
        this.modalController.dismiss();
    }

    async ngOnInit(){
    }

    @ViewChild('earth') mapContainer: ElementRef;
    map: any;

    location= { location:{lat:0,lng:52} };;

    ionViewDidEnter() {

        this.loadmap();
        
        /*if(this.location){
            this.location.location.lat = this.lat;
            this.location.location.lng = this.lng;
            this.setLocation(this.location, false);
        }*/
        
        this.goMe();
    }

    
    markerGroup; 
    tileUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";  
    tileOptions:any = { maxZoom: 15 };

    loadmap() {

        this.markerGroup = L.featureGroup();
        this.map = L.map("earth", {attributionControl: false}).fitWorld();

        L.tileLayer(this.tileUrl, this.tileOptions).addTo(this.map);
    }
  
    flyMaker;
    selectedItem;
    setLocation(item, showMaker=true){
        this.selectedItem = item;
        
        if(showMaker){
            /*var redMarker = L.AwesomeMarkers.icon({
                icon: 'coffee',
                markerColor: 'red'
            });*/
              
            this.flyMaker = L.marker([item.location.lat, item.location.lng]).addTo(this.map)
            //this.flyMaker = L.marker([item.location.lat, item.location.lng], {icon: redMarker}).addTo(this.map)
                .bindPopup("<img style='float:left;margin-right:10px;border-radius:3px;' width=40 height=40 src="+this.reddah.appData('userphoto_'+this.userName)+">"+
                this.reddah.appData('usersignature_'+this.userName), {closeButton: true});

            this.markerGroup.clearLayers();
            this.markerGroup.addLayer(this.flyMaker);
            if(this.location)
                this.map.addLayer(this.markerGroup);
        }

        this.map.setView([item.location.lat, item.location.lng], 3);
        //this.map.flyTo([item.location.lat, item.location.lng], 3);
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
        
        let loc = null;
        try{
            loc = JSON.parse(locationJson);
        }catch(e){}
        
        if(loc&&loc.location){
            this.setLocation(loc);
        }else{
            this.map.locate({ setView: true, maxZoom: 15 }).on('locationfound', (e) => {
                loc = {
                    "title": this.userName,
                    "location":{"lat":e.latitude,"lng":e.longitude}
                }
                this.setLocation(loc);

                this.reddah.saveUserLocation(this.userName, loc, loc.location.lat, loc.location.lng);
                    
                
            }).on('locationerror', (err) => {
                alert(err.message);
            })
        }
            
    }

    async refresh(type){
        let center = this.map.getCenter();
        let bounds = this.map.getBounds();
        let ne = bounds._northEast;
        let sw = bounds._southWest;

        let latCenter = center.lat;
        let lngCenter = center.lng;
        let latLow = sw.lat; 
        let latHigh = ne.lat;
        let lngLow = sw.lng;
        let lngHigh = ne.lng;

        //get cache by current hour.
        let cacheKey = `this.reddah.getUsersByLocation${type}${latCenter}${lngCenter}${latLow}${latHigh}${lngLow}${lngHigh}${this.reddah.getHourString()}`;
        let request = this.reddah.getUsersByLocation(type, latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, 0);

        this.cacheService.loadFromObservable(cacheKey, request, "getUsersByLocation")
        .subscribe(data=>{
            //console.log(data)
            if(data.Success==0){
                this.markerGroup.clearLayers();

                let showArray = [];
                let showNumber = 5;
                if(data.Message.length<=showNumber){
                    for(let i =0;i<data.Message.length;i++)
                        showArray.push(i);
                }else{
                    showArray = this.reddah.getRandomArray(showNumber, data.Message.length);
                }
                data.Message.forEach((user, index) => {
                    this.reddah.getUserPhotos(user.UserName);
                    if(showArray.includes(index)){
                        //let content = L.DomUtil.create('div', 'content');
                        let content = "<img id='"+user.UserName+"' style='margin-right:5px;border-radius:3px;' width=40 height=40 src="
                            +this.reddah.appDataMap('userphoto_'+user.UserName, user.Photo)+">"
                            //+this.reddah.getDisplayName(user.UserName)+"";
                        let popup = L.popup().setContent(content);
                        /*L.DomEvent.on(popup, 'click', ()=>{
                            this.goUser(user.UserName);
                        });*/

                        
                        this.flyMaker = L.marker([user.Lat, user.Lng]).addTo(this.map)
                            .bindPopup(popup,{closeButton: true});
                            //+"<br>"+this.reddah.appData('usersignature_'+user.UserName));

                        this.flyMaker.on('popupopen', ()=> {
                            this.elementRef.nativeElement.querySelector("#"+user.UserName)
                            .addEventListener('click', (e)=>
                            {
                                this.goUser(user.UserName);
                            });
                        });
                            
                        this.markerGroup.addLayer(this.flyMaker);
                    }

                });
                this.map.addLayer(this.markerGroup);
            }
        });
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            }
        });
          
        await userModal.present();
    }
}
