import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";
import { UserPage } from '../user/user.page';

@Component({
    selector: 'app-worm-hole',
    templateUrl: 'worm-hole.page.html',
    styleUrls: ['worm-hole.page.scss']
})
export class WormHolePage implements OnInit {

    async close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public navController: NavController,
        public modalController: ModalController
    ){}

    async ngOnInit(){
        // set up global javascript variables

        let blackholeMass = 3000;
        let curblackholeMass = 0;

        let canvas, gl; // canvas and webgl context

        let shaderScript;
        let shaderSource;
        let vertexShader; // Vertex shader.  Not much happens in that shader, it just creates the vertex's to be drawn on
        let fragmentShader; // this shader is where the magic happens. Fragment = pixel.  Vertex = kind of like "faces" on a 3d model.  
        let buffer;


        /* Variables holding the location of uniform variables in the WebGL. We use this to send info to the WebGL script. */
        let locationOfTime;
        let locationOfResolution;
        let locationOfMouse;
        let locationOfMass;
        let locationOfclickedTime;

        let originY = window.innerHeight,
            originX = window.innerWidth;

        let mouse;
        let program;
        let positionLocation;

        let startTime = new Date().getTime(); // Get start time for animating
        let currentTime = 0;

        
        let clickedTime = 0;
        let clicked = false;

        canvas = document.getElementById('glscreen');
        let hammer = new window['Hammer'](canvas);
        
        hammer.on('press', (e) => {
            clicked = true;
            //find the recommend user and pop up
            setTimeout(() => {
                this.getUserInHole(e);
            },3000)
        });

        /*
        window.addEventListener('mousedown', ()=> {
            clicked = true;
        });
        window.addEventListener('mouseup', ()=> {
            clicked = false;
        });*/

        function init(image) {
            try{
                // standard canvas setup here, except get webgl context
                canvas = document.getElementById('glscreen');
                gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                canvas.width = window.innerWidth >= window.innerHeight ? window.innerWidth : window.innerHeight;
                canvas.height = window.innerWidth >= window.innerHeight ? window.innerWidth : window.innerHeight;

                mouse = {
                    x: originX / 2,
                    y: -(originY / 2) + canvas.height,
                    moved: false
                };

                
                let hammer = new window['Hammer'](canvas);
                hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
                hammer.on('pan', (e) => {
                    mouse.x = e.center.x;
                    mouse.y = -e.center.y + canvas.height;
                    mouse.moved = true;
                });
                /*
                window.addEventListener('mousemove', (e)=> {
                    mouse.x = e.pageX;
                    mouse.y = -e.pageY + canvas.height;
                    mouse.moved = true;
                });*/

                // give WebGL it's viewport
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

                // kind of back-end stuff
                buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([-1.0, -1.0,
                        1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
                        1.0, -1.0,
                        1.0, 1.0
                    ]),
                    gl.STATIC_DRAW
                ); // ^^ That up there sets up the vertex's used to draw onto. I think at least, I haven't payed much attention to vertex's yet, for all I know I'm wrong.

                shaderScript = document.getElementById("2d-vertex-shader");
                //shaderSource = shaderScript.text;
                shaderSource = `attribute vec2 a_position;
                attribute vec2 a_texCoord;
                
                varying vec2 v_texCoord;
                void main() {
                    gl_Position = vec4(a_position, 0, 1);
                    v_texCoord = a_texCoord;
                }`;
                vertexShader = gl.createShader(gl.VERTEX_SHADER); //create the vertex shader from script
                gl.shaderSource(vertexShader, shaderSource);
                gl.compileShader(vertexShader);

                shaderScript = document.getElementById("2d-fragment-shader");
                //shaderSource = shaderScript.text;
                shaderSource = `#ifdef GL_ES
                precision mediump float;
                #endif
                
                #define PI 3.14159265359
                
                uniform sampler2D u_image;
                varying vec2 v_texCoord;
                
                uniform vec2 u_resolution;
                uniform vec2 u_mouse;
                uniform float u_mass;
                uniform float u_time;
                uniform float u_clickedTime;
                
                vec2 rotate(vec2 mt, vec2 st, float angle){
                    float cos = cos(angle + u_clickedTime); // try replacing (angle) with (angle*3.0)
                    float sin = sin(angle);
                    
                    // Uncomment these two lines for realism
                    //float cos = cos(angle) * (u_time * 0.3);
                    //float sin = sin(angle) * (u_time * 0.3);
                    
                    float nx = (cos * (st.x - mt.x)) + (sin * (st.y - mt.y)) + mt.x;
                    float ny = (cos * (st.y - mt.y)) - (sin * (st.x - mt.x)) + mt.y;
                    return vec2(nx, ny);
                }
                
                void main() {
                    vec2 st = gl_FragCoord.xy/u_resolution;
                    vec2 mt = u_mouse.xy/u_resolution;
                
                    float dx = st.x - mt.x;
                    float dy = st.y - mt.y;
                
                    float dist = sqrt(dx * dx + dy * dy);
                    float pull = u_mass / (dist * dist);
                
                    vec2 r = rotate(mt,st,pull);
                    
                    vec3 color = vec3(0.0);
                    vec4 imgcolor = texture2D(u_image, r);
                    color = vec3(
                        (imgcolor.x - (pull * 0.25)),
                        (imgcolor.y - (pull * 0.25)), 
                        (imgcolor.z - (pull * 0.25))
                        );
                    gl_FragColor = vec4(color,1.);
                }`;
                fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //create the fragment from script
                gl.shaderSource(fragmentShader, shaderSource);
                gl.compileShader(fragmentShader);

                program = gl.createProgram(); // create the WebGL program.  This variable will be used to inject our javascript variables into the program.
                gl.attachShader(program, vertexShader); // add the shaders to the program
                gl.attachShader(program, fragmentShader); // ^^
                gl.linkProgram(program); // Tell our WebGL application to use the program
                gl.useProgram(program); // ^^ yep, but now literally use it.


                /* 

                Alright, so here we're attatching javascript variables to the WebGL code.  First we get the location of the uniform variable inside the program. 

                We use the gl.getUniformLocation function to do this, and pass thru the program variable we created above, as well as the name of the uniform variable in our shader.

                */
                locationOfResolution = gl.getUniformLocation(program, "u_resolution");
                locationOfMouse = gl.getUniformLocation(program, "u_mouse");
                locationOfMass = gl.getUniformLocation(program, "u_mass");
                locationOfTime = gl.getUniformLocation(program, "u_time");
                locationOfclickedTime = gl.getUniformLocation(program, "u_clickedTime");

                /*

                Then we simply apply our javascript variables to the program. 
                Notice, it gets a bit tricky doing this.  If you're editing a float value, gl.uniformf works. 

                But if we want to send over an array of floats, for example, we'd use gl.uniform2f.  We're specifying that we are sending 2 floats at the end.  

                You can also send it over to the program as a vector, by using gl.uniform2fv.
                To read up on all of the different gl.uniform** stuff, to send any variable you want, I'd recommend using the table (found on this site, but you need to scroll down about 300px) 

                https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html#uniforms

                */
                gl.uniform2f(locationOfResolution, canvas.width, canvas.height);
                gl.uniform2f(locationOfMouse, mouse.x, mouse.y);
                gl.uniform1f(locationOfMass, curblackholeMass * 0.00001);
                gl.uniform1f(locationOfTime, currentTime);
                gl.uniform1f(locationOfclickedTime, clickedTime);


                var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

                // provide texture coordinates for the rectangle.
                var texCoordBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0,
                        1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
                        1.0, -1.0,
                        1.0, 1.0
                    ]),
                    gl.STATIC_DRAW);
                gl.enableVertexAttribArray(texCoordLocation);
                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

                // Create a texture.
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);

                // Set the parameters so we can render any size image.
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                // Upload the image into the texture.
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                render();
            }
            catch{
    
            }
        }

        function render() {
            try
            { 
                var now = new Date().getTime();
                currentTime = (now - startTime) / 1000; // update the current time for animations

                if (curblackholeMass < blackholeMass - 50) {
                    curblackholeMass += (blackholeMass - curblackholeMass) * 0.03;
                }

                if (clicked) {
                    clickedTime += 0.03;
                } else if (clickedTime > 0 && clicked == false) {
                    clickedTime += -(clickedTime * 0.015);
                }

                if (mouse.moved == false) {
                    mouse.y = (-(originY / 2) + Math.sin(currentTime) * 50) + canvas.height;
                    mouse.x = (originX / 2) + Math.sin(currentTime) * -150
                }

                gl.uniform1f(locationOfMass, curblackholeMass * 0.00001);
                gl.uniform2f(locationOfMouse, mouse.x, mouse.y);
                gl.uniform1f(locationOfTime, currentTime); // update the time uniform in our shader
                gl.uniform1f(locationOfclickedTime, clickedTime);

                window.requestAnimationFrame(render); // request the next frame

                positionLocation = gl.getAttribLocation(program, "a_position"); // do stuff for those vertex's
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            
            }
            catch{}
        }

        
        var image = new Image();
        image.src = "/assets/icon/blackhole.jpg";
        image.onload = ()=> {
            init(image);
        }
    }

    getUserInHole(e){
        let rdm = Math.floor((Math.random()*100)+1);
        let fx = e.center.x+rdm;
        let fy = e.center.y+rdm;
        let rdmfpn = fx%2==1?1:-1;
        let latCenter = (fx%90)*rdmfpn;
        rdmfpn = fx%2==1?1:-1;
        let lngCenter = (fy%180)*rdmfpn;
        let latLow = -90; 
        let latHigh = 90;
        let lngLow = -180;
        let lngHigh = 180;
        
        //do not use cache when user count is too low
        let type = -1; //0:female, 1:male, -1:all
        this.reddah.getUsersByLocation(type, latCenter, lngCenter, latLow, latHigh, lngLow, lngHigh, 0)
        .subscribe(data=>{
            if(data.Success==0){
                let showArray = [];
                let showNumber = 10;
                if(data.Message.length<=showNumber){
                    for(let i =0;i<data.Message.length;i++)
                        showArray.push(i);
                }else{
                    showArray = this.reddah.getRandomArray(showNumber, data.Message.length);
                }
                
                let foundUser = data.Message[showArray[0]];
                this.reddah.getUserPhotos(foundUser.UserName);

                this.goUser(foundUser.UserName);

            }
        });
    
    }

    async goUser(userName){
        this.close();
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }
  
    
}

