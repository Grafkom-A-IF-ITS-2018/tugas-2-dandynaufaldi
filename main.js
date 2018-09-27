/** @type {WebGLRenderingContext} */
let gl
function initGL(canvas) {
    try {
        gl = canvas.getContext('webgl')
        gl.viewportWidth = canvas.width
        gl.viewportHeight = canvas.height
    } catch (e) {
        if (!gl) {
                alert('Tidak bisa menginisialisasi WebGL')
            }
    }
}
function getShader(gl, id) {
    let shaderScript = document.getElementById(id)
    if (!shaderScript) {
        return null
    }
    let str = ''
    let k = shaderScript.firstChild
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent
        }
        k = k.nextSibling
    }
    let shader
    if (shaderScript.type == 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER)
    } else if (shaderScript.type = 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER)
    } else {
        return null
    }
    gl.shaderSource(shader, str)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader))
        return null
    }
    return shader
}
let shaderProgram
function initShaders() {
    let fragmentShader = getShader(gl, 'shader-fs')
    let vertexShader = getShader(gl, 'shader-vs')
    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, fragmentShader)
    gl.attachShader(shaderProgram, vertexShader)
    gl.linkProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Tidak bisa menginisialisasi shaders')
    }
    gl.useProgram(shaderProgram)
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix')
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
}
let mvMatrix = mat4.create()
let mvMatrixStack = []
let pMatrix = mat4.create()
function mvPushMatrix() {
    let copy = mat4.create()
    mat4.copy(copy, mvMatrix)
    mvMatrixStack.push(copy)
}
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Tumpukan matriks kosong"
    }
    mvMatrix = mvMatrixStack.pop()
}
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}
/**
 * @param  {Array} vertices
 * @param  {Number} verItemSize
 * @param  {Number} verNumItem
 * @param  {Array} colors
 * @param  {Number} colItemSize
 * @param  {Number} colNumItem
 */
function triDiObj( vertices, verItemSize, verNumItem, colors, colItemSize, colNumItem){
    this.vertices = vertices
    this.verItemSize = verItemSize
    this.verNumItem = verNumItem
    this.colors = colors
    this.colItemSize = colItemSize
    this.colNumItem = colNumItem
    this.positionBuffer = undefined
    this.colorBuffer = undefined
    this.draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.verItemSize, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.colItemSize, gl.FLOAT, false, 0, 0)
        setMatrixUniforms()
        gl.drawArrays(gl.TRIANGLES, 0, this.verNumItem)
    }
    this.initBuffer = function(){
        this.positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
        // this.positionBuffer.itemSize = this.verItemSize
        // this.positionBuffer.numItems = this.verNumItem

        this.colorBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW)
        // this.colorBuffer.itemSize = this.colItemSize
        // this.colorBuffer.numItems = this.colNumItem
    }
}
// -2.0, 3.0, 0.0,   //1
//                     -2.0, 3.0, 0.0,     //2
//                     -2.0, -3.0, 0.0,   //10

//                     -2.0, 3.0, 0.0,   //2
//                     -1.0, -3.0, 0.0,  //9
//                     -2.0, -3.0, 0.0,   //10
let triDiObjs = []
//     -2  -1  0   1   2
//-------------------------
// 3// 3   5       9   10
// 2//
// 1//     4
// 0//
//-1//             7
//-2//
//-3// 2   1       6   8
//-2.0, 3.0, 0.0,   //3
//-1.0, 3.0, 0.0,   //5
//1.0, -1.0, 0.0,   //7
//1.0, 3,0, 0.0,    //9
//2.0, 3.0, 0.0,    //10
//2.0, -3.0, 0.0,   //8
//1.0, -3.0, 0.0,   //6
//-1.0, 1.0, 0.0,   //4
//-1.0, -3.0, 0.0,  //1 
//-2.0, -3.0, 0.0,   //2 
let n = new triDiObj([-1.0, -3.0, 0.0,  //1 
                    -2.0, -3.0, 0.0,   //2 
                    -2.0, 3.0, 0.0,   //3
                    -1.0, 1.0, 0.0,   //4
                    -1.0, 3.0, 0.0,   //5
                    1.0, -3.0, 0.0,   //6
                    1.0, -1.0, 0.0,   //7
                    2.0, -3.0, 0.0,   //8
                    1.0, 3,0, 0.0,    //9
                    2.0, 3.0, 0.0,    //10
                    ],
                    3, 3,
                    [0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    0.0, 0.5, 0.5, 1.0,
                    ],
                    4, 3)

let y = new triDiObj([1.0, 1.0, 0.0,
                    -1.0, 1.0, 0.0,
                    1.0, -1.0, 0.0,
                    -1.0, -1.0, 0.0],
                    3, 4,
                    [1.0, 0.0, 0.0, 1.0,
                    0.0, 1.0, 0.0, 1.0,
                    0.0, 0.0, 1.0, 1.0],
                    4, 4)
console.log(n)        
let triangleVertexPositionBuffer
let triangleVertexColorBuffer
let squareVertexPositionBuffer
let squareVertexColorBuffer
function initBuffers() {
    // Triangle Position
    triangleVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
    let vertices = [
        -2.0, -3.0, 0.0,   //2 
        -1.0, -3.0, 0.0,  //1 
        -2.0, 3.0, 0.0,   //3
        -1.0, 3.0, 0.0,   //5
        1.0, -3.0, 0.0,   //6
        2.0, -3.0, 0.0,   //8
        1.0, 3.0, 0.0,    //9
        2.0, 3.0, 0.0,    //10
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    triangleVertexPositionBuffer.itemSize = 3
    triangleVertexPositionBuffer.numItems = 8
    // Triangle Color
    triangleVertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer)
    let colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    triangleVertexColorBuffer.itemSize = 4
    triangleVertexColorBuffer.numItems = 8
    // Square Position
    squareVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
    vertices = [
        1.0, -2.0, 0.0, //1
        0.0, -2.0, 0.0, //2
        1.0, 0.5, 0.0, //3
        0.0, 0.5, 0.0, //4
        -0.5, 3.5, 0.0, //5
        -1.5, 3.0, 0.0, //6
        1.0, 0.5, 0.0, //7
        0.0, 0.5, 0.0, //8
        2.5, 3.0, 0.0, //9
        1.5, 3.5, 0.0 //10
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    squareVertexPositionBuffer.itemSize = 3
    squareVertexPositionBuffer.numItems = 10
    // Square Color
    squareVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
    ]
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems = 10;
}
let rTri = 0
let rSquare = 0
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    mat4.perspective(pMatrix, glMatrix.toRadian(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
    mat4.identity(mvMatrix)
    mat4.translate(mvMatrix, mvMatrix, [-1.5, 3.0, -20.0])
    mvPushMatrix()
    mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(rTri), [1.0, 0.0, 0.0])
    //mat4.rotateY(mvMatrix, mvMatrix, glMatrix.toRadian(rTri))
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)
    setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleVertexPositionBuffer.numItems)
    mvPopMatrix()
    mat4.translate(mvMatrix, mvMatrix, [0.0, -7.0, 0.0])
    mvPushMatrix()
    mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(rSquare), [0.0, 1.0, 0.0])
    //mat4.rotateX(mvMatrix, mvMatrix, glMatrix.toRadian(rSquare))
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)
    setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems)
    mvPopMatrix()
}
let lastTime = 0
function animate() {
    let timeNow = new Date().getTime()
    if (lastTime != 0) {
        let elapsed = timeNow - lastTime
        rTri += (90 * elapsed) / 1000.0
        rSquare += (75 * elapsed) / 1000.0
    }
    lastTime = timeNow
}
function tick() {
    requestAnimationFrame(tick)
    drawScene()
    animate()
}
function webGLStart() {
    let canvas = document.getElementById('mycanvas')
    initGL(canvas)
    initShaders()
    initBuffers()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    tick()
}