import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CacheService } from "ionic-cache";
import { RegisterPage } from "../register/register.page"
import { ForgotPage } from "../forgot/forgot.page";


/*import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshLine, MeshLineMaterial } from 'three.meshline';*/

@Component({
    selector: 'app-signin',
    templateUrl: './signin.page.html',
    styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

    showSigninWithApple = false;
    constructor(private modalController: ModalController,
        public reddah: ReddahService,
        private loadingController: LoadingController,
        private router: Router,
        private cacheService: CacheService,
        private platform: Platform,
    ) { }

    ngOnInit() {
        let lastLoginUserName = this.reddah.getLoginUserName();
        if(lastLoginUserName)
            this.username = lastLoginUserName;

        //this.drawBackground();
        if(this.platform.is('ipad')||this.platform.is('iphone')||this.platform.is('ios'))
        {
            this.showSigninWithApple = true;
        }
    }

    
    username = "";
    password = "";

    async logIn() {
        if (this.username.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.UserNameEmpty"));
        } else if (this.password.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.PasswordEmpty"));
        } else {
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                spinner: null,
                duration: 30000,
                message: `<div class='bar-box'>${this.reddah.getLoadingEffect()}
                <div class='bar-text'>${this.reddah.instant("Login.Loading")}</div>
                </div>`,
                translucent: true,
                backdropDismiss: true
              });
            await loading.present();
            
            this.reddah.login(this.username, this.password)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.setLoginUserName(this.username);
                    this.reddah.setCurrentJwt(result.Message);
                    // return token successfully
                    this.modalController.dismiss(result.Message);
                    this.router.navigate(['/'], {
                        queryParams: {
                            action: 'login'
                        }
                    });
                    this.cacheService.clearAll();
                    this.reddah.updateUserDeviceInfo();
                }
                else {
                    let msg = this.reddah.instant(`Service.${result.Success}`);
                    this.reddah.toast(msg, "danger");
                }
                
            });
        }
    }

    checkLogin(){
        return this.username=="" ||this.password=="";
    }

    async close(){
        await this.modalController.dismiss(null);
    }

    getLocale(){
        return this.reddah.getCurrentLocale();
    }

    async goRegister(){
        const modal = await this.modalController.create({
            component: RegisterPage,
            componentProps: { url: '' },
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if(data){
            this.reddah.preloadArticles(data)
            let lastLoginUserName = this.reddah.getLoginUserName();
            if(lastLoginUserName)
                this.username = lastLoginUserName;
        }
    }

    async forgot(){
        const modal = await this.modalController.create({
            component: ForgotPage,
            componentProps: {},
            cssClass: "modal-fullscreen",
            swipeToClose: true,
            presentingElement: await this.modalController.getTop(),
        });
        
        await modal.present();
    }

    

        

    /*
    
    drawBackground(){
    
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 1000 );
        camera.position.set( 0, 0, -10 );
        
        var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
        
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.domElement.setAttribute("class","login-bg");
        
        var container = document.getElementById( 'container' );
        container.appendChild( renderer.domElement );
        

        var controls = new OrbitControls( camera, renderer.domElement );
        var clock = new THREE.Clock();

        var lines = [];
        var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
        var strokeTexture;

        var Params = function() {
            this.curves = true;
            this.circles = true;
            this.amount = 12;
            this.lineWidth = 5;
            this.dashArray = 0.81;
            this.dashOffset = 0;
            this.dashRatio = 0.12;
            this.taper = 'linear';
            this.strokes = true;
            this.sizeAttenuation = true;
            this.animateWidth = false;
            this.spread = false;
            this.autoRotate = true;
            this.autoUpdate = true;
            this.animateVisibility = false;
            this.animateDashOffset = true;
            this.update = function() {
                clearLines();
                createLines();
            }
        };

        var params = new Params();
        function update() {
            if( params.autoUpdate ) {
                clearLines();
                createLines();
            }
        }

        var loader = new THREE.TextureLoader();
        loader.load( 'assets/icon/stroke.png', function( texture ) {
            strokeTexture = texture;
            init()
        } );

        

        var TAU = 2 * Math.PI;
        var hexagonGeometry = new THREE.Geometry();
        for( var j = 0; j < TAU - .1; j += TAU / 100 ) {
            var v = new THREE.Vector3();
            v.set( Math.cos( j ), Math.sin( j ), 0 );
            hexagonGeometry.vertices.push( v );
        }
        hexagonGeometry.vertices.push( hexagonGeometry.vertices[ 0 ].clone() );

        
        

        function ConstantSpline() {

            this.p0 = new THREE.Vector3();
            this.p1 = new THREE.Vector3();
            this.p2 = new THREE.Vector3();
            this.p3 = new THREE.Vector3();
        
            this.tmp = new THREE.Vector3();
            this.res = new THREE.Vector3();
            this.o = new THREE.Vector3();
        
            this.points = [];
            this.lPoints = [];
            this.steps = [];
            
            this.inc = .01;
            this.d = 0;
        
            this.distancesNeedUpdate = false;
        
        };
        
        ConstantSpline.prototype.calculate = function() {
        
            this.d = 0;
            this.points = [];
        
            this.o.copy( this.p0 );
        
            for( var j = 0; j <= 1; j += this.inc ) {
                
                var i = ( 1 - j );
                var ii = i * i;
                var iii = ii * i;
                var jj = j * j;
                var jjj = jj * j;
                
                this.res.set( 0, 0, 0 );
                
                this.tmp.copy( this.p0 );
                this.tmp.multiplyScalar( iii );		
                this.res.add( this.tmp );
        
                this.tmp.copy( this.p1 );
                this.tmp.multiplyScalar( 3 * j * ii );
                this.res.add( this.tmp );
        
                this.tmp.copy( this.p2 );
                this.tmp.multiplyScalar( 3 * jj * i );
                this.res.add( this.tmp );
        
                this.tmp.copy( this.p3 );
                this.tmp.multiplyScalar( jjj );
                this.res.add( this.tmp );
        
                this.points.push( this.res.clone() );
                
            }
        
            this.points.push( this.p3.clone() );
        
            this.distancesNeedUpdate = true;
        
        };
        
        ConstantSpline.prototype.calculateDistances = function() {
        
            this.steps = [];
            this.d = 0;
        
            var from, to, td = 0;
        
            for( var j = 0; j < this.points.length - 1; j++ ) {
        
                this.points[ j ].distance = td;
                this.points[ j ].ac = this.d;
        
                from = this.points[ j ],
                to = this.points[ j + 1 ],
                td = to.distanceTo( from );
        
                this.d += td;
        
            }
        
            this.points[ this.points.length - 1 ].distance = 0;
            this.points[ this.points.length - 1 ].ac = this.d;
        
        }
        
        ConstantSpline.prototype.reticulate = function( settings ) {
        
            if( this.distancesNeedUpdate ) {
                this.calculateDistances();
                this.distancesNeedUpdate = false;
            }
        
            this.lPoints = [];
        
            var l = [];
        
            var steps, distancePerStep;
        
            if( settings.steps) {
                steps = settings.steps;
                distancePerStep = this.d / steps;
            }
        
            if( settings.distancePerStep ) {
                distancePerStep = settings.distancePerStep;
                steps = this.d / distancePerStep;		
            }
        
            var d = 0,
                p = 0;
        
            this.lPoints = [];
        
            var current = new THREE.Vector3();
            current.copy( this.points[ 0 ].clone() );
            this.lPoints.push( current.clone() );
        
            function splitSegment( a, b, l ) {
        
                var t = b.clone();
                var d = 0;
                t.sub( a );
                var rd = t.length();
                t.normalize();
                t.multiplyScalar( distancePerStep );
                var s = Math.floor( rd / distancePerStep );
                for( var j = 0; j < s; j++ ) {
                    a.add( t );
                    l.push( a.clone() );
                    d += distancePerStep;
                }
                return d;
            }
        
            for( var j = 0; j < this.points.length; j++ ) {
        
                if( this.points[ j ].ac - d > distancePerStep ) {
                    
                    d += splitSegment( current, this.points[ j ], this.lPoints );
        
                }
        
            }
            this.lPoints.push( this.points[ this.points.length - 1 ].clone() );
        
        
        };

        function createCurve() {
            

            var s = new ConstantSpline();
            var rMin = 5;
            var rMax = 10;
            var origin = new THREE.Vector3( randomInRange( -rMin, rMin ), randomInRange( -rMin, rMin ), randomInRange( -rMin, rMin ) );

            s.inc = .001;
            s.p0 = new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() );
            s.p0.set( 0, 0, 0 );
            s.p1 = s.p0.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
            s.p2 = s.p1.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
            s.p3 = s.p2.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
            s.p0.multiplyScalar( rMin + Math.random() * rMax );
            s.p1.multiplyScalar( rMin + Math.random() * rMax );
            s.p2.multiplyScalar( rMin + Math.random() * rMax );
            s.p3.multiplyScalar( rMin + Math.random() * rMax );

            s.calculate();
            var geometry = new THREE.Geometry();
            s.calculateDistances();
            //s.reticulate( { distancePerStep: .1 });
            s.reticulate( { steps: 500 } );
            var geometry = new THREE.Geometry();

            for( var j = 0; j < s.lPoints.length - 1; j++ ) {
                geometry.vertices.push( s.lPoints[ j ].clone() );
            }

            return geometry;

        }

        var colors = [
            0xed6a5a,
            0xf4f1bb,
            0x9bc1bc,
            0x5ca4a9,
            0xe6ebe0,
            0xf0b67f,
            0xfe5f55,
            0xd6d1b1,
            0xc7efcf,
            0xeef5db,
            0x50514f,
            0xf25f5c,
            0xffe066,
            0x247ba0,
            0x70c1b3
        ];

        function clearLines() {

            lines.forEach( function( l ) {
                scene.remove( l );
            } );
            lines = [];

        }

        function makeLine( geo ) {

            var g = new MeshLine();

            switch( params.taper ) {
                case 'none': g.setGeometry( geo ); break;
                case 'linear': g.setGeometry( geo, function( p ) { return 1 - p; } ); break;
                case 'parabolic': g.setGeometry( geo, function( p ) { return 1 * parabola( p, 1 )} ); break;
                case 'wavy': g.setGeometry( geo, function( p ) { return 2 + Math.sin( 50 * p ) } ); break;
            }

            var material = new MeshLineMaterial( {
                map: strokeTexture,
                useMap: params.strokes,
                color: new THREE.Color( colors[ ~~randomInRange( 0, colors.length ) ] ),
                opacity: 1,//params.strokes ? .5 : 1,
                dashArray: params.dashArray,
                dashOffset: params.dashOffset,
                dashRatio: params.dashRatio,
                resolution: resolution,
                sizeAttenuation: params.sizeAttenuation,
                lineWidth: params.lineWidth,
                near: camera.near,
                far: camera.far,
                depthWrite: false,
                depthTest: !params.strokes,
                alphaTest: params.strokes ? .5 : 0,
                transparent: true,
                side: THREE.DoubleSide
            });
            var mesh = new THREE.Mesh( g.geometry, material );
            if( params.spread || params.circles ) {
                var r = 50;
                mesh.position.set( randomInRange( -r, r ), randomInRange( -r, r ), randomInRange( -r, r ) );
                var s = 10 + 10 * Math.random();
                mesh.scale.set( s,s,s );
                mesh.rotation.set( Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI );
            }
            scene.add( mesh );

            lines.push( mesh );

        }

        function init() {

            createLines();
            onWindowResize();
            render(null);

        }

        function createLine() {
            if( params.circles ) makeLine( hexagonGeometry );
            if( params.curves ) makeLine( createCurve() );
            //makeLine( makeVerticalLine() );
            //makeLine( makeSquare() );
        }

        function createLines() {
            for( var j = 0; j < params.amount; j++ ) {
                createLine();
            }
        }

        function makeVerticalLine() {
            var g = new THREE.Geometry()
            var x = ( .5 - Math.random() ) * 100;
            g.vertices.push( new THREE.Vector3( x, -10, 0 ) );
            g.vertices.push( new THREE.Vector3( x, 10, 0 ) );
            return g;
        }

        function makeSquare() {
            var g = new THREE.Geometry()
            var x = ( .5 - Math.random() ) * 100;
            g.vertices.push( new THREE.Vector3( -1, -1, 0 ) );
            g.vertices.push( new THREE.Vector3( 1, -1, 0 ) );
            g.vertices.push( new THREE.Vector3( 1, 1, 0 ) );
            g.vertices.push( new THREE.Vector3( -1, 1, 0 ) );
            g.vertices.push( new THREE.Vector3( -1, -1, 0 ) );
            return g;
        }

        function onWindowResize() {

            var w = container.clientWidth;
            var h = container.clientHeight;

            camera.aspect = w / h;
            camera.updateProjectionMatrix();

            renderer.setSize( w, h );

            resolution.set( w, h );

        }

        window.addEventListener( 'resize', onWindowResize );

        var tmpVector = new THREE.Vector3();

        function render(time) {

            requestAnimationFrame( render );
            controls.update();

            var delta = clock.getDelta();
            var t = clock.getElapsedTime();
            lines.forEach( function( l, i ) {
                if( params.animateWidth ) l.material.uniforms.lineWidth.value = params.lineWidth * ( 1 + .5 * Math.sin( 5 * t + i ) );
                if( params.autoRotate ) l.rotation.y += .125 * delta;
                    l.material.uniforms.visibility.value= params.animateVisibility ? (time/3000) % 1.0 : 1.0;
                    l.material.uniforms.dashOffset.value -= params.animateDashOffset ? 0.01 : 0;
            } );

            renderer.render( scene, camera );

        }

        function randomInRange( min, max ) {
                return min + Math.random() * ( max - min );
            
        }

        function parabola( x, k ) {
            return Math.pow( 4 * x * ( 1 - x ), k );
        }

        
    }
*/
}


