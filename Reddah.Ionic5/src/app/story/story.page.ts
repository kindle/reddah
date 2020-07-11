import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ReddahService } from '../reddah.service';
import { LoadingController, NavController, ModalController } from '@ionic/angular';

import L from 'leaflet';
import { UserPage } from '../common/user/user.page';
import { AddTimelinePage } from '../mytimeline/add-timeline/add-timeline.page';
import { TsViewerPage } from '../mytimeline/tsviewer/tsviewer.page';

@Component({
    selector: 'app-story',
    templateUrl: 'story.page.html',
    styleUrls: ['story.page.scss']
})
export class StoryPage implements OnInit {

    @Input() lat: any;
    @Input() lng: any;
    @Input() readonly = false;
    userName: any;

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController, 
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

    
    markerGroup; 
    tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";  
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
                .bindPopup("<img style='float:left;margin-right:10px;border-radius:3px;' width=40 height=40 src="
                +this.reddah.appData('userphoto_'+this.userName)+">"+
                this.reddah.appData('usersignature_'+this.userName), {closeButton: true});
            this.markerGroup.clearLayers();
            this.markerGroup.addLayer(this.flyMaker);
            if(this.location)
                this.map.addLayer(this.markerGroup);

            
        }

        this.map.setView([item.location.lat, item.location.lng], 11);
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

    async refresh(type=0){
        let center = this.map.getCenter();
        let bounds = this.map.getBounds();
        let ne = bounds._northEast;
        let sw = bounds._southWest;

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
        this.map.setView([latCenter, lngCenter], this.map.getZoom());
        //do not use cache when user count is too low
        console.log(`${type}, ${latCenter}, ${lngCenter}, ${latLow}, ${latHigh}, ${lngLow}, ${lngHigh}`)
        this.reddah.getStoryByLocation(type, latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, 0)
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
                        let photos = user.Content.split('$$$');
                        let samplePhoto = "";
                        if(photos.length>0)
                            samplePhoto = photos[0];
                        /*let content = "<img id='"+user.Id+""+"' style='float:left;margin-right:5px;border-radius:3px;' width=40 height=40 src="
                            +this.reddah.appDataMap('userphoto_'+user.UserName, samplePhoto)+">"
                            +this.reddah.summary(user.Title, 20)+"";*/
                        //let content = "<div (click)='"+this.goTsViewer(user)+"'>"+this.reddah.summary(user.Title, 20)+"</div>"
                        let content = "<div (onclick)='goTsViewer("+user+")'>"+this.reddah.summary(user.Title, 20)+"</div>"
                        let popup = L.popup().setContent(content);
                        /*L.DomEvent.on(popup, 'click', ()=>{
                            this.goUser(user.UserName);
                        });*/

                        
                        this.flyMaker = L.marker([user.Lat, user.Lng]).addTo(this.map)
                            .bindPopup(popup,{closeButton: true});
                            //+"<br>"+this.reddah.appData('usersignature_'+user.UserName));

                        /*
                        this.flyMaker.on('popupopen', ()=> {
                            this.elementRef.nativeElement.querySelector("#"+user.Id)
                            .addEventListener('click', (e)=>
                            {
                                console.log(e)
                                this.goTsViewer(user);
                            });
                        });*/
                        
                            
                        this.markerGroup.addLayer(this.flyMaker);
                    }

                });
                this.map.addLayer(this.markerGroup);
            }
        });
    }

    async goTsViewer(article){
        const userModal = await this.modalController.create({
            component: TsViewerPage,
            componentProps: { 
                article: article
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await userModal.present();
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

    async create(){
        //data=1: take a photo, data=2: lib photo, data=3: lib video
        this.goPost(1);
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddTimelinePage,
            componentProps: { 
                postType: postType,
                action: 'story'
            },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            
        }
    }
}
