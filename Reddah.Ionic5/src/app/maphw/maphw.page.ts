import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2, Inject } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { LoadingController, NavController, ModalController } from '@ionic/angular';

import L from 'leaflet';
//import "../../assets/maker/leaflet.awesome-markers";
import { UserPage } from '../common/user/user.page';
import { DOCUMENT } from '@angular/common';

declare var HWMapJsSDK: any;

@Component({
    selector: 'app-maphw',
    templateUrl: 'maphw.page.html',
    styleUrls: ['maphw.page.scss']
})
export class MapHWPage implements OnInit {

    maphw: any;
    marker: any;

    markerGroup = [];
    markerContentGroup = [];


    @Input() lat: any;
    @Input() lng: any;
    @Input() readonly = false;
    userName: any;

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,

        public modalController: ModalController,
        private elementRef: ElementRef,
        private _renderer2: Renderer2, 
        @Inject(DOCUMENT) private _document: Document,
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

    ngOnInit(){
    }

    @ViewChild('earth') mapContainer: ElementRef;
    map: any;

    location= { location:{lat:0,lng:52} };;

    ionViewDidEnter() {
        this.loadmap();
        this.goMe(true);
    }
    
    //markerGroup; 
    tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";  
    tileOptions:any = { maxZoom: 15 };

    loadmap() {
        
    }
  
    flyMaker;
    selectedItem;
    setLocation(item, showMaker=true){
        this.selectedItem = item;
        
        const mapOptions: any = {};
        mapOptions.center = { lat: item.location.lat, lng: item.location.lng };
        mapOptions.zoom = 3;
        mapOptions.language = this.reddah.getCurrentLocale().split('-')[0];
        mapOptions.zoomControl = false; 
        this.maphw = new HWMapJsSDK.HWMap(document.getElementById('map'), mapOptions);
        
        if(showMaker){
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
                    +this.reddah.appData('userphoto_'+this.userName)+">"+
                    this.reddah.appData('usersignature_'+this.userName),
                offset: [0, -40],
            });
            infoWindow.open(marker);
            this.markerContentGroup.push(infoWindow);
            marker.addListener('click', () => {
                infoWindow.open(marker);
                this.markerContentGroup.push(infoWindow);
            });
            
        }

        //this.map.setView([item.location.lat, item.location.lng], 3);
    }

    @ViewChild('about') about;
    change(page=null){
        
        this.reddah.getMessageUnread().subscribe(data=>{
            if(data.Success==0){
                this.reddah.unReadMessage = data.Message;
            }
        });
    }

    
    async goMe(auto=false){
        
        let locationJson = this.reddah.appData('userlocationjson_'+this.userName);
        
        let loc = null;
        try{
            loc = JSON.parse(locationJson);
        }catch(e){}
        
        if(loc&&loc.location){
            this.setLocation(loc);
        }else{
            this.map.locate({ setView: true, maxZoom: 15 }).on('locationfound', (e) => {
                if(!this.readonly){
                    loc = {
                        "title": this.userName,
                        "location":{"lat":e.latitude,"lng":e.longitude}
                    }
                    this.setLocation(loc);
                    this.reddah.saveUserLocation(this.userName, loc, loc.location.lat, loc.location.lng);
                }
                else{
                    loc = {
                        "title": this.reddah.instant("Menu.About"),
                        "location":{"lat":e.latitude,"lng":e.longitude}
                    }
                    this.setLocation(loc, false);
                    
                    if(auto){
                        this.refresh(0);
                    }
                }
                
            }).on('locationerror', (err) => {
                console.log(err.message);
            })
        }
            
    }

    clearMarker(marker){
        marker.setMap(null);
        marker = null;
    }
    async refresh(type){
        const loading = await this.loadingController.create({
            cssClass: 'custom-loading',
            spinner:'bubbles',
            duration: 2000,
        });
        await loading.present();
//console.log(this.maphw)
        let center = this.maphw.getCenter();
        let bounds = this.maphw.getBounds();
//console.log(center);
//console.log(bounds);

        //let ne = bounds._northEast;
        //let sw = bounds._southWest;
        let ne = bounds.ne;
        let sw = bounds.sw;

        let latCenter = center.lat;
        let lngCenter = center.lng;
        let orgLngCenter = center.lng;
        let latLow = sw.lat; 
        let latHigh = ne.lat;
        let lngLow = sw.lng;
        let orgLngLow = sw.lng;
        let lngHigh = ne.lng;
        let orgLngHigh = ne.lng;
        
        //alert(`center_lng:_${lngCenter} _lng:(${lngLow}, ${lngHigh})`);

        //adjust
        lngCenter = lngCenter % 360;
        if (lngCenter >= 180)
        {
            lngCenter = lngCenter - 360;
        }
        if (lngCenter <= -180)
        {
            lngCenter = -lngCenter - 360;
        }
        lngLow = lngLow % 360;
        if (lngLow >= 180)
        {
            lngLow = lngLow - 360;
        }
        if (lngLow <= -180)
        {
            lngLow = -lngLow - 360;
        }
        lngHigh = lngHigh % 360;
        if (lngHigh >= 180)
        {
            lngHigh = lngHigh - 360;
        }
        if (lngHigh <= -180)
        {
            lngHigh = -lngHigh - 360;
        }
        //let lngOffset = lngCenter-orgLngCenter;
        //console.log(lngOffset)
        //alert(`center_lng:_${lngCenter} _lng:(${lngLow}, ${lngHigh})`);
        //get cache by current hour.
        //let cacheKey = `this.reddah.getUsersByLocation${type}${latCenter}${lngCenter}${latLow}${latHigh}${lngLow}${lngHigh}${this.reddah.getHourString()}`;
        //let request = this.reddah.getUsersByLocation(type, latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, 0);
        //this.cacheService.loadFromObservable(cacheKey, request, "getUsersByLocation")
        ////////this.map.setView([latCenter, lngCenter], this.map.getZoom());
        //do not use cache when user count is too low
        this.reddah.getUsersByLocation(type, latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, 0)
        .subscribe(data=>{
            //console.log(data)
            if(data.Success==0){
                this.clearMarker(this.marker);
                
                //this.markerGroup.clearLayers();
                this.markerGroup.forEach(ex=>{
                    this.clearMarker(ex);
                });
                this.markerContentGroup.forEach(mc=>{
                    mc.close()
                });
                this.markerGroup = [];
                this.markerContentGroup = [];

                let showArray = [];
                let showNumber = 5;
                if(data.Message.length<=showNumber){
                    for(let i =0;i<data.Message.length;i++)
                        showArray.push(i);
                }else{
                    showArray = this.reddah.getRandomArray(showNumber, data.Message.length);
                }
                data.Message.forEach((user, index) => {
                    if(showArray.includes(index)){
                        this.reddah.getUserPhotos(user.UserName);
                        //let content = L.DomUtil.create('div', 'content');
                        let content = "<img id='id_"+user.UserName+"' style='margin-right:5px;border-radius:3px;' width=40 height=40 src="
                            +this.reddah.appDataMap('userphoto_'+user.UserName, user.Photo)+">";
                        let popup = L.popup().setContent(content);
                        /*L.DomEvent.on(popup, 'click', ()=>{
                            this.goUser(user.UserName);
                        });*/

                        
                        /*this.flyMaker = L.marker([user.Lat, user.Lng]).addTo(this.map)
                            .bindPopup(popup,{closeButton: true});
                            //+"<br>"+this.reddah.appData('usersignature_'+user.UserName));

                        
                        this.flyMaker.on('popupopen', ()=> {
                            this.elementRef.nativeElement.querySelector("#id_"+user.UserName)
                            .addEventListener('click', (e)=>
                            {
                                if(!this.readonly){
                                    this.goUser(user.UserName);
                                }
                                else{
                                    this.reddah.toast(this.reddah.instant("Common.LoginToView"));
                                }
                            });
                        });
                        
                            
                        this.markerGroup.addLayer(this.flyMaker);*/
                        let itemMarker = new HWMapJsSDK.HWMarker({
                            map: this.maphw,
                            position: { lat: user.Lat, lng: user.Lng },
                            //label: this.reddah.appData('usersignature_'+user.UserName),
                            icon: { color: type==0?'red':'blue' },
                            label: { opacity: 0.5, url: type==0?'assets/maker/marker-icon-2x-red.png':'assets/maker/marker-icon-2x-blue.png' },
                        });
                        let marker = itemMarker;
                        
                        marker.addListener('click', () => {
                            let infoWindow = new HWMapJsSDK.HWInfoWindow({
                                map: this.maphw,
                                position: { lat: user.Lat, lng: user.Lng },
                                content: "<img id='id_"+user.UserName+"' style='float:left;margin-right:10px;border-radius:3px;' width=40 height=40 src="
                                    +this.reddah.appData('userphoto_'+user.UserName)+">"+
                                    (this.reddah.appData('usersignature_'+user.UserName) ? this.reddah.appData('usersignature_'+user.UserName):this.reddah.instant('About.DefaultSignature')),
                                offset: [0, -40],
                            });
                            this.markerContentGroup.forEach(mc=>{
                                mc.close()
                            });
                            this.markerContentGroup.push(infoWindow);
                            //infoWindow.open(marker);
                            this.elementRef.nativeElement.querySelector("#id_"+user.UserName)
                            .addEventListener('click', (e)=>
                            {
                                if(!this.readonly){
                                    this.goUser(user.UserName);
                                }
                                else{
                                    this.reddah.toast(this.reddah.instant("Common.LoginToView"));
                                }
                            });
                            infoWindow.open(marker);
                        });
                        this.markerGroup.push(itemMarker);

                    }

                });
                //this.map.addLayer(this.markerGroup);

            }
            loading.dismiss();
        });
    }

    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await userModal.present();
    }
}
