import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ReddahService } from '../reddah.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalePage } from '../common/locale/locale.page';
import { SigninPage } from './signin/signin.page';
//import dat from 'dat.gui'
//import Stats from 'stats-js';
//import TweenMax from "gsap";
import PerspectiveTransform from '../../assets/js/css_globe_PerspectiveTransform.js'
import TweenMax from '../../assets/js/TweenMax.min.js'
import { AuthService } from '../auth.service';
import { RegisterPage } from './register/register.page'
import { Globalization } from '@ionic-native/globalization/ngx';
import { MapPage } from '../map/map.page';

@Component({
    selector: 'app-surface',
    templateUrl: './surface.page.html',
    styleUrls: ['./surface.page.scss'],
})
export class SurfacePage implements OnInit {

    constructor(private modalController: ModalController,
        public reddah: ReddahService,
        private platform: Platform,
        private router: Router,
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private globalization: Globalization,
    ) {}

    ngOnInit() {
        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        let defaultLocale ="en-US"
        if(currentLocale==null){
            if(this.platform.is('cordova'))
            { 
                this.globalization.getPreferredLanguage()
                .then(res => {
                    this.localStorageService.store("Reddah_Locale", res.value);
                    this.reddah.loadTranslate(res.value);
                })
                .catch(e => {
                    this.localStorageService.store("Reddah_Locale", defaultLocale);
                    this.reddah.loadTranslate(defaultLocale);
                });
            }
            else{
                this.localStorageService.store("Reddah_Locale", defaultLocale);
                this.reddah.loadTranslate(defaultLocale);
            }

        }
        else{
            this.reddah.loadTranslate(currentLocale);
        }
        this.init(null);
        setTimeout(()=>{this.tap()},1500)
    }

    isAuthenticated() {
        return this.authService.authenticated();
    }

    async register(){
        this.config.isWorldVisible = false;

        const modal = await this.modalController.create({
            component: RegisterPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.preloadArticles(data)
            this.signin();
        }
        else{
            this.config.isWorldVisible = true;
        }
    }

    async signin(){
        this.config.isWorldVisible = false;
        
        const modal = await this.modalController.create({
            component: SigninPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            let result = this.authService.exactToken(data);
            if(result){
                this.router.navigate(['']);
            }
        }
        else
        {
            this.config.isWorldVisible = true;
        }
    }

    async locale(){
        this.config.isWorldVisible = false;

        let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
        const changeLocaleModal = await this.modalController.create({
            component: LocalePage,
            componentProps: { orgLocale: currentLocale },
            cssClass: "modal-fullscreen",
        });
        
        await changeLocaleModal.present();
        const { data } = await changeLocaleModal.onDidDismiss();
        if(data){
            let currentLocale = this.localStorageService.retrieve("Reddah_Locale");
            this.reddah.loadTranslate(currentLocale);
        }
        this.config.isWorldVisible = true;
        
    }

    async goMap(){
        const modal = await this.modalController.create({
            component: MapPage,
            componentProps: {
                readonly: true
                //lat: this.config.lat,
                //lng: this.config.lng
            },
            cssClass: "modal-fullscreen",
        });
          
        await modal.present();
    }

    tap(){
        
        
        if(this.isAuthenticated()){
            
            //this.config.autoSpin = !this.config.autoSpin;
            //this.config.isWorldVisible = false;
            //this.config.isHaloVisible = false;
            //console.log(this.config.lat+"_"+this.config.lng);
            //console.log(this.dragLat +"++"+this.dragLng)
            //console.log(this.dragLat +"++"+this.dragLng)
            

            this.router.navigate(['map'], {
                queryParams: {
                    lat: this.config.lat,
                    lng: this.config.lng
                }
            });
        }
        else{
            this.config.autoSpin = !this.config.autoSpin;
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
            //bug south earth glitch...
            //this.config.lat = this.clamp(this.dragLat + dY * 0.5, -90, 90);
            //this.config.lng = this.clampLng(this.dragLng - dX * 0.5, -180, 180);
            this.config.lng = this.clampLng(this.dragLng - dX * 0.5);
            
        }
    }


    config = {
        percent: 0,
        lat: 39.773949,
        lng: 116.330711,
        segX: 14,
        segY: 12,
        isWorldVisible: true,
        isHaloVisible: true,
        isPoleVisible: true,
        autoSpin: false,
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
        bg: 'assets/icon/css_globe_bg.jpg',
        diffuse: 'assets/icon/css_globe_diffuse.jpg',
        halo: 'assets/icon/css_globe_halo.png',
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

        /*var gui = new dat.GUI();
        gui.add(this.config, 'lat', -90, 90).listen();
        gui.add(this.config, 'lng', -180, 180).listen();
        gui.add(this.config, 'isHaloVisible');
        gui.add(this.config, 'isPoleVisible');
        gui.add(this.config, 'autoSpin');
        gui.add(this.config, 'goToBristol');
        gui.add(this.config, 'zoom', 0, 1).listen();
        */

        //this.stats = new Stats();
        //this.stats.domElement.style.position = 'absolute';
        //this.stats.domElement.style.left = 0;
        //this.stats.domElement.style.top = 0;
        //document.body.appendChild(this.stats.domElement);

        // events
        this.world.ondragstart = function() {
            return false;
        };
        /*this.world.addEventListener('mousedown', ()=>this.onMouseDown);
        this.world.addEventListener('mousemove', ()=>this.onMouseMove);
        this.world.addEventListener('mouseup', ()=>this.onMouseUp);
        this.world.addEventListener('touchstart', this.touchPass(()=>this.onMouseDown));
        this.world.addEventListener('touchmove', this.touchPass(()=>this.onMouseMove));
        this.world.addEventListener('touchend', this.touchPass(()=>this.onMouseUp));
*/
        this.loop();
    }

    touchPass(func) {
        return function(evt) {
            evt.preventDefault();
            func.call(this, {
                pageX: evt.changedTouches[0].pageX,
                pageY: evt.changedTouches[0].pageY
            });
        };
    }

    onMouseDown(evt) {
        this.isMouseDown = true;
        this.dragX = evt.pageX;
        this.dragY = evt.pageY;
        this.dragLat = this.config.lat;
        this.dragLng = this.config.lng;
    }

    onMouseMove(evt) {
        if (this.isMouseDown) {
            var dX = evt.pageX - this.dragX;
            var dY = evt.pageY - this.dragY;
            this.config.lat = this.clamp(this.dragLat + dY * 0.5, -90, 90);
            //this.config.lng = this.clampLng(this.dragLng - dX * 0.5, -180, 180);
            
        }
    }

    onMouseUp(evt) {
        if (this.isMouseDown) {
            this.isMouseDown = false;
        }
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
        requestAnimationFrame(()=>{this.loop()});
        //this.stats.begin();
        this.render();
        //this.stats.end();
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
