/* jshint esversion: 8 */  
let checkerBall; // Model
let checkerContract;
let checkerTex; // p5 Graphics Texture
let camera, lookAtVector; // Camera
let gui;
let captureRect = {w:1000, h:1000, lineW:4, lineL:100, _w:0, _h:0};
let tokenSeed, defaultSeed, prev; // token seed
let centerVector, dragVector, pressVector; // Vectors that are used for zoom function
let zoomWidth, zoomHeight;
let canvas, boxGraphic, voxelGraphic;
let boxWidth = 100, boxOrtho = {};
let panAng, tiltAng;
let secrets;

const scrConstant = 2560; // Screen Constant
let zoomRatio = 1, _zoomRatio = zoomRatio;

// Setting the orbital rotation time
let pan_time = 3600; // An Hour
let tilt_time = 86400; // A Day

const boxNum = 1;
const array = [];

function preload() {
  checkerContract = loadJSON('contracts/Checker.json');
  // Loading a model from local
  checkerBall = loadModel('assets/CheckerBall.obj', true);
}

function setup() {  
  // uid Generation and Setting of a default random seed
  const _uid = uuid.parse(uuid.v4());
  let _prevByte;
  for (const unhexed of _uid) {
    if (defaultSeed) {
      defaultSeed %= unhexed + 10;      
      defaultSeed *= _prevByte;
    } else {
      defaultSeed = unhexed;
      _initialByte = unhexed;
    }
    _prevByte = unhexed;
  }
  
  // Canvas
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Graphics
  voxelGraphic = createGraphics(2048, 2048, WEBGL);
  voxelGraphic.camera = voxelGraphic.createCamera();
  boxGraphic = createGraphics(2048, 2048, WEBGL);
  boxGraphic.camera = boxGraphic.createCamera();
  
  // Checker Texture
  checkerTex = new CheckerTex();
  
  // GUI
  gui = new GUI();
  
  // Camera Vector
  lookAtVector = createVector(0, 0, 1);
  
  // Vectors used for zoom function
  centerVector = createVector(width/2, height/2);
  pressVector = createVector(0, 0);
  dragVector = createVector(0, 0);
  
  angleMode(RADIANS);
  ambientLight(255);
  frameRate(60);
  calibrate();
}

// Calibrate a camera in box graphic as well as ortho values
function calibrate() {
  let ratio = min(width, height) / max(width, height);
  
  _scrConstant = scrConstant * zoomRatio;
  zoomWidth = width >= height? _scrConstant: _scrConstant * ratio;
  zoomHeight = width <= height? _scrConstant: _scrConstant * ratio;
  
  voxelGraphic.camera.setPosition(0, 0, 0);
  voxelGraphic.camera.ortho(-zoomWidth/2, zoomWidth/2, -zoomHeight/2, zoomHeight/2, -2000, 2000);
  
  boxGraphic.camera.setPosition(0, 0, 0);
  captureRect._w = min(width, captureRect.w);
  captureRect._h = min(height, captureRect.h);
  captureRect._w = min(captureRect._w, captureRect._h);
  captureRect._h = min(captureRect._w, captureRect._h);
}

function draw() {
  checkerTex.draw();
  background(0);
  
  // Read a token seed anytime it changes.
  tokenSeed = (gui.param.Seed && gui.param.Seed !== "Vanilla")? parseInt(gui.param.Seed): defaultSeed;
  if(prev !== tokenSeed && tokenSeed) {
    setSeed(tokenSeed);
    prev = tokenSeed;
  }
  
  switch(gui.param["View Mode"]) {
    case "Temporal":
      panAng = getAngle(pan_time);
      tiltAng = getAngle(tilt_time);
      
      tiltAng = tiltAng >= PI? TAU - tiltAng: tiltAng;
      lookAtVector = p5.Vector.fromAngles(tiltAng, panAng);
      break;
    case "Fixed":
      panAng = QUARTER_PI;
      tiltAng = QUARTER_PI;
      lookAtVector.set(QUARTER_PI, QUARTER_PI, QUARTER_PI);
      break;
  }
  
  voxelGraphic.clear();
  voxelGraphic.camera.lookAt(lookAtVector.x, lookAtVector.y, lookAtVector.z);
  voxelGraphic.blendMode(EXCLUSION);
  voxelGraphic.push();
  voxelGraphic.scale(5);
  voxelGraphic.noStroke();
  voxelGraphic.texture(checkerTex);
  voxelGraphic.model(checkerBall);
  voxelGraphic.pop();
  
  // Box Ortho
  boxOrtho._w = max(boxWidth * sin(panAng), boxWidth * cos(panAng));
  boxOrtho._h = max(boxWidth * sin(tiltAng), boxWidth * cos(tiltAng));
  boxOrtho.w = min(boxOrtho._w, width/height * boxOrtho._h);
  boxOrtho.h = min(boxOrtho._h, height/width * boxOrtho._w);
  
  boxOrtho.w = min(boxOrtho.w * zoomRatio, boxOrtho.w);
  boxOrtho.h = min(boxOrtho.h * zoomRatio, boxOrtho.h);
  
  // Box Graphics
  boxGraphic.clear();
  boxGraphic.camera.lookAt(lookAtVector.x, lookAtVector.y, lookAtVector.z);
  boxGraphic.camera.ortho(-boxOrtho.w/2, boxOrtho.w/2, -boxOrtho.h/2, boxOrtho.h/2, -1000, 1000);
  boxGraphic.blendMode(EXCLUSION);
  boxGraphic.push();
  boxGraphic.noStroke();
  boxGraphic.texture(checkerTex);
  boxGraphic.plane(boxWidth);
  boxGraphic.rotateY(HALF_PI);
  boxGraphic.plane(boxWidth);
  boxGraphic.rotateX(HALF_PI);
  boxGraphic.plane(boxWidth);
  boxGraphic.pop();
  
  //blendMode(LIGHTEST);
  push();
  noStroke();
  texture(boxGraphic);
  plane(width, height);
  pop();
  
  push();
  noStroke();
  texture(voxelGraphic);
  plane(width, height);
  pop();
  
  const corner = (x = 0, y = 0, _length = 100, _weight = 1, _ang = 0) => {
    push();
    translate(x, y);
    rotate(_ang);
    stroke(255);
    strokeWeight(_weight);
    noFill();
    beginShape(LINES);
    vertex(_length, -_weight/2);
    vertex(-_weight, -_weight/2);
    vertex(-_weight/2, 0);
    vertex(-_weight/2, _length);
    endShape();
    pop();
  };
  
  if (gui.param.captRectSwitch) {
    corner(-captureRect._w/2, -captureRect._h/2, captureRect.lineL, captureRect.lineW, 0);
    corner(captureRect._w/2, -captureRect._h/2, captureRect.lineL, captureRect.lineW, HALF_PI);
    corner(-captureRect._w/2, captureRect._h/2, captureRect.lineL, captureRect.lineW, PI + HALF_PI);
    corner(captureRect._w/2, captureRect._h/2, captureRect.lineL, captureRect.lineW, PI);
  }
  
  if(gui.param.pinGUISwitch) {
    if(gui.isHidden) gui.show();
  }
}

function mouseMoved(event) {
  if(!gui.param.pinGUISwitch) {
    //if(mouseX < gui.width && mouseY < gui.height) gui.show();
    if(gui.isOver) gui.show();
    else gui.hide();
  }
}

function mousePressed(event) {
  if (mouseButton === LEFT && gui.isOut) {
    pressVector.set(event.x, event.y);
    _zoomRatio = zoomRatio;
  }
}

function mouseDragged(event) {
  if (mouseButton === LEFT &&  gui.isOut) {
    dragVector.set(event.x, event.y);
    let pressDist = centerVector.dist(pressVector);
    let dragDist = centerVector.dist(dragVector);
    
    zoomRatio = _zoomRatio * pressDist/dragDist;
    zoomRatio = constrain(zoomRatio, 0.1, 1);
    calibrate();
  }
}

function getAngle(time = 1) {
  if(time != 0) {
    return map(Date.now() % (1000 * time), 0, (1000 * time), 0, TAU, true);
  } else {
    throw "time is zero";
  }
}

function setSeed(int) {
  randomSeed(int);
  noiseSeed(int);
  checkerTex.setSeed(int);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerVector = createVector(width/2, height/2);
  calibrate();
}
