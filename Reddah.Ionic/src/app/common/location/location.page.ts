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
import leaflet from 'leaflet';
import L from 'leaflet-search';
//import { OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-location',
  templateUrl: 'location.page.html',
  styleUrls: ['location.page.scss']
})
export class LocationPage implements OnInit {
    
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
        ){
        
    }
    
    locations=[];

    ngOnInit(){
        
    }

    ionViewDidEnter() {
        this.loadmap();
    }
    
    markerGroup;
    loadmap() {
        this.map = leaflet.map("map").fitWorld();
        this.markerGroup = leaflet.featureGroup();
        
        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(this.map);

        this.map.locate({
            setView: true, 
            maxZoom: 10
        }).on('locationfound', (e) => {
            let marker = leaflet.marker([e.latitude, e.longitude]).on('click', () => {});

            this.markerGroup.addLayer(marker);
            this.map.addLayer(this.markerGroup);

            //add search
            /*var controlSearch = new L.Control.Search({
                position:'topright',		
                layer: marker,
                initial: false,
                zoom: 12,
                marker: false
            });
            this.map.addControl( controlSearch );*/

            this.reddah.getNearby(e.latitude, e.longitude).subscribe(data=>{
                //alert(JSON.stringify(data));
                //alert(JSON.stringify(data._body.result.pois));
                this.locations = data._body.result.pois;
            });

        }).on('locationerror', (err) => {
            alert(err.message);
        })

        //var searchLayer = L.layerGroup().addTo(this.map);
        //... adding data in searchLayer ...
        //this.map.addControl( new L.Control.Search({layer: searchLayer}) );
        //this.search("方舟大厦")
    }

    /*async search(text){
        // setup
        const provider = new OpenStreetMapProvider();

        // search
        const results = await provider.search({ query: text });
        console.log(results);
    }*/

    flyMaker;
    selectedItem;
    setLocation(item){
        this.selectedItem = item;
        this.flyMaker = leaflet.marker([item.location.lat, item.location.lng]);
        this.markerGroup.clearLayers();
        this.markerGroup.addLayer(this.flyMaker);
        //this.map.addLayer(this.markerGroup);

        this.map.flyTo([item.location.lat, item.location.lng], 15);
    }

}
