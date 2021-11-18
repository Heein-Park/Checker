//esversion:8;

let checkerBall;
let checkerTex;
let camera;
let gui;
let tokenSeed, defaultSeed, prev;
let centerVector, dragVector, pressVector;
let canvas;

const scrConstant = 1920;
let zoomRatio = 1, _zoomRatio = zoomRatio;

let pan_time = 60; // A Minute
let tilt_time = 86400; // A Day

const boxNum = 1;
const array = [];

function preload() {
  checkerBall = loadModel('assets/CheckerBall.obj', true);
}

function setup() {
  const _uid = uuid.parse(uuid.v4());
  //console.log(_uid);
  
  let _prevByte;
  for (const unhexed of _uid) {
    //console.log("Value in UID Array : ", unhexed);
    //console.log("defaultSeed : ", defaultSeed);
    if (defaultSeed) {
      defaultSeed %= unhexed + 10;
      //console.log("defaultSeed %= unhexed : ", defaultSeed);
      
      defaultSeed *= _prevByte;
      //console.log("defaultSeed * _prevByte : ", defaultSeed);
    } else {
      defaultSeed = unhexed;
      _initialByte = unhexed;
    }
    
    _prevByte = unhexed;
  }
  
  angleMode(RADIANS);
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  checkerTex = new CheckerTex();
  gui = new GUI();
  camera = createCamera();
  calibrate();
  centerVector = createVector(width/2, height/2);
  pressVector = createVector(0, 0);
  dragVector = createVector(0, 0);
  
  ambientLight(255);
}

function calibrate() {
  camera.setPosition(0, 0, 0);
  let ratio = min(width, height) / max(width, height);
  
  _scrConstant = scrConstant * zoomRatio;
  const _w = width >= height? _scrConstant: _scrConstant * ratio;
  const _h = width <= height? _scrConstant: _scrConstant * ratio;
  ortho(-_w/2, _w/2, -_h/2, _h/2, -1000, 1000);
}

function draw() {
  background(0);
  switch(gui.param["View Mode"]) {
    case "Temporal":
      let panAng = getAngle(pan_time);
      let tiltAng = getAngle(tilt_time);
      
      tiltAng = tiltAng >= PI? TAU - tiltAng: tiltAng;
      
      let lookAtVec = p5.Vector.fromAngles(tiltAng, panAng);
      camera.lookAt(lookAtVec.x, lookAtVec.y, lookAtVec.z);
      break;
    case "Fixed":
      camera.lookAt(QUARTER_PI, QUARTER_PI, QUARTER_PI);
      break;
  }
  
  tokenSeed = (gui.param.Seed && gui.param.Seed !== "Vanilla")? parseInt(gui.param.Seed): defaultSeed;
  if(prev !== tokenSeed && tokenSeed) {
    setSeed(tokenSeed);
    prev = tokenSeed;
  }


  checkerTex.draw();
  blendMode(EXCLUSION);
  push();
  scale(5);
  noStroke();
  texture(checkerTex);
  textureWrap(CLAMP);
  model(checkerBall);
  pop();
}

function mousePressed(event) {
  pressVector.set(event.x, event.y);
  _zoomRatio = zoomRatio;
}

function mouseDragged(event) {
  dragVector.set(event.x, event.y);
  let pressDist = centerVector.dist(pressVector);
  let dragDist = centerVector.dist(dragVector);
  
  zoomRatio = _zoomRatio * pressDist/dragDist;
  calibrate();
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
