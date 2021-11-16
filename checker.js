//esversion:8;

let checkerBall;
let checkerTex;
let camera;
let gui;
let viewMode = {options: ["Fixed", "Temporal"]};
let tokens = {seed: []};
let prev;

const scrConstant = 1920;

let pan_time = 60; // A Minute
let tilt_time = 86400; // A Day

const boxNum = 1;
const array = [];

function preload() {
  checkerBall = loadModel('assets/CheckerBall.obj', true);
}

function setup() {
  angleMode(RADIANS);
  createCanvas(windowWidth, windowHeight, WEBGL);
  checkerTex = new CheckerTex();
  gui = createGui('Asset Picker');
  gui.addObject(viewMode);
  
  camera = createCamera();
  calibrate();
  
  ambientLight(255);
  connectToAccount().then(response => {
    tokens.seed = response.assets.map(asset => asset.traits[1].value);
    //console.log(response);
    gui.addObject(tokens);
  }).catch(err => console.error(err));
}

function calibrate() {
  camera.setPosition(0, 0, 0);
  let ratio = min(width, height) / max(width, height);
  //console.log(width > height? "Wider Width": "Higher Height", ratio);
  let _w = width >= height? scrConstant: scrConstant * ratio;
  let _h = width <= height? scrConstant: scrConstant * ratio;
  ortho(-_w/2, _w/2, -_h/2, _h/2, -1000, 1000);
}

function draw() {
  background(0);
  

  switch(viewMode.options) {
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
  
  if(prev !== tokens.seed) {
    //console.log(tokens.seed);
    randomSeed(tokens.seed);
    noiseSeed(tokens.seed);
    checkerTex.setSeed(tokens.seed);
    prev = tokens.seed;
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

function getAngle(time = 1) {
  if(time != 0) {
    return map(Date.now() % (1000 * time), 0, (1000 * time), 0, TAU, true);
  } else {
    throw "time is zero";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calibrate();
}
