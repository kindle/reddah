import { Component, OnInit } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LoadingController, NavController, ModalController } from '@ionic/angular';

//import dat from 'dat.gui'
//import Stats from 'stats-js';
//import TweenMax from "gsap";
import PerspectiveTransform from '../../../assets/surface/css_globe_PerspectiveTransform.js'
import TweenMax from '../../../assets/surface/TweenMax.min.js'
import { MapPage } from '../../map/map.page';

@Component({
    selector: 'app-earth',
    templateUrl: 'earth.page.html',
    styleUrls: ['earth.page.scss']
})
export class EarthPage implements OnInit {

    
    userName: any;
    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController,
    ){
        this.userName = this.reddah.getCurrentUser();
    }

    ngOnInit(){
        this.init(null);
    }

    async tap(evt){
        
        this.config.autoSpin = !this.config.autoSpin;

        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
                lat: this.config.lat,
                lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data||!data)
        {
            this.config.autoSpin = true;
        }
        
    }

    panstart(evt){
        this.isMouseDown = true;
        this.dragX = evt.center.x;
        this.dragY = evt.center.y;
        this.dragLat = this.config.lat;
        this.dragLng = this.config.lng;
    }

    panend(evt){
        if (this.isMouseDown) {
            this.isMouseDown = false;
        } 
    }

    pan(evt){
         if (this.isMouseDown) {
            var dX = evt.center.x - this.dragX;
            var dY = evt.center.y - this.dragY;
            this.config.lat = this.clamp(this.dragLat + dY * 0.5, -90, 90);
            //this.config.lng = this.clampLng(this.dragLng - dX * 0.5, -180, 180);
            this.config.lng = this.clampLng(this.dragLng - dX * 0.5);
            
        }
    }

    async goMe(){
        let locationJson = this.reddah.appData('userlocationjson_'+this.userName);
        
        let loc = JSON.parse(locationJson);
        alert(loc.location.lat+"_"+loc.location.lng);
        if(loc)
            this.goTo(loc.location.lat, loc.location.lng);
    }


    config = {
        percent: 0,
        lat: 0,
        lng: 0,
        segX: 14,
        segY: 12,
        isWorldVisible: true,
        isHaloVisible: true,
        isPoleVisible: true,
        autoSpin: true,
        zoom: 0,

        skipPreloaderAnimation: false,

        goToBristol: function() {
            this.goTo(51.4500, 2.5833);
        }
    };

    stats;
    imgs;
    preloader;
    preloadPercent;
    globeDoms;
    vertices;

    world;
    worldBg;
    globe;
    globeContainer;
    globePole;
    globeHalo;

    pixelExpandOffset = 1.5;
    rX = 0;
    rY = 0;
    rZ = 0;
    sinRX;
    sinRY;
    sinRZ;
    cosRX;
    cosRY;
    cosRZ;
    dragX;
    dragY;
    dragLat;
    dragLng;

    isMouseDown = false;
    isTweening = false;
    tick = 1;

    URLS = {
        bg: 'assets/surface/css_globe_bg.jpg',
        diffuse: 'assets/surface/css_globe_diffuse.jpg',
        halo: 'assets/surface/css_globe_halo.png',
    };

    transformStyleName = PerspectiveTransform.transformStyleName;

    init(ref) {
        
        this.world = document.querySelector('.world');
        this.worldBg = document.querySelector('.world-bg');
        this.worldBg.style.backgroundImage = 'url(' + this.URLS.bg + ')';
        this.globe = document.querySelector('.world-globe');
        this.globeContainer = document.querySelector('.world-globe-doms-container');
        this.globePole = document.querySelector('.world-globe-pole');
        this.globeHalo = document.querySelector('.world-globe-halo');
        this.globeHalo.style.backgroundImage = 'url(' + this.URLS.halo + ')';


        this.regenerateGlobe();

        // events
        this.world.ondragstart = function() {
            return false;
        };


        this.loop();
    }

    regenerateGlobe() {
        var dom, domStyle;
        var x, y;
        this.globeDoms = [];
        while (dom = this.globeContainer.firstChild) {
            this.globeContainer.removeChild(dom);
        }

        var segX = this.config.segX;
        var segY = this.config.segY;
        var diffuseImgBackgroundStyle = 'url(' + this.URLS.diffuse + ')';
        var segWidth = 1600 / segX | 0;
        var segHeight = 800 / segY | 0;

        this.vertices = [];

        var verticesRow;
        var radius = (536) / 2;

        var phiStart = 0;
        var phiLength = Math.PI * 2;

        var thetaStart = 0;
        var thetaLength = Math.PI;

        for (y = 0; y <= segY; y++) {

            verticesRow = [];

            for (x = 0; x <= segX; x++) {

                var u = x / segX;
                var v = 0.05 + y / segY * (1 - 0.1);

                var vertex = {
                    x: -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength),
                    y: -radius * Math.cos(thetaStart + v * thetaLength),
                    z: radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength),
                    phi: phiStart + u * phiLength,
                    theta: thetaStart + v * thetaLength
                };
                verticesRow.push(vertex);
            }
            this.vertices.push(verticesRow);
        }

        for (y = 0; y < segY; ++y) {
            for (x = 0; x < segX; ++x) {
                dom = document.createElement('div');
                domStyle = dom.style;
                domStyle.position = 'absolute';
                domStyle.width = segWidth + 'px';
                domStyle.height = segHeight + 'px';
                domStyle.overflow = 'hidden';
                domStyle[PerspectiveTransform.transformOriginStyleName] = '0 0';
                domStyle.backgroundImage = diffuseImgBackgroundStyle;
                dom.perspectiveTransform = new PerspectiveTransform(dom, segWidth, segHeight);
                dom.topLeft = this.vertices[y][x];
                dom.topRight = this.vertices[y][x + 1];
                dom.bottomLeft = this.vertices[y + 1][x];
                dom.bottomRight = this.vertices[y + 1][x + 1];
                domStyle.backgroundPosition = (-segWidth * x) + 'px ' + (-segHeight * y) + 'px';
                this.globeContainer.appendChild(dom);
                this.globeDoms.push(dom);
            }
        }

    }

    loop(){
        try{
            requestAnimationFrame(()=>{this.loop()});
            this.render();
        }
        catch(e){}
        //catch(e){alert(JSON.stringify(e))}
    }

    render() {

        if (this.config.autoSpin && !this.isMouseDown && !this.isTweening) {
            this.config.lng = this.clampLng(this.config.lng - 0.2);
        }

        this.rX = this.config.lat / 180 * Math.PI;
        this.rY = (this.clampLng(this.config.lng) - 270) / 180 * Math.PI;

        this.world.style.display = this.config.isWorldVisible ? 'block' : 'none';
        this.globePole.style.display = this.config.isPoleVisible ? 'block' : 'none';
        this.globeHalo.style.display = this.config.isHaloVisible ? 'block' : 'none';

        var ratio = Math.pow(this.config.zoom, 1);
        this.pixelExpandOffset = 1.5 + (ratio) * -1.25;
        ratio = 1 + ratio * 3;
        this.globe.style[this.transformStyleName] = 'scale3d(' + ratio + ',' + ratio + ',1)';
        ratio = 1 + Math.pow(this.config.zoom, 2) * 0.3;
        this.worldBg.style[this.transformStyleName] = 'scale3d(' + ratio + ',' + ratio + ',1)';

        this.transformGlobe();
    }

    clamp(x, min, max) {
        return x < min ? min : x > max ? max : x;
    }

    clampLng(lng) {
        return ((lng + 180) % 360) - 180;
    }

    transformGlobe() {

        var dom, perspectiveTransform;
        var x, y, v1, v2, v3, v4, vertex, verticesRow, i, len;
        if (this.tick ^= 1) {
            //console.log(this.rY);
            this.sinRY = Math.sin(this.rY);
            this.sinRX = Math.sin(-this.rX);
            this.sinRZ = Math.sin(this.rZ);
            this.cosRY = Math.cos(this.rY);
            this.cosRX = Math.cos(-this.rX);
            this.cosRZ = Math.cos(this.rZ);

            var segX = this.config.segX;
            var segY = this.config.segY;

            for (y = 0; y <= segY; y++) {
                verticesRow = this.vertices[y];
                for (x = 0; x <= segX; x++) {
                    this.rotate(vertex = verticesRow[x], vertex.x, vertex.y, vertex.z);
                }
            }

            for (y = 0; y < segY; y++) {
                for (x = 0; x < segX; x++) {
                    dom = this.globeDoms[x + segX * y];

                    v1 = dom.topLeft;
                    v2 = dom.topRight;
                    v3 = dom.bottomLeft;
                    v4 = dom.bottomRight;

                    this.expand(v1, v2);
                    this.expand(v2, v3);
                    this.expand(v3, v4);
                    this.expand(v4, v1);

                    perspectiveTransform = dom.perspectiveTransform;
                    perspectiveTransform.topLeft.x = v1.tx;
                    perspectiveTransform.topLeft.y = v1.ty;
                    perspectiveTransform.topRight.x = v2.tx;
                    perspectiveTransform.topRight.y = v2.ty;
                    perspectiveTransform.bottomLeft.x = v3.tx;
                    perspectiveTransform.bottomLeft.y = v3.ty;
                    perspectiveTransform.bottomRight.x = v4.tx;
                    perspectiveTransform.bottomRight.y = v4.ty;
                    perspectiveTransform.hasError = perspectiveTransform.checkError();

                    if (!(perspectiveTransform.hasError = perspectiveTransform.checkError())) {
                        perspectiveTransform.calc();
                    }
                }
            }
        } else {
            for (i = 0, len = this.globeDoms.length; i < len; i++) {
                perspectiveTransform = this.globeDoms[i].perspectiveTransform;
                if (!perspectiveTransform.hasError) {
                    perspectiveTransform.update();
                } else {
                    perspectiveTransform.style[this.transformStyleName] = 'translate3d(-8192px, 0, 0)';
                }
            }
        }
    }

    goTo(lat, lng) {
        var dX = lat - this.config.lat;
        var dY = lng - this.config.lng;
        var roughDistance = Math.sqrt(dX * dX + dY * dY);
        this.isTweening = true;
        TweenMax.to(this.config, roughDistance * 0.01, {
            lat: lat,
            lng: lng,
            ease: 'easeInOutSine'
        });
        TweenMax.to(this.config, 1, {
            delay: roughDistance * 0.01,
            zoom: 1,
            ease: 'easeInOutSine',
            onComplete: function() {
                this.isTweening = false;
            }
        });
    }

    rotate(vertex, x, y, z) {
        let x0 = x * this.cosRY - z * this.sinRY;
        let z0 = z * this.cosRY + x * this.sinRY;
        let y0 = y * this.cosRX - z0 * this.sinRX;
        z0 = z0 * this.cosRX + y * this.sinRX;

        let offset = 1 + (z0 / 4000);
        let x1 = x0 * this.cosRZ - y0 * this.sinRZ;
        y0 = y0 * this.cosRZ + x0 * this.sinRZ;

        vertex.px = x1 * offset;
        vertex.py = y0 * offset;
    }

    // shameless stole and edited from threejs CanvasRenderer
    expand(v1, v2) {

        var x = v2.px - v1.px,
            y = v2.py - v1.py,
            det = x * x + y * y,
            idet;

        if (det === 0) {
            v1.tx = v1.px;
            v1.ty = v1.py;
            v2.tx = v2.px;
            v2.ty = v2.py;
            return;
        }

        idet = this.pixelExpandOffset / Math.sqrt(det);

        x *= idet;
        y *= idet;

        v2.tx = v2.px + x;
        v2.ty = v2.py + y;
        v1.tx = v1.px - x;
        v1.ty = v1.py - y;

    }
    
}
