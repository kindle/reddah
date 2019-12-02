import { Component, OnInit, ViewChild } from '@angular/core';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingController, NavController, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from "ionic-cache";

@Component({
    selector: 'app-magic-mirror',
    templateUrl: 'magic-mirror.page.html',
    styleUrls: ['magic-mirror.page.scss']
})
export class MagicMirrorPage implements OnInit {

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
        private cacheService: CacheService,

    ){
        
    }

    

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

        let startTime = new Date().getTime(); // Get start time for animating
        let currentTime = 0;

        let clicked = false,
            clickedTime = 0;
        
        window.addEventListener('mousedown',function() {
            clicked = true;
        });
        window.addEventListener('mouseup',function() {
            clicked = false;
        });

        function init(image) {
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
            window.addEventListener('mousemove',function(e) {
                mouse.x = e.pageX;
                mouse.y = -e.pageY + canvas.height;
                mouse.moved = true;
            });

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
            shaderSource = shaderScript.text;
            vertexShader = gl.createShader(gl.VERTEX_SHADER); //create the vertex shader from script
            gl.shaderSource(vertexShader, shaderSource);
            gl.compileShader(vertexShader);

            shaderScript = document.getElementById("2d-fragment-shader");
            shaderSource = shaderScript.text;
            fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //create the fragment from script
            gl.shaderSource(fragmentShader, shaderSource);
            gl.compileShader(fragmentShader);

            this.program = gl.createProgram(); // create the WebGL program.  This variable will be used to inject our javascript variables into the program.
            gl.attachShader(this.program, vertexShader); // add the shaders to the program
            gl.attachShader(this.program, fragmentShader); // ^^
            gl.linkProgram(this.program); // Tell our WebGL application to use the program
            gl.useProgram(this.program); // ^^ yep, but now literally use it.


            /* 

            Alright, so here we're attatching javascript variables to the WebGL code.  First we get the location of the uniform variable inside the program. 

            We use the gl.getUniformLocation function to do this, and pass thru the program variable we created above, as well as the name of the uniform variable in our shader.

            */
            locationOfResolution = gl.getUniformLocation(this.program, "u_resolution");
            locationOfMouse = gl.getUniformLocation(this.program, "u_mouse");
            locationOfMass = gl.getUniformLocation(this.program, "u_mass");
            locationOfTime = gl.getUniformLocation(this.program, "u_time");
            locationOfclickedTime = gl.getUniformLocation(this.program, "u_clickedTime");

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


            var texCoordLocation = gl.getAttribLocation(this.program, "a_texCoord");

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

        function render() {
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

            //window.requestAnimationFrame(render, canvas); // request the next frame
            window.requestAnimationFrame(render);

            this.positionLocation = gl.getAttribLocation(this.program, "a_position"); // do stuff for those vertex's
            gl.enableVertexAttribArray(this.positionLocation);
            gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        //window.addEventListener('load', function(event) {
            var image = new Image();
            image.src = this.spaceImage;
            image.onload = function() {
                init(image);
            }

        //});
/*
        window.addEventListener('resize', function(event) {
            // just re-doing some stuff in the init here, to enable resizing.
            canvas.width = window.innerWidth >= window.innerHeight ? window.innerWidth : window.innerHeight;
            canvas.height = window.innerWidth >= window.innerHeight ? window.innerWidth : window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            locationOfResolution = gl.getUniformLocation(this.program, "u_resolution");
        });*/
        
    }

    spaceImage = `data:image/png;base64,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`+
    `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`;
    
    
    
}
