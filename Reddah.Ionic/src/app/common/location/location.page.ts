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
import { OpenStreetMapProvider } from 'leaflet-geosearch';

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
    
    ngOnInit(){
        
    }

    ionViewDidEnter() {
        this.loadmap();
    }
    
    loadmap() {
        this.map = leaflet.map("map").fitWorld();
        
        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(this.map);

        this.map.locate({
            setView: true, 
            maxZoom: 10
        }).on('locationfound', (e) => {
            let markerGroup = leaflet.featureGroup();
            let marker: any = leaflet.marker([e.latitude, e.longitude]).on('click', () => {
                alert('Marker clicked');
            })

            markerGroup.addLayer(marker);
            this.map.addLayer(markerGroup);

            //add search
            var controlSearch = new L.Control.Search({
                position:'topright',		
                layer: marker,
                initial: false,
                zoom: 12,
                marker: false
            });
            this.map.addControl( controlSearch );

        }).on('locationerror', (err) => {
            alert(err.message);
        })

        var searchLayer = L.layerGroup().addTo(this.map);
        //... adding data in searchLayer ...
        this.map.addControl( new L.Control.Search({layer: searchLayer}) );
        
    }

}
