var gl;

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
      }


function createProgram(fragmentShaderID, vertexShaderID) {
        var fragmentShader = getShader(gl, fragmentShaderID);
        var vertexShader = getShader(gl, vertexShaderID);

        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(program.vertexPositionAttribute);

        program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
        gl.enableVertexAttribArray(program.vertexNormalAttribute);

        program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
        gl.enableVertexAttribArray(program.textureCoordAttribute);

        program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
        program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
        program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
        program.samplerUniform = gl.getUniformLocation(program, "uSampler");
        program.useTexturesUniform = gl.getUniformLocation(program, "uUseTextures");
        program.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
        program.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
        program.pointLightingLocationUniform = gl.getUniformLocation(program, "uPointLightingLocation");
        program.pointLightingColorUniform = gl.getUniformLocation(program, "uPointLightingColor");

        return program;
    }






    var currentProgram;
    var perVertexProgram;
    var perFragmentProgram;

    function initShaders() {
        perVertexProgram = createProgram("per-vertex-lighting-fs", "per-vertex-lighting-vs");
        perFragmentProgram = createProgram("per-fragment-lighting-fs", "per-fragment-lighting-vs");
    }


    function handleLoadedTexture(texture) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }


                                            //  ********** TEXTURES ********** //





                                          

     var sunTexture;
     var ermisTexture;
     var afroditeTexture;
     var earthTexture;
     var moonTexture;
     var marsTexture;

    function initTexture() {
                                           //  ********** SUN TEXTURES ********** //

        sunTexture = gl.createTexture();
        sunTexture.image = new Image();
      sunTexture.image.onload = function () {
            handleLoadedTexture(sunTexture)
       }

       sunTexture.image.src = "images/SunTexture.png";

                                          //  ********** ERMIS  TEXTURES ********** //

          ermisTexture = gl.createTexture();
        ermisTexture.image = new Image();
        ermisTexture.image.onload = function () {
            handleLoadedTexture(ermisTexture)
        }

        
        ermisTexture.image.src = "images/ErmisTexture.jpg";


                                        //  ********** AFRODITI  TEXTURES ********** //
        afroditeTexture = gl.createTexture();
        afroditeTexture.image = new Image();
        afroditeTexture.image.onload = function () {
            handleLoadedTexture(afroditeTexture)
        }

        afroditeTexture.image.src = "images/afroditeTexture.jpg";




                                        //  ********** EARTH TEXTURES ********** //

        earthTexture = gl.createTexture();
        earthTexture.image = new Image();
        earthTexture.image.onload = function () {
            handleLoadedTexture(earthTexture)
        }

        earthTexture.image.src = "images/earthTexture.jpg";

                                        // ************ MOON TEXTURES ***********//

                moonTexture = gl.createTexture();
        moonTexture.image = new Image();
        moonTexture.image.onload = function () {
            handleLoadedTexture(moonTexture)
        }

        moonTexture.image.src = "images/moonTexture.gif";    

                                    //***************** MARS TEXTURE **************//

                marsTexture = gl.createTexture();
        marsTexture.image = new Image();
        marsTexture.image.onload = function () {
            handleLoadedTexture(marsTexture)
        }

        marsTexture.image.src = "images/marsTexture.jpg";                                 




    

}
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

     function setMatrixUniforms() {
        gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(currentProgram.nMatrixUniform, false, normalMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
                                               //******************** MOUSE EVENTS *********************//



    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    var zd=-100.0 ;

    var sunRotationMatrix = mat4.create();
    mat4.identity(sunRotationMatrix);

    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }


    function handleMouseUp(event) {
        mouseDown = false;
    }


    function handleMouseMove(event) {
        if (!mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);

        var deltaY = newY - lastMouseY;
        mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

        mat4.multiply(newRotationMatrix, sunRotationMatrix, sunRotationMatrix);

        lastMouseX = newX
        lastMouseY = newY;
    }


    var stop = true;
    var texturOnOff = true;


    var currentlyPressedKeys = {};              

    function handleKeyDown(event) {                    


                                                //********STOP **********//
        currentlyPressedKeys[event.keyCode] = true;

        if (String.fromCharCode(event.keyCode) == "S") {
            if (stop == true) {
                stop = false;
            }else{
        stop = true;
        }
      }


                                                //********* TEXTURE ON/OFF *********//
        currentlyPressedKeys[event.keyCode] = true;

        if (String.fromCharCode(event.keyCode) == "T") {
            if (texturOnOff == true) {
                texturOnOff = false;
            }else{
        texturOnOff = true;
        }
      }



    }

     
function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }



    function handleKeys() {
        if (currentlyPressedKeys[109]) {
            // Page Up
            zd -= 0.20;
        }
        if (currentlyPressedKeys[107]) {
            // Page Down
            zd += 0.20;
        }
       
    }
                                                //  ************* BUFFERS ************* //

    var sunVertexPositionBuffer;
    var sunVertexNormalBuffer;
    var sunVertexTextureCoordBuffer;
    var sunVertexIndexBuffer;


    var ermisVertexPositionBuffer;
    var ermisVertexNormalBuffer;
    var ermisVertexTextureCoordBuffer;
    var ermisVertexIndexBuffer;


    var afroditeVertexPositionBuffer;
    var afroditeVertexNormalBuffer;
    var afroditeVertexTextureCoordBuffer;
    var afroditeVertexIndexBuffer;


    var earthVertexPositionBuffer;
    var earthVertexNormalBuffer;
    var earthVertexTextureCoordBuffer;
    var earthVertexIndexBuffer;

    var moonVertexPositionBuffer;
    var moonVertexNormalBuffer;
    var moonVertexTextureCoordBuffer;
    var moonVertexIndexBuffer;


    var marsVertexPositionBuffer;
    var marsVertexNormalBuffer;
    var marsVertexTextureCoordBuffer;
    var marsVertexIndexBuffer;


    function initBuffers() {


                                                //  ************* SUN  ************** //
        var latitudeBands = 30;
        var longitudeBands = 30;
        var sun_radius = 20;

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(sun_radius * x);
                vertexPositionData.push(sun_radius * y);
                vertexPositionData.push(sun_radius * z);
            }
        }

        var indexData = [];
        for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

        sunVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        sunVertexNormalBuffer.itemSize = 3;
        sunVertexNormalBuffer.numItems = normalData.length / 3;

        sunVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        sunVertexTextureCoordBuffer.itemSize = 2;
        sunVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        sunVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        sunVertexPositionBuffer.itemSize = 3;
        sunVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        sunVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        sunVertexIndexBuffer.itemSize = 1;
        sunVertexIndexBuffer.numItems = indexData.length;


                                                         //  ************* ERMIS  ************** //
 
        var ermis_radius = 0.9;               

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(ermis_radius * x);
                vertexPositionData.push(ermis_radius * y);
                vertexPositionData.push(ermis_radius * z);
            }
        }

       
        ermisVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ermisVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        ermisVertexNormalBuffer.itemSize = 3;
        ermisVertexNormalBuffer.numItems = normalData.length / 3;

        ermisVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ermisVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        ermisVertexTextureCoordBuffer.itemSize = 2;
        ermisVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        ermisVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ermisVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        ermisVertexPositionBuffer.itemSize = 3;
        ermisVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        ermisVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ermisVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        ermisVertexIndexBuffer.itemSize = 1;
        ermisVertexIndexBuffer.numItems = indexData.length;


       


                                                    
                                                     //  ************* AFRODITI  ************** //


        
        var afrodite_radius = 0.94;               

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(afrodite_radius * x);
                vertexPositionData.push(afrodite_radius * y);
                vertexPositionData.push(afrodite_radius * z);
            }
        }

       
        afroditeVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, afroditeVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        afroditeVertexNormalBuffer.itemSize = 3;
        afroditeVertexNormalBuffer.numItems = normalData.length / 3;

        afroditeVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, afroditeVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        afroditeVertexTextureCoordBuffer.itemSize = 2;
        afroditeVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        afroditeVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, afroditeVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        afroditeVertexPositionBuffer.itemSize = 3;
        afroditeVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        afroditeVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, afroditeVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        afroditeVertexIndexBuffer.itemSize = 1;
        afroditeVertexIndexBuffer.numItems = indexData.length;


                                                 //  ************* EARTH ************** //

       
        var earth_radius = 1.0;               

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(earth_radius * x);
                vertexPositionData.push(earth_radius * y);
                vertexPositionData.push(earth_radius * z);
            }
        }

       
        earthVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        earthVertexNormalBuffer.itemSize = 3;
        earthVertexNormalBuffer.numItems = normalData.length / 3;

        earthVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        earthVertexTextureCoordBuffer.itemSize = 2;
        earthVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        earthVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        earthVertexPositionBuffer.itemSize = 3;
        earthVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        earthVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        earthVertexIndexBuffer.itemSize = 1;
        earthVertexIndexBuffer.numItems = indexData.length;     





                                    //********************** MOON ***************// 

        var moon_radius = 0.28;               

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(moon_radius * x);
                vertexPositionData.push(moon_radius * y);
                vertexPositionData.push(moon_radius * z);
            }
        }

       
        moonVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        moonVertexNormalBuffer.itemSize = 3;
        moonVertexNormalBuffer.numItems = normalData.length / 3;

        moonVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        moonVertexTextureCoordBuffer.itemSize = 2;
        moonVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        moonVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        moonVertexPositionBuffer.itemSize = 3;
        moonVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        moonVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        moonVertexIndexBuffer.itemSize = 1;
        moonVertexIndexBuffer.numItems = indexData.length;




                                    //********************** MARS ***************// 

        var mars_radius = 0.44;               

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(mars_radius * x);
                vertexPositionData.push(mars_radius * y);
                vertexPositionData.push(mars_radius * z);
            }
        }

       
        marsVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, marsVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        marsVertexNormalBuffer.itemSize = 3;
        marsVertexNormalBuffer.numItems = normalData.length / 3;

        marsVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, marsVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        marsVertexTextureCoordBuffer.itemSize = 2;
        marsVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        marsVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, marsVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        marsVertexPositionBuffer.itemSize = 3;
        marsVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        marsVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, marsVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        marsVertexIndexBuffer.itemSize = 1;
        marsVertexIndexBuffer.numItems = indexData.length;

                             

    }






                                        //******************DRAW SCENE FUNCTION ************//





            var rSun=0;                            
            var rERMIS =0;
            var yErmis=0;
            var rAfrodite = 0
            var yAfrodite=0;
            var rEarth=0;
            var yEarth=0;
             var ymoon=0;
             var rmoon=0;
            var rmars=0;
            var ymars=0;


    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0, pMatrix);

         var perFragmentLighting = document.getElementById("per-fragment").checked;
        if (perFragmentLighting) {
            currentProgram = perFragmentProgram;
        } else {
            currentProgram = perVertexProgram;
        } gl.useProgram(currentProgram); 

        var perVertexLighting = document.getElementById("per-vertex").checked;
        if (perVertexLighting) {
            currentProgram = perVertexProgram
        } else {
            currentProgram = perFragmentProgram;
        } gl.useProgram(currentProgram); 

    var lighting = true;
        gl.uniform1i(currentProgram.useLightingUniform, lighting);
        if (lighting) {
            gl.uniform3f(
                currentProgram.ambientColorUniform,
                parseFloat(document.getElementById("ambientR").value),
                parseFloat(document.getElementById("ambientG").value),
                parseFloat(document.getElementById("ambientB").value)
            );

            gl.uniform3f(
                currentProgram.pointLightingLocationUniform,
           0.0,0.0,0.0                //********** x,y,z location pointlight
            );

            gl.uniform3f(
                currentProgram.pointLightingColorUniform,
                parseFloat(document.getElementById("pointR").value),
                parseFloat(document.getElementById("pointG").value),
                parseFloat(document.getElementById("pointB").value)
            );
        }
        


     
      
                                     //***************** SUN DRAW ****************//
var textures = texturOnOff;
        gl.uniform1i(currentProgram.useTexturesUniform, textures);

        mat4.identity(mvMatrix);
        
        
        mat4.translate(mvMatrix, [-40.0, 0.0, zd]);

        
         mat4.multiply(mvMatrix, sunRotationMatrix);
      
      

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sunTexture);
  
    
        gl.uniform1i(currentProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, sunVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, sunVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, sunVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, sunVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);



        

                                // *******************  ERMIS DRAW ********************** //
                                  

   

      
      
        
    
    mvPushMatrix();
         
         mat4.rotate(mvMatrix, degToRad(yErmis), [0, 1, 0]);

         mat4.translate(mvMatrix, [40.0,0.0,0.0]);
         mat4.rotate(mvMatrix, degToRad(rERMIS), [0, 1, 0]);

        
      
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, ermisTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, ermisVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, ermisVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
  

        gl.bindBuffer(gl.ARRAY_BUFFER, ermisVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, ermisVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        


        gl.bindBuffer(gl.ARRAY_BUFFER, ermisVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, ermisVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

   

        

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ermisVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, ermisVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);



    mvPopMatrix();

                                    //***************** AFRODITI DRAW ****************//
        

    mvPushMatrix();
       
        mat4.rotate(mvMatrix, degToRad(yAfrodite), [0, 1, 0]);
         mat4.translate(mvMatrix, [45.0, 0.0,0.0]);    // ERMIS_X = +40 , AFRODITI_X=+15, X=55 
        mat4.rotate(mvMatrix, degToRad(rAfrodite), [0, 1, 0]);
        

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, afroditeTexture);
     

        gl.bindBuffer(gl.ARRAY_BUFFER, afroditeVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, afroditeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, afroditeVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, afroditeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, afroditeVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, afroditeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

   

        

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, afroditeVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, afroditeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();


                                //***************** EARTH DRAW  ****************//


        mat4.translate(mvMatrix, [0.0,0.0,0.0]);
        mat4.rotate(mvMatrix, degToRad(yEarth), [0, 1, 0]);
          
    
     mvPushMatrix();
        
        

        mat4.translate(mvMatrix, [90.0,0.0,0.0]);
        mat4.rotate(mvMatrix, degToRad(rEarth), [0, 1, 0]);

     
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, earthTexture);
      
        gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, earthVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, earthVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, earthVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

   

        

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, earthVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);                         

    mvPopMatrix();




                            //************* MOON DRAW *******************//


         

    mvPushMatrix();
    mat4.translate(mvMatrix, [90.0,0.0,0.0]);
         mat4.rotate(mvMatrix, degToRad(ymoon), [0, 1, 0]);

        mat4.translate(mvMatrix, [3.0,0.0,0.0]);  //  ERMIS_X = +40 , AFRODITI_X=+15, AFRODITI_X=55 ,X=90
        

    
       gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, moonTexture);
      

        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, moonVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

   
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, moonVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, moonVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

   

        

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);                         

    mvPopMatrix();



           //************* mars DRAW *******************//


         

    mvPushMatrix();
        mat4.translate(mvMatrix, [0.0,0.0,0.0]);
        mat4.rotate(mvMatrix, degToRad(ymars), [0, 1, 0]);

        mat4.translate(mvMatrix, [95.0,0.0,0.0]);  //  ERMIS_X = +40 , AFRODITI_X=+15, AFRODITI_X=55 ,X=90
        

    
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, marsTexture);
      

        gl.bindBuffer(gl.ARRAY_BUFFER, marsVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, marsVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

   
        gl.bindBuffer(gl.ARRAY_BUFFER, marsVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, marsVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, marsVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, marsVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

   

        

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, marsVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, marsVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);                         

    mvPopMatrix();
    

    }





        var lastTime = 0;

    function animate() {

       
    
        var timeNow = new Date().getTime();

        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            

           ymoon+= (15 * elapsed)/1000.0;
            rERMIS +=( 13 * elapsed)/1000.0;
           
            rmars+=( 13 * elapsed)/1000.0;
           rAfrodite += (18 * elapsed) / 1000.0;
          
           rEarth  += (48 * elapsed) / 1000.0;
    if(stop){ 

           yErmis += (48 * elapsed) / 1000.0;
           yAfrodite +=(35 * elapsed) / 1000.0;
           yEarth  += (30 * elapsed) / 1000.0;
           ymoon+= (24 * elapsed)/1000.0;

           ymars+= (15 * elapsed)/1000.0;
       }

           
            
            }
                lastTime = timeNow;
        }
    




    function tick() {
        requestAnimFrame(tick);
        drawScene();
        handleKeys();
         animate();
    }


    function webGLStart() {
        var canvas = document.getElementById("lesson13-canvas");
        initGL(canvas);
        initShaders();
        initBuffers();
        initTexture();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        canvas.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

       
        
        
        tick();
    }
