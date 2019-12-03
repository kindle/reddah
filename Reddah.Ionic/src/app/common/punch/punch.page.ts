import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-punch',
    templateUrl: 'punch.page.html',
    styleUrls: ['punch.page.scss']
})
export class PunchPage implements OnInit {

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private popoverController: PopoverController,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private platform: Platform,

    ){
        
    }

    

    async ngOnInit(){
        var p2 = require('p2');

        const TWO_PI_P = Math.PI * 2;
        const HALF_PI_P = Math.PI * 0.5;
        // canvas settings
        let drawingCanvas = document.getElementById("drawing_canvas"),
            viewWidth = this.platform.width(),
            viewHeight = 600, //this.platform.height(),//768,
            viewCenterX = viewWidth * 0.5,
            viewCenterY = viewHeight * 0.5,
            ctx,
            timeStep = (1 / 60),
            time = 0;

        let ppm = 24, // pixels per meter
            physicsWidth = viewWidth / ppm,
            physicsHeight = viewHeight / ppm,
            physicsCenterX = physicsWidth * 0.5,
            physicsCenterY = physicsHeight * 0.5;

        let world;

        let wheel,
            arrow,
            mouseBody,
            mouseConstraint;

        let arrowMaterial,
            pinMaterial,
            contactMaterial;

        let wheelSpinning = false,
            wheelStopped = true;

        let particles = [];

        let statusLabel = document.getElementById('status_label');

        
        initDrawingCanvas(drawingCanvas);
        initPhysics();

        requestAnimationFrame(loop);

        statusLabel.innerHTML = 'Give it a good spin!';
        
        function initDrawingCanvas(drawingCanvas) {
            drawingCanvas.width = viewWidth;
            drawingCanvas.height = viewHeight;
            ctx = drawingCanvas.getContext('2d');

            /*
            drawingCanvas.addEventListener('mousemove', updateMouseBodyPosition);
            drawingCanvas.addEventListener('mousedown', checkStartDrag);
            drawingCanvas.addEventListener('mouseup', checkEndDrag);
            drawingCanvas.addEventListener('mouseout', checkEndDrag);
            *//////////
            let hammer = new window['Hammer'](drawingCanvas);
            hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });

            hammer.on('panstart', (e)=>{ 
                checkStartDrag(e);
            });
            hammer.on('panend', (e)=>{ 
                checkEndDrag(e);
            });

            hammer.on('press', (e)=>{ 
                checkEndDrag(e);
            });
          
            hammer.on('pan', (e) => {
                updateMouseBodyPosition(e);
            });

        }

        function updateMouseBodyPosition(e) {
            var p = getPhysicsCoord(e);
            mouseBody.position[0] = p.x;
            mouseBody.position[1] = p.y;
        }

        function checkStartDrag(e) {
            try{
                if (world.hitTest(mouseBody.position, [wheel.wbody])[0]) {

                    mouseConstraint = new p2.RevoluteConstraint(mouseBody, wheel.wbody, {
                        worldPivot: mouseBody.position,
                        collideConnected: false
                    });

                    world.addConstraint(mouseConstraint);
                }

                if (wheelSpinning === true) {
                    wheelSpinning = false;
                    wheelStopped = true;
                    statusLabel.innerHTML = "Impatience will not be rewarded.";
                }
            }catch{}
        }

        function checkEndDrag(e) {
            try{
                if (mouseConstraint) {
                    world.removeConstraint(mouseConstraint);
                    mouseConstraint = null;

                    if (wheelSpinning === false && wheelStopped === true) {
                        if (Math.abs(wheel.wbody.angularVelocity) > 7.5) {
                            wheelSpinning = true;
                            wheelStopped = false;
                            console.log('good spin');
                            statusLabel.innerHTML = '...clack clack clack clack clack clack...'
                        } else {
                            console.log('sissy');
                            statusLabel.innerHTML = 'Come on, you can spin harder than that.'
                        }
                    }
                }
            }catch{}
        }

        function getPhysicsCoord(e) {
            try{
                drawingCanvas = document.getElementById("drawing_canvas");
                var rect = drawingCanvas.getBoundingClientRect(),
                    x = (e.center.x - rect.left) / ppm,
                    y = physicsHeight - (e.center.y - rect.top) / ppm;

                return {
                    x: x,
                    y: y
                };
            }catch{}
        }

        function initPhysics() {
            try{
                world = new p2.World();
                world.solver.iterations = 100;
                world.solver.tolerance = 0;

                arrowMaterial = new p2.Material();
                pinMaterial = new p2.Material();
                contactMaterial = new p2.ContactMaterial(arrowMaterial, pinMaterial, {
                    friction: 0.0,
                    restitution: 0.1
                });
                world.addContactMaterial(contactMaterial);

                var wheelRadius = 8,
                    wheelX = physicsCenterX,
                    wheelY = wheelRadius + 4,
                    arrowX = wheelX,
                    arrowY = wheelY + wheelRadius + 0.625;

                wheel = new Wheel(wheelX, wheelY, wheelRadius, 32, 0.25, 7.5);
                wheel.wbody.angle = (Math.PI / 32.5);
                wheel.wbody.angularVelocity = 5;
                arrow = new Arrow(arrowX, arrowY, 0.5, 1.5);
                mouseBody = new p2.Body();

                world.addBody(mouseBody);
            }catch{}
        }

        function spawnPartices() {
            for (var i = 0; i < 200; i++) {
                var p0 = new Point(viewCenterX, viewCenterY - 64);
                var p1 = new Point(viewCenterX, 0);
                var p2 = new Point(Math.random() * viewWidth, Math.random() * viewCenterY);
                var p3 = new Point(Math.random() * viewWidth, viewHeight + 64);

                particles.push(new Particle(p0, p1, p2, p3));
            }
        }

        function update() {
            try{
                particles.forEach(function(p) {
                    p.update();
                    if (p.complete) {
                        particles.splice(particles.indexOf(p), 1);
                    }
                });

                // p2 does not support continuous collision detection :(
                // but stepping twice seems to help
                // considering there are only a few bodies, this is ok for now.
                
                world.islandSplit = false;
                world.step(timeStep * 0.5);
                world.step(timeStep * 0.5);

                if (wheelSpinning === true && wheelStopped === false &&
                    wheel.wbody.angularVelocity < 1 && arrow.hasStopped()) {

                    var win = wheel.gotLucky();

                    wheelStopped = true;
                    wheelSpinning = false;

                    wheel.wbody.angularVelocity = 0;
                        
                    
                    if (win===0) {
                        spawnPartices();
                        statusLabel.innerHTML = 'Woop woop!+3'
                    }
                    else {
                        statusLabel.innerHTML = 'Too bad! Invite a friend to try again!';
                    }
                }
            }catch{}
        }

        function draw() {
            // ctx.fillStyle = '#fff';
            ctx.clearRect(0, 0, viewWidth, viewHeight);

            wheel.draw();
            arrow.draw();

            particles.forEach(function(p) {
                p.draw();
            });
        }

        function loop() {
            update();
            draw();

            requestAnimationFrame(loop);
        }

        
        /////////////////////////////
        // wheel of fortune
        /////////////////////////////
        function Wheel(x, y, radius, segments, pinRadius, pinDistance) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.segments = segments;
            this.pinRadius = pinRadius;
            this.pinDistance = pinDistance;

            this.pX = this.x * ppm;
            this.pY = (physicsHeight - this.y) * ppm;
            this.pRadius = this.radius * ppm;
            this.pPinRadius = this.pinRadius * ppm;
            this.pPinPositions = [];

            this.deltaPI = TWO_PI_P / this.segments;

            
            //this.createBody();
            this.wbody = new p2.Body({
                mass: 1,
                position: [this.x, this.y]
            });
            this.wbody.angularDamping = 0.0;
            this.wbody.addShape(new p2.Circle(this.radius));
            this.wbody.shapes[0].sensor = true; //TODO use collision bits instead

            var axis = new p2.Body({
                position: [this.x, this.y]
            });
            var constraint = new p2.LockConstraint(this.wbody, axis);
            constraint.collideConnected = false;

            world.addBody(this.wbody);
            world.addBody(axis);
            world.addConstraint(constraint);

            //this.createPins();
            var l = this.segments;
            

            for (var i = 0; i < l; i++) {
                let x = Math.cos(i / l * TWO_PI_P) * this.pinDistance,
                    y = Math.sin(i / l * TWO_PI_P) * this.pinDistance;
                
                let pin = new p2.Circle(this.pinRadius);

                pin.material = pinMaterial;
                this.wbody.addShape(pin, [x, y]);
                this.pPinPositions[i] = [x * ppm, -y * ppm];
            }

            this.draw = function(){
                // TODO this should be cached in a canvas, and drawn as an image
                // also, more doodads
                ctx.save();
                ctx.translate(this.pX, this.pY);

                ctx.beginPath();
                ctx.fillStyle = '#ffce00';
                ctx.arc(0, 0, this.pRadius + 24, 0, TWO_PI_P);
                ctx.fill();
                ctx.fillRect(-12, 0, 24, 400);

                ctx.rotate(-this.wbody.angle);

                for (var i = 0; i < this.segments; i++) {
                    let magicn = i % 2;
                    
                    ctx.fillStyle = (magicn === 0) ? 'rgb(219,19,39)' : '#ffffff'//white/red;
                        /*(
                          (magicn === 1) ? 'rgb(219,19,39)' :'rgb(255,225,32)' ///red/yellow
                        );*/
                    ctx.beginPath();
                    ctx.arc(0, 0, this.pRadius, i * this.deltaPI, (i + 1) * this.deltaPI);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.fillStyle = '#401911';

                this.pPinPositions.forEach(function(p) {
                    ctx.beginPath();
                    ctx.arc(p[0], p[1], this.pPinRadius, 0, TWO_PI_P);
                    ctx.fill();
                }, this);

                ctx.restore();
            } 
            
            this.gotLucky = function() {
                var currentRotation = wheel.wbody.angle % TWO_PI_P,
                    currentSegment = Math.floor(currentRotation / this.deltaPI);

                return (currentSegment % 2);
            }
        };

        /////////////////////////////
        // arrow on top of the wheel of fortune
        /////////////////////////////
        function Arrow(x, y, w, h) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.verts = [];

            this.pX = this.x * ppm;
            this.pY = (physicsHeight - this.y) * ppm;
            this.pVerts = [];

            //this.createBody();
            this.abody = new p2.Body({
                mass: 1,
                position: [this.x, this.y]
            });
            //create arrow shape
            this.verts[0] = [0, this.h * 0.25];
            this.verts[1] = [-this.w * 0.5, 0];
            this.verts[2] = [0, -this.h * 0.75];
            this.verts[3] = [this.w * 0.5, 0];

            this.pVerts[0] = [this.verts[0][0] * ppm, -this.verts[0][1] * ppm];
            this.pVerts[1] = [this.verts[1][0] * ppm, -this.verts[1][1] * ppm];
            this.pVerts[2] = [this.verts[2][0] * ppm, -this.verts[2][1] * ppm];
            this.pVerts[3] = [this.verts[3][0] * ppm, -this.verts[3][1] * ppm];

            var shape = new p2.Convex(this.verts);
            shape.material = arrowMaterial;

            this.abody.addShape(shape);



            var axis = new p2.Body({
                position: [this.x, this.y]
            });
            var constraint = new p2.RevoluteConstraint(this.abody, axis, {
                worldPivot: [this.x, this.y]
            });
            constraint.collideConnected = false;

            var left = new p2.Body({
                position: [this.x - 2, this.y]
            });
            var right = new p2.Body({
                position: [this.x + 2, this.y]
            });
            var leftConstraint = new p2.DistanceConstraint(this.abody, left, {
                localAnchorA: [-this.w * 2, this.h * 0.25],
                collideConnected: false
            });
            var rightConstraint = new p2.DistanceConstraint(this.abody, right, {
                localAnchorA: [this.w * 2, this.h * 0.25],
                collideConnected: false
            });
            var s = 32,
                r = 4;

            leftConstraint.setStiffness(s);
            leftConstraint.setRelaxation(r);
            rightConstraint.setStiffness(s);
            rightConstraint.setRelaxation(r);

            world.addBody(this.abody);
            world.addBody(axis);
            world.addConstraint(constraint);
            world.addConstraint(leftConstraint);
            world.addConstraint(rightConstraint);


            this.hasStopped= function() {
                var angle = Math.abs(this.abody.angle % TWO_PI_P);

                return (angle < 1e-3 || (TWO_PI_P - angle) < 1e-3);
            }
            this.update= function() {

            }
            this.draw = function() {
                ctx.save();
                ctx.translate(this.pX, this.pY);
                ctx.rotate(-this.abody.angle);

                ctx.fillStyle = '#401911';

                ctx.beginPath();
                ctx.moveTo(this.pVerts[0][0], this.pVerts[0][1]);
                ctx.lineTo(this.pVerts[1][0], this.pVerts[1][1]);
                ctx.lineTo(this.pVerts[2][0], this.pVerts[2][1]);
                ctx.lineTo(this.pVerts[3][0], this.pVerts[3][1]);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        };
        /////////////////////////////
        // your reward
        /////////////////////////////
        function Particle(p0, p1, p2, p3) {
            this.p0 = p0;
            this.p1 = p1;
            this.p2 = p2;
            this.p3 = p3;

            this.time = 0;
            this.duration = 3 + Math.random() * 2;
            this.color = 'hsl(' + Math.floor(Math.random() * 360) + ',100%,50%)';

            this.w = 10;
            this.h = 7;

            this.complete = false;
        
            this.update = function() {
                this.time = Math.min(this.duration, this.time + timeStep);

                var f = Ease.outCubic(this.time, 0, 1, this.duration);
                var p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

                var dx = p.x - this.x;
                var dy = p.y - this.y;

                this.r = Math.atan2(dy, dx) + HALF_PI_P;
                this.sy = Math.sin(Math.PI * f * 10);
                this.x = p.x;
                this.y = p.y;

                this.complete = this.time === this.duration;
            }
            this.draw = function() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.r);
                ctx.scale(1, this.sy);

                ctx.fillStyle = this.color;
                ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

                ctx.restore();
            }
        };
        function Point(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        };
        /////////////////////////////
        // math
        /////////////////////////////
        /**
         * easing equations from http://gizma.com/easing/
         * t = current time
         * b = start value
         * c = delta value
         * d = duration
         */
        var Ease = {
            inCubic: function(t, b, c, d) {
                t /= d;
                return c * t * t * t + b;
            },
            outCubic: function(t, b, c, d) {
                t /= d;
                t--;
                return c * (t * t * t + 1) + b;
            },
            inOutCubic: function(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            },
            inBack: function(t, b, c, d, s) {
                s = s || 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            }
        };

        function cubeBezier(p0, c0, c1, p1, t) {
            var p = new Point(0,0);
            var nt = (1 - t);

            p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
            p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

            return p;
        }
        
    }
  
    
}
